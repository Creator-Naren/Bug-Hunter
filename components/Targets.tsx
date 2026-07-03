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
  ClipboardList
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

  const selectedTarget = targets.find(t => t.id === selectedTargetId);

  // Sync loaded checklists and target notes when target changes
  useEffect(() => {
    if (selectedTarget) {
      setTargetNotes(selectedTarget.notes || '');
      loadChecklistsData(selectedTarget.id);
    }
  }, [selectedTargetId, targets]);

  const loadChecklistsData = async (targetId: string) => {
    const data = await getChecklists(targetId);
    setLoadedChecklists(data);
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
      console.error(e);
      alert('Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.name) return;

    const target: Target = {
      id: 'target_' + crypto.randomUUID(),
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
      await saveTarget(target);
      onRefresh();
      setIsAddingNew(false);
      setSelectedTargetId(target.id);
      setNewTarget({
        name: '',
        url: '',
        platform: 'HackerOne',
        scope: '',
        out_of_scope: '',
        notes: ''
      });
    } catch (e) {
      console.error(e);
      alert('Error creating target');
    }
  };

  const handleDeleteTarget = async (targetId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this target? All associated bug reports and checklists will be destroyed.')) {
      return;
    }
    try {
      await deleteTarget(targetId);
      setSelectedTargetId(null);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert('Error deleting target');
    }
  };

  // Initializing a default checklist
  const handleInitializeChecklist = async (type: 'OWASP' | 'RECON') => {
    if (!selectedTarget) return;

    let items: ChecklistItem[] = [];
    if (type === 'OWASP') {
      const owasp = [
        'A01:2021-Broken Access Control (IDORs, Privilege Escalation)',
        'A02:2021-Cryptographic Failures (Sensitive Data Exposure)',
        'A03:2021-Injection (SQLi, Command Injection, LDAP, XPath)',
        'A04:2021-Insecure Design (Business Logic Flaws)',
        'A05:2021-Security Misconfiguration (Default accounts, open directories)',
        'A06:2021-Vulnerable and Outdated Components',
        'A07:2021-Identification and Authentication Failures (JWT bugs, password bypass)',
        'A08:2021-Software and Data Integrity Failures (Insecure deserialization)',
        'A09:2021-Security Logging and Monitoring Failures (No locks/limits)',
        'A10:2021-Server-Side Request Forgery (SSRF on internal resources)'
      ];
      items = owasp.map((lbl, idx) => ({ id: `owasp_${idx}`, label: lbl, done: false }));
    } else if (type === 'RECON') {
      const recon = [
        'Subdomain discovery & enumeration (passive & active)',
        'Port scanning & HTTP service discovery (Nmap/naabu)',
        'Directory brute-forcing (Gobuster/ffuf) for hidden files',
        'JavaScript analysis (API endpoints, API keys, endpoints)',
        'CORS Policy Audit (Access-Control-Allow-Origin: *)',
        'Check cloud storage exposure (Public S3 Buckets / GC buckets)',
        'Parameter discovery & fuzzing (Arjun / ffuf)',
        'Analyze headers (Missing CSP, HSTS, Secure Cookies)',
        'Identify application technologies & frameworks (Wappalyzer)',
        'Exposed Git directories / configuration files / backup files'
      ];
      items = recon.map((lbl, idx) => ({ id: `recon_${idx}`, label: lbl, done: false }));
    }

    const checklist: MethodologyChecklist = {
      id: `${selectedTarget.id}_${type}`,
      target_id: selectedTarget.id,
      checklist_type: type === 'OWASP' ? 'OWASP Top 10 Audit' : 'Recon & Asset Discovery',
      items
    };

    try {
      await saveChecklist(checklist);
      await loadChecklistsData(selectedTarget.id);
    } catch (e) {
      console.error(e);
      alert('Failed to initialize checklist');
    }
  };

  // Toggling checklist item
  const handleToggleChecklistItem = async (checklist: MethodologyChecklist, itemId: string) => {
    const updatedItems = checklist.items.map(item => {
      if (item.id === itemId) {
        return { ...item, done: !item.done };
      }
      return item;
    });

    const updatedChecklist: MethodologyChecklist = {
      ...checklist,
      items: updatedItems
    };

    try {
      // Optimistic update
      setLoadedChecklists(prev => prev.map(c => c.id === checklist.id ? updatedChecklist : c));
      await saveChecklist(updatedChecklist);
    } catch (e) {
      console.error(e);
      loadChecklistsData(selectedTarget.id!);
    }
  };

  // Adding custom item to checklist
  const handleAddCustomChecklistItem = async (checklist: MethodologyChecklist) => {
    if (!customChecklistItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: 'custom_' + crypto.randomUUID(),
      label: customChecklistItemText.trim(),
      done: false
    };

    const updatedChecklist: MethodologyChecklist = {
      ...checklist,
      items: [...checklist.items, newItem]
    };

    try {
      setCustomChecklistItemText('');
      setLoadedChecklists(prev => prev.map(c => c.id === checklist.id ? updatedChecklist : c));
      await saveChecklist(updatedChecklist);
    } catch (e) {
      console.error(e);
      loadChecklistsData(selectedTarget.id!);
    }
  };

  // Filtered list
  const filteredTargets = targets.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const linkedReports = selectedTargetId 
    ? reports.filter(r => r.target_id === selectedTargetId)
    : [];

  return (
    <div className="flex-1 flex overflow-hidden font-mono text-zinc-300 relative scanline-overlay">
      
      {/* LEFT COLUMN: Target Index */}
      <div className={`w-80 border-r border-[#00FF41]/20 flex flex-col bg-[#060608] shrink-0 h-full ${selectedTarget ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#00FF41]/20 flex items-center justify-between">
          <span className="text-xs font-bold text-[#00FF41] tracking-widest flex items-center gap-1.5">
            <TargetIcon className="w-4 h-4 text-[#00FF41]" />
            TARGET_REGISTRY
          </span>
          <button 
            onClick={() => setIsAddingNew(true)}
            className="p-1 border border-[#00FF41]/30 hover:bg-[#00FF41]/10 text-[#00FF41] hover:border-[#00FF41] transition-colors"
            title="Register New Target"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-[#00FF41]/10 flex items-center gap-2 bg-zinc-950">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Search assets / platforms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none text-xs focus:outline-none text-white placeholder-zinc-600"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
          {filteredTargets.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 text-xs italic">
              No targets found.
            </div>
          ) : (
            filteredTargets.map((t) => {
              const active = selectedTargetId === t.id;
              const tReports = reports.filter(r => r.target_id === t.id);
              return (
                <div 
                  key={t.id}
                  onClick={() => {
                    setSelectedTargetId(t.id);
                    setIsAddingNew(false);
                  }}
                  className={`p-4 text-left cursor-pointer transition-all duration-150 relative ${
                    active 
                      ? 'bg-[#00FF41]/5 border-l-2 border-[#00FF41]' 
                      : 'hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${active ? 'text-[#00FF41] glow-text-green' : 'text-white'}`}>
                      {t.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded">
                      {t.platform}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">{t.url || 'No URL specified'}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[9px] text-zinc-600">
                      Added: {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] font-bold text-cyan-400">
                      {tReports.length} BUGS
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT WORKSPACE */}
      <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
        {isAddingNew ? (
          /* FORM: ADD NEW TARGET */
          <div className="flex-1 p-8 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#00FF41]/20 pb-4">
              <span className="text-sm font-bold text-[#00FF41] tracking-widest flex items-center gap-2">
                <PlusSquare className="w-5 h-5 text-[#00FF41]" />
                INITIALIZE_NEW_TARGET_OPERATION
              </span>
              <button 
                onClick={() => setIsAddingNew(false)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white border border-zinc-800 px-2.5 py-1"
              >
                <ArrowLeft className="w-4 h-4" /> CANCEL
              </button>
            </div>

            <form onSubmit={handleCreateTarget} className="space-y-6 max-w-3xl text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold tracking-wider">PROGRAM / TARGET NAME <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Acme Corporation, Yahoo!"
                    value={newTarget.name}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-[#00FF41] rounded-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-zinc-400 font-bold tracking-wider">PLATFORM</label>
                  <select 
                    value={newTarget.platform}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, platform: e.target.value }))}
                    className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-[#00FF41] rounded-none"
                  >
                    <option value="HackerOne">HackerOne</option>
                    <option value="Bugcrowd">Bugcrowd</option>
                    <option value="Intigriti">Intigriti</option>
                    <option value="YesWeHack">YesWeHack</option>
                    <option value="Private Program">Private / Self-Hosted Program</option>
                    <option value="Other">Other / Wildcard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 font-bold tracking-wider">BASE URL / SCOPING SEED</label>
                <input 
                  type="url" 
                  placeholder="https://*.acme.com, https://bugbounty.acme.com"
                  value={newTarget.url}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-[#00FF41] rounded-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 font-bold tracking-wider">IN-SCOPE ASSETS (One per line)</label>
                <textarea 
                  rows={4}
                  placeholder="*.acme.com&#10;api.acme.com&#10;Staging-web.acme.com"
                  value={newTarget.scope}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, scope: e.target.value }))}
                  className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-[#00FF41] rounded-none font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 font-bold tracking-wider">OUT-OF-SCOPE ASSETS / RESTRICTIONS</label>
                <textarea 
                  rows={3}
                  placeholder="No automated heavy scanning on auth.acme.com&#10;Do not attack legacy-partner.acme.com"
                  value={newTarget.out_of_scope}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, out_of_scope: e.target.value }))}
                  className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-[#00FF41] rounded-none font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-zinc-400 font-bold tracking-wider">INITIAL OPERATIONS NOTES / RECON REPORT</label>
                <textarea 
                  rows={4}
                  placeholder="Acme Corp uses AWS Cloudfront, Cloudflare protection on main domain, legacy API written in Django, JWT authentication..."
                  value={newTarget.notes}
                  onChange={(e) => setNewTarget(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-[#060608] border border-zinc-800 px-3 py-2.5 text-white focus:outline-none focus:border-[#00FF41] rounded-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-zinc-900 border border-[#00FF41] text-[#00FF41] hover:bg-[#00FF41]/10 font-bold text-xs tracking-widest transition-all shadow-[0_0_10px_rgba(0,255,65,0.1)] hover:shadow-[0_0_15px_rgba(0,255,65,0.2)] rounded-none uppercase"
              >
                DEPLOY_TARGET_MONITOR
              </button>
            </form>
          </div>
        ) : selectedTarget ? (
          /* ACTIVE WORKSPACE */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Workspace Header */}
            <div className="p-6 border-b border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedTargetId(null)}
                  className="md:hidden p-1.5 border border-zinc-800 text-zinc-400 hover:text-white mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white tracking-widest uppercase flex items-center gap-1">
                      <TargetIcon className="w-4.5 h-4.5 text-[#00FF41]" />
                      {selectedTarget.name}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[#00FF41] rounded">
                      {selectedTarget.platform}
                    </span>
                  </div>
                  {selectedTarget.url && (
                    <a 
                      href={selectedTarget.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-zinc-500 hover:text-cyan-400 flex items-center gap-1.5 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {selectedTarget.url}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => triggerNewReportFormWithTarget(selectedTarget.id)}
                  className="px-3 py-1.5 bg-[#00FF41]/10 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/20 font-bold text-[10px] tracking-widest transition-colors"
                >
                  REPORT_VULNERABILITY
                </button>
                <button 
                  onClick={() => handleDeleteTarget(selectedTarget.id)}
                  className="p-1.5 border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Destroy Target Record"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Workspace Tabs */}
            <div className="px-6 border-b border-zinc-900 bg-zinc-950 flex items-center shrink-0">
              <button 
                onClick={() => setActiveWorkspaceTab('details')}
                className={`px-4 py-3 font-bold text-[10px] tracking-widest border-b-2 transition-all ${
                  activeWorkspaceTab === 'details' 
                    ? 'border-[#00FF41] text-[#00FF41] glow-text-green' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                SCOPE_AND_NOTES
              </button>
              <button 
                onClick={() => setActiveWorkspaceTab('checklist')}
                className={`px-4 py-3 font-bold text-[10px] tracking-widest border-b-2 transition-all ${
                  activeWorkspaceTab === 'checklist' 
                    ? 'border-[#00FF41] text-[#00FF41] glow-text-green' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                METHODOLOGY_CHECKLIST
              </button>
              <button 
                onClick={() => setActiveWorkspaceTab('reports')}
                className={`px-4 py-3 font-bold text-[10px] tracking-widest border-b-2 transition-all ${
                  activeWorkspaceTab === 'reports' 
                    ? 'border-cyan-400 text-cyan-400 glow-text-cyan' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                BUG_REPORTS ({linkedReports.length})
              </button>
            </div>

            {/* Workspace Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#09090b]">
              {activeWorkspaceTab === 'details' && (
                <div className="space-y-6 max-w-5xl">
                  {/* Scope Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-2 border border-zinc-900 p-4 bg-zinc-950">
                      <span className="text-[10px] font-bold text-[#00FF41] tracking-widest block uppercase">IN-SCOPE SEEDS</span>
                      <pre className="font-mono bg-[#060608] border border-zinc-900 p-3 text-zinc-400 overflow-x-auto whitespace-pre max-h-[160px] rounded">
                        {selectedTarget.scope || 'No specific assets listed in scope.'}
                      </pre>
                    </div>

                    <div className="space-y-2 border border-zinc-900 p-4 bg-zinc-950">
                      <span className="text-[10px] font-bold text-red-500 tracking-widest block uppercase">OUT-OF-SCOPE RULES</span>
                      <pre className="font-mono bg-[#060608] border border-zinc-900 p-3 text-zinc-500 overflow-x-auto whitespace-pre max-h-[160px] rounded">
                        {selectedTarget.out_of_scope || 'No explicit restrictions configured.'}
                      </pre>
                    </div>
                  </div>

                  {/* Operational Notes Section */}
                  <div className="border border-zinc-900 bg-zinc-950 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        OPERATIONAL_RECON_REPORTS
                      </span>
                      <button
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        className="flex items-center gap-1 px-3 py-1 bg-zinc-900 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 text-[10px] tracking-wider font-bold transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {isSavingNotes ? 'SAVING...' : 'SAVE_NOTES'}
                      </button>
                    </div>
                    <textarea 
                      rows={12}
                      value={targetNotes}
                      onChange={(e) => setTargetNotes(e.target.value)}
                      className="w-full bg-[#060608] border border-zinc-900 p-4 font-mono text-xs text-zinc-300 focus:outline-none focus:border-cyan-400 leading-relaxed rounded-none"
                      placeholder="Input any notes, active credentials, subdomains found, cloud storage configs, or API details..."
                    />
                  </div>
                </div>
              )}

              {activeWorkspaceTab === 'checklist' && (
                <div className="space-y-6 max-w-5xl text-xs">
                  {/* Checklist options */}
                  {loadedChecklists.length === 0 ? (
                    <div className="border border-dashed border-zinc-800 p-12 text-center space-y-4 bg-zinc-950/40">
                      <div className="text-zinc-500">NO_METHODOLOGY_CHECKLISTS_INITIALIZED</div>
                      <p className="text-[10px] text-zinc-600 max-w-md mx-auto leading-relaxed">
                        Bug bounty hunts are much more effective when conducted systematically. Initialize a pre-configured industry methodology to track your coverage step-by-step.
                      </p>
                      <div className="flex items-center justify-center gap-4 pt-2">
                        <button
                          onClick={() => handleInitializeChecklist('OWASP')}
                          className="px-4 py-2 bg-zinc-900 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/10 font-bold text-[10px] tracking-wider"
                        >
                          INITIALIZE OWASP TOP 10
                        </button>
                        <button
                          onClick={() => handleInitializeChecklist('RECON')}
                          className="px-4 py-2 bg-zinc-900 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 font-bold text-[10px] tracking-wider"
                        >
                          INITIALIZE RECON CHECKLIST
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {loadedChecklists.map((checklist) => {
                        const total = checklist.items.length;
                        const completed = checklist.items.filter(i => i.done).length;
                        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                        return (
                          <div key={checklist.id} className="border border-zinc-900 bg-zinc-950 p-5 space-y-4 flex flex-col min-h-[300px]">
                            {/* Header */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#00FF41] tracking-widest uppercase block">
                                {checklist.checklist_type}
                              </span>
                              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                                <span>PROGRESS: {percent}% ({completed} / {total} done)</span>
                                <div className="w-24 bg-zinc-900 border border-zinc-800 h-2.5 rounded-none overflow-hidden flex">
                                  <div 
                                    className="bg-[#00FF41] h-full"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Items List */}
                            <div className="flex-1 overflow-y-auto space-y-2 max-h-[250px] pr-1">
                              {checklist.items.map((item) => (
                                <div 
                                  key={item.id}
                                  onClick={() => handleToggleChecklistItem(checklist, item.id)}
                                  className={`flex items-start gap-2.5 p-2 border border-zinc-900/60 hover:bg-zinc-900/20 cursor-pointer transition-colors ${
                                    item.done ? 'bg-zinc-900/10 border-zinc-900 text-zinc-500 line-through' : 'bg-zinc-950 text-zinc-300'
                                  }`}
                                >
                                  {item.done ? (
                                    <CheckSquare className="w-4 h-4 text-[#00FF41] shrink-0 mt-0.5" />
                                  ) : (
                                    <Square className="w-4 h-4 text-zinc-600 hover:text-zinc-400 shrink-0 mt-0.5" />
                                  )}
                                  <span className="font-mono text-[11px] leading-relaxed select-none">{item.label}</span>
                                </div>
                              ))}
                            </div>

                            {/* Add Custom Item */}
                            <div className="pt-2 border-t border-zinc-900 flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Add custom auditing item..."
                                value={customChecklistItemText}
                                onChange={(e) => setCustomChecklistItemText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddCustomChecklistItem(checklist);
                                }}
                                className="flex-1 bg-[#060608] border border-zinc-900 px-2.5 py-1.5 focus:outline-none focus:border-[#00FF41] text-[11px]"
                              />
                              <button
                                onClick={() => handleAddCustomChecklistItem(checklist)}
                                className="px-3 bg-zinc-900 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/10 text-[10px] tracking-wider"
                              >
                                ADD
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add another checklist optionally */}
                      {loadedChecklists.length === 1 && (
                        <div className="border border-dashed border-zinc-900 p-6 flex flex-col items-center justify-center gap-3 bg-zinc-950/20">
                          <span className="text-[10px] text-zinc-500 font-bold tracking-widest block uppercase">ADDITIONAL METHODOLOGY</span>
                          <button
                            onClick={() => handleInitializeChecklist(loadedChecklists[0].checklist_type.includes('OWASP') ? 'RECON' : 'OWASP')}
                            className="px-4 py-2 bg-zinc-900 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 font-bold text-[10px] tracking-wider"
                          >
                            INITIALIZE {loadedChecklists[0].checklist_type.includes('OWASP') ? 'RECON & ASSET DISCOVERY' : 'OWASP TOP 10'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeWorkspaceTab === 'reports' && (
                <div className="space-y-4 max-w-5xl text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-[10px] font-bold text-zinc-500 tracking-wider">INDEX_OF_REPORTS</span>
                    <button 
                      onClick={() => triggerNewReportFormWithTarget(selectedTarget.id)}
                      className="text-[10px] text-[#00FF41] hover:underline"
                    >
                      + FILE_NEW_REPORT
                    </button>
                  </div>

                  {linkedReports.length === 0 ? (
                    <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-900 bg-zinc-950/20">
                      NO_REPORTS_FILED_FOR_THIS_TARGET
                      <span className="text-[10px] text-zinc-700 block mt-1">Found a bug? Convert Python SAST findings or file a manual report to begin triage.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {linkedReports.map((report) => (
                        <div 
                          key={report.id}
                          className="border border-zinc-900 bg-zinc-950 p-4 flex items-center justify-between hover:border-cyan-400/20 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{report.title}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                                report.severity === 'Critical' ? 'bg-red-950/40 border-red-500/40 text-red-400' :
                                report.severity === 'High' ? 'bg-orange-950/40 border-orange-500/40 text-orange-400' :
                                report.severity === 'Medium' ? 'bg-yellow-950/40 border-yellow-500/40 text-yellow-400' :
                                'bg-zinc-900 border-zinc-800 text-zinc-400'
                              }`}>
                                {report.severity}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-400">{report.vuln_type}</div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase rounded font-bold">
                              {report.status}
                            </span>
                            <span className="text-[10px] text-zinc-600">
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
          /* NO TARGET SELECTED DEFAULT */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-500 space-y-4">
            <TargetIcon className="w-12 h-12 text-zinc-700 stroke-[1.5]" />
            <div className="text-center space-y-1">
              <span className="text-xs font-bold tracking-widest text-zinc-400 block uppercase">NO_ACTIVE_TARGET_WORKSPACE_ENGAGED</span>
              <p className="text-[10px] text-zinc-600 max-w-sm mx-auto leading-relaxed">
                Select a target from the left index panel or initialize a new monitoring operations log to track scoped directories, checklists, and reports.
              </p>
            </div>
            <button 
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2 bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/20 text-xs font-bold tracking-wider"
            >
              INITIALIZE_TARGET
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
