import React, { useState } from 'react';
import { ShieldAlert, AlertOctagon, CheckCircle2, Siren, Flame, Radio } from 'lucide-react';

export default function EmergencyPanel({ trafficData, onTriggerEmergency, onClearEmergency }) {
  const activeEmergency = trafficData?.activeEmergency;
  const [selectedDir, setSelectedDir] = useState('North');
  const [vehicleType, setVehicleType] = useState('ambulance');

  const emergencyTypes = [
    { id: 'ambulance', label: 'Ambulance (EMS)', icon: Siren, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
    { id: 'fire_truck', label: 'Fire Engine (FD)', icon: Flame, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { id: 'police', label: 'Police Cruiser (LE)', icon: Radio, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' }
  ];

  return (
    <div className="space-y-4">
      {/* Active Siren Banner if triggered */}
      {activeEmergency && (
        <div className="rounded-2xl p-5 border-2 border-rose-500 bg-gradient-to-r from-rose-950/80 via-slate-950 to-blue-950/80 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-rose-600 text-white rounded-xl shadow-lg">
                <Siren className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-rose-300 uppercase">
                  ACTIVE PRIORITY PREEMPTION PROTOCOL
                </span>
                <h3 className="text-xl font-black text-white tracking-wide">
                  {activeEmergency.type.toUpperCase()} ON {activeEmergency.direction.toUpperCase()} APPROACH
                </h3>
                <p className="text-xs text-rose-200/80">
                  Conflicting phases cleared. Green wave corridor activated. Signal held green until vehicle clears intersection.
                </p>
              </div>
            </div>

            <button
              onClick={() => onClearEmergency?.()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition"
            >
              Clear Emergency Corridor
            </button>
          </div>
        </div>
      )}

      {/* Manual Dispatch Simulator Panel */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center space-x-2.5 mb-4">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h3 className="text-base font-bold text-white">Emergency Green Wave Preemption Dispatch</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Select Approach Direction */}
          <div>
            <label className="text-xs text-slate-400 block mb-2 font-medium">Approach Direction:</label>
            <div className="grid grid-cols-4 gap-2">
              {['North', 'South', 'East', 'West'].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDir(d)}
                  className={`py-2 text-xs font-mono font-bold rounded-lg border transition ${
                    selectedDir === d 
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Select Emergency Vehicle Type */}
          <div>
            <label className="text-xs text-slate-400 block mb-2 font-medium">Vehicle Unit:</label>
            <div className="grid grid-cols-3 gap-2">
              {emergencyTypes.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setVehicleType(item.id)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center space-y-1 transition ${
                      vehicleType === item.id 
                        ? 'bg-slate-800 text-white border-rose-500/80 shadow' 
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-rose-400" />
                    <span className="text-[10px]">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={() => onTriggerEmergency?.(selectedDir, vehicleType)}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)] transition flex items-center justify-center space-x-2"
        >
          <Siren className="w-4 h-4" />
          <span>Dispatch Emergency Priority Corridor on {selectedDir}</span>
        </button>
      </div>
    </div>
  );
}
