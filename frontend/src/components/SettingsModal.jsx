import React, { useState } from 'react';
import { Settings, Sliders, Save, RotateCcw, X, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, currentConfig, onSaveConfig, trafficPattern, onSetPattern }) {
  if (!isOpen) return null;

  const [config, setConfig] = useState({
    g_min: currentConfig?.g_min || 10,
    g_max: currentConfig?.g_max || 60,
    yellow_time: currentConfig?.yellow_time || 3,
    all_red_time: currentConfig?.all_red_time || 2,
    weight_vehicles: currentConfig?.weight_vehicles || 0.5,
    weight_queue: currentConfig?.weight_queue || 0.3,
    weight_waiting: currentConfig?.weight_waiting || 0.2,
    simulation_speed: currentConfig?.simulation_speed || 1.0
  });

  const [pattern, setPattern] = useState(trafficPattern || 'morning_rush');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    onSaveConfig?.(config);
    onSetPattern?.(pattern);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setConfig({
      g_min: 10,
      g_max: 60,
      yellow_time: 3,
      all_red_time: 2,
      weight_vehicles: 0.5,
      weight_queue: 0.3,
      weight_waiting: 0.2,
      simulation_speed: 1.0
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 bg-slate-900 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Signal Optimization & Simulation Parameters</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 my-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Traffic Scenario Preset */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 uppercase tracking-wider">
              Traffic Demand Scenario Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'morning_rush', label: 'Morning Rush' },
                { id: 'evening_rush', label: 'Evening Rush' },
                { id: 'balanced', label: 'Balanced Flow' },
                { id: 'unbalanced', label: 'Heavy East' },
                { id: 'gridlock', label: 'Gridlock Surge' },
                { id: 'night', label: 'Night Hours' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setPattern(item.id)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition ${
                    pattern === item.id 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow' 
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Green Duration Limits */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Min Green (\(G_{`\\min`}\)):</span>
                <span className="font-mono text-cyan-400 font-bold">{config.g_min}s</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={config.g_min}
                onChange={e => setConfig({ ...config, g_min: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Max Green (\(G_{`\\max`}\)):</span>
                <span className="font-mono text-cyan-400 font-bold">{config.g_max}s</span>
              </div>
              <input
                type="range"
                min="30"
                max="90"
                value={config.g_max}
                onChange={e => setConfig({ ...config, g_max: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Phase Clearance Intervals */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Yellow Phase Time:</span>
                <span className="font-mono text-amber-400 font-bold">{config.yellow_time}s</span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                value={config.yellow_time}
                onChange={e => setConfig({ ...config, yellow_time: parseInt(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>All-Red Clearance:</span>
                <span className="font-mono text-rose-400 font-bold">{config.all_red_time}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={config.all_red_time}
                onChange={e => setConfig({ ...config, all_red_time: parseInt(e.target.value) })}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Priority Score Formula Weights */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block mb-2 font-mono">
              Formula Weights: \(P_i = w_V V_i + w_Q Q_i + w_W W_i\)
            </span>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Vehicle Count Weight (\(w_V\)):</span>
                  <span className="font-mono text-white">{config.weight_vehicles}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={config.weight_vehicles}
                  onChange={e => setConfig({ ...config, weight_vehicles: parseFloat(e.target.value) })}
                  className="w-full accent-blue-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Queue Length Weight (\(w_Q\)):</span>
                  <span className="font-mono text-white">{config.weight_queue}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={config.weight_queue}
                  onChange={e => setConfig({ ...config, weight_queue: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Waiting Time Weight (\(w_W\)):</span>
                  <span className="font-mono text-white">{config.weight_waiting}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={config.weight_waiting}
                  onChange={e => setConfig({ ...config, weight_waiting: parseFloat(e.target.value) })}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            {savedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedNotice ? 'Applied!' : 'Save & Apply'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
