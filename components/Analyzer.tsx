import React, { useState } from 'react';
import { 
  Play, 
  Code,
  Terminal,
  ShieldAlert, 
  ArrowRight,
  History,
  CheckCircle2,
  Zap,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Bug,
  FileCode,
  Sparkles
} from 'lucide-react';
import { Finding, CodeAnalysis } from '../types';

interface AnalyzerProps {
  onConvertToReport: (finding: Finding, codeSnippet: string) => void;
  onLogEvent: (msg: string) => void;
  historicalAnalyses: CodeAnalysis[];
  onSaveAnalysis: (analysis: CodeAnalysis) => void;
}

const DEFAULT_PYTHON_SAMPLE = `import sqlite3
import os
import subprocess
import yaml

def get_user_profile(user_id):
    # DANGEROUS: SQL Injection flaw
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE id = '{user_id}'"
    cursor.execute(query)
    return cursor.fetchone()

def run_system_ping(host_ip):
    # DANGEROUS: Command Injection flaw
    command = "ping -c 1 " + host_ip
    return subprocess.getoutput(command)

def load_user_config(config_str):
    # DANGEROUS: Unsafe YAML Deserialization
    return yaml.load(config_str)

def read_user_file(filename):
    # DANGEROUS: Path Traversal
    path = os.path.join('/var/app/data', filename)
    with open(path, 'r') as f:
        return f.read()
`;

