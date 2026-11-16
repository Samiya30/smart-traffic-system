import React, { useState, useEffect } from 'react';
import { Sliders, Bell, ShieldAlert, Wifi, Globe, MapPin, Cpu, Volume2, VolumeX, FileText, Wind } from 'lucide-react';

export default function Navbar({ onOpenSettings, trafficData, onOpenReport, isVoiceMuted, onToggleVoice }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeEmergency = trafficData?.activeEmergency;
  const activeAccident = trafficData?.activeAccident;
  const aqi = trafficData?.airQuality?.aqiValue || 68;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between">
        {/* Left: Brand & Intersection */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-sm lg:text-base text-white tracking-wide">
                  TRAFFIC.AI
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                  v2.5 Pro
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Computer Vision & Societal Traffic Optimization
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

          {/* Intersection & Air Quality */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-white">MG Road & Ring Road Junction</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="hidden xl:flex items-center space-x-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40 text-[11px] text-emerald-300">
            <Wind className="w-3 h-3 text-emerald-400" />
            <span>Clean Air: <strong>AQI {aqi}</strong> (Protected)</span>
          </div>
        </div>

        {/* Right: Controls, Alerts, Clock */}
        <div className="flex items-center space-x-2.5">
          {/* Active Crash Banner */}
          {activeAccident && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-rose-600/30 border border-rose-500 text-rose-300 text-xs font-mono font-bold animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>COLLISION CONTAINMENT ON {activeAccident.direction.toUpperCase()}</span>
            </div>
          )}

          {/* Active Emergency Flasher */}
          {activeEmergency && !activeAccident && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>EMS CORRIDOR ON {activeEmergency.direction.toUpperCase()}</span>
            </div>
          )}

          {/* Voice Speech Toggle */}
          <button
            onClick={onToggleVoice}
            className={`p-2 rounded-xl border transition ${
              !isVoiceMuted 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title={isVoiceMuted ? "Enable Voice & Audio Siren Alerts" : "Mute Voice Alerts"}
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Quick Print Report Button */}
          <button
            onClick={onOpenReport}
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition"
            title="Generate Official Evaluation Summary Report"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Report</span>
          </button>

          {/* Digital Clock */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 font-bold">
            <span>{timeStr}</span>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Adjust Signal Weights & Optimization Parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
