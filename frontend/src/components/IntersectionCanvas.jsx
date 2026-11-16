import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, AlertTriangle, Zap, Volume2, ShieldAlert, Accessibility, Bus, AlertOctagon } from 'lucide-react';

export default function IntersectionCanvas({ 
  trafficData, 
  onTriggerEmergency, 
  onManualOverride,
  onTriggerPedestrian,
  onTriggerBusPriority,
  onTriggerAccident 
}) {
  const canvasRef = useRef(null);
  const vehiclesRef = useRef([]);
  const animFrameRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Vehicle types specification
  const VEHICLE_SPECS = {
    car: { length: 28, width: 15, color: '#3b82f6', maxSpeed: 2.2, label: 'Car' },
    suv: { length: 32, width: 17, color: '#06b6d4', maxSpeed: 2.0, label: 'SUV' },
    bus: { length: 58, width: 20, color: '#f59e0b', maxSpeed: 1.5, label: 'Bus' },
    truck: { length: 50, width: 18, color: '#8b5cf6', maxSpeed: 1.4, label: 'Truck' },
    motorcycle: { length: 18, width: 9, color: '#ec4899', maxSpeed: 2.6, label: 'Bike' },
    ambulance: { length: 38, width: 18, color: '#ffffff', maxSpeed: 3.2, label: 'Ambulance' }
  };

  // Synchronize vehicles on canvas
  useEffect(() => {
    if (!trafficData || !trafficData.approaches) return;

    if (vehiclesRef.current.length === 0) {
      const initialVehicles = [];
      const directions = ['North', 'South', 'East', 'West'];

      directions.forEach(dir => {
        const count = Math.min(Math.round(trafficData.approaches[dir]?.vehicleCount || 10), 12);
        for (let i = 0; i < count; i++) {
          initialVehicles.push(createVehicle(dir, i * 40 + 70, getRandomType(dir === trafficData.activeEmergency?.direction)));
        }
      });
      vehiclesRef.current = initialVehicles;
    }
  }, [trafficData?.trafficPattern]);

  // Inject Emergency Ambulance if triggered
  useEffect(() => {
    if (trafficData?.activeEmergency) {
      const emDir = trafficData.activeEmergency.direction;
      const existing = vehiclesRef.current.find(v => v.type === 'ambulance');
      if (!existing) {
        vehiclesRef.current.unshift(createVehicle(emDir, 320, 'ambulance'));
      }
    }
  }, [trafficData?.activeEmergency]);

  // Inject Public Transit Bus if triggered
  useEffect(() => {
    if (trafficData?.activeBusPriority) {
      const bDir = trafficData.activeBusPriority.direction;
      vehiclesRef.current.unshift(createVehicle(bDir, 280, 'bus'));
    }
  }, [trafficData?.activeBusPriority]);

  const getRandomType = (isEmergency = false) => {
    if (isEmergency) return 'ambulance';
    const r = Math.random();
    if (r < 0.55) return 'car';
    if (r < 0.72) return 'motorcycle';
    if (r < 0.85) return 'suv';
    if (r < 0.94) return 'bus';
    return 'truck';
  };

  const createVehicle = (direction, distance, type) => {
    const spec = VEHICLE_SPECS[type] || VEHICLE_SPECS.car;
    const laneOffset = (Math.random() > 0.5 ? 1 : -1) * 14;
    return {
      id: Math.floor(Math.random() * 100000),
      direction,
      distance,
      laneOffset,
      type,
      spec,
      speed: 0,
      waitingTime: 0,
      cleared: false,
      strobePhase: 0
    };
  };

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let lastTime = performance.now();
    let pedAnimPhase = 0;

    const render = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      pedAnimPhase += dt * 3;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const roadWidth = 140;
      const halfRoad = roadWidth / 2;

      // 1. Clear background
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      // 2. Surrounding terrain & sidewalks
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, cx - halfRoad, cy - halfRoad);
      ctx.fillRect(cx + halfRoad, 0, width - (cx + halfRoad), cy - halfRoad);
      ctx.fillRect(0, cy + halfRoad, cx - halfRoad, height - (cy + halfRoad));
      ctx.fillRect(cx + halfRoad, cy + halfRoad, width - (cx + halfRoad), height - (cy + halfRoad));

      // 3. Asphalt roads
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - halfRoad, 0, roadWidth, height);
      ctx.fillRect(0, cy - halfRoad, width, roadWidth);

      // 4. Lane borders & markings
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - halfRoad, 0, roadWidth, height);
      ctx.strokeRect(0, cy - halfRoad, width, roadWidth);

      // Yellow Center Dash Lines
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10]);

      ctx.beginPath();
      ctx.moveTo(cx, 0); ctx.lineTo(cx, cy - halfRoad);
      ctx.moveTo(cx, cy + halfRoad); ctx.lineTo(cx, height);
      ctx.moveTo(0, cy); ctx.lineTo(cx - halfRoad, cy);
      ctx.moveTo(cx + halfRoad, cy); ctx.lineTo(width, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Zebra Crosswalks
      const isPedActive = trafficData?.pedestrianCrossing?.active;
      const pedDir = trafficData?.pedestrianCrossing?.direction;
      const isElderly = trafficData?.pedestrianCrossing?.isElderlyOrDisabled;

      ctx.fillStyle = isPedActive ? 'rgba(168, 85, 247, 0.6)' : 'rgba(255, 255, 255, 0.4)';
      const zebraWidth = 12;
      const zebraGap = 6;
      for (let x = cx - halfRoad + 4; x < cx + halfRoad - 4; x += zebraWidth + zebraGap) {
        ctx.fillRect(x, cy - halfRoad - 22, zebraWidth, 18); // North
        ctx.fillRect(x, cy + halfRoad + 4, zebraWidth, 18);  // South
      }
      for (let y = cy - halfRoad + 4; y < cy + halfRoad - 4; y += zebraWidth + zebraGap) {
        ctx.fillRect(cx - halfRoad - 22, y, 18, zebraWidth); // West
        ctx.fillRect(cx + halfRoad + 4, y, 18, zebraWidth);  // East
      }

      // Draw Animated Pedestrian figures when crosswalk active
      if (isPedActive) {
        drawPedestrians(ctx, cx, cy, halfRoad, pedDir, pedAnimPhase, isElderly);
      }

      // 6. Stop lines (White)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - halfRoad, cy - halfRoad - 4, roadWidth, 4);
      ctx.fillRect(cx - halfRoad, cy + halfRoad, roadWidth, 4);
      ctx.fillRect(cx - halfRoad - 4, cy - halfRoad, 4, roadWidth);
      ctx.fillRect(cx + halfRoad, cy - halfRoad, 4, roadWidth);

      // 7. Traffic Signals
      const approaches = trafficData?.approaches || {};
      const activeDir = trafficData?.activeDirection || 'North';
      const isAccident = !!trafficData?.activeAccident;

      drawTrafficLight(ctx, cx - halfRoad - 28, cy - halfRoad - 60, 'North', isAccident ? 'RED' : (approaches.North?.signal || 'RED'));
      drawTrafficLight(ctx, cx + halfRoad + 10, cy + halfRoad + 10, 'South', isAccident ? 'RED' : (approaches.South?.signal || 'RED'));
      drawTrafficLight(ctx, cx - halfRoad - 60, cy + halfRoad + 10, 'West', isAccident ? 'RED' : (approaches.West?.signal || 'RED'));
      drawTrafficLight(ctx, cx + halfRoad + 10, cy - halfRoad - 60, 'East', isAccident ? 'RED' : (approaches.East?.signal || 'RED'));

      // 8. Update & Draw Vehicles
      if (!isPaused && !isAccident) {
        updateVehicles(dt, cx, cy, halfRoad, approaches, activeDir);
      }

      drawVehicles(ctx, cx, cy);

      // 9. Direction Badges
      drawDirectionBadges(ctx, cx, cy, halfRoad, approaches, activeDir, trafficData?.timerRemaining);

      // 10. Crash Hazard Marker on Center if Accident active
      if (isAccident) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.beginPath();
        ctx.arc(cx, cy, 55, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("COLLISION", cx, cy - 6);
        ctx.fillText("ALL SIGNALS RED", cx, cy + 12);
        ctx.textAlign = 'left';
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [trafficData, isPaused]);

  const drawPedestrians = (ctx, cx, cy, halfRoad, pedDir, phase, isElderly) => {
    const walkOffset = (Math.sin(phase) * 0.5 + 0.5) * (halfRoad * 2 - 20);
    const px = cx - halfRoad + 10 + walkOffset;
    const py = cy - halfRoad - 13;

    ctx.save();
    ctx.fillStyle = isElderly ? '#c084fc' : '#4ade80';
    // Pedestrian Head & Body
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(px - 2, py + 4, 4, 8);

    if (isElderly) {
      // Cane icon
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px + 3, py + 2);
      ctx.lineTo(px + 6, py + 12);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawTrafficLight = (ctx, x, y, direction, state) => {
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, 22, 54, 4);
    ctx.fill();
    ctx.stroke();

    const isRed = state === 'RED';
    const isYellow = state === 'YELLOW';
    const isGreen = state === 'GREEN';

    ctx.fillStyle = isRed ? '#ef4444' : '#450a0a';
    ctx.beginPath();
    ctx.arc(x + 11, y + 10, 6, 0, Math.PI * 2);
    ctx.fill();
    if (isRed) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = isYellow ? '#f59e0b' : '#451a03';
    ctx.beginPath();
    ctx.arc(x + 11, y + 27, 6, 0, Math.PI * 2);
    ctx.fill();
    if (isYellow) {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = isGreen ? '#10b981' : '#022c22';
    ctx.beginPath();
    ctx.arc(x + 11, y + 44, 6, 0, Math.PI * 2);
    ctx.fill();
    if (isGreen) {
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };

  const drawDirectionBadges = (ctx, cx, cy, halfRoad, approaches, activeDir, timerRemaining) => {
    ctx.font = '600 11px "JetBrains Mono", monospace';
    const badgeW = 74;
    const badgeH = 22;

    const badges = [
      { dir: 'North', x: cx - 37, y: 15, state: approaches.North?.signal || 'RED' },
      { dir: 'South', x: cx - 37, y: cy * 2 - 35, state: approaches.South?.signal || 'RED' },
      { dir: 'West',  x: 15, y: cy - 11, state: approaches.West?.signal || 'RED' },
      { dir: 'East',  x: cx * 2 - 89, y: cy - 11, state: approaches.East?.signal || 'RED' }
    ];

    badges.forEach(b => {
      const isActive = b.dir === activeDir;
      ctx.fillStyle = isActive ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.8)';
      ctx.strokeStyle = isActive ? '#06b6d4' : '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, badgeW, badgeH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isActive ? '#38bdf8' : '#94a3b8';
      const text = `${b.dir.toUpperCase()}${isActive ? ` ${timerRemaining || 0}s` : ''}`;
      ctx.fillText(text, b.x + 8, b.y + 15);
    });
  };

  const updateVehicles = (dt, cx, cy, halfRoad, approaches, activeDir) => {
    const stopDistance = halfRoad + 10;
    const vehicles = vehiclesRef.current;

    const byDir = { North: [], South: [], East: [], West: [] };
    vehicles.forEach(v => {
      if (byDir[v.direction]) byDir[v.direction].push(v);
    });

    Object.keys(byDir).forEach(dir => {
      byDir[dir].sort((a, b) => a.distance - b.distance);
      const isGreen = approaches[dir]?.signal === 'GREEN';

      for (let i = 0; i < byDir[dir].length; i++) {
        const v = byDir[dir][i];
        const ahead = i > 0 ? byDir[dir][i - 1] : null;

        let minAllowedDistance = stopDistance;
        if (ahead) {
          minAllowedDistance = ahead.distance + ahead.spec.length + 8;
        }

        if (isGreen || v.distance < stopDistance) {
          v.speed = Math.min(v.spec.maxSpeed, v.speed + 1.5 * dt);
          v.distance -= v.speed * 60 * dt;
          if (v.distance < -120) {
            v.distance = 360 + Math.random() * 80;
            v.type = getRandomType();
            v.spec = VEHICLE_SPECS[v.type] || VEHICLE_SPECS.car;
            v.speed = 0;
            v.waitingTime = 0;
          }
        } else {
          if (v.distance > minAllowedDistance) {
            const distToStop = v.distance - minAllowedDistance;
            const targetSpeed = Math.min(v.spec.maxSpeed, Math.max(0.4, distToStop / 40));
            v.speed = targetSpeed;
            v.distance -= v.speed * 60 * dt;
          } else {
            v.distance = minAllowedDistance;
            v.speed = 0;
            v.waitingTime += dt;
          }
        }

        if (v.type === 'ambulance') {
          v.strobePhase = (v.strobePhase + dt * 10) % 2;
        }
      }
    });
  };

  const drawVehicles = (ctx, cx, cy) => {
    vehiclesRef.current.forEach(v => {
      const { direction, distance, laneOffset, spec, type, strobePhase } = v;
      let x, y, angle;

      if (direction === 'North') {
        x = cx - 22 + laneOffset;
        y = cy - distance;
        angle = Math.PI / 2;
      } else if (direction === 'South') {
        x = cx + 22 + laneOffset;
        y = cy + distance;
        angle = -Math.PI / 2;
      } else if (direction === 'West') {
        x = cx - distance;
        y = cy + 22 + laneOffset;
        angle = 0;
      } else if (direction === 'East') {
        x = cx + distance;
        y = cy - 22 + laneOffset;
        angle = Math.PI;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(-spec.length / 2 + 2, -spec.width / 2 + 2, spec.length, spec.width);

      ctx.fillStyle = spec.color;
      ctx.beginPath();
      ctx.roundRect(-spec.length / 2, -spec.width / 2, spec.length, spec.width, 3);
      ctx.fill();

      // Bus priority banner indicator
      if (type === 'bus') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-spec.length / 3, -spec.width / 2 + 2, (spec.length * 2) / 3, spec.width - 4);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.fillText("BUS", -6, 3);
      }

      if (type === 'ambulance') {
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-2, -5, 4, 10);
        ctx.fillRect(-5, -2, 10, 4);

        const isRedPhase = strobePhase < 1;
        ctx.fillStyle = isRedPhase ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = isRedPhase ? '#ef4444' : '#3b82f6';
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    });
  };

  return (
    <div className="relative glass-panel rounded-2xl p-4 overflow-hidden border border-slate-800">
      <div className="flex flex-wrap items-center justify-between mb-3 px-2 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-200">
            4-Way Junction Live Micro-Simulator (60 FPS)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onTriggerPedestrian?.('North', true)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition"
            title="Request elderly/disabled extended crosswalk"
          >
            <Accessibility className="w-3.5 h-3.5 text-purple-400" />
            <span>Crosswalk (Walk)</span>
          </button>

          <button
            onClick={() => onTriggerBusPriority?.('East', '500D Metro Feeder', 65)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition"
            title="Grant Public Transit Bus Priority (65 commuters)"
          >
            <Bus className="w-3.5 h-3.5 text-amber-400" />
            <span>Bus Priority (TSP)</span>
          </button>

          <button
            onClick={() => onTriggerEmergency?.('North', 'ambulance')}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition"
            title="Dispatch emergency ambulance"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Ambulance</span>
          </button>
        </div>
      </div>

      <div className="relative flex justify-center items-center bg-[#070a12] rounded-xl overflow-hidden border border-slate-800/80">
        <canvas
          ref={canvasRef}
          width={640}
          height={640}
          className="max-w-full h-auto cursor-crosshair"
        />

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] bg-slate-900/90 backdrop-blur px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-400">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span>
            <span>Car</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
            <span>Bus (TSP)</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block"></span>
            <span>Truck</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
            <span>Ambulance</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-400 inline-block"></span>
            <span>Pedestrian</span>
          </div>
        </div>
      </div>
    </div>
  );
}
