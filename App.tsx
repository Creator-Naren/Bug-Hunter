/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Targets } from './components/Targets';
import { BugReports } from './components/BugReports';
import { Analyzer } from './components/Analyzer';
import { getTargets, getBugReports, getCodeAnalyses, saveCodeAnalysis } from './services/db';
import { Target, BugReport, CodeAnalysis, Finding } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [targets, setTargets] = useState<Target[]>([]);
  const [reports, setReports] = useState<BugReport[]>([]);
  const [historicalAnalyses, setHistoricalAnalyses] = useState<CodeAnalysis[]>([]);
  
  // Navigation & interaction helper states
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isAddingNewTarget, setIsAddingNewTarget] = useState(false);
  const [isAddingNewReport, setIsAddingNewReport] = useState(false);
  const [newReportInitialState, setNewReportInitialState] = useState<Partial<BugReport> | null>(null);

  // System Logs Daemon State (Sidebar Feed)
  const [recentLogs, setRecentLogs] = useState<string[]>([
    'System initialization sequence complete.',
    'Secure Firestore communication channel established.',
    'Gemini 2.5 SAST Security engine online.',
    'Ready for code scanning operations.'
  ]);

  // Log Helper
  const addSystemLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setRecentLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 15)]);
  };

  // Fetch Firestore database logs on mount and updates
  const fetchAllData = async () => {
    try {
      const dbTargets = await getTargets();
      const dbReports = await getBugReports();
      const dbAnalyses = await getCodeAnalyses();
      
      setTargets(dbTargets);
      setReports(dbReports);
      setHistoricalAnalyses(dbAnalyses);
    } catch (e) {
      console.error('Error fetching workspace data:', e);
      addSystemLog('ERROR: Firestore synchronization failure.');
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = () => {
    fetchAllData();
  };

  // Convert AI Finding to Bug Report Form with enhanced details
  const handleConvertToReport = (finding: Finding, codeSnippet: string) => {
    const cweHeader = finding.cwe ? ` [${finding.cwe}]` : '';
    const codeLines = codeSnippet.split('\n');
    const startLine = Math.max(0, finding.lineNumber - 5);
    const endLine = Math.min(codeLines.length, finding.lineNumber + 5);
    const slicedPoc = codeLines.slice(startLine, endLine).join('\n');

    const stepsToReproduce = finding.exploitScenario
      ? `Exploit Scenario / Attack Path:\n${finding.exploitScenario}`
      : `1. Review Python code around line ${finding.lineNumber}.\n2. Trigger vulnerable code execution path.`;

    const impactText = finding.impact
      ? `Technical & Business Impact:\n${finding.impact}\n\nRemediation Recommendation:\n${finding.recommendation}`
      : `Exploitation of this finding may lead to security compromise.\n\nRecommendation:\n${finding.recommendation}`;

    const initialReport: Partial<BugReport> = {
      title: `[AI Audit] ${finding.type}${cweHeader} at Line ${finding.lineNumber}`,
      vuln_type: finding.type,
      severity: finding.severity,
      description: `During an automated SAST audit, BugHunter AI identified a ${finding.severity}-severity vulnerability (${finding.cwe || 'CWE Unspecified'}):\n\n${finding.description}`,
      steps_to_reproduce: stepsToReproduce,
      poc: `# Vulnerable Code Snippet (Line ${finding.lineNumber}):\n${slicedPoc}\n\n${finding.remediationCode ? `# Suggested Remediation Code:\n${finding.remediationCode}` : ''}`,
      impact: impactText,
      status: 'Draft'
    };

    setNewReportInitialState(initialReport);
    setIsAddingNewReport(true);
    setSelectedReportId(null);
    setActiveTab('reports');
    addSystemLog(`Converted AI Finding (${finding.type}) -> Draft Bug Report.`);
  };

  // Save historical scans
  const handleSaveAnalysis = async (analysis: CodeAnalysis) => {
    try {
      await saveCodeAnalysis(analysis);
      setHistoricalAnalyses(prev => [analysis, ...prev]);
    } catch (e) {
      console.error('Error saving historical analysis:', e);
    }
  };

  // Quick Action triggers from Dashboard
  const triggerNewTargetForm = () => {
    setIsAddingNewTarget(true);
    setSelectedTargetId(null);
    setActiveTab('targets');
    addSystemLog('Opening target registration workspace.');
  };

  const triggerNewReportForm = () => {
    setNewReportInitialState(null);
    setIsAddingNewReport(true);
    setSelectedReportId(null);
    setActiveTab('reports');
    addSystemLog('Opening vulnerability compiler workspace.');
  };

  const triggerNewReportFormWithTarget = (targetId: string) => {
    setNewReportInitialState({ target_id: targetId });
    setIsAddingNewReport(true);
    setSelectedReportId(null);
    setActiveTab('reports');
    addSystemLog(`Compiler pre-loaded with target ID: ${targetId}`);
  };

  return (
    <div className="flex h-screen bg-[#090A0F] text-zinc-100 overflow-hidden font-sans select-none antialiased">
      
      {/* SIDEBAR NAVIGATION */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Auto close forms on tab navigation
          if (tab !== 'targets') setIsAddingNewTarget(false);
          if (tab !== 'reports') {
            setIsAddingNewReport(false);
            setNewReportInitialState(null);
          }
        }} 
        recentLogs={recentLogs} 
      />

      {/* CORE WORKSPACE INTERFACE */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0D0E15]">
        {activeTab === 'dashboard' && (
          <Dashboard 
            targets={targets} 
            reports={reports} 
            setActiveTab={setActiveTab}
            setSelectedTargetId={setSelectedTargetId}
            triggerNewTargetForm={triggerNewTargetForm}
            triggerNewReportForm={triggerNewReportForm}
          />
        )}

        {activeTab === 'analyzer' && (
          <Analyzer 
            onConvertToReport={handleConvertToReport}
            onLogEvent={addSystemLog}
            historicalAnalyses={historicalAnalyses}
            onSaveAnalysis={handleSaveAnalysis}
          />
        )}

        {activeTab === 'targets' && (
          <Targets 
            targets={targets}
            reports={reports}
            selectedTargetId={selectedTargetId}
            setSelectedTargetId={setSelectedTargetId}
            onRefresh={handleRefresh}
            triggerNewReportFormWithTarget={triggerNewReportFormWithTarget}
            isAddingNew={isAddingNewTarget}
            setIsAddingNew={setIsAddingNewTarget}
          />
        )}

        {activeTab === 'reports' && (
          <BugReports 
            targets={targets}
            reports={reports}
            selectedReportId={selectedReportId}
            setSelectedReportId={setSelectedReportId}
            onRefresh={handleRefresh}
            isAddingNew={isAddingNewReport}
            setIsAddingNew={setIsAddingNewReport}
            newReportInitialState={newReportInitialState}
            setNewReportInitialState={setNewReportInitialState}
          />
        )}
      </main>

    </div>
  );
};

export default App;
