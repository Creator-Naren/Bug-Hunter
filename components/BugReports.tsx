import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search,
  Plus, 
  ArrowLeft,
  Trash2, 
  Edit3, 
  FileDown, 
  Calendar,
  Target as TargetIcon,
  Code,
  FileCode2,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import { BugReport, Target } from '../types';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedMd, setCopiedMd] = useState(false);

  // Form state
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [formState, setFormState] = useState<Partial<BugReport>>({
    title: '',
    target_id: '',
    vuln_type: 'SQL Injection',
    severity: 'High',
    description: '',
    steps_to_reproduce: '',
    impact: '',
    poc: '',
    status: 'Draft'
  });

  // Load pre-loaded initial state when creating from AI finding
  useEffect(() => {
    if (newReportInitialState) {
      setFormState({
        title: newReportInitialState.title || '',
        target_id: newReportInitialState.target_id || (targets[0]?.id || ''),
        vuln_type: newReportInitialState.vuln_type || 'SQL Injection',
        severity: newReportInitialState.severity || 'High',
        description: newReportInitialState.description || '',
        steps_to_reproduce: newReportInitialState.steps_to_reproduce || '',
        impact: newReportInitialState.impact || '',
        poc: newReportInitialState.poc || '',
        status: newReportInitialState.status || 'Draft'
      });
      setEditingReportId(null);
    } else if (isAddingNew && !editingReportId) {
      setFormState({
        title: '',
        target_id: targets[0]?.id || '',
        vuln_type: 'SQL Injection',
        severity: 'High',
        description: '',
        steps_to_reproduce: '',
        impact: '',
        poc: '',
        status: 'Draft'
      });
    }
  }, [newReportInitialState, isAddingNew]);

  const selectedReport = reports.find(r => r.id === selectedReportId) || null;

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vuln_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || r.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesSev && matchesStatus;
  });

  const handleEditClick = (report: BugReport) => {
    setEditingReportId(report.id);
    setFormState({ ...report });
    setIsAddingNew(true);
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title?.trim()) {
      alert('Report title is required.');
      return;
    }

    const reportDoc: BugReport = {
      id: editingReportId || ('bug_' + Date.now()),
      title: formState.title || 'Untitled Bug',
      target_id: formState.target_id || (targets[0]?.id || ''),
      vuln_type: formState.vuln_type || 'Other Vulnerability',
      severity: (formState.severity as any) || 'High',
      description: formState.description || '',
      steps_to_reproduce: formState.steps_to_reproduce || '',
      impact: formState.impact || '',
      poc: formState.poc || '',
      status: (formState.status as any) || 'Draft',
      created_date: editingReportId ? (selectedReport?.created_date || new Date().toISOString()) : new Date().toISOString()
    };

    try {
      await saveBugReport(reportDoc);
      onRefresh();
      setIsAddingNew(false);
      setNewReportInitialState(null);
      setEditingReportId(null);
      setSelectedReportId(reportDoc.id);
    } catch (err) {
      console.error('Failed to save bug report:', err);
      alert('Error saving report to database.');
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm('Are you sure you want to delete this bug report permanently?')) {
      try {
        await deleteBugReport(id);
        onRefresh();
        setSelectedReportId(null);
      } catch (err) {
        console.error('Error deleting report:', err);
      }
    }
  };

  const handleExportMarkdown = (report: BugReport) => {
    const target = targets.find(t => t.id === report.target_id);

    const markdownContent = `# ${report.title}

**Vulnerability Type:** ${report.vuln_type}
**Severity:** ${report.severity}
**Target:** ${target?.name || 'Unspecified Target'} (${target?.url || 'N/A'})
**Status:** ${report.status}
**Date Reported:** ${new Date(report.created_date).toLocaleDateString()}

---

## 1. Summary / Description
${report.description}

## 2. Steps to Reproduce
${report.steps_to_reproduce}

## 3. Proof of Concept (PoC)
\`\`\`
${report.poc}
\`\`\`

## 4. Impact
${report.impact}
`;

    navigator.clipboard.writeText(markdownContent);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#0A0B10]">
      
      {/* Left Inventory File List Panel */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-[#1E2235] bg-[#0D0E17] flex flex-col h-full ${selectedReportId || isAddingNew ? 'hidden md:flex' : 'flex'}`}>

        {/* Panel Header */}
        <div className="p-4 border-b border-[#1E2235] bg-[#0A0B12] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-wider text-white uppercase font-mono">BUG_INVENTORY</span>
            </div>
            <button
              onClick={() => {
                setNewReportInitialState(null);
                setEditingReportId(null);
                setIsAddingNew(true);
                setSelectedReportId(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold tracking-wider font-mono transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>FILE REPORT</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search vulnerability titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#06070B] border border-[#1E2235] text-xs text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50 font-mono placeholder:text-zinc-600"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#06070B] border border-[#1E2235] text-zinc-300 p-1.5 rounded-lg focus:outline-none"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="Critical">CRITICAL</option>
              <option value="High">HIGH</option>
              <option value="Medium">MEDIUM</option>
              <option value="Low">LOW</option>
              <option value="Info">INFO</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#06070B] border border-[#1E2235] text-zinc-300 p-1.5 rounded-lg focus:outline-none"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="Draft">DRAFT</option>
              <option value="Submitted">SUBMITTED</option>
              <option value="Accepted">ACCEPTED</option>
              <option value="Rejected">REJECTED</option>
              <option value="Duplicate">DUPLICATE</option>
            </select>
          </div>
        </div>

        {/* Reports Feed */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs font-mono space-y-2">
              <FileCode2 className="w-8 h-8 text-zinc-600 mx-auto stroke-[1.5]" />
              <div>NO BUG REPORTS FOUND</div>
              <div className="text-[10px] text-zinc-600">File a report or convert AI findings to start tracking.</div>
            </div>
          ) : (
            filteredReports.map((report) => {
              const isSelected = report.id === selectedReportId && !isAddingNew;
              const target = targets.find(t => t.id === report.target_id);

              return (
                <div
                  key={report.id}
                  onClick={() => {
                    setIsAddingNew(false);
                    setSelectedReportId(report.id);
                  }}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(0,255,102,0.08)]'
                      : 'bg-[#0A0B12] border-[#1E2235] text-zinc-400 hover:bg-[#10121D] hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-white truncate font-sans">{report.title}</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      report.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      report.severity === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      report.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {report.severity}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-cyan-400 truncate mb-2">{report.vuln_type}</div>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-[#1E2235]/60">
                    <span className="text-zinc-500 truncate max-w-[140px]">{target?.name || 'General Target'}</span>
                    <span className="text-zinc-400 uppercase font-bold">{report.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0A0B10]">

        {isAddingNew ? (
          /* CREATE / EDIT BUG REPORT FORM */
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E2235] pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="md:hidden p-1.5 rounded-lg border border-[#1E2235] text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-bold text-white tracking-wide font-sans flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  {editingReportId ? 'EDIT VULNERABILITY RECORD' : 'COMPILE VULNERABILITY BUG REPORT'}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSaveReport} className="space-y-6 max-w-4xl text-xs font-mono">
              <div className="space-y-2">
                <label className="block text-zinc-400 font-bold uppercase">REPORT TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. [SQLi] Unauthenticated User ID parameter bypass on /api/user"
                  value={formState.title}
                  onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold uppercase">LINKED TARGET *</label>
                  <select
                    value={formState.target_id}
                    onChange={(e) => setFormState(prev => ({ ...prev, target_id: e.target.value }))}
                    className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50"
                  >
                    {targets.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.platform})</option>
                    ))}
                    {targets.length === 0 && <option value="">No targets registered</option>}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold uppercase">VULNERABILITY CATEGORY *</label>
                  <select
                    value={formState.vuln_type}
                    onChange={(e) => setFormState(prev => ({ ...prev, vuln_type: e.target.value }))}
                    className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="SQL Injection">SQL Injection</option>
                    <option value="Command Injection">Command Injection</option>
                    <option value="Cross-Site Scripting (XSS)">Cross-Site Scripting (XSS)</option>
                    <option value="Insecure Direct Object Reference (IDOR)">IDOR</option>
                    <option value="Server-Side Request Forgery (SSRF)">SSRF</option>
                    <option value="Broken Authentication">Broken Authentication</option>
                    <option value="Path Traversal">Path Traversal</option>
                    <option value="Hardcoded Secret / Credentials">Hardcoded Secret</option>
                    <option value="Unsafe Deserialization">Unsafe Deserialization</option>
                    <option value="Other Security Vulnerability">Other Security Flaw</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold uppercase">SEVERITY RATING *</label>
                  <select
                    value={formState.severity}
                    onChange={(e) => setFormState(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="Info">Info</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-emerald-400 font-bold uppercase">VULNERABILITY DESCRIPTION</label>
                <textarea
                  rows={4}
                  placeholder="Detailed breakdown of the flaw..."
                  value={formState.description}
                  onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-cyan-400 font-bold uppercase">STEPS TO REPRODUCE</label>
                <textarea
                  rows={4}
                  placeholder="1. Navigate to endpoint...&#10;2. Inject payload...&#10;3. Observe response..."
                  value={formState.steps_to_reproduce}
                  onChange={(e) => setFormState(prev => ({ ...prev, steps_to_reproduce: e.target.value }))}
                  className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50 leading-relaxed font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-yellow-400 font-bold uppercase">PROOF OF CONCEPT (PoC / PAYLOADS)</label>
                <textarea
                  rows={5}
                  placeholder="GET /api/v2/user?id=1' OR 1=1-- HTTP/1.1&#10;Host: target.com"
                  value={formState.poc}
                  onChange={(e) => setFormState(prev => ({ ...prev, poc: e.target.value }))}
                  className="w-full bg-[#07080D] border border-[#1E2235] p-3.5 text-emerald-400 rounded-lg focus:outline-none focus:border-emerald-500/50 leading-relaxed font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-rose-400 font-bold uppercase">TECHNICAL & BUSINESS IMPACT</label>
                <textarea
                  rows={3}
                  placeholder="Explain consequence (e.g., total database compromise, privilege escalation)..."
                  value={formState.impact}
                  onChange={(e) => setFormState(prev => ({ ...prev, impact: e.target.value }))}
                  className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50 leading-relaxed font-sans text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,255,102,0.12)]"
                >
                  SAVE BUG REPORT RECORD
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2.5 rounded-lg bg-[#141724] border border-[#252A3F] text-zinc-400 hover:text-white font-semibold text-xs transition-all"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        ) : selectedReport ? (
          /* SELECTED REPORT DETAILS VIEW */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Top Details Action Bar */}
            <div className="p-6 border-b border-[#1E2235] bg-[#0D0E17] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedReportId(null)}
                  className="md:hidden p-1.5 rounded-lg border border-[#1E2235] text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-white font-sans">{selectedReport.title}</h2>
                  <div className="text-xs font-mono text-zinc-400 flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1">
                      <TargetIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>TARGET:</span>
                      <strong className="text-zinc-200">
                        {targets.find(t => t.id === selectedReport.target_id)?.name || 'General Target'}
                      </strong>
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{new Date(selectedReport.created_date).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono">
                <button
                  onClick={() => handleExportMarkdown(selectedReport)}
                  className="px-3.5 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all"
                >
                  {copiedMd ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">MARKDOWN COPIED!</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>EXPORT MARKDOWN</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleEditClick(selectedReport)}
                  className="p-2 rounded-lg bg-[#141724] border border-[#252A3F] text-zinc-300 hover:text-white transition-all"
                  title="Edit Record"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteClick(selectedReport.id)}
                  className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Badges Row */}
            <div className="px-6 py-3 border-b border-[#1E2235] bg-[#0A0B12] flex items-center gap-6 text-xs font-mono shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">SEVERITY:</span>
                <span className={`font-bold px-2.5 py-0.5 rounded border ${
                  selectedReport.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  selectedReport.severity === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  selectedReport.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                  'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                }`}>
                  {selectedReport.severity}
                </span>
              </div>

              <span>|</span>

              <div className="flex items-center gap-2">
                <span className="text-zinc-500">CATEGORY:</span>
                <span className="text-cyan-400 font-bold">{selectedReport.vuln_type}</span>
              </div>

              <span>|</span>

              <div className="flex items-center gap-2">
                <span className="text-zinc-500">STATUS:</span>
                <span className="text-zinc-200 font-bold uppercase">{selectedReport.status}</span>
              </div>
            </div>

            {/* Report Document Body */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">

              {/* Description Block */}
              <div className="p-5 rounded-xl border border-[#1E2235] bg-[#0D0E17] space-y-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase block">
                  VULNERABILITY DESCRIPTION
                </span>
                <p className="text-xs font-sans leading-relaxed text-zinc-200 whitespace-pre-line bg-[#07080D] p-4 rounded-lg border border-[#1B1E2E]">
                  {selectedReport.description || 'No description available.'}
                </p>
              </div>

              {/* Steps to Reproduce */}
              <div className="p-5 rounded-xl border border-[#1E2235] bg-[#0D0E17] space-y-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider uppercase block">
                  STEPS TO REPRODUCE
                </span>
                <pre className="text-xs font-mono leading-relaxed text-zinc-200 whitespace-pre-wrap bg-[#07080D] p-4 rounded-lg border border-[#1B1E2E]">
                  {selectedReport.steps_to_reproduce || 'No steps to reproduce recorded.'}
                </pre>
              </div>

              {/* Proof of Concept Code */}
              <div className="p-5 rounded-xl border border-[#1E2235] bg-[#0D0E17] space-y-2">
                <span className="text-[10px] font-mono font-bold text-yellow-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Code className="w-4 h-4" />
                  PROOF OF CONCEPT (PoC / EXPLOIT PAYLOAD)
                </span>
                <pre className="bg-[#06070B] p-4 rounded-lg border border-[#1E2235] text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
                  {selectedReport.poc || '# No exploit code provided.'}
                </pre>
              </div>

              {/* Impact Analysis */}
              <div className="p-5 rounded-xl border border-[#1E2235] bg-[#0D0E17] space-y-2">
                <span className="text-[10px] font-mono font-bold text-rose-400 tracking-wider uppercase block">
                  TECHNICAL & BUSINESS IMPACT
                </span>
                <p className="text-xs font-sans leading-relaxed text-zinc-200 whitespace-pre-line bg-[#07080D] p-4 rounded-lg border border-[#1B1E2E]">
                  {selectedReport.impact || 'No impact analysis recorded.'}
                </p>
              </div>

            </div>

          </div>
        ) : (
          /* DEFAULT NO SELECTION VIEW */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-500 space-y-4 font-mono">
            <ShieldAlert className="w-12 h-12 text-zinc-700 stroke-[1.5]" />
            <div className="text-center space-y-1">
              <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase block font-sans">
                NO BUG REPORT SELECTED
              </span>
              <p className="text-[10px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Select a vulnerability from the left inventory feed or click 'FILE REPORT' to compile a report.
              </p>
            </div>
            <button
              onClick={() => {
                setNewReportInitialState(null);
                setEditingReportId(null);
                setIsAddingNew(true);
              }}
              className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold tracking-wider"
            >
              FILE NEW REPORT
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
