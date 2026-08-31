import React from 'react';
import { 
  Terminal, 
  ShieldAlert, 
  LayoutDashboard, 
  Wifi, 
  Cpu, 
  Activity,
  Shield,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recentLogs: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, recentLogs }) => {
  const menuItems = [
    { id: 'dashboard', label: 'SYSTEM OVERVIEW', icon: LayoutDashboard, badge: 'READY' },
    { id: 'analyzer', label: 'AI SAST SCANNER', icon: Terminal, badge: 'GEMINI 2.5' },
    { id: 'targets', label: 'TARGET REGISTRY', icon: Cpu, badge: null },
    { id: 'reports', label: 'VULN COMPILER', icon: ShieldAlert, badge: null },
  ];

  return (
    <aside className="w-64 bg-[#08090E] border-r border-[#1B1E2E] flex flex-col h-full shrink-0 font-mono text-xs select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1B1E2E] flex flex-col gap-3 bg-gradient-to-b from-[#0F111A]/80 to-[#08090E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.2)]">
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <span className="text-sm font-bold tracking-wider text-white flex items-center gap-1 font-sans">
                BUG<span className="text-emerald-400 font-mono">HUNTER</span>
              </span>
              <span className="text-[9px] text-zinc-400 tracking-widest block font-mono font-bold">SECURITY AI v2.5</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-400 bg-[#0D0E17] border border-[#1E2235] px-2.5 py-1.5 rounded-md">
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-zinc-400">ENGINE:</span>
          </div>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400/30" />
            ACTIVE
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-5 space-y-1.5">
        <div className="px-3 pb-2 text-[9px] font-bold text-zinc-400 tracking-widest uppercase">
          WORKSPACE NAVIGATION
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-left transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(0,255,102,0.08)]'
                  : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#121421] hover:border-[#1E2235]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                <span className="font-semibold text-xs tracking-wide">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/40'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Terminal Mini-feed */}
      <div className="p-3.5 border-t border-[#1B1E2E] bg-[#0A0B12] flex flex-col gap-2 min-h-[150px] max-h-[190px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 tracking-wider">
            <Activity className="w-3 h-3 text-cyan-400" />
            SYSTEM LOG FEED
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 text-[9px] text-zinc-400 leading-relaxed font-mono pr-1">
          {recentLogs.map((log, index) => (
            <div key={index} className="flex items-start gap-1">
              <span className="text-cyan-400 shrink-0 font-bold">&gt;</span>
              <span className="truncate text-zinc-300">{log}</span>
            </div>
          ))}
          {recentLogs.length === 0 && (
            <div className="text-zinc-600 italic">No events logged yet.</div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-[#1B1E2E] text-[10px] text-zinc-400 space-y-1 bg-[#06070B] font-mono">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">OPERATOR:</span>
          <span className="text-zinc-200 font-bold">SOLO_HUNTER</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">FIRESTORE:</span>
          <span className="text-cyan-400 font-bold">CONNECTED</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">MODE:</span>
          <span className="text-emerald-400 font-bold">STRICT_SAST</span>
        </div>
      </div>
    </aside>
  );
};
