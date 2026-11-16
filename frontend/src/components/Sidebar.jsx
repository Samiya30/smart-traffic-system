import React from 'react';
import { 
  LayoutDashboard, 
  Tv, 
  Camera, 
  Award, 
  ShieldAlert, 
  BarChart3, 
  BookOpen, 
  Sliders, 
  HeartHandshake,
  FileCheck,
  Zap,
  Printer
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onOpenSettings, onOpenReport }) {
  const menuItems = [
    { id: 'overview', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'simulator', label: '4-Way Simulator', icon: Tv, badge: '60 FPS' },
    { id: 'societal', label: 'Societal & Green Impact', icon: HeartHandshake, badge: 'Welfare' },
    { id: 'violations', label: 'Violations & e-Challan', icon: ShieldAlert, badge: 'Police' },
    { id: 'cameras', label: 'AI CCTV Feeds', icon: Camera, badge: 'YOLOv8' },
    { id: 'benchmark', label: 'AI vs Fixed Benchmark', icon: Award, highlight: true },
    { id: 'emergency', label: 'Emergency Corridor', icon: ShieldAlert, badge: 'EMS' },
    { id: 'analytics', label: 'Traffic Analytics', icon: BarChart3 },
    { id: 'viva', label: 'Viva & Project Guide', icon: BookOpen }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 p-4 hidden md:flex flex-col justify-between min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 block">
            Navigation System
          </span>
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Algorithm Card */}
        <div className="rounded-xl p-3.5 bg-slate-950/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Priority Algorithm</span>
          </div>
          <p className="font-mono text-[10px] text-cyan-300 leading-tight">
            P_i = 0.5·V_i + 0.3·Q_i + 0.2·W_i
          </p>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Multi-criteria dynamic green duration allocation with anti-starvation.
          </p>
        </div>
      </div>

      {/* Footer Info & Report Print Trigger */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onOpenReport}
          className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition"
        >
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          <span>Print Evaluation Report</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Config Parameters</span>
        </button>

        <span className="block text-center text-[10px] text-slate-400 mt-2 font-mono">
          Final-Year CSE Major Project
        </span>
      </div>
    </aside>
  );
}
