import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  // API Endpoint for code analysis
  app.post('/api/analyze', async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'No code snippet provided' });
      }

      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
      }

      const systemInstruction = `You are BugHunter AI, a professional security analyst and automated static application security testing (SAST) tool. 
Your job is to thoroughly analyze the provided Python code snippet for security vulnerabilities, logic flaws, OWASP Top 10 issues, hardcoded secrets, and unsafe coding practices.

Be extremely precise. Find actual vulnerabilities (e.g., SQL injection, insecure direct object references, weak cryptography, XSS, directory traversal, insecure use of eval or subprocess, unsafe yaml loading, etc.).
Only report genuine vulnerabilities or highly questionable code smells that pose security risks.

You must return a structured JSON response matching the following schema:
{
  "type": "object",
  "properties": {
    "vulnerabilities": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": { "type": "string" },
          "severity": { "type": "string", "enum": ["Critical", "High", "Medium", "Low", "Info"] },
          "lineNumber": { "type": "integer" },
          "description": { "type": "string" },
          "recommendation": { "type": "string" }
        },
        "required": ["type", "severity", "lineNumber", "description", "recommendation"]
      }
    },
    "overallSeverity": { "type": "string", "enum": ["Critical", "High", "Medium", "Low", "None"] },
    "summary": { "type": "string" }
  },
  "required": ["vulnerabilities", "overallSeverity", "summary"]
}`;

      const userPrompt = `Perform a security analysis on this Python code and output the JSON findings:

\`\`\`python
${code}
\`\`\``;

      // Call the Gemini API with structured JSON output
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [userPrompt],
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vulnerabilities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: 'The type/name of vulnerability (e.g. SQL Injection)' },
                    severity: { 
                      type: Type.STRING, 
                      enum: ['Critical', 'High', 'Medium', 'Low', 'Info'],
                      description: 'The severity rating'
                    },
                    lineNumber: { type: Type.INTEGER, description: 'Approximate 1-based line number of the finding' },
                    description: { type: Type.STRING, description: 'Explanation of the vulnerability' },
                    recommendation: { type: Type.STRING, description: 'Actionable remediation or code fix' }
                  },
                  required: ['type', 'severity', 'lineNumber', 'description', 'recommendation']
                }
              },
              overallSeverity: {
                type: Type.STRING,
                enum: ['Critical', 'High', 'Medium', 'Low', 'None']
              },
              summary: { type: Type.STRING, description: 'High-level security summary of the analysis' }
            },
            required: ['vulnerabilities', 'overallSeverity', 'summary']
          },
          temperature: 0.1,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response received from Gemini');
      }

      // Parse and return the JSON
      const parsed = JSON.parse(responseText);
      res.json(parsed);

    } catch (error: any) {
      console.error('Error during code analysis:', error);
      res.status(500).json({ error: error.message || 'Failed to analyze code snippet.' });
    }
  });

  // Serve static assets or use Vite dev server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
