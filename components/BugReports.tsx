import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit3, 
  FileDown, 
  ArrowLeft, 
  Target as TargetIcon,
  ChevronDown,
  Filter,
  Code,
  Share2,
  Bookmark,
  Calendar
} from 'lucide-react';
import { Target, BugReport } from '../types';
import { saveBugReport, deleteBugReport } from '../services/db';

interface BugReportsProps {
  targets: Target[];
  reports: BugReport[];
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  onRefresh: () => void;
  isAddingNew: boolean;
  setIsAddingNew: (val: boolean) => void;
  newReportInitialState: Partial<BugReport> | null;
  setNewReportInitialState: (val: Partial<BugReport> | null) => void;
}

export const BugReports: React.FC<BugReportsProps> = ({
  targets,
  reports,
  selectedReportId,
  setSelectedReportId,
  onRefresh,
  isAddingNew,
  setIsAddingNew,
  newReportInitialState,
  setNewReportInitialState
}) => {
  // Filters
  const [filterTarget, setFilterTarget] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'date'>('severity');

  // Edit / Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<BugReport>({
    id: '',
    title: '',
    target_id: '',
    vuln_type: 'SQL Injection',
    severity: 'High',
    description: '',
    steps_to_reproduce: '',
    impact: '',
    poc: '',
    status: 'Draft',
    created_date: ''
  });

  // Handle opening New Form with initial states if any
  React.useEffect(() => {
    if (isAddingNew) {
      setFormState({
        id: 'report_' + crypto.randomUUID(),
        title: newReportInitialState?.title || '',
        target_id: newReportInitialState?.target_id || (targets[0]?.id || ''),
        vuln_type: newReportInitialState?.vuln_type || 'SQL Injection',
        severity: newReportInitialState?.severity || 'High',
        description: newReportInitialState?.description || '',
        steps_to_reproduce: newReportInitialState?.steps_to_reproduce || '',
        impact: newReportInitialState?.impact || '',
        poc: newReportInitialState?.poc || '',
        status: newReportInitialState?.status || 'Draft',
        created_date: new Date().toISOString()
      });
    }
  }, [isAddingNew, newReportInitialState, targets]);

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const severityWeight = {
    'Critical': 5,
    'High': 4,
    'Medium': 3,
    'Low': 2,
    'Info': 1
  };

  // Sort and Filter reports
  const filteredReports = reports.filter(r => {
    const matchTarget = filterTarget === 'all' || r.target_id === filterTarget;
    const matchSeverity = filterSeverity === 'all' || r.severity === filterSeverity;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchTarget && matchSeverity && matchStatus;
  }).sort((a, b) => {
    if (sortBy === 'severity') {
      return severityWeight[b.severity] - severityWeight[a.severity];
    } else {
      return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
    }
  });

  const handleEditClick = (report: BugReport) => {
    setFormState({ ...report });
    setIsEditing(true);
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title || !formState.target_id) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      await saveBugReport(formState);
      onRefresh();
      setIsEditing(false);
      setIsAddingNew(false);
      setNewReportInitialState(null);
      setSelectedReportId(formState.id);
    } catch (e) {
      console.error(e);
      alert('Failed to save report.');
    }
  };

  const handleDeleteClick = async (reportId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this bug report? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteBugReport(reportId);
      setSelectedReportId(null);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert('Failed to delete report.');
    }
  };

  // Generate HackerOne/Bugcrowd compatible Markdown report
  const handleExportMarkdown = (report: BugReport) => {
    const targetName = targets.find(t => t.id === report.target_id)?.name || 'Unknown Target';
    const markdownContent = `# ${report.title}

## Summary
- **Target**: ${targetName}
- **Vulnerability Type**: ${report.vuln_type}
- **Severity**: ${report.severity}
- **Status**: ${report.status}
- **Report Date**: ${new Date(report.created_date).toLocaleDateString()}

## Description
${report.description || 'No description provided.'}

## Steps to Reproduce
${report.steps_to_reproduce || 'No reproduction steps provided.'}

## Proof of Concept (PoC)
\`\`\`python
${report.poc || '# No PoC code provided.'}
\`\`\`

## Impact
${report.impact || 'No impact analysis provided.'}

---
_Report generated automatically via BugHunter Secure Workspace_
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_vulnerability_report.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex overflow-hidden font-mono text-zinc-300 relative scanline-overlay">
      
      {/* LEFT COLUMN: Report Registry Index */}
      <div className={`w-80 border-r border-[#00FF41]/20 flex flex-col bg-[#060608] shrink-0 h-full ${selectedReport || isAddingNew || isEditing ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#00FF41]/20 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-[#00FF41] tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#00FF41]" />
            BUG_INVENTORY
          </span>
          <button 
            onClick={() => {
              setNewReportInitialState(null);
              setIsAddingNew(true);
              setIsEditing(false);
              setSelectedReportId(null);
            }}
            className="p-1 border border-[#00FF41]/30 hover:bg-[#00FF41]/10 text-[#00FF41] hover:border-[#00FF41] transition-colors"
            title="Create New Bug Report"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Panel */}
        <div className="p-4 border-b border-[#00FF41]/10 space-y-3 bg-zinc-950 shrink-0 text-[10px]">
          <div className="flex items-center justify-between text-zinc-500 font-bold">
            <span className="flex items-center gap-1 uppercase"><Filter className="w-3.5 h-3.5 text-cyan-400" /> AUDIT_FILTERS</span>
            <button 
              onClick={() => {
                setFilterTarget('all');
                setFilterSeverity('all');
                setFilterStatus('all');
              }}
              className="hover:text-white hover:underline uppercase"
            >
              RESET
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div>
              <span className="text-zinc-600 block mb-1 uppercase font-bold">TARGET PROGRAM</span>
              <select 
                value={filterTarget} 
                onChange={(e) => setFilterTarget(e.target.value)}
                className="w-full bg-[#060608] border border-zinc-900 px-2 py-1.5 text-zinc-300 focus:outline-none"
              >
                <option value="all">ALL TARGETS</option>
                {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-zinc-600 block mb-1 uppercase font-bold">SEVERITY</span>
                <select 
                  value={filterSeverity} 
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full bg-[#060608] border border-zinc-900 px-2 py-1.5 text-zinc-300 focus:outline-none"
                >
                  <option value="all">ALL</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="Info">Info</option>
                </select>
              </div>

              <div>
                <span className="text-zinc-600 block mb-1 uppercase font-bold">STATUS</span>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-[#060608] border border-zinc-900 px-2 py-1.5 text-zinc-300 focus:outline-none"
                >
                  <option value="all">ALL</option>
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Duplicate">Duplicate</option>
                </select>
              </div>
            </div>

            <div>
              <span className="text-zinc-600 block mb-1 uppercase font-bold">SORT BY</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSortBy('severity')} 
                  className={`flex-1 py-1 text-center border font-bold ${
                    sortBy === 'severity' ? 'border-[#00FF41] text-[#00FF41] bg-[#00FF41]/5' : 'border-zinc-900 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  SEVERITY
                </button>
                <button 
                  onClick={() => setSortBy('date')} 
                  className={`flex-1 py-1 text-center border font-bold ${
                    sortBy === 'date' ? 'border-[#00FF41] text-[#00FF41] bg-[#00FF41]/5' : 'border-zinc-900 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  DATE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Index List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 text-xs italic">
              No reports found in registry index.
            </div>
          ) : (
            filteredReports.map((r) => {
              const active = selectedReportId === r.id;
              const target = targets.find(t => t.id === r.target_id);
              
              return (
                <div 
                  key={r.id}
                  onClick={() => {
                    setSelectedReportId(r.id);
                    setIsAddingNew(false);
                    setIsEditing(false);
                  }}
                  className={`p-4 text-left cursor-pointer transition-all duration-150 relative ${
                    active 
                      ? 'bg-cyan-500/5 border-l-2 border-cyan-400' 
                      : 'hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="space-y-1 mb-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-bold text-xs truncate max-w-[150px] ${active ? 'text-cyan-400 glow-text-cyan' : 'text-white'}`}>
                        {r.title}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 border shrink-0 ${
                        r.severity === 'Critical' ? 'bg-red-950/40 border-red-500/40 text-red-400' :
                        r.severity === 'High' ? 'bg-orange-950/40 border-orange-500/40 text-orange-400' :
                        r.severity === 'Medium' ? 'bg-yellow-950/40 border-yellow-500/40 text-yellow-400' :
                        'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}>
                        {r.severity}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                      <span className="truncate">{target?.name || 'Unknown Target'}</span>
                      <span className="shrink-0 text-zinc-600">{r.vuln_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] pt-1 border-t border-zinc-900/40">
                    <span className="text-zinc-600">
                      Filed: {new Date(r.created_date).toLocaleDateString()}
                    </span>
                    <span className="text-cyan-400/80 uppercase font-bold">
                      {r.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT WORKSPACE: Detail or Form */}
      <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
        {isAddingNew || isEditing ? (
          /* FORM VIEW */
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 shrink-0">
              <span className="text-xs font-bold text-cyan-400 tracking-widest flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-cyan-400" />
                {isEditing ? 'UPDATE_VULNERABILITY_FILE_RECORD' : 'COMPILE_NEW_VULNERABILITY_REPORT'}
              </span>
              <button 
                onClick={() => {
                  setIsAddingNew(false);
                  setIsEditing(false);
                }}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white border border-zinc-800 px-2.5 py-1"
              >
                <ArrowLeft className="w-4 h-4" /> CANCEL
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="space-y-6 max-w-4xl text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold tracking-wider">REPORT TITLE <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Remote Code Execution via deserialization in /api/v2/config"
                    value={formState.title}
                    onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 rounded-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold tracking-wider">TARGET PROGRAM <span className="text-red-500">*</span></label>
                  <select 
                    required
                    value={formState.target_id}
                    onChange={(e) => setFormState(prev => ({ ...prev, target_id: e.target.value }))}
                    className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 rounded-none"
                  >
                    <option value="" disabled>Select Target</option>
                    {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold tracking-wider">VULNERABILITY TYPE</label>
                  <select 
                    value={formState.vuln_type}
                    onChange={(e) => setFormState(prev => ({ ...prev, vuln_type: e.target.value }))}
                    className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 rounded-none"
                  >
                    <option value="SQL Injection">SQL Injection</option>
                    <option value="Cross-Site Scripting (XSS)">Cross-Site Scripting (XSS)</option>
                    <option value="Server-Side Request Forgery (SSRF)">Server-Side Request Forgery (SSRF)</option>
                    <option value="Insecure Direct Object Reference (IDOR)">Insecure Direct Object Reference (IDOR)</option>
                    <option value="Remote Code Execution (RCE)">Remote Code Execution (RCE)</option>
                    <option value="Cross-Site Request Forgery (CSRF)">Cross-Site Request Forgery (CSRF)</option>
                    <option value="Path Traversal">Path Traversal</option>
                    <option value="Subdomain Takeover">Subdomain Takeover</option>
                    <option value="Broken Authentication">Broken Authentication</option>
                    <option value="Information Disclosure">Information Disclosure</option>
                    <option value="Open Redirect">Open Redirect</option>
                    <option value="Other / Business Logic Flaw">Other / Business Logic Flaw</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold tracking-wider">SEVERITY RATING</label>
                  <select 
                    value={formState.severity}
                    onChange={(e) => setFormState(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 rounded-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Info">Info</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold tracking-wider">TRIAGE STATUS</label>
                  <select 
                    value={formState.status}
                    onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 rounded-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Accepted">Accepted / Triaged</option>
                    <option value="Rejected">Rejected / N/A</option>
                    <option value="Duplicate">Duplicate</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 font-bold tracking-wider">VULNERABILITY DESCRIPTION</label>
                <textarea 
                  rows={4}
                  placeholder="Detail the root cause of the vulnerability. Why does this happen?"
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 rounded-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 font-bold tracking-wider">STEPS TO REPRODUCE (Numbered layout)</label>
                <textarea 
                  rows={5}
                  placeholder="1. Navigate to target URL&#10;2. Inject the payload...&#10;3. Observe response..."
                  value={formState.steps_to_reproduce}
                  onChange={(e) => setFormState(prev => ({ ...prev, steps_to_reproduce: e.target.value }))}
                  className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 rounded-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 font-bold tracking-wider">PROOF_OF_CONCEPT (PoC Code / Payloads)</label>
                <textarea 
                  rows={5}
                  placeholder="GET /api/v2/config?id=1' UNION SELECT NULL-- HTTP/1.1&#10;Host: api.acme.com"
                  value={formState.poc}
                  onChange={(e) => setFormState(prev => ({ ...prev, poc: e.target.value }))}
                  className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 rounded-none font-mono text-[11px]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 font-bold tracking-wider">REAL WORLD SECURITY IMPACT</label>
                <textarea 
                  rows={3}
                  placeholder="Explain what an attacker can achieve with this exploit (e.g. read user credentials, hijack accounts, control servers)."
                  value={formState.impact}
                  onChange={(e) => setFormState(prev => ({ ...prev, impact: e.target.value }))}
                  className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 rounded-none leading-relaxed"
                />
              </div>

              <button 
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-zinc-900 border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold text-xs tracking-widest transition-all shadow-[0_0_10px_rgba(0,229,255,0.1)] hover:shadow-[0_0_15px_rgba(0,229,255,0.2)] rounded-none uppercase"
              >
                COMMIT_REPORT_RECORD
              </button>
            </form>
          </div>
        ) : selectedReport ? (
          /* DETAILS VIEW */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Details Header */}
            <div className="p-6 border-b border-zinc-900 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedReportId(null)}
                  className="md:hidden p-1.5 border border-zinc-800 text-zinc-400 hover:text-white mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white tracking-widest uppercase flex items-center gap-1">
                      <ShieldAlert className="w-4.5 h-4.5 text-cyan-400" />
                      {selectedReport.title}
                    </h2>
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center gap-2 mt-1">
                    <TargetIcon className="w-3.5 h-3.5" />
                    <span>TARGET:</span>
                    <span className="text-zinc-300 font-bold">
                      {targets.find(t => t.id === selectedReport.target_id)?.name || 'Unknown Target'}
                    </span>
                    <span className="text-zinc-700">|</span>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(selectedReport.created_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => handleExportMarkdown(selectedReport)}
                  className="p-1.5 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 flex items-center gap-1.5 text-[10px] font-bold tracking-widest px-3 py-1.5"
                  title="Export Report as HackerOne Markdown"
                >
                  <FileDown className="w-4 h-4" />
                  EXPORT_MD
                </button>
                <button 
                  onClick={() => handleEditClick(selectedReport)}
                  className="p-1.5 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/10 flex items-center gap-1.5 text-[10px] font-bold tracking-widest px-3 py-1.5"
                  title="Edit Record"
                >
                  <Edit3 className="w-4 h-4" />
                  EDIT_BUG
                </button>
                <button 
                  onClick={() => handleDeleteClick(selectedReport.id)}
                  className="p-1.5 border border-red-500/20 text-red-500 hover:bg-red-500/10 flex items-center gap-1.5 text-[10px] font-bold tracking-widest px-3 py-1.5"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                  DESTROY
                </button>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="px-6 py-3 border-b border-zinc-900 bg-zinc-950 flex items-center gap-4 text-xs shrink-0 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">SEVERITY:</span>
                <span className={`font-bold px-2 py-0.5 border ${
                  selectedReport.severity === 'Critical' ? 'bg-red-950/40 border-red-500/40 text-red-400' :
                  selectedReport.severity === 'High' ? 'bg-orange-950/40 border-orange-500/40 text-orange-400' :
                  selectedReport.severity === 'Medium' ? 'bg-yellow-950/40 border-yellow-500/40 text-yellow-400' :
                  'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}>
                  {selectedReport.severity}
                </span>
              </div>
              <span className="text-zinc-800">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">TYPE:</span>
                <span className="text-cyan-400 font-bold">{selectedReport.vuln_type}</span>
              </div>
              <span className="text-zinc-800">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">STATUS:</span>
                <span className="text-zinc-300 font-bold uppercase">{selectedReport.status}</span>
              </div>
            </div>

            {/* Details Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#09090b]">
              {/* Description block */}
              <div className="space-y-2 border border-zinc-900 bg-zinc-950 p-5 rounded-none">
                <span className="text-[10px] font-bold text-[#00FF41] tracking-widest block uppercase">VULNERABILITY DESCRIPTION</span>
                <p className="text-xs leading-relaxed text-zinc-300 whitespace-pre-line font-mono bg-zinc-950 p-3 border border-zinc-900/60 rounded">
                  {selectedReport.description || 'No description provided.'}
                </p>
              </div>

              {/* Steps to Reproduce */}
              <div className="space-y-2 border border-zinc-900 bg-zinc-950 p-5 rounded-none">
                <span className="text-[10px] font-bold text-cyan-400 tracking-widest block uppercase">STEPS TO REPRODUCE</span>
                <p className="text-xs leading-relaxed text-zinc-300 whitespace-pre-line font-mono bg-zinc-950 p-3 border border-zinc-900/60 rounded">
                  {selectedReport.steps_to_reproduce || 'No steps to reproduce listed.'}
                </p>
              </div>

              {/* PoC code */}
              <div className="space-y-2 border border-zinc-900 bg-zinc-950 p-5 rounded-none">
                <span className="text-[10px] font-bold text-yellow-500 tracking-widest block uppercase flex items-center gap-1.5">
                  <Code className="w-4 h-4" />
                  PROOF_OF_CONCEPT (PoC)
                </span>
                <pre className="font-mono text-xs bg-[#060608] border border-zinc-900 p-4 text-[#00FF41]/90 overflow-x-auto whitespace-pre rounded">
                  {selectedReport.poc || '# No exploit code listed.'}
                </pre>
              </div>

              {/* Impact analysis */}
              <div className="space-y-2 border border-zinc-900 bg-zinc-950 p-5 rounded-none">
                <span className="text-[10px] font-bold text-red-400 tracking-widest block uppercase">REAL_WORLD_SECURITY_IMPACT</span>
                <p className="text-xs leading-relaxed text-zinc-300 whitespace-pre-line font-mono bg-zinc-950 p-3 border border-zinc-900/60 rounded">
                  {selectedReport.impact || 'No impact analysis recorded.'}
                </p>
              </div>
            </div>

          </div>
        ) : (
          /* NO SELECTION DEFAULT */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-500 space-y-4">
            <ShieldAlert className="w-12 h-12 text-zinc-700 stroke-[1.5]" />
            <div className="text-center space-y-1">
              <span className="text-xs font-bold tracking-widest text-zinc-400 block uppercase">NO_BUG_REPORT_SELECTED</span>
              <p className="text-[10px] text-zinc-600 max-w-sm mx-auto leading-relaxed">
                Select a vulnerability from the left inventory file tree or click file new report to compile exploit notes, steps, and export Markdown report.
              </p>
            </div>
            <button 
              onClick={() => {
                setNewReportInitialState(null);
                setIsAddingNew(true);
              }}
              className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold tracking-wider"
            >
              FILE_NEW_REPORT
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
