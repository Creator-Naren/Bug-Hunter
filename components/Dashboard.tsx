import React from 'react';
import { 
  Target as TargetIcon, 
  ShieldAlert, 
  Plus, 
  Activity, 
  Terminal, 
  FileText,
  ShieldCheck,
  Zap,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Target, BugReport } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface DashboardProps {
  targets: Target[];
  reports: BugReport[];
  setActiveTab: (tab: string) => void;
  setSelectedTargetId: (id: string | null) => void;
  triggerNewTargetForm: () => void;
  triggerNewReportForm: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  targets, 
  reports, 
  setActiveTab, 
  setSelectedTargetId,
  triggerNewTargetForm,
  triggerNewReportForm
}) => {
  // Statistics
  const totalTargets = targets.length;
  const activeTargetsCount = targets.filter(t => t.status === 'Active').length;
  const totalBugs = reports.length;
  const criticalBugs = reports.filter(r => r.severity === 'Critical').length;
  const highBugs = reports.filter(r => r.severity === 'High').length;
  const mediumBugs = reports.filter(r => r.severity === 'Medium').length;
  const lowBugs = reports.filter(r => r.severity === 'Low').length;
  const infoBugs = reports.filter(r => r.severity === 'Info').length;

  const severityData = [
    { name: 'CRITICAL', count: criticalBugs, color: '#ff3366' },
    { name: 'HIGH', count: highBugs, color: '#ffaa00' },
    { name: 'MEDIUM', count: mediumBugs, color: '#eab308' },
    { name: 'LOW', count: lowBugs, color: '#00e5ff' },
    { name: 'INFO', count: infoBugs, color: '#94a3b8' },
  ];

  const statusCounts = {
    Draft: reports.filter(r => r.status === 'Draft').length,
    Submitted: reports.filter(r => r.status === 'Submitted').length,
    Accepted: reports.filter(r => r.status === 'Accepted').length,
    Rejected: reports.filter(r => r.status === 'Rejected').length,
    Duplicate: reports.filter(r => r.status === 'Duplicate').length,
  };

  const statusData = [
    { name: 'DRAFT', count: statusCounts.Draft, color: '#94a3b8' },
    { name: 'SUBMITTED', count: statusCounts.Submitted, color: '#00e5ff' },
    { name: 'ACCEPTED', count: statusCounts.Accepted, color: '#00ff66' },
    { name: 'REJECTED', count: statusCounts.Rejected, color: '#ff3366' },
    { name: 'DUPLICATE', count: statusCounts.Duplicate, color: '#a855f7' },
  ];

  const handleTargetClick = (targetId: string) => {
    setSelectedTargetId(targetId);
    setActiveTab('targets');
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto bg-[#0A0B10]">
      
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2235] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">
              COMMAND <span className="text-emerald-400 font-mono">DASHBOARD</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
              LIVE POSTURE
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Real-time vulnerability telemetry, active attack targets, and AI static security audit metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerNewTargetForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#121421] border border-[#252A3F] text-zinc-200 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 text-xs font-semibold tracking-wide transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>NEW TARGET</span>
          </button>

          <button
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold tracking-wide transition-all duration-200 shadow-[0_0_20px_rgba(0,255,102,0.12)] font-mono"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>AI SCANNER</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Targets Card */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0F111A] to-[#141724] border border-[#1E2235] hover:border-cyan-500/40 transition-all duration-200 shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase font-mono">TARGET REGISTRY</span>
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
              <TargetIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{totalTargets}</span>
            <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
              {activeTargetsCount} ACTIVE
            </span>
          </div>
          <div className="mt-2 text-[10px] text-zinc-400 font-sans">
            Monitored applications & security scopes
          </div>
        </div>

        {/* Total Bug Reports Card */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0F111A] to-[#141724] border border-[#1E2235] hover:border-emerald-500/40 transition-all duration-200 shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase font-mono">TOTAL DISCOVERIES</span>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{totalBugs}</span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              {statusCounts.Accepted} ACCEPTED
            </span>
          </div>
          <div className="mt-2 text-[10px] text-zinc-400 font-sans">
            Compiled bug reports & AI findings
          </div>
        </div>

        {/* Critical & High Vulnerabilities Card */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0F111A] to-[#141724] border border-[#1E2235] hover:border-rose-500/40 transition-all duration-200 shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase font-mono">CRITICAL EXPOSURE</span>
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-400 font-mono">{criticalBugs + highBugs}</span>
            <div className="flex gap-1.5 font-mono text-[10px]">
              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 font-bold">{criticalBugs} CRIT</span>
              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-bold">{highBugs} HIGH</span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-zinc-400 font-sans">
            Action required vulnerability threats
          </div>
        </div>

        {/* System Security Score */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0F111A] to-[#141724] border border-[#1E2235] hover:border-purple-500/40 transition-all duration-200 shadow-lg group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase font-mono">AI SAST ENGINE</span>
            <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-purple-300 font-mono">GEMINI 2.5</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              ONLINE
            </span>
          </div>
          <div className="mt-2 text-[10px] text-zinc-400 font-sans">
            Structured security analysis prompt ready
          </div>
        </div>

      </div>

      {/* Interactive Charts Visualizing Posture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Severity Metrics Chart */}
        <div className="p-6 rounded-xl bg-[#0D0E17] border border-[#1E2235] space-y-4 flex flex-col h-[360px] shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-400" />
              <span className="text-xs font-bold tracking-wider text-zinc-200 uppercase font-mono">VULNERABILITY_SEVERITY_BREAKDOWN</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">SEVERITY RATING INDEX</span>
          </div>

          <div className="flex-1 min-h-0 w-full pt-2">
            {totalBugs === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs border border-dashed border-[#1E2235] rounded-lg bg-[#08090E]/40 font-mono">
                NO_VULNERABILITY_DATA_LOADED
                <span className="text-[10px] mt-1 text-zinc-600">Run code scans or add bug reports to render telemetry</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} fontFamily="monospace" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F111A', borderColor: '#252A3F', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                    labelClassName="text-zinc-300 font-mono text-xs font-bold"
                    itemStyle={{ color: '#00ff66', fontFamily: 'monospace', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="p-6 rounded-xl bg-[#0D0E17] border border-[#1E2235] space-y-4 flex flex-col h-[360px] shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-cyan-400" />
              <span className="text-xs font-bold tracking-wider text-zinc-200 uppercase font-mono">REPORT_TRIAGE_STATUS</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">TRIAGE STATUS DISTRIBUTION</span>
          </div>

          <div className="flex-1 min-h-0 w-full pt-2">
            {totalBugs === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs border border-dashed border-[#1E2235] rounded-lg bg-[#08090E]/40 font-mono">
                NO_TRIAGE_REPORTS_FILED
                <span className="text-[10px] mt-1 text-zinc-600">Configure target programs to populate report states</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} fontFamily="monospace" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F111A', borderColor: '#252A3F', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                    labelClassName="text-zinc-300 font-mono text-xs font-bold"
                    itemStyle={{ color: '#00e5ff', fontFamily: 'monospace', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Target Registry Overview & Recent Operations Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Target Registry List */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#0D0E17] border border-[#1E2235] space-y-4 flex flex-col h-[420px] shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1E2235] pb-4">
            <div className="flex items-center gap-2">
              <TargetIcon className="w-4.5 h-4.5 text-rose-400" />
              <span className="text-xs font-bold tracking-wider text-white uppercase font-mono">MONITORED_TARGET_REGISTRY</span>
            </div>
            <button 
              onClick={() => setActiveTab('targets')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-mono"
            >
              <span>VIEW ALL</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {targets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs border border-dashed border-[#1E2235] rounded-lg bg-[#08090E]/40 py-12 font-mono">
                NO_ACTIVE_TARGETS_REGISTERED
                <button 
                  onClick={triggerNewTargetForm} 
                  className="mt-4 text-xs font-bold text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                >
                  + REGISTER FIRST TARGET
                </button>
              </div>
            ) : (
              targets.slice(0, 5).map((target) => {
                const targetBugs = reports.filter(r => r.target_id === target.id);
                const targetCrit = targetBugs.filter(r => r.severity === 'Critical').length;
                const targetHigh = targetBugs.filter(r => r.severity === 'High').length;
                
                return (
                  <div 
                    key={target.id}
                    onClick={() => handleTargetClick(target.id)}
                    className="group p-4 rounded-lg border border-[#1E2235] bg-[#0A0B12] flex items-center justify-between hover:border-emerald-500/40 hover:bg-[#10121D] cursor-pointer transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{target.name}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-[#141724] border border-[#252A3F] text-cyan-400 rounded font-mono font-semibold">{target.platform}</span>
                      </div>
                      <div className="text-xs text-zinc-400 truncate max-w-md font-mono">{target.url || 'No URL configured'}</div>
                    </div>

                    <div className="flex items-center gap-5 font-mono">
                      <div className="text-right space-y-0.5">
                        <div className="text-[9px] text-zinc-500">REPORTS</div>
                        <div className="text-xs font-bold text-zinc-200">
                          {targetBugs.length} <span className="text-zinc-500 font-normal">bugs</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1.5">
                        {targetCrit > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded">
                            {targetCrit} CRIT
                          </span>
                        )}
                        {targetHigh > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded">
                            {targetHigh} HIGH
                          </span>
                        )}
                        {targetCrit === 0 && targetHigh === 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded">
                            SECURE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Operations Activity Feed */}
        <div className="p-6 rounded-xl bg-[#0D0E17] border border-[#1E2235] flex flex-col h-[420px] space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1E2235] pb-4">
            <span className="text-xs font-bold tracking-wider text-emerald-400 flex items-center gap-2 uppercase font-mono">
              <Activity className="w-4 h-4" />
              OPERATIONS_FEED
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 text-xs font-mono pr-1">
            {reports.length === 0 && targets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 border border-dashed border-[#1E2235] rounded-lg bg-[#08090E]/40">
                SYSTEM_IDLE
                <span className="text-[10px] text-zinc-600 mt-1">Awaiting security operations...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.slice(0, 4).map((report) => {
                  const target = targets.find(t => t.id === report.target_id);
                  return (
                    <div key={report.id} className="p-3 rounded-lg border border-[#1E2235] bg-[#0A0B12] space-y-1.5">
                      <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                        <span className="text-cyan-400 font-bold">BUG DISCOVERY</span>
                        <span>{new Date(report.created_date).toLocaleDateString()}</span>
                      </div>
                      <div className="font-bold text-zinc-200 text-xs">
                        {report.vuln_type}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {report.title} <span className="text-zinc-600">on</span> <span className="text-zinc-300 font-semibold">{target?.name || 'Target Program'}</span>
                      </div>
                      <div className="pt-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          report.severity === 'Critical' ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' :
                          report.severity === 'High' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                          report.severity === 'Medium' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' :
                          'bg-zinc-800 border-zinc-700 text-zinc-300'
                        }`}>
                          {report.severity}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {targets.slice(0, 3).map((target) => (
                  <div key={target.id} className="p-3 rounded-lg border border-[#1E2235] bg-[#0A0B12] space-y-1">
                    <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">TARGET INITIALIZED</span>
                      <span>{new Date(target.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="font-bold text-zinc-200 text-xs">
                      {target.name}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Platform: <span className="text-cyan-400 font-bold">{target.platform}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
