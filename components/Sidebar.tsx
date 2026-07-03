import React from 'react';
import { 
  Terminal, 
  ShieldAlert, 
  CheckSquare, 
  LayoutDashboard, 
  Wifi, 
  Cpu, 
  Clock 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  recentLogs: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, recentLogs }) => {
  const menuItems = [
    { id: 'dashboard', label: 'SYSTEM STATUS', icon: LayoutDashboard },
    { id: 'analyzer', label: 'AI CODE AUDIT', icon: Terminal },
    { id: 'targets', label: 'TARGET REGISTRY', icon: Cpu },
    { id: 'reports', label: 'BUG INVENTORY', icon: ShieldAlert },
  ];

  return (
    <div className="w-64 bg-[#0A0A0C] border-r border-[#00FF41]/20 flex flex-col h-full shrink-0 font-mono text-xs select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#00FF41]/20 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#00FF41] rounded-sm animate-pulse shadow-[0_0_8px_#00FF41]" />
          <span className="text-sm font-bold tracking-widest text-[#00FF41] glow-text-green">
            BUGHUNTER_v1.0
          </span>
        </div>
        <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-1">
          <Wifi className="w-3.5 h-3.5 text-[#00FF41]" />
          <span>SESSION: <span className="text-[#00FF41] font-bold">SECURE</span></span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-none border text-left transition-all duration-150 ${
                isActive
                  ? 'bg-[#00FF41]/10 border-[#00FF41] text-[#00FF41] shadow-[inset_0_0_8px_rgba(0,255,65,0.05)] glow-text-green'
                  : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[#00FF41]' : 'text-zinc-500'}`} />
              <span className="font-bold tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Terminal Mini-feed */}
      <div className="p-4 border-t border-[#00FF41]/10 bg-zinc-950/60 flex flex-col gap-2 min-h-[140px] max-h-[180px] overflow-hidden">
        <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
          <Terminal className="w-3 h-3 text-cyan-400" />
          SYSTEM_LOG_DAEMON
        </span>
        <div className="flex-1 overflow-y-auto space-y-1 text-[9px] text-[#00FF41]/70 leading-relaxed font-mono">
          {recentLogs.map((log, index) => (
            <div key={index} className="truncate">
              <span className="text-cyan-500/80 mr-1">&gt;</span>
              {log}
            </div>
          ))}
          {recentLogs.length === 0 && (
            <div className="text-zinc-600 italic">No events logged yet.</div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#00FF41]/20 text-[10px] text-zinc-500 space-y-1 bg-[#050507]">
        <div className="flex items-center justify-between">
          <span>OPERATOR:</span>
          <span className="text-zinc-300 font-bold">SOLO_HUNTER</span>
        </div>
        <div className="flex items-center justify-between">
          <span>IP_STATUS:</span>
          <span className="text-cyan-400 font-bold">127.0.0.1</span>
        </div>
        <div className="flex items-center justify-between">
          <span>ZONE:</span>
          <span className="text-[#00FF41] font-bold">LOC-HOST</span>
        </div>
      </div>
    </div>
  );
};
