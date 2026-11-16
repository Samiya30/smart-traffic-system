import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Wind, 
  Accessibility, 
  Bus, 
  AlertOctagon, 
  CheckCircle2, 
  ShieldAlert, 
  Flame, 
  Siren, 
  Play, 
  Sparkles 
} from 'lucide-react';

export default function SocietalImpactPanel({ 
  trafficData, 
  onTriggerPedestrian, 
  onTriggerBusPriority, 
  onTriggerAccident, 
  onClearAccident,
  onTriggerEmergency 
}) {
  const airQuality = trafficData?.airQuality || {
    aqiValue: 68,
    status: "Moderate (Protected)",
    pm25: 38.4,
    pm10: 58.2,
    co2AvoidedTodayKg: 34.2,
    fuelSavedTodayLiters: 14.8,
    schoolZoneProtectionActive: true
  };

  const pedestrianCrossing = trafficData?.pedestrianCrossing;
  const activeBusPriority = trafficData?.activeBusPriority;
  const activeAccident = trafficData?.activeAccident;
  const [pedDirection, setPedDirection] = useState('North');
  const [selectedBusDir, setSelectedBusDir] = useState('East');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-1">
              <HeartHandshake className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                Technology for Social Good & Urban Welfare
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Societal, Environmental & Human Accessibility Framework
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Addressing real-world human crises: protecting emergency transit in the <strong>"Golden Hour"</strong>, safeguarding schoolchildren from toxic idling emissions, guaranteeing crosswalk time for senior citizens, and prioritizing high-occupancy public transit.
            </p>
          </div>

          <div className="bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] font-mono text-emerald-400 block font-bold uppercase">Public Health Status</span>
            <span className="text-xl font-black text-white font-mono">AQI {airQuality.aqiValue}</span>
            <span className="text-[10px] text-emerald-400 block">Clean Air Zone Active</span>
          </div>
        </div>
      </div>

      {/* Accident Incident Containment Banner (If triggered) */}
      {activeAccident && (
        <div className="rounded-2xl p-5 border-2 border-rose-500 bg-rose-950/90 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-rose-600 text-white rounded-xl shadow-lg">
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-rose-300 uppercase">
                  CRITICAL CRASH INCIDENT DETECTED
                </span>
                <h3 className="text-lg font-black text-white tracking-wide">
                  {activeAccident.details.toUpperCase()} ON {activeAccident.direction.toUpperCase()} APPROACH
                </h3>
                <p className="text-xs text-rose-200">
                  All intersection approaches locked RED to prevent secondary pile-up collisions. GPS & video telemetry sent to EMS Dispatch (108).
                </p>
              </div>
            </div>

            <button
              onClick={() => onClearAccident?.()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition"
            >
              Clear Collision & Resume Signals
            </button>
          </div>
        </div>
      )}

      {/* Grid of 4 Societal Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Pillar 1: Universal Accessibility (Elderly & Disabled Crosswalk) */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Accessibility className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Universal Accessibility (Crosswalk)</h3>
                <span className="text-[10px] text-slate-400 font-mono">Elderly & Disability Dynamic Extension</span>
              </div>
            </div>
            {pedestrianCrossing?.active && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                WALK: {Math.round(pedestrianCrossing.timerRemaining)}s
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 my-3 leading-relaxed">
            Traditional rigid 10s walk timers force senior citizens and wheelchair users into danger. Our vision system detects slow-moving pedestrians and automatically extends green time by <strong>+10 seconds</strong> with acoustic walk chimes.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Crosswalk Corridor:</label>
              <div className="grid grid-cols-4 gap-2">
                {['North', 'South', 'East', 'West'].map(d => (
                  <button
                    key={d}
                    onClick={() => setPedDirection(d)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition ${
                      pedDirection === d 
                        ? 'bg-purple-600 text-white border-purple-500' 
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onTriggerPedestrian?.(pedDirection, false)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
              >
                Standard Walk (14s)
              </button>

              <button
                onClick={() => onTriggerPedestrian?.(pedDirection, true)}
                className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] transition"
              >
                ♿ Elderly Extension (24s)
              </button>
            </div>
          </div>
        </div>

        {/* Pillar 2: Social Equity (Public Transit Bus Priority - TSP) */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Social Equity (Bus Priority - TSP)</h3>
                <span className="text-[10px] text-slate-400 font-mono">High-Occupancy Public Transit</span>
              </div>
            </div>
            {activeBusPriority && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                TSP ACTIVE
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 my-3 leading-relaxed">
            A public bus carrying <strong>65 daily commuters and students</strong> deserves priority over single-occupancy luxury cars. The system grants instant green extension to city buses, encouraging green transit adoption.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Bus Approach Corridor:</label>
              <div className="grid grid-cols-4 gap-2">
                {['North', 'South', 'East', 'West'].map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedBusDir(d)}
                    className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition ${
                      selectedBusDir === d 
                        ? 'bg-amber-600 text-white border-amber-500' 
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onTriggerBusPriority?.(selectedBusDir, "500D Metro Feeder", 65)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition"
            >
              🚌 Grant Bus Priority on {selectedBusDir} (65 Commuters)
            </button>
          </div>
        </div>

        {/* Pillar 3: Environmental Sustainability & Clean Air Zone */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hospital & School Clean Air Zone</h3>
              <span className="text-[10px] text-slate-400 font-mono">Micro-Climate Emission Defense</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 my-3">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">CO₂ Idling Prevented</span>
              <span className="text-xl font-bold text-emerald-400 font-mono block">
                {airQuality.co2AvoidedTodayKg} kg
              </span>
              <span className="text-[10px] text-slate-400">Equivalent to planting 12 trees</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase">Fuel Saved by Commuters</span>
              <span className="text-xl font-bold text-amber-400 font-mono block">
                {airQuality.fuelSavedTodayLiters} L
              </span>
              <span className="text-[10px] text-slate-400">Direct relief for working families</span>
            </div>
          </div>

          <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/40 text-[11px] text-emerald-300">
            <strong>School Zone Protection:</strong> Prevents prolonged diesel truck idling within 400m radius of St. Joseph's High School & Baptist Hospital during morning 07:30–09:00 peak hours.
          </div>
        </div>

        {/* Pillar 4: Secondary Collision Prevention & Crash Dispatch */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Accident Containment & EMS Dispatch</h3>
              <span className="text-[10px] text-slate-400 font-mono">Secondary Crash Prevention Protocol</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 my-3 leading-relaxed">
            Secondary pile-ups cause 18% of traffic crash fatalities. Upon collision detection, signals instantly lock RED to freeze approaching vehicles safely and alert EMS (108) with zero delay.
          </p>

          <div className="pt-2">
            {!activeAccident ? (
              <button
                onClick={() => onTriggerAccident?.("South", "Two-Wheeler & Sedan Collision")}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition flex items-center justify-center space-x-2"
              >
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Simulate Crash Incident (Freeze Signals & Notify EMS)</span>
              </button>
            ) : (
              <button
                onClick={() => onClearAccident?.()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
              >
                Clear Accident Incident & Resume Signal Cycle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
