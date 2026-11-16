import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, FileText, Printer, CheckCircle2, Download, Search, Car, Zap } from 'lucide-react';

export default function ViolationsPanel({ violations = [], onGenerateViolation }) {
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  const filtered = violations.filter(v => {
    if (filterType === 'ALL') return true;
    return v.violationType.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 mb-1">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Automated Law Enforcement & Public Safety
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            AI Traffic Violations & Automated e-Challan Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automatic capture of red-light jumping, over-speeding, and stop-line intrusions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onGenerateViolation?.('North', 'Red Light Jump')}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Red Light Jump</span>
          </button>

          <button
            onClick={() => onGenerateViolation?.('East', 'Speed Limit Exceeded (72 km/h)')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
          >
            Simulate Speeding
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-slate-400">Filter Infractions:</span>
        {['ALL', 'Red Light', 'Speed', 'Stop Line'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-lg border font-mono transition ${
              filterType === type 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 font-bold' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Violations Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Challan ID</th>
                <th className="py-3 px-4">Vehicle Plate</th>
                <th className="py-3 px-4">Infraction Type</th>
                <th className="py-3 px-4">Corridor</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4">Penalty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-300">{v.id}</td>
                  <td className="py-3 px-4 font-mono font-bold text-cyan-400">{v.plateNumber}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-white">{v.violationType}</span>
                    <span className="block text-[10px] text-slate-400">{new Date(v.timestamp).toLocaleTimeString()}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">{v.direction} Approach</td>
                  <td className="py-3 px-4 font-mono text-amber-400 font-semibold">{v.speedKmh} km/h</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-400">₹{v.fineAmount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      v.status === 'PAID' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedViolation(v)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 font-semibold text-[11px] transition flex items-center space-x-1 ml-auto"
                    >
                      <FileText className="w-3 h-3" />
                      <span>e-Challan</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official e-Challan Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 bg-slate-950 shadow-2xl relative">
            {/* Ticket Header */}
            <div className="text-center pb-4 border-b border-slate-800">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                GOVERNMENT OF URBAN TRAFFIC POLICE
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                AUTOMATED TRAFFIC INFRACTION NOTICE
              </h3>
              <span className="text-xs text-slate-400 font-mono">e-Challan No: {selectedViolation.id}</span>
            </div>

            {/* Vehicle Details */}
            <div className="my-4 space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Registered Plate:</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{selectedViolation.plateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Infraction Type:</span>
                <span className="font-bold text-rose-400">{selectedViolation.violationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-200">MG Road & Ring Road Junction ({selectedViolation.direction})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recorded Speed:</span>
                <span className="font-mono text-amber-400 font-bold">{selectedViolation.speedKmh} km/h (Limit: 50 km/h)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-300">{new Date(selectedViolation.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800">
                <span className="font-bold text-slate-200">Fine Amount Payable:</span>
                <span className="font-mono font-black text-rose-400 text-base">₹{selectedViolation.fineAmount}</span>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="flex flex-col items-center justify-center my-3 p-2 bg-white rounded-lg">
              <div className="h-8 w-56 flex items-center justify-between">
                {[...Array(38)].map((_, i) => (
                  <div key={i} className={`h-full ${i % 3 === 0 ? 'w-1 bg-black' : i % 5 === 0 ? 'w-1.5 bg-black' : 'w-0.5 bg-black'}`} />
                ))}
              </div>
              <span className="font-mono text-[9px] text-slate-800 mt-1 tracking-widest">
                * {selectedViolation.id}-{selectedViolation.plateNumber} *
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedViolation(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition"
              >
                Close
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