export const Analyzer: React.FC<AnalyzerProps> = ({
  onConvertToReport,
  onLogEvent,
  historicalAnalyses,
  onSaveAnalysis
}) => {
  const [code, setCode] = useState<string>(DEFAULT_PYTHON_SAMPLE);
  const [isScanning, setIsScanning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<CodeAnalysis | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTabMap, setActiveTabMap] = useState<Record<number, 'analysis' | 'exploit' | 'remediation'>>({});

  const appendTerminalLog = (msg: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleRunScan = async () => {
    if (!code.trim()) {
      alert('Please enter or paste Python code to analyze.');
      return;
    }

    setIsScanning(true);
    setActiveAnalysis(null);
    setTerminalLogs([]);

    appendTerminalLog('INITIALIZING GEMINI 2.5 SAST PIPELINE...');
    appendTerminalLog('Parsing Abstract Syntax Tree (AST)...');
    onLogEvent('Initiated SAST code analysis with Gemini 2.5.');

    try {
      appendTerminalLog('Transmitting payload to /api/analyze endpoint...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server returned an analysis failure.');
      }

      const data = await response.json();

      appendTerminalLog(`ANALYSIS COMPLETE. Found ${data.vulnerabilities.length} threat indicator(s).`);
      appendTerminalLog(`OVERALL POSTURE SEVERITY: ${data.overallSeverity.toUpperCase()}`);

      const newAnalysis: CodeAnalysis = {
        id: 'scan_' + Date.now(),
        code_snippet: code,
        language: 'python',
        findings: data.vulnerabilities || [],
        overallSeverity: data.overallSeverity || 'None',
        summary: data.summary || 'Security analysis complete.',
        created_date: new Date().toISOString()
      };

      setActiveAnalysis(newAnalysis);
      onSaveAnalysis(newAnalysis);
      onLogEvent(`Audit completed. Severity: ${newAnalysis.overallSeverity}. Findings: ${newAnalysis.findings.length}`);

    } catch (err: any) {
      console.error('Code Analysis error:', err);
      appendTerminalLog(`[-] ERROR: ${err.message || 'Scan aborted.'}`);
      onLogEvent(`ERROR: SAST analysis failed — ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const setFindingTab = (index: number, tab: 'analysis' | 'exploit' | 'remediation') => {
    setActiveTabMap(prev => ({ ...prev, [index]: tab }));
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto bg-[#0A0B10]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2235] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
              AI SAST <span className="text-emerald-400 font-mono">AUDIT STATION</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              GEMINI 2.5 FLASH
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Automated deep security analysis, vulnerability detection, exploit simulation, and code remediation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCode(DEFAULT_PYTHON_SAMPLE);
              setActiveAnalysis(null);
            }}
            className="px-3 py-2 rounded-lg bg-[#121421] border border-[#252A3F] text-zinc-300 hover:text-white hover:border-zinc-500 text-xs font-mono font-semibold transition-all"
          >
            LOAD SAMPLE CODE
          </button>
        </div>
      </div>

      {/* Editor & Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Code Input Section */}
        <div className="lg:col-span-8 rounded-xl border border-[#1E2235] bg-[#0D0E17] flex flex-col h-[520px] shadow-lg overflow-hidden">
          <div className="px-4 py-3 bg-[#0A0B12] border-b border-[#1E2235] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-zinc-200">SOURCE_PAYLOAD.py</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                PYTHON 3.x
              </span>
            </div>
            <span className="text-[10px] text-zinc-500">{code.split('\n').length} LINES</span>
          </div>

          <div className="flex-1 relative flex bg-[#07080D]">
            {/* Line numbers column */}
            <div className="w-12 py-3 bg-[#06070B] border-r border-[#1B1E2E] text-zinc-600 font-mono text-xs text-right pr-3 select-none leading-relaxed">
              {code.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed overflow-auto"
              placeholder="# Paste your Python source code here for automated security auditing..."
            />
          </div>

          <div className="px-4 py-3 border-t border-[#1E2235] bg-[#0A0B12] flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500">
              CHAR COUNT: {code.length}
            </span>
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs tracking-wider uppercase transition-all duration-200 font-mono ${
                isScanning 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(0,255,102,0.15)]'
              }`}
            >
              {isScanning ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                  <span>AUDITING AST...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>RUN AI SECURITY AUDIT</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time Scan Terminal & History Drawer */}
        <div className="lg:col-span-4 rounded-xl border border-[#1E2235] bg-[#0D0E17] flex flex-col h-[520px] shadow-lg overflow-hidden font-mono">
          <div className="px-4 py-3 bg-[#0A0B12] border-b border-[#1E2235] flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-bold text-zinc-300">
              <Terminal className="w-4 h-4 text-cyan-400" />
              SAST_TELEMETRY_LOG
            </span>
            {isScanning && (
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SCANNING
              </span>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-2 text-[10px] bg-[#07080D] text-zinc-400 leading-relaxed">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className={log.includes('ERROR') ? 'text-rose-400 font-bold' : log.includes('COMPLETE') ? 'text-emerald-400 font-bold' : 'text-cyan-300/90'}>
                {log}
              </div>
            ))}
            
            {terminalLogs.length === 0 && !isScanning && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-center space-y-2 py-12">
                <Code className="w-8 h-8 text-zinc-700 stroke-[1.5]" />
                <div className="text-zinc-500 font-bold">AWAITING SCAN COMMAND</div>
                <div className="text-[9px] text-zinc-600 max-w-[200px]">
                  Click 'RUN AI SECURITY AUDIT' to execute Gemini SAST threat analysis.
                </div>
              </div>
            )}
          </div>

          {/* Historical Scans List */}
          <div className="border-t border-[#1E2235] bg-[#0A0B12] p-4 min-h-[160px] max-h-[190px] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-purple-400" />
                AUDIT HISTORY ({historicalAnalyses.length})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 text-[10px] pr-1">
              {historicalAnalyses.map((hist) => (
                <div 
                  key={hist.id}
                  onClick={() => {
                    setCode(hist.code_snippet);
                    setActiveAnalysis(hist);
                    setTerminalLogs([`[+] Loaded audit from cache: ${new Date(hist.created_date).toLocaleString()}`]);
                  }}
                  className="p-2.5 rounded-lg border border-[#1E2235] bg-[#07080D] hover:border-cyan-500/40 hover:bg-[#121421] cursor-pointer flex items-center justify-between transition-all group"
                >
                  <span className="truncate text-zinc-400 group-hover:text-cyan-300 font-sans font-medium">
                    {new Date(hist.created_date).toLocaleTimeString()}
                  </span>
                  <span className={`font-bold uppercase text-[9px] px-1.5 py-0.5 rounded border ${
                    hist.overallSeverity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                    hist.overallSeverity === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    hist.overallSeverity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {hist.overallSeverity}
                  </span>
                </div>
              ))}

              {historicalAnalyses.length === 0 && (
                <div className="text-zinc-600 text-center py-4 text-[10px] italic">
                  No historical audits recorded.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Analysis Audit Results View */}
      {activeAnalysis && (
        <div className="rounded-xl border border-[#1E2235] bg-[#0D0E17] p-6 lg:p-8 space-y-6 shadow-2xl">

          {/* Audit Posture Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1E2235] pb-6">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase font-mono">
                  EXECUTIVE POSTURE SUMMARY
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {activeAnalysis.findings.length} VULNERABILITIES DETECTED
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {activeAnalysis.summary}
              </p>
            </div>

            <div className="text-right flex flex-col items-end gap-1 shrink-0 font-mono">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest">OVERALL POSTURE RATING</span>
              <span className={`text-base font-extrabold px-4 py-1.5 rounded-lg border shadow-lg ${
                activeAnalysis.overallSeverity === 'Critical' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' :
                activeAnalysis.overallSeverity === 'High' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                activeAnalysis.overallSeverity === 'Medium' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' :
                'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              }`}>
                {activeAnalysis.overallSeverity} SEVERITY
              </span>
            </div>
          </div>

          {/* Detailed Findings List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white tracking-wider uppercase font-mono flex items-center gap-2">
                <Bug className="w-4 h-4 text-emerald-400" />
                IDENTIFIED VULNERABILITY THREAT VECTORS ({activeAnalysis.findings.length})
              </span>
            </div>

            {activeAnalysis.findings.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 text-xs border border-dashed border-[#1E2235] rounded-xl bg-[#08090E]/50 font-mono space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto stroke-[1.5]" />
                <div className="text-white font-bold text-sm font-sans">NO VULNERABILITIES DETECTED</div>
                <div className="text-zinc-500 text-xs max-w-md mx-auto">
                  Static analysis did not identify any known security flaws or questionable coding patterns in this payload.
                </div>
              </div>
            ) : (
              activeAnalysis.findings.map((finding, index) => {
                const currentTab = activeTabMap[index] || 'analysis';

                return (
                  <div
                    key={index}
                    className="rounded-xl border border-[#1E2235] bg-[#0A0B12] p-6 space-y-5 hover:border-[#2B314B] transition-all shadow-md"
                  >
                    {/* Finding Title & Badges */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2235] pb-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border font-mono ${
                          finding.severity === 'Critical' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' :
                          finding.severity === 'High' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                          finding.severity === 'Medium' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' :
                          'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        }`}>
                          {finding.severity}
                        </span>

                        <span className="text-base font-bold text-white font-sans">{finding.type}</span>

                        {finding.cwe && (
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[#141724] border border-[#252A3F] text-purple-400">
                            {finding.cwe}
                          </span>
                        )}

                        <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-[#141724] border border-[#252A3F] text-zinc-400">
                          LINE {finding.lineNumber}
                        </span>
                      </div>

                      <button
                        onClick={() => onConvertToReport(finding, code)}
                        className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold tracking-wider font-mono transition-all flex items-center gap-1.5 shrink-0"
                      >
                        <span>FILE BUG REPORT</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sub-tabs: Analysis, Exploit Scenario, Remediation */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-[#1E2235] pb-2 text-xs font-mono">
                        <button
                          onClick={() => setFindingTab(index, 'analysis')}
                          className={`px-3 py-1.5 rounded-md transition-all ${
                            currentTab === 'analysis'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          THREAT ANALYSIS & IMPACT
                        </button>

                        <button
                          onClick={() => setFindingTab(index, 'exploit')}
                          className={`px-3 py-1.5 rounded-md transition-all ${
                            currentTab === 'exploit'
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          EXPLOIT SCENARIO
                        </button>

                        <button
                          onClick={() => setFindingTab(index, 'remediation')}
                          className={`px-3 py-1.5 rounded-md transition-all ${
                            currentTab === 'remediation'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          SECURE CODE FIX
                        </button>
                      </div>

                      {/* Tab 1: Threat Analysis */}
                      {currentTab === 'analysis' && (
                        <div className="space-y-4 text-xs font-mono">
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                              VULNERABILITY DESCRIPTION:
                            </span>
                            <p className="text-zinc-300 leading-relaxed bg-[#07080D] p-3.5 rounded-lg border border-[#1E2235] font-sans text-xs">
                              {finding.description}
                            </p>
                          </div>

                          {finding.impact && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">
                                TECHNICAL & BUSINESS IMPACT:
                              </span>
                              <p className="text-zinc-300 leading-relaxed bg-[#07080D] p-3.5 rounded-lg border border-[#1E2235] font-sans text-xs">
                                {finding.impact}
                              </p>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                              RECOMMENDED REMEDIATION:
                            </span>
                            <p className="text-zinc-300 leading-relaxed bg-[#07080D] p-3.5 rounded-lg border border-[#1E2235] font-sans text-xs">
                              {finding.recommendation}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tab 2: Exploit Scenario */}
                      {currentTab === 'exploit' && (
                        <div className="space-y-2 text-xs font-mono">
                          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                            STEP-BY-STEP ATTACK SIMULATION:
                          </span>
                          <div className="bg-[#07080D] p-4 rounded-lg border border-[#1E2235] text-zinc-300 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                            {finding.exploitScenario || 'Standard exploitation techniques allow attackers to abuse this input vector.'}
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Remediation Code */}
                      {currentTab === 'remediation' && (
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                              REFACTORED SECURE PYTHON CODE:
                            </span>
                            {finding.remediationCode && (
                              <button
                                onClick={() => handleCopyCode(finding.remediationCode!, index)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141724] border border-[#252A3F] text-zinc-300 hover:text-white text-[10px]"
                              >
                                {copiedIndex === index ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400">COPIED</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>COPY FIX</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          <pre className="bg-[#06070B] p-4 rounded-lg border border-[#1E2235] text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                            {finding.remediationCode || '# Follow standard secure coding guidelines to patch this vulnerability.'}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};
