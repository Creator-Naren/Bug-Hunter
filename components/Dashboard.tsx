import React from 'react';
import { 
  Target as TargetIcon, 
  ShieldAlert, 
  CheckSquare, 
  Plus, 
  Activity, 
  TrendingUp, 
  Terminal, 
  CheckCircle,
  FileText
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

  const submittedBugs = reports.filter(r => r.status === 'Submitted').length;
  const acceptedBugs = reports.filter(r => r.status === 'Accepted').length;

  // Severity Chart Data
  const severityData = [
    { name: 'CRIT', count: criticalBugs, color: '#EF4444' }, // Red
    { name: 'HIGH', count: highBugs, color: '#F97316' },    // Orange
    { name: 'MED', count: mediumBugs, color: '#EAB308' },    // Yellow
    { name: 'LOW', count: lowBugs, color: '#10B981' },       // Green
    { name: 'INFO', count: infoBugs, color: '#06B6D4' }      // Cyan
  ];

  // Status Chart Data
  const statusData = [
    { name: 'DRAFT', count: reports.filter(r => r.status === 'Draft').length, color: '#71717A' },
    { name: 'SUBMITTED', count: submittedBugs, color: '#3B82F6' },
    { name: 'ACCEPTED', count: acceptedBugs, color: '#10B981' },
    { name: 'REJECTED', count: reports.filter(r => r.status === 'Rejected').length, color: '#EF4444' },
    { name: 'DUPE', count: reports.filter(r => r.status === 'Duplicate').length, color: '#8B5CF6' }
  ];

  const handleTargetClick = (targetId: string) => {
    setSelectedTargetId(targetId);
    setActiveTab('targets');
  };

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto font-mono text-zinc-300 relative scanline-overlay">
      
      {/* Top Banner */}
      <div className="border border-[#00FF41]/20 bg-zinc-950 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_15px_rgba(0,255,65,0.05)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#00FF41] rounded-full animate-ping" />
            <h1 className="text-xl font-bold tracking-widest text-[#00FF41] glow-text-green">
              COMMAND_DASHBOARD
            </h1>
          </div>
          <p className="text-xs text-zinc-500">
            Automated intelligence workspace for bug hunting operations, target scoping, and report tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={triggerNewTargetForm}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/10 text-xs font-bold transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            ADD_TARGET
          </button>
          <button 
            onClick={triggerNewReportForm}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 text-xs font-bold transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            NEW_REPORT
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="border border-[#00FF41]/10 bg-zinc-950/80 p-5 flex items-center justify-between shadow-[inset_0_0_10px_rgba(0,255,65,0.02)]">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">ACTIVE TARGETS</span>
            <div className="text-2xl font-bold text-white tracking-tight">{activeTargetsCount} <span className="text-xs text-zinc-500 font-normal">/ {totalTargets} total</span></div>
          </div>
          <div className="p-3 bg-zinc-900 border border-[#00FF41]/20">
            <TargetIcon className="w-6 h-6 text-[#00FF41]" />
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="border border-red-500/10 bg-zinc-950/80 p-5 flex items-center justify-between shadow-[inset_0_0_10px_rgba(239,68,68,0.02)]">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">CRITICAL / HIGH BUGS</span>
            <div className="text-2xl font-bold text-red-500 tracking-tight glow-text-red">
              {criticalBugs + highBugs} <span className="text-xs text-zinc-500 font-normal">/ {totalBugs} total</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-900 border border-red-500/20">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="border border-cyan-500/10 bg-zinc-950/80 p-5 flex items-center justify-between shadow-[inset_0_0_10px_rgba(6,182,212,0.02)]">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">SUBMISSION ACCURACY</span>
            <div className="text-2xl font-bold text-cyan-400 tracking-tight">
              {totalBugs > 0 ? Math.round((acceptedBugs / (reports.filter(r => r.status !== 'Draft').length || 1)) * 100) : 0}%
              <span className="text-[10px] text-zinc-500 font-normal block">({acceptedBugs} accepted)</span>
            </div>
          </div>
          <div className="p-3 bg-zinc-900 border border-cyan-500/20">
            <CheckCircle className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="border border-yellow-500/10 bg-zinc-950/80 p-5 flex items-center justify-between shadow-[inset_0_0_10px_rgba(234,179,8,0.02)]">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">QUICK ANALYZER</span>
            <button 
              onClick={() => setActiveTab('analyzer')}
              className="text-xs block font-bold text-yellow-500 hover:underline tracking-widest text-left uppercase flex items-center gap-1.5 mt-2"
            >
              <Terminal className="w-3.5 h-3.5" />
              LAUNCH_ANALYSIS
            </button>
          </div>
          <div className="p-3 bg-zinc-900 border border-yellow-500/20">
            <Activity className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Charts & Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Metrics */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-widest text-[#00FF41] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              VULNERABILITY_SEVERITY_DENSITY
            </span>
          </div>
          <div className="flex-1 min-h-0 w-full">
            {totalBugs === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-xs border border-dashed border-zinc-800">
                NO_BUG_DATA_FOUND
                <span className="text-[10px] mt-1 text-zinc-700">Add a report or scan code to view severity densities</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '0px' }}
                    labelClassName="text-zinc-400 font-mono text-xs font-bold"
                    itemStyle={{ color: '#00FF41', fontFamily: 'monospace', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Metrics */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-widest text-cyan-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              REPORT_STATUS_DISTRIBUTION
            </span>
          </div>
          <div className="flex-1 min-h-0 w-full">
            {totalBugs === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-xs border border-dashed border-zinc-800">
                NO_STATUS_DATA_FOUND
                <span className="text-[10px] mt-1 text-zinc-700">Configure targets and report states</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={8} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '0px' }}
                    labelClassName="text-zinc-400 font-mono text-xs font-bold"
                    itemStyle={{ color: '#00E5FF', fontFamily: 'monospace', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
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

      {/* Target Registry Overview & Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Target Registry List */}
        <div className="lg:col-span-2 border border-zinc-800 bg-zinc-950 p-6 space-y-4 flex flex-col h-[400px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-white flex items-center gap-1.5">
              <TargetIcon className="w-4.5 h-4.5 text-red-500" />
              TARGET_REGISTRY_INDEX
            </span>
            <button 
              onClick={() => setActiveTab('targets')}
              className="text-[10px] font-bold text-zinc-500 hover:text-[#00FF41] hover:underline"
            >
              VIEW_ALL_TARGETS
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {targets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-xs border border-dashed border-zinc-900 py-12">
                NO_ACTIVE_TARGETS_MONITORED
                <button 
                  onClick={triggerNewTargetForm} 
                  className="mt-3 text-[10px] font-bold text-[#00FF41] border border-[#00FF41]/20 px-2.5 py-1 bg-[#00FF41]/5 hover:bg-[#00FF41]/10"
                >
                  INITIALIZE_FIRST_TARGET
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
                    className="group border border-zinc-900 bg-zinc-950 p-4 flex items-center justify-between hover:border-[#00FF41]/30 hover:bg-zinc-900/20 cursor-pointer transition-all duration-150"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-[#00FF41] transition-colors">{target.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded">{target.platform}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-md">{target.url || 'No scoping URL configured'}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right space-y-0.5">
                        <div className="text-[10px] text-zinc-500">BUG_COUNT</div>
                        <div className="text-xs font-bold text-zinc-300">
                          {targetBugs.length} <span className="text-zinc-500 font-normal">reported</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1.5">
                        {targetCrit > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-950/50 border border-red-500/30 text-red-400">
                            {targetCrit} CRIT
                          </span>
                        )}
                        {targetHigh > 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-orange-950/50 border border-orange-500/30 text-orange-400">
                            {targetHigh} HIGH
                          </span>
                        )}
                        {targetCrit === 0 && targetHigh === 0 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-600">
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

        {/* Recent Activity Log */}
        <div className="border border-zinc-800 bg-zinc-950 p-6 flex flex-col h-[400px]">
          <span className="text-xs font-bold tracking-widest text-[#00FF41] flex items-center gap-1.5 mb-4">
            <Activity className="w-4 h-4" />
            OPERATIONS_ACTIVITY_FEED
          </span>

          <div className="flex-1 overflow-y-auto space-y-4 text-xs">
            {reports.length === 0 && targets.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600 border border-dashed border-zinc-900">
                SYSTEM_IDLE
                <span className="text-[9px] text-zinc-700 mt-1">Awaiting recon operations...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.slice(0, 4).map((report) => {
                  const target = targets.find(t => t.id === report.target_id);
                  return (
                    <div key={report.id} className="border-l border-cyan-400/40 pl-3 space-y-1">
                      <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                        <span>BUG_DISCOVERY</span>
                        <span>{new Date(report.created_date).toLocaleDateString()}</span>
                      </div>
                      <div className="font-bold text-zinc-200">
                        {report.vuln_type} Found
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {report.title} <span className="text-zinc-600">on</span> {target?.name || 'Unknown Target'}
                      </div>
                      <div>
                        <span className={`text-[9px] font-bold px-1 border uppercase ${
                          report.severity === 'Critical' ? 'bg-red-950/40 border-red-500/40 text-red-400' :
                          report.severity === 'High' ? 'bg-orange-950/40 border-orange-500/40 text-orange-400' :
                          report.severity === 'Medium' ? 'bg-yellow-950/40 border-yellow-500/40 text-yellow-400' :
                          'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}>
                          {report.severity}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {targets.slice(0, 3).map((target) => (
                  <div key={target.id} className="border-l border-[#00FF41]/30 pl-3 space-y-1">
                    <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                      <span>TARGET_ENGAGED</span>
                      <span>{new Date(target.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="font-bold text-zinc-200">
                      Target Initiated: {target.name}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Platform: <span className="text-zinc-400 font-bold">{target.platform}</span>
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
