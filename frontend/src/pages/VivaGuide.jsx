import React, { useState } from 'react';
import { BookOpen, HelpCircle, Layers, CheckCircle2, Cpu, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function VivaGuide() {
  const [openFaq, setOpenFaq] = useState(0);

  const vivaQuestions = [
    {
      q: "1. What is the fundamental problem with traditional fixed-time traffic light controllers?",
      a: "Traditional traffic signals operate on pre-programmed cyclic timers (e.g., 30s per direction) without awareness of actual vehicle density. This leads to severe road capacity underutilization—empty roads receive green signals while congested corridors experience spillback queues, unnecessary engine idling, fuel wastage, and increased particulate emissions."
    },
    {
      q: "2. Why did you choose YOLO (You Only Look Once) over two-stage detectors like Faster R-CNN?",
      a: "Faster R-CNN employs a Region Proposal Network (RPN) followed by classification, achieving high accuracy but running at only 5–9 FPS on typical hardware. YOLO models detection as a single end-to-end regression problem directly predicting bounding box coordinates and class probabilities in a single forward pass. YOLOv8 processes frames at 45–60+ FPS, enabling true real-time multi-lane surveillance required for instantaneous traffic control."
    },
    {
      q: "3. Why is object detection alone not sufficient, and why is tracking (ByteTrack) mandatory?",
      a: "A standard detector identifies objects frame-by-frame without memory. If a vehicle waits at a red light for 30 frames, a detector alone would count it 30 times. Tracking assigns a persistent unique track ID to each vehicle by associating bounding boxes across time using spatial overlap (IoU) and motion continuity. This prevents duplicate counting and allows speed estimation and directional tripwire crossing counts."
    },
    {
      q: "4. Explain the Mathematical Formulation used for Dynamic Signal Optimization.",
      a: "We compute a multi-criteria priority score for each approach i: P_i = 0.5 * V_i + 0.3 * Q_i + 0.2 * W_i, where V_i is normalized vehicle volume, Q_i is normalized queue length, and W_i is waiting time. Green light time is dynamically allocated as: G_i = G_min + (P_i / sum(P_j)) * (G_max - G_min), bounded within [G_min, G_max] (e.g. 10s to 60s) with 3s yellow and 2s all-red safety clearance."
    },
    {
      q: "5. How does your system prevent starvation of low-traffic roads?",
      a: "If a low-traffic approach (e.g., West) only has 2 cars waiting while East has 40 cars, a pure vehicle-count system would perpetually favor East. Our formula includes the waiting-time weight (W_i). Once an approach waits beyond the starvation threshold (e.g. 80 seconds), its wait score is mathematically boosted, ensuring it receives green in the immediately following cycle."
    },
    {
      q: "6. How does Emergency Vehicle Preemption guarantee road safety?",
      a: "When an emergency responder (ambulance, fire truck) is detected, the controller triggers a protected preemption sequence. It never instantly turns conflicting directions green. Instead, it transitions the currently active green phase through Yellow (2–3s) and All-Red (2s) clearance intervals before illuminating the emergency corridor green, preventing broadside/t-bone collisions."
    },
    {
      q: "7. How do you quantify environmental and fuel savings in this project?",
      a: "Standard transportation engineering models estimate that a passenger car idling at a red signal consumes approximately 0.8 to 0.85 liters of fuel per hour, emitting 2.31 kg of CO2 per liter. By comparing the cumulative delay under our AI-adaptive controller against the fixed 30s baseline, we calculate total vehicle-hours of idling eliminated and convert that directly to fuel liters and kilograms of CO2 avoided."
    },
    {
      q: "8. What happens if a camera disconnects or operates in heavy fog/night conditions?",
      a: "The system incorporates a heartbeat watchdog. If a camera feed experiences frame drop or occlusion, the controller automatically falls back to historical average phase durations for that hour of day, and flags an alert on the administrator dashboard for maintenance inspection."
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 bg-slate-900/60">
        <div className="flex items-center space-x-3 text-cyan-400 mb-2">
          <BookOpen className="w-6 h-6" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest">
            Academic Project Documentation & Viva Defense Guide
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Smart Traffic Management System Using Computer Vision & AI
        </h1>
        <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
          Comprehensive project synopsis, mathematical models, module architecture, and viva examiner Q&A preparation.
        </p>
      </div>

      {/* Abstract Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-2 text-white font-bold text-sm mb-3">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Project Abstract</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans text-justify">
          The Smart Traffic Management System Using Computer Vision and Artificial Intelligence is designed to improve urban traffic management through automated vehicle detection, traffic density estimation, and adaptive traffic signal optimization. The proposed system uses computer vision techniques and deep learning models such as YOLO to detect and classify vehicles from real-time or prerecorded traffic video streams. Vehicle tracking algorithms are used to count vehicles accurately and estimate traffic density across different directions of an intersection. Based on the collected traffic information, an intelligent signal optimization algorithm dynamically determines signal priorities and green-light durations while considering traffic demand, waiting time, and safety constraints. The system also provides a centralized web-based dashboard for monitoring traffic conditions, visualizing congestion, analyzing historical traffic patterns, and managing emergency priority requests.
        </p>
      </div>

      {/* 5-Layer System Architecture */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-2 text-white font-bold text-sm mb-4">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>5-Layer System Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">Layer 1: Input</span>
            <h4 className="text-xs font-bold text-white mb-1">Video Streams</h4>
            <p className="text-[11px] text-slate-400">CCTV RTSP feeds, MP4 video files, synthetic traffic camera streams.</p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block mb-1">Layer 2: Vision</span>
            <h4 className="text-xs font-bold text-white mb-1">Detection & Tracking</h4>
            <p className="text-[11px] text-slate-400">YOLOv8 deep learning model + ByteTrack ID assignment & tripwires.</p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block mb-1">Layer 3: Optimization</span>
            <h4 className="text-xs font-bold text-white mb-1">Priority Engine</h4>
            <p className="text-[11px] text-slate-400">Mathematical formula \(P_i = 0.5V_i + 0.3Q_i + 0.2W_i\) and dynamic \(G_i\).</p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-purple-400 uppercase font-bold block mb-1">Layer 4: Backend</span>
            <h4 className="text-xs font-bold text-white mb-1">Node.js + WebSockets</h4>
            <p className="text-[11px] text-slate-400">Express REST APIs, Socket.IO live state broadcasting, SQLite / PostgreSQL.</p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block mb-1">Layer 5: UI</span>
            <h4 className="text-xs font-bold text-white mb-1">React Dashboard</h4>
            <p className="text-[11px] text-slate-400">60FPS Canvas simulator, CCTV HUDs, analytics charts, emergency controls.</p>
          </div>
        </div>
      </div>

      {/* Top Viva Defense Q&A Accordion */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center space-x-2 text-white font-bold text-base mb-4">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>Top Viva Voce Examination Questions & Answers</span>
        </div>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-xl border border-slate-800/80 bg-slate-950/50 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between text-xs md:text-sm font-semibold text-slate-200 hover:text-white transition"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-2 font-sans bg-slate-900/40">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
