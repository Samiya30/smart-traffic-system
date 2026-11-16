import React from 'react';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, BarChart2, PieChart as PieIcon, TrendingUp } from 'lucide-react';

export default function TrafficCharts({ trafficData }) {
  const approaches = trafficData?.approaches || {};

  const hourlyData = [
    { time: '00:00', volume: 320, waitTime: 12 },
    { time: '03:00', volume: 180, waitTime: 8 },
    { time: '06:00', volume: 620, waitTime: 16 },
    { time: '08:00', volume: 1480, waitTime: 24 },
    { time: '10:00', volume: 1120, waitTime: 19 },
    { time: '12:00', volume: 950, waitTime: 17 },
    { time: '14:00', volume: 880, waitTime: 15 },
    { time: '16:00', volume: 1240, waitTime: 21 },
    { time: '18:00', volume: 1560, waitTime: 26 },
    { time: '20:00', volume: 1040, waitTime: 18 },
    { time: '22:00', volume: 540, waitTime: 14 }
  ];

  const vehicleDistribution = [
    { name: 'Cars / Sedans', value: 58, color: '#3b82f6' },
    { name: 'Motorcycles', value: 22, color: '#06b6d4' },
    { name: 'Transit Buses', value: 12, color: '#f59e0b' },
    { name: 'Heavy Trucks', value: 6, color: '#8b5cf6' },
    { name: 'Bicycles', value: 2, color: '#10b981' }
  ];

  const directionData = [
    { direction: 'North', vehicles: approaches.North?.vehicleCount || 28, queue: approaches.North?.queueLength || 38 },
    { direction: 'South', vehicles: approaches.South?.vehicleCount || 14, queue: approaches.South?.queueLength || 18 },
    { direction: 'East',  vehicles: approaches.East?.vehicleCount || 42, queue: approaches.East?.queueLength || 62 },
    { direction: 'West',  vehicles: approaches.West?.vehicleCount || 8,  queue: approaches.West?.queueLength || 10 }
  ];

  const exportCSV = () => {
    let csv = "Time,TrafficVolume,AvgWaitSeconds\n";
    hourlyData.forEach(row => {
      csv += `${row.time},${row.volume},${row.waitTime}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `traffic_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">
            Traffic Intelligence & Historical Patterns
          </h2>
          <p className="text-xs text-slate-400">
            Real-time sensor aggregation across MG Road junction corridors.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Analytics (CSV)</span>
        </button>
      </div>

      {/* Hourly Flow Chart */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200">24-Hour Traffic Volume & Average Delay</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Peak Rush: 08:00 & 18:00</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }}
                itemStyle={{ fontSize: 12 }}
              />
              <Area type="monotone" dataKey="volume" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#volGrad)" name="Vehicle Count" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid of Distribution and Direction Congestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart: Vehicle Categories */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center space-x-2 mb-3">
            <PieIcon className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">Vehicle Category Composition</h3>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {vehicleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }}
                  formatter={(value) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-[11px] text-slate-400">
            {vehicleDistribution.map(item => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Directional Queue Comparison */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">Corridor Queue Lengths (Meters)</h3>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={directionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="direction" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }}
                  itemStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="queue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Queue Length (m)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
