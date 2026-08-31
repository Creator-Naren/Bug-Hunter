import React, { useState, useEffect } from 'react';
import { 
  Target as TargetIcon, 
  Search, 
  Plus, 
  ArrowLeft, 
  Trash2, 
  CheckSquare, 
  Square, 
  Save, 
  ExternalLink, 
  FileText, 
  ShieldAlert,
  FolderOpen,
  PlusSquare,
  Sparkles,
  ClipboardList,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { Target, BugReport, MethodologyChecklist, ChecklistItem } from '../types';
import { saveTarget, deleteTarget, saveChecklist, getChecklists } from '../services/db';

interface TargetsProps {
  targets: Target[];
  reports: BugReport[];
  selectedTargetId: string | null;
  setSelectedTargetId: (id: string | null) => void;
  onRefresh: () => void;
  triggerNewReportFormWithTarget: (targetId: string) => void;
  isAddingNew: boolean;
  setIsAddingNew: (val: boolean) => void;
}

export const Targets: React.FC<TargetsProps> = ({
  targets,
  reports,
  selectedTargetId,
  setSelectedTargetId,
  onRefresh,
  triggerNewReportFormWithTarget,
  isAddingNew,
  setIsAddingNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'details' | 'checklist' | 'reports'>('details');

  // New Target Form State
  const [newTarget, setNewTarget] = useState({
    name: '',
    url: '',
    platform: 'HackerOne',
    scope: '',
    out_of_scope: '',
    notes: ''
  });

  // Checklists State
  const [loadedChecklists, setLoadedChecklists] = useState<MethodologyChecklist[]>([]);
  const [customChecklistItemText, setCustomChecklistItemText] = useState('');
  const [targetNotes, setTargetNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const selectedTarget = targets.find(t => t.id === selectedTargetId) || null;
  const linkedReports = reports.filter(r => r.target_id === selectedTargetId);

  // Sync notes when selected target changes
  useEffect(() => {
    if (selectedTarget) {
      setTargetNotes(selectedTarget.notes || '');
      loadChecklistsForTarget(selectedTarget.id);
    }
  }, [selectedTargetId]);

  const loadChecklistsForTarget = async (targetId: string) => {
    try {
      const data = await getChecklists(targetId);
      setLoadedChecklists(data);
    } catch (e) {
      console.error('Error loading checklists:', e);
    }
  };

  const filteredTargets = targets.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.name.trim()) {
      alert('Target program name is required.');
      return;
    }

    const targetDoc: Target = {
      id: 'target_' + Date.now(),
      name: newTarget.name,
      url: newTarget.url,
      platform: newTarget.platform,
      scope: newTarget.scope,
      out_of_scope: newTarget.out_of_scope,
      status: 'Active',
      notes: newTarget.notes,
      createdAt: new Date().toISOString()
    };

    try {
      await saveTarget(targetDoc);
      onRefresh();
      setIsAddingNew(false);
      setSelectedTargetId(targetDoc.id);
      setNewTarget({ name: '', url: '', platform: 'HackerOne', scope: '', out_of_scope: '', notes: '' });
    } catch (err) {
      console.error('Failed to create target:', err);
      alert('Error saving target to database.');
    }
  };

  const handleDeleteTarget = async (id: string) => {
    if (confirm('Are you sure you want to remove this target from your registry?')) {
      try {
        await deleteTarget(id);
        onRefresh();
        setSelectedTargetId(null);
      } catch (e) {
        console.error('Failed to delete target:', e);
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedTarget) return;
    setIsSavingNotes(true);
    try {
      const updated: Target = {
        ...selectedTarget,
        notes: targetNotes
      };
      await saveTarget(updated);
      onRefresh();
    } catch (e) {
      console.error('Error updating target notes:', e);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleInitializeChecklist = async (type: 'OWASP' | 'RECON') => {
    if (!selectedTarget) return;

    let defaultItems: string[] = [];
    let typeName = 'OWASP Top 10';

    if (type === 'OWASP') {
      typeName = 'OWASP Top 10';
      defaultItems = [
        'A01:2021-Broken Access Control (IDOR, Privilege Escalation)',
        'A02:2021-Cryptographic Failures (Hardcoded Secrets, Weak Hashes)',
        'A03:2021-Injection (SQLi, Command Injection, LDAP)',
        'A04:2021-Insecure Design (Missing Rate Limits, Flawed Logic)',
        'A05:2021-Security Misconfiguration (Debug Mode, Unused Ports)',
        'A06:2021-Vulnerable and Outdated Components (Outdated PyPI packages)',
        'A07:2021-Identification & Authentication Failures (Weak Passwords, Session Reuse)',
        'A08:2021-Software and Data Integrity Failures (Unsafe Yaml, Pickle)',
        'A09:2021-Security Logging & Monitoring Failures',
        'A10:2021-Server-Side Request Forgery (SSRF)'
      ];
    } else {
      typeName = 'Recon & Asset Discovery';
      defaultItems = [
        'Subdomain Enumeration (Amass, Subfinder)',
        'Port Scanning & Service Fingerprinting (Nmap, Masscan)',
        'Directory & Endpoint Fuzzing (ffuf, Dirsearch)',
        'GitHub / Code Leak Discovery (Trufflehog)',
        'Tech Stack & Parameter Discovery (Arjun, Wappalyzer)',
        'Authentication & OAuth Flow Inspection'
      ];
    }

    const items: ChecklistItem[] = defaultItems.map((label, idx) => ({
      id: `item_${Date.now()}_${idx}`,
      label,
      done: false
    }));

    const newChecklist: MethodologyChecklist = {
      id: `${selectedTarget.id}_${type}`,
      target_id: selectedTarget.id,
      checklist_type: typeName,
      items
    };

    try {
      await saveChecklist(newChecklist);
      setLoadedChecklists(prev => [...prev.filter(c => c.id !== newChecklist.id), newChecklist]);
    } catch (e) {
      console.error('Error creating checklist:', e);
    }
  };

  const handleToggleChecklistItem = async (checklist: MethodologyChecklist, itemId: string) => {
    const updatedItems = checklist.items.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    const updatedChecklist: MethodologyChecklist = {
      ...checklist,
      items: updatedItems
    };

    try {
      await saveChecklist(updatedChecklist);
      setLoadedChecklists(prev => prev.map(c => c.id === updatedChecklist.id ? updatedChecklist : c));
    } catch (e) {
      console.error('Error toggling item:', e);
    }
  };

  const handleAddCustomChecklistItem = async (checklist: MethodologyChecklist) => {
    if (!customChecklistItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: `item_${Date.now()}`,
      label: customChecklistItemText.trim(),
      done: false
    };

    const updatedChecklist: MethodologyChecklist = {
      ...checklist,
      items: [...checklist.items, newItem]
    };

    try {
      await saveChecklist(updatedChecklist);
      setLoadedChecklists(prev => prev.map(c => c.id === updatedChecklist.id ? updatedChecklist : c));
      setCustomChecklistItemText('');
    } catch (e) {
      console.error('Error adding item:', e);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#0A0B10]">
      
      {/* Left Target List Panel */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-[#1E2235] bg-[#0D0E17] flex flex-col h-full ${selectedTargetId || isAddingNew ? 'hidden md:flex' : 'flex'}`}>

        {/* Panel Header */}
        <div className="p-4 border-b border-[#1E2235] bg-[#0A0B12] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TargetIcon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-wider text-white uppercase font-mono">TARGET_REGISTRY</span>
            </div>
            <button
              onClick={() => {
                setIsAddingNew(true);
                setSelectedTargetId(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold tracking-wider font-mono transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD TARGET</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search targets or platforms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#06070B] border border-[#1E2235] text-xs text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500/50 font-mono placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Target Cards Feed */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTargets.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs font-mono space-y-2">
              <FolderOpen className="w-8 h-8 text-zinc-600 mx-auto stroke-[1.5]" />
              <div>NO TARGETS FOUND</div>
              <div className="text-[10px] text-zinc-600">Register a new bug bounty target or asset scope.</div>
            </div>
          ) : (
            filteredTargets.map((target) => {
              const isSelected = target.id === selectedTargetId && !isAddingNew;
              const bugCount = reports.filter(r => r.target_id === target.id).length;

              return (
                <div
                  key={target.id}
                  onClick={() => {
                    setIsAddingNew(false);
                    setSelectedTargetId(target.id);
                  }}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(0,255,102,0.08)]'
                      : 'bg-[#0A0B12] border-[#1E2235] text-zinc-400 hover:bg-[#10121D] hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white truncate max-w-[180px] font-sans">{target.name}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#141724] border border-[#252A3F] text-cyan-400 font-bold">
                      {target.platform}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 truncate mb-2">{target.url || 'No scoping URL'}</div>
                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-[#1E2235]/60">
                    <span className="text-zinc-500">{bugCount} BUGS FILED</span>
                    <span className="text-emerald-400 font-bold">{target.status}</span>
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
          /* CREATE TARGET FORM */
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
                  <PlusSquare className="w-5 h-5 text-emerald-400" />
                  REGISTER NEW TARGET PROGRAM
                </h2>
              </div>
            </div>

            <form onSubmit={handleCreateTarget} className="space-y-6 max-w-3xl text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold uppercase">TARGET PROGRAM NAME *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp Security"
                    value={newTarget.name}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold uppercase">BOUNTY PLATFORM *</label>
                  <select
                    value={newTarget.platform}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="HackerOne">HackerOne</option>
                    <option value="Bugcrowd">Bugcrowd</option>
                    <option value="Intigriti">Intigriti</option>
                    <option value="YesWeHack">YesWeHack</option>
                    <option value="Private Program">Private Program</option>
                    <option value="Self Hosted / Internal">Self Hosted / Internal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 font-bold uppercase">SCOPING URL / DOMAIN</label>
                <input
                  type="text"
                  placeholder="https://hackerone.com/acme or https://api.acme.com"
                  value={newTarget.url}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-emerald-400 font-bold uppercase">IN-SCOPE ASSETS & WILDCARDS</label>
                <textarea
                  rows={4}
                  placeholder="*.acme.com&#10;api.acme.com&#10;mobile-app-v2.apk"
                  value={newTarget.scope}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, scope: e.target.value }))}
                  className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-rose-400 font-bold uppercase">OUT-OF-SCOPE RULES</label>
                <textarea
                  rows={3}
                  placeholder="blog.acme.com&#10;Third party integration forms&#10;DoS / Automated Scanner Denial"
                  value={newTarget.out_of_scope}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, out_of_scope: e.target.value }))}
                  className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 font-bold uppercase">INITIAL OPERATOR NOTES</label>
                <textarea
                  rows={3}
                  placeholder="Recon notes, test accounts, JWT secrets, special headers..."
                  value={newTarget.notes}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-[#0D0E17] border border-[#1E2235] px-3.5 py-2.5 text-white rounded-lg focus:outline-none focus:border-emerald-500/50 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,255,102,0.12)]"
                >
                  SAVE TARGET PROGRAM
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
        ) : selectedTarget ? (
          /* SELECTED TARGET DETAILS & METHODOLOGY WORKSPACE */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* Workspace Top Bar */}
            <div className="p-6 border-b border-[#1E2235] bg-[#0D0E17] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedTargetId(null)}
                  className="md:hidden p-1.5 rounded-lg border border-[#1E2235] text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white font-sans">{selectedTarget.name}</h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#141724] border border-[#252A3F] text-cyan-400">
                      {selectedTarget.platform}
                    </span>
                  </div>
                  {selectedTarget.url && (
                    <a
                      href={selectedTarget.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-zinc-400 hover:text-emerald-400 flex items-center gap-1 mt-1 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{selectedTarget.url}</span>
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-mono">
                <button
                  onClick={() => triggerNewReportFormWithTarget(selectedTarget.id)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>FILE BUG REPORT</span>
                </button>
                <button
                  onClick={() => handleDeleteTarget(selectedTarget.id)}
                  className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all"
                  title="Delete Target"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub Nav Workspace Tabs */}
            <div className="px-6 border-b border-[#1E2235] bg-[#0A0B12] flex items-center gap-6 text-xs font-mono shrink-0">
              <button
                onClick={() => setActiveWorkspaceTab('details')}
                className={`py-3 border-b-2 font-bold transition-all flex items-center gap-2 ${
                  activeWorkspaceTab === 'details'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>SCOPE & NOTES</span>
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('checklist')}
                className={`py-3 border-b-2 font-bold transition-all flex items-center gap-2 ${
                  activeWorkspaceTab === 'checklist'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>METHODOLOGY CHECKLIST</span>
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('reports')}
                className={`py-3 border-b-2 font-bold transition-all flex items-center gap-2 ${
                  activeWorkspaceTab === 'reports'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>LINKED BUG REPORTS ({linkedReports.length})</span>
              </button>
            </div>

            {/* Tab Workspace Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">

              {/* TAB 1: SCOPE & NOTES */}
              {activeWorkspaceTab === 'details' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs font-mono">

                  {/* Scope Details */}
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl border border-[#1E2235] bg-[#0D0E17] space-y-3">
                      <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase block">
                        IN-SCOPE ASSETS
                      </span>
                      <pre className="text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed bg-[#07080D] p-3 rounded-lg border border-[#1B1E2E]">
                        {selectedTarget.scope || 'No explicit scope defined.'}
                      </pre>
                    </div>

                    <div className="p-5 rounded-xl border border-[#1E2235] bg-[#0D0E17] space-y-3">
                      <span className="text-[10px] font-bold text-rose-400 tracking-wider uppercase block">
                        OUT-OF-SCOPE RULES
                      </span>
                      <pre className="text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed bg-[#07080D] p-3 rounded-lg border border-[#1B1E2E]">
                        {selectedTarget.out_of_scope || 'No out of scope rules defined.'}
                      </pre>
                    </div>
                  </div>

                  {/* Notes Editor */}
                  <div className="p-5 rounded-xl border border-[#1E2235] bg-[#0D0E17] flex flex-col space-y-3 h-[450px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase block">
                        RECON & OPERATOR NOTES
                      </span>
                      <button
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 font-bold text-[10px] flex items-center gap-1 transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSavingNotes ? 'SAVING...' : 'SAVE NOTES'}</span>
                      </button>
                    </div>

                    <textarea
                      value={targetNotes}
                      onChange={(e) => setTargetNotes(e.target.value)}
                      placeholder="Write your research notes, API tokens, payloads, or session cookies here..."
                      className="flex-1 bg-[#07080D] border border-[#1E2235] p-3.5 text-zinc-200 rounded-lg focus:outline-none focus:border-cyan-500/50 resize-none font-mono text-xs leading-relaxed"
                    />
                  </div>

                </div>
              )}

              {/* TAB 2: METHODOLOGY CHECKLIST */}
              {activeWorkspaceTab === 'checklist' && (
                <div className="space-y-6">
                  {loadedChecklists.length === 0 ? (
                    <div className="p-12 text-center rounded-xl border border-dashed border-[#1E2235] bg-[#0D0E17] space-y-4 font-mono">
                      <Sparkles className="w-10 h-10 text-emerald-400 mx-auto stroke-[1.5]" />
                      <div className="text-white font-bold text-sm font-sans">INITIALIZE SECURITY AUDIT METHODOLOGY</div>
                      <p className="text-zinc-400 text-xs max-w-md mx-auto">
                        Choose a structured methodology framework to track vulnerability testing across OWASP Top 10 or Recon phases.
                      </p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => handleInitializeChecklist('OWASP')}
                          className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs"
                        >
                          INITIALIZE OWASP TOP 10
                        </button>
                        <button
                          onClick={() => handleInitializeChecklist('RECON')}
                          className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 font-bold text-xs"
                        >
                          INITIALIZE RECON METHODOLOGY
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono text-xs">
                      {loadedChecklists.map((checklist) => {
                        const total = checklist.items.length;
                        const completed = checklist.items.filter(i => i.done).length;
                        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                        return (
                          <div key={checklist.id} className="p-5 rounded-xl border border-[#1E2235] bg-[#0D0E17] space-y-4 flex flex-col min-h-[360px]">
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase block font-sans">
                                {checklist.checklist_type}
                              </span>
                              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                                <span>PROGRESS: {percent}% ({completed}/{total} completed)</span>
                                <div className="w-28 bg-[#07080D] border border-[#1E2235] h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-emerald-400 h-full transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 max-h-[260px] pr-1">
                              {checklist.items.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => handleToggleChecklistItem(checklist, item.id)}
                                  className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                    item.done
                                      ? 'bg-emerald-500/5 border-emerald-500/20 text-zinc-500 line-through'
                                      : 'bg-[#07080D] border-[#1E2235] text-zinc-200 hover:border-emerald-500/30'
                                  }`}
                                >
                                  {item.done ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                                  )}
                                  <span className="leading-relaxed select-none">{item.label}</span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-[#1E2235] flex gap-2">
                              <input
                                type="text"
                                placeholder="Add custom audit item..."
                                value={customChecklistItemText}
                                onChange={(e) => setCustomChecklistItemText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddCustomChecklistItem(checklist);
                                }}
                                className="flex-1 bg-[#07080D] border border-[#1E2235] px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500/50 text-xs text-white"
                              />
                              <button
                                onClick={() => handleAddCustomChecklistItem(checklist)}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs"
                              >
                                ADD
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LINKED BUG REPORTS */}
              {activeWorkspaceTab === 'reports' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-[#1E2235] pb-3">
                    <span className="text-xs font-bold text-zinc-400 tracking-wider">INDEX OF LINKED BUG REPORTS</span>
                    <button
                      onClick={() => triggerNewReportFormWithTarget(selectedTarget.id)}
                      className="text-xs font-bold text-emerald-400 hover:underline"
                    >
                      + FILE NEW REPORT
                    </button>
                  </div>

                  {linkedReports.length === 0 ? (
                    <div className="p-12 text-center rounded-xl border border-dashed border-[#1E2235] bg-[#0D0E17] text-zinc-500 space-y-2">
                      <div>NO BUG REPORTS FILED FOR THIS TARGET</div>
                      <div className="text-[10px] text-zinc-600">Run code analysis or manually compile a report.</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {linkedReports.map((report) => (
                        <div
                          key={report.id}
                          className="p-4 rounded-xl border border-[#1E2235] bg-[#0D0E17] flex items-center justify-between hover:border-cyan-500/40 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm font-sans">{report.title}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                report.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                                report.severity === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                report.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              }`}>
                                {report.severity}
                              </span>
                            </div>
                            <div className="text-[10px] text-cyan-400">{report.vuln_type}</div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#141724] border border-[#252A3F] text-zinc-400 font-bold uppercase">
                              {report.status}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {new Date(report.created_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        ) : (
          /* DEFAULT NO TARGET SELECTED VIEW */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-500 space-y-4 font-mono">
            <TargetIcon className="w-12 h-12 text-zinc-700 stroke-[1.5]" />
            <div className="text-center space-y-1">
              <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase block font-sans">
                NO TARGET SELECTED
              </span>
              <p className="text-[10px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Select a target from the left index or click 'ADD TARGET' to begin scoping and vulnerability tracking.
              </p>
            </div>
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold tracking-wider"
            >
              REGISTER NEW TARGET
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
