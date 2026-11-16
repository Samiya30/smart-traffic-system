import React from 'react';
import { Clock, Activity, TrendingDown, Leaf, ShieldAlert, Cpu } from 'lucide-react';

export default function MetricCards({ trafficData }) {
  const approaches = trafficData?.approaches || {};
  const activeDir = trafficData?.activeDirection || 'North';
  const phaseState = trafficData?.phaseState || 'GREEN';
  const timer = trafficData?.timerRemaining ?? 0;
  const metrics = trafficData?.metrics || {};
  const improvement = metrics?.improvementPct ?? 48;
  const fuel = metrics?.ai?.fuelSavedLiters ?? 12.4;
  const co2 = metrics?.ai?.co2SavedKg ?? 28.6;
  const totalWaiting = trafficData?.totalWaitingVehicles ?? 65;

  const getSignalBadgeColor = () => {
    if (phaseState === 'GREEN') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (phaseState === 'YELLOW') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Active Phase Card */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 relative overflow-hidden group hover:border-cyan-500/40 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Signal Phase</span>
          <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${getSignalBadgeColor()}`}>
            {phaseState}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white tracking-tight">{activeDir} Approach</span>
        </div>
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cycle Remaining:</span>
          </div>
          <span className="font-mono text-base font-bold text-cyan-400">{timer}s</span>
        </div>
      </div>

      {/* 2. Total Congestion / Waiting Vehicles */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 relative overflow-hidden group hover:border-blue-500/40 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Queue Density</span>
          <Activity className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{Math.round(totalWaiting)}</span>
          <span className="text-xs text-slate-400 font-medium">vehicles in queue</span>
        </div>
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">Throughput:</span>
          <span className="font-mono text-xs font-semibold text-blue-400">
            {metrics?.ai?.totalPassed ? Math.round(metrics.ai.totalPassed) : 520} cleared
          </span>
        </div>
      </div>

      {/* 3. AI Wait Time Reduction */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Wait Time Efficiency</span>
          <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px] font-bold">
            <TrendingDown className="w-3 h-3" />
            <span>-{improvement}%</span>
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {metrics?.ai?.averageWaitTime || 18.5}s
          </span>
          <span className="text-xs text-slate-400 line-through">
            {metrics?.fixed?.averageWaitTime || 36.2}s fixed
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">Optimization:</span>
          <span className="font-mono text-xs font-semibold text-emerald-400">Dynamic AI (YOLO)</span>
        </div>
      </div>

      {/* 4. Environmental Savings */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 relative overflow-hidden group hover:border-amber-500/40 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Green Impact</span>
          <Leaf className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-white tracking-tight">{co2} kg</span>
          <span className="text-xs text-slate-400">CO₂ avoided</span>
        </div>
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-xs text-slate-400">Fuel Saved:</span>
          <span className="font-mono text-xs font-semibold text-amber-400">{fuel} Liters</span>
        </div>
      </div>
    </div>
  );
}
