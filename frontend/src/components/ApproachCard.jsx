import React from 'react';
import { Video, ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function ApproachCard({ direction, data, isActive, isEmergency, onManualOverride, onTriggerEmergency }) {
  const signal = data?.signal || 'RED';
  const vehicleCount = Math.round(data?.vehicleCount ?? 0);
  const pcuCount = data?.pcuCount ?? 0;
  const queueLength = data?.queueLength ?? 0;
  const waitingTime = Math.round(data?.waitingTime ?? 0);
  const density = data?.densityLevel || 'Low';

  const getSignalColor = () => {
    if (signal === 'GREEN') return 'bg-emerald-500 shadow-[0_0_15px_#10b981]';
    if (signal === 'YELLOW') return 'bg-amber-500 shadow-[0_0_15px_#f59e0b]';
    return 'bg-rose-500 shadow-[0_0_12px_#ef4444]';
  };

  const getDensityBadge = () => {
    switch (density) {
      case 'Very High':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'High':
        return 'bg-rose-900/40 text-rose-400 border-rose-700/50';
      case 'Medium':
        return 'bg-amber-900/40 text-amber-300 border-amber-700/50';
      case 'Low':
      default:
        return 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50';
    }
  };

  return (
    <div className={`glass-panel rounded-2xl p-4 border transition-all duration-300 ${
      isActive 
        ? 'border-cyan-500/60 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)] bg-slate-900/90' 
        : isEmergency
        ? 'border-rose-500/70 shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)] animate-pulse'
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <span className={`w-3.5 h-3.5 rounded-full ${getSignalColor()} transition-colors duration-300`} />
          <div>
            <h3 className="font-bold text-white text-base tracking-wide">{direction} Corridor</h3>
            <span className="text-[10px] text-slate-400 font-mono">CAM-0{direction === 'North' ? 1 : direction === 'South' ? 2 : direction === 'East' ? 3 : 4} • RTSP-HD</span>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getDensityBadge()}`}>
          {density}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 my-3">
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
          <span className="text-[11px] text-slate-400 block mb-0.5">Vehicle Volume</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold text-white font-mono">{vehicleCount}</span>
            <span className="text-[10px] text-slate-400">({pcuCount} PCU)</span>
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
          <span className="text-[11px] text-slate-400 block mb-0.5">Queue Length</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold text-cyan-400 font-mono">{queueLength}</span>
            <span className="text-[10px] text-slate-400">meters</span>
          </div>
        </div>
      </div>

      {/* Queue Fill Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
          <span>Capacity Occupancy</span>
          <span>{Math.min(100, Math.round((queueLength / 120) * 100))}%</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              queueLength > 50 ? 'bg-rose-500' : queueLength > 25 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, (queueLength / 120) * 100)}%` }}
          />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <span className="text-[11px] text-slate-400 font-mono">
          Wait: <strong className="text-slate-200">{waitingTime}s</strong>
        </span>

        <div className="flex space-x-1.5">
          <button
            onClick={() => onManualOverride?.(direction)}
            className="px-2 py-1 text-[11px] rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 font-medium transition"
            title="Force immediate green signal for this direction"
          >
            Force Green
          </button>
          <button
            onClick={() => onTriggerEmergency?.(direction, 'ambulance')}
            className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/40 transition"
            title="Trigger emergency preemption on this direction"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
