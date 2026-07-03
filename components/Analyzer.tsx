import React, { useState, useRef } from 'react';
import { 
  Terminal, 
  Upload, 
  Play, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Code,
  Sparkles,
  FileCode,
  HelpCircle
} from 'lucide-react';
import { Finding, CodeAnalysis } from '../types';

interface AnalyzerProps {
  onConvertToReport: (finding: Finding, code: string) => void;
  onLogEvent: (msg: string) => void;
  historicalAnalyses: CodeAnalysis[];
  onSaveAnalysis: (analysis: CodeAnalysis) => void;
}

export const Analyzer: React.FC<AnalyzerProps> = ({ 
  onConvertToReport, 
  onLogEvent,
  historicalAnalyses,
  onSaveAnalysis
}) => {
  const [code, setCode] = useState<string>(`# Example insecure Python code for security scanning
import sqlite3
import subprocess
import hashlib
from flask import Flask, request

app = Flask(__name__)

# Vulnerability 1: Insecure SQL Query Construction (SQL Injection)
@app.route("/user")
def get_user():
    username = request.args.get('username')
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    # Direct formatting allows SQL injection!
    query = "SELECT * FROM users WHERE username = '%s'" % username
    cursor.execute(query)
    return str(cursor.fetchall())

# Vulnerability 2: Dangerous Subprocess Command Execution
@app.route("/ping")
def ping_server():
    ip = request.args.get('ip')
    # Shell=True with unvalidated user input is highly critical (RCE)!
    cmd = f"ping -c 1 {ip}"
    subprocess.call(cmd, shell=True)
    return "Ping executed"

# Vulnerability 3: Weak/Deprecated MD5 Hashing
def hash_password(password):
    # MD5 is structurally insecure and prone to collisions
    return hashlib.md5(password.encode()).hexdigest()

# Vulnerability 4: Hardcoded Superuser API Key
ADMIN_API_KEY = "sk_prod_99ab623fe71940bcad133d1b8cc0"
`);

  const [isScanning, setIsScanning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<CodeAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run security scan
  const handleRunScan = async () => {
    if (!code.trim()) {
      alert('Please provide some Python code to analyze.');
      return;
    }

    setIsScanning(true);
    setActiveAnalysis(null);
    setTerminalLogs([]);

    // Custom terminal logging simulation during analysis
    const simLogs = [
      '[+] Initializing virtual security container context...',
      '[+] Parsing Python Abstract Syntax Tree (AST)...',
      '[+] Executing pattern matching filters (SQLi, XSS, Path Traversal)...',
      '[+] Analyzing library imports and functions security constraints...',
      '[+] Inspecting shell execution vectors and subprocess parameters...',
      '[+] Verifying cryptographic entropy for hardcoded secrets...',
      '[+] Connecting to BugHunter Deep-Auditing Gemini models...',
      '[+] Mapping detected security threats with OWASP standards...',
      '[+] Generating high-fidelity remediation patches...'
    ];

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < simLogs.length) {
        setTerminalLogs(prev => [...prev, simLogs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(interval);
      }
    }, 250);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to complete code scan.');
      }

      const result = await response.json();
      
      // Delay slightly if fast response to match hacker visual terminal sequence
      await new Promise(resolve => setTimeout(resolve, 1500));

      const analysis: CodeAnalysis = {
        id: 'analysis_' + crypto.randomUUID(),
        code_snippet: code,
        language: 'python',
        findings: result.vulnerabilities || [],
        overallSeverity: result.overallSeverity || 'None',
        summary: result.summary || 'No critical issues identified.',
        created_date: new Date().toISOString()
      };

      // Stop scanning
      clearInterval(interval);
      setTerminalLogs(prev => [...prev, `[+] Audit complete! ${analysis.findings.length} findings identified.`, '[+] Compiling visual dashboard...']);
      setIsScanning(false);
      setActiveAnalysis(analysis);
      onSaveAnalysis(analysis);
      onLogEvent(`Completed AI audit of Python code. Found ${analysis.findings.length} vulnerabilities.`);

    } catch (error: any) {
      clearInterval(interval);
      console.error(error);
      setTerminalLogs(prev => [...prev, `[-] SCAN_FAILED: ${error.message}`]);
      setIsScanning(false);
      alert(`Security scanning failed: ${error.message}`);
    }
  };

  // Upload Python file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.py') && !file.name.endsWith('.txt')) {
      alert('Only .py or .txt files are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCode(text);
      onLogEvent(`Uploaded file: ${file.name} for AI analysis.`);
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto font-mono text-zinc-300 relative scanline-overlay">
      
      {/* Page Title */}
      <div className="border-b border-[#00FF41]/20 pb-4 shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#00E5FF]" />
            <h1 className="text-xl font-bold tracking-widest text-[#00E5FF] glow-text-cyan">
              AI_PYTHON_SAST_AUDIT
            </h1>
          </div>
          <p className="text-xs text-zinc-500">
            Automated code-level static application security testing. Powered by Gemini LLM reasoning.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".py,.txt" 
            className="hidden" 
          />
          <button 
            onClick={triggerFileUpload}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            UPLOAD_FILE (.py)
          </button>
        </div>
      </div>

      {/* Code Editor and Terminal Log Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Code Editor */}
        <div className="lg:col-span-8 flex flex-col border border-zinc-800 bg-[#060608] h-[500px]">
          <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 font-bold text-zinc-400">
              <FileCode className="w-4 h-4 text-[#00FF41]" />
              SOURCE_WORKSPACE.py
            </span>
            <span className="text-zinc-600 uppercase">PYTHON3</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 bg-[#060608] text-[#00FF41] font-mono text-xs focus:outline-none resize-none leading-relaxed overflow-auto"
            placeholder="# Paste your Python code here for automated security analysis..."
          />
          <div className="p-3 border-t border-zinc-900 bg-zinc-950 flex items-center justify-between">
            <span className="text-[9px] text-zinc-600">CHARACTER_COUNT: {code.length}</span>
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs tracking-widest uppercase transition-all duration-150 ${
                isScanning 
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-600' 
                  : 'bg-zinc-900 border border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/10 shadow-[0_0_10px_rgba(0,255,65,0.05)]'
              }`}
            >
              <Play className="w-4.5 h-4.5 fill-current" />
              {isScanning ? 'RUNNING_AUDIT...' : 'START_AI_SCAN'}
            </button>
          </div>
        </div>

        {/* Console / History */}
        <div className="lg:col-span-4 flex flex-col border border-zinc-800 bg-[#060608] h-[500px]">
          <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 font-bold text-zinc-400">
              <Terminal className="w-4 h-4 text-cyan-400" />
              SAST_DEATH_CONSOLE
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-1.5 font-mono text-[10px] text-zinc-500 leading-relaxed">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className={log && typeof log === 'string' && log.startsWith('[-]') ? 'text-red-500' : 'text-[#00FF41]/80'}>
                {log || ''}
              </div>
            ))}
            
            {terminalLogs.length === 0 && !isScanning && (
              <div className="space-y-4 text-center text-zinc-600 py-16">
                <div>AWAITING_COMMAND</div>
                <div className="text-[9px] text-zinc-700 max-w-[200px] mx-auto">
                  Click 'START_AI_SCAN' to spawn security scanners and begin AST threat scanning.
                </div>
              </div>
            )}

            {isScanning && (
              <div className="inline-block w-2.5 h-4 bg-[#00FF41] animate-pulse ml-1" />
            )}
          </div>

          {/* Historical Audits Tracker */}
          <div className="border-t border-zinc-900 bg-zinc-950 p-4 min-h-[140px] max-h-[180px] flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold mb-2 tracking-wider block uppercase">HISTORICAL AUDITS ({historicalAnalyses.length})</span>
            <div className="flex-1 overflow-y-auto space-y-1.5 text-[9px] pr-1">
              {historicalAnalyses.map((hist) => (
                <div 
                  key={hist.id}
                  onClick={() => {
                    setCode(hist.code_snippet);
                    setActiveAnalysis(hist);
                    setTerminalLogs([`[+] Loaded audit from registry: ${new Date(hist.created_date).toLocaleString()}`]);
                  }}
                  className="p-2 border border-zinc-900 hover:border-cyan-400/20 bg-zinc-950/60 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <span className="truncate group-hover:text-cyan-400">{new Date(hist.created_date).toLocaleString()}</span>
                  <span className={`font-bold uppercase ${
                    hist.overallSeverity === 'Critical' ? 'text-red-500' :
                    hist.overallSeverity === 'High' ? 'text-orange-500' :
                    hist.overallSeverity === 'Medium' ? 'text-yellow-500' :
                    'text-zinc-600'
                  }`}>
                    {hist.overallSeverity}
                  </span>
                </div>
              ))}
              {historicalAnalyses.length === 0 && (
                <div className="text-zinc-700 italic text-center py-4">No historic audit records.</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Analysis Audit Results Section */}
      {activeAnalysis && (
        <div className="space-y-6 border border-zinc-800 bg-zinc-950 p-6 shadow-[0_0_20px_rgba(0,255,65,0.02)]">
          {/* Header Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase block">AUDIT_POSTURE_SUMMARY</span>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                {activeAnalysis.summary}
              </p>
            </div>

            <div className="text-right flex flex-col items-end gap-1 shrink-0 font-mono">
              <span className="text-[9px] text-zinc-600 uppercase">OVERALL_SEVERITY_RATING</span>
              <span className={`text-base font-bold px-3 py-1 border glow-text-${activeAnalysis.overallSeverity === 'Critical' ? 'red' : 'green'} ${
                activeAnalysis.overallSeverity === 'Critical' ? 'bg-red-950/40 border-red-500/40 text-red-400' :
                activeAnalysis.overallSeverity === 'High' ? 'bg-orange-950/40 border-orange-500/40 text-orange-400' :
                activeAnalysis.overallSeverity === 'Medium' ? 'bg-yellow-950/40 border-yellow-500/40 text-yellow-400' :
                'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}>
                {activeAnalysis.overallSeverity}
              </span>
            </div>
          </div>

          {/* Finding Cards */}
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-[#00FF41] tracking-widest block uppercase">DETECTED_THREAT_VECTORS ({activeAnalysis.findings.length})</span>
            
            {activeAnalysis.findings.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-xs border border-dashed border-zinc-900">
                NO_SECURITY_ISSUES_FOUND
                <span className="text-[10px] text-zinc-700 block mt-1">Excellent! No vulnerability threat indicators triggered static analysis.</span>
              </div>
            ) : (
              activeAnalysis.findings.map((finding, index) => (
                <div 
                  key={index}
                  className="border border-zinc-900 bg-zinc-950 p-5 flex flex-col md:flex-row items-stretch justify-between gap-6 hover:border-zinc-800 transition-colors"
                >
                  <div className="space-y-4 flex-1">
                    {/* Vulnerability type & Line Number */}
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                        finding.severity === 'Critical' ? 'bg-red-950/40 border-red-500/40 text-red-400' :
                        finding.severity === 'High' ? 'bg-orange-950/40 border-orange-500/40 text-orange-400' :
                        finding.severity === 'Medium' ? 'bg-yellow-950/40 border-yellow-500/40 text-yellow-400' :
                        'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}>
                        {finding.severity}
                      </span>
                      <span className="text-sm font-bold text-white">{finding.type}</span>
                      <span className="text-[10px] font-bold text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                        Line {finding.lineNumber}
                      </span>
                    </div>

                    {/* Threat Details */}
                    <div className="space-y-2 text-xs font-mono">
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold block uppercase">THREAT ANALYSIS:</span>
                        <p className="text-zinc-400 leading-relaxed bg-zinc-950/50 p-2.5 border border-zinc-900/40 rounded">
                          {finding.description}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-500 font-bold block uppercase">RECOMMENDED REMEDIATION:</span>
                        <pre className="font-mono text-[11px] bg-[#060608] border border-zinc-900 p-3 text-cyan-400/90 overflow-x-auto whitespace-pre rounded">
                          {finding.recommendation}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col justify-between items-end gap-4 border-t md:border-t-0 md:border-l border-zinc-900/60 pt-4 md:pt-0 md:pl-6 shrink-0 md:w-48 text-right font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-zinc-600 block uppercase font-bold">CWE_REFERENCE</span>
                      <span className="text-[11px] text-zinc-400 font-bold">OWASP_TOP_10</span>
                    </div>

                    <button
                      onClick={() => onConvertToReport(finding, code)}
                      className="w-full py-2 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/40 hover:border-cyan-400 text-cyan-400 text-[10px] tracking-wider font-bold transition-all uppercase flex items-center justify-center gap-1.5"
                    >
                      FILE_BUG_REPORT
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
