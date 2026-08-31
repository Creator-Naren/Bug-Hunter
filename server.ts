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

      const systemInstruction = `You are BugHunter Elite AI, an elite security researcher and Automated Static Application Security Testing (SAST) platform engineer.
Your mission is to perform deep, expert-level vulnerability discovery on Python code.

Be extremely thorough, precise, and actionable. Uncover security vulnerabilities, OWASP Top 10 risks, logic flaws, broken authentication, hardcoded secrets, unsafe deserialization, SQL injection, RCE, IDOR, SSRF, path traversal, command injection, and insecure cryptographic usage.

For EVERY finding, you must provide:
1. 'type': Clear vulnerability name (e.g., 'SQL Injection via String Formatting', 'Command Injection in Subprocess Call').
2. 'severity': One of 'Critical', 'High', 'Medium', 'Low', 'Info'.
3. 'lineNumber': 1-based line number where the core vulnerability starts or triggers.
4. 'cwe': Standard CWE designation if applicable (e.g., 'CWE-89', 'CWE-78', 'CWE-798').
5. 'description': Deep explanation of why this code is dangerous and how it works under the hood.
6. 'impact': Explicit real-world business and technical consequences if exploited.
7. 'exploitScenario': Step-by-step scenario demonstrating how an attacker could exploit this vulnerability.
8. 'recommendation': Executive guidance on how to fix and prevent this flaw.
9. 'remediationCode': Clean, secure Python code snippet demonstrating the exact refactored fix.

Also provide an 'overallSeverity' rating and a comprehensive executive 'summary' assessing the overall security posture of the provided code.`;

      const userPrompt = `Analyze the following Python source code for security vulnerabilities. Produce structured JSON findings according to the schema:

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
                    type: { type: Type.STRING, description: 'Vulnerability title' },
                    severity: { 
                      type: Type.STRING, 
                      enum: ['Critical', 'High', 'Medium', 'Low', 'Info'],
                      description: 'Severity rating'
                    },
                    lineNumber: { type: Type.INTEGER, description: '1-based line number of finding' },
                    cwe: { type: Type.STRING, description: 'CWE ID e.g. CWE-89' },
                    description: { type: Type.STRING, description: 'Detailed vulnerability explanation' },
                    impact: { type: Type.STRING, description: 'Technical & business impact' },
                    exploitScenario: { type: Type.STRING, description: 'Step-by-step attack scenario' },
                    recommendation: { type: Type.STRING, description: 'High level remediation guidance' },
                    remediationCode: { type: Type.STRING, description: 'Secure code snippet fix' }
                  },
                  required: ['type', 'severity', 'lineNumber', 'cwe', 'description', 'impact', 'exploitScenario', 'recommendation', 'remediationCode']
                }
              },
              overallSeverity: {
                type: Type.STRING,
                enum: ['Critical', 'High', 'Medium', 'Low', 'None']
              },
              summary: { type: Type.STRING, description: 'Executive summary of code security posture' }
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
