import React, { useState } from 'react';
import { Camera, Maximize2, ShieldCheck, Eye, Layers } from 'lucide-react';

export default function CameraFeeds({ trafficData }) {
  const approaches = trafficData?.approaches || {};
  const [activeCam, setActiveCam] = useState('ALL');

  const cameras = [
    { id: 'cam-01', direction: 'North', name: 'MG Road Northbound Approach', fps: 30, latency: '12ms' },
    { id: 'cam-02', direction: 'South', name: 'Outer Ring Road South Approach', fps: 30, latency: '14ms' },
    { id: 'cam-03', direction: 'East',  name: 'Tech Corridor East Highway', fps: 30, latency: '11ms' },
    { id: 'cam-04', direction: 'West',  name: 'Metro Terminal West Approach', fps: 30, latency: '15ms' }
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            CCTV AI Telemetry & Object Detection Feeds
          </h2>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Filter:</span>
          {['ALL', 'North', 'South', 'East', 'West'].map(dir => (
            <button
              key={dir}
              onClick={() => setActiveCam(dir)}
              className={`px-2.5 py-1 rounded-lg border font-mono transition ${
                activeCam === dir 
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold' 
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {dir}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cameras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras
          .filter(c => activeCam === 'ALL' || c.direction === activeCam)
          .map(cam => {
            const data = approaches[cam.direction] || {};
            const count = Math.round(data.vehicleCount || 10);
            const isGreen = data.signal === 'GREEN';

            return (
              <div 
                key={cam.id} 
                className="glass-panel rounded-2xl overflow-hidden border border-slate-800 relative group"
              >
                {/* Camera Top Bar */}
                <div className="bg-slate-950/80 px-3 py-2 flex items-center justify-between border-b border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-mono font-semibold text-slate-300">
                      {cam.id.toUpperCase()} • {cam.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {cam.latency}
                    </span>
                    <span className="text-emerald-400">YOLOv8 Active</span>
                  </div>
                </div>

                {/* Simulated AI CCTV Video Feed */}
                <div className="relative aspect-video bg-[#070b14] overflow-hidden flex items-center justify-center">
                  {/* Road Asphalt Graphics */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-60">
                    <div className="w-48 h-full bg-[#1e293b] relative border-x-2 border-slate-600">
                      <div className="w-full h-full flex flex-col justify-between py-2 items-center">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="w-1 h-8 bg-amber-400/80" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Virtual Tripwire Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500/90 shadow-[0_0_8px_#ef4444] z-10 flex items-center justify-between px-4">
                    <span className="text-[9px] font-mono font-bold text-rose-300 bg-rose-950/80 px-1 py-0.5 rounded">
                      TRIPWIRE LINE #1
                    </span>
                    <span className="text-[9px] font-mono font-bold text-rose-300 bg-rose-950/80 px-1 py-0.5 rounded">
                      CROSSING DETECTOR
                    </span>
                  </div>

                  {/* Simulated Detected Vehicles with YOLO Bounding Boxes */}
                  <div className="absolute inset-0 p-4 pointer-events-none">
                    {/* Vehicle 1 */}
                    <div className="absolute top-[28%] left-[32%] w-24 h-14 border-2 border-emerald-400 rounded-sm bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                      <span className="absolute -top-4 left-0 bg-emerald-500 text-slate-950 text-[9px] font-mono font-bold px-1 rounded-t">
                        car #104 94%
                      </span>
                    </div>

                    {/* Vehicle 2 */}
                    <div className="absolute top-[52%] left-[44%] w-28 h-20 border-2 border-amber-400 rounded-sm bg-amber-500/10 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                      <span className="absolute -top-4 left-0 bg-amber-500 text-slate-950 text-[9px] font-mono font-bold px-1 rounded-t">
                        bus #107 91%
                      </span>
                    </div>

                    {/* Vehicle 3 */}
                    <div className="absolute top-[38%] left-[56%] w-12 h-10 border-2 border-cyan-400 rounded-sm bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                      <span className="absolute -top-4 left-0 bg-cyan-500 text-slate-950 text-[9px] font-mono font-bold px-1 rounded-t">
                        bike #112 88%
                      </span>
                    </div>
                  </div>

                  {/* Live HUD Overlay */}
                  <div className="absolute top-2 left-2 z-20 flex flex-col space-y-1 text-[10px] font-mono text-slate-400 bg-slate-950/85 p-2 rounded-lg border border-slate-800">
                    <span className="text-white font-bold">{cam.direction.toUpperCase()} ROAD</span>
                    <span>VEHICLES: <strong className="text-cyan-400">{count}</strong></span>
                    <span>QUEUE: <strong className="text-amber-400">{data.queueLength || 25}m</strong></span>
                    <span>SIGNAL: <strong className={isGreen ? 'text-emerald-400' : 'text-rose-400'}>{data.signal || 'RED'}</strong></span>
                  </div>

                  <div className="absolute bottom-2 right-2 z-20 text-[10px] font-mono text-slate-400 bg-slate-950/85 px-2 py-1 rounded border border-slate-800">
                    REC • 1080p60 H.265
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
