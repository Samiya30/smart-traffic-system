import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MetricCards from './components/MetricCards';
import ApproachCard from './components/ApproachCard';
import IntersectionCanvas from './components/IntersectionCanvas';
import CameraFeeds from './components/CameraFeeds';
import PerformanceComparison from './components/PerformanceComparison';
import EmergencyPanel from './components/EmergencyPanel';
import TrafficCharts from './components/TrafficCharts';
import SettingsModal from './components/SettingsModal';
import SocietalImpactPanel from './components/SocietalImpactPanel';
import ViolationsPanel from './components/ViolationsPanel';
import ReportModal from './components/ReportModal';
import VivaGuide from './pages/VivaGuide';
import { api, socket } from './services/api';
import { 
  Tv, 
  Camera, 
  Award, 
  ShieldAlert, 
  BarChart3, 
  BookOpen, 
  LayoutDashboard,
  HeartHandshake
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [trafficData, setTrafficData] = useState(null);
  const [violations, setViolations] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const speakAlert = (text) => {
    if (isVoiceMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore
    }
  };

  const showToast = (msg, speak = false) => {
    setToastMessage(msg);
    if (speak) speakAlert(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Socket.IO listener & Initial Fetch
  useEffect(() => {
    api.getLiveTraffic()
      .then(data => setTrafficData(data))
      .catch(err => console.warn("Connecting to live simulation stream...", err));

    api.getViolations()
      .then(data => setViolations(data))
      .catch(err => console.warn("Loading violations...", err));

    socket.on('traffic_update', (snapshot) => {
      setTrafficData(snapshot);
    });

    socket.on('emergency_alert', (data) => {
      if (data.active) {
        showToast(data.message, true);
      }
    });

    socket.on('accident_alert', (data) => {
      if (data.active) {
        showToast(data.message, true);
      }
    });

    socket.on('violation_logged', (vItem) => {
      setViolations(prev => [vItem, ...prev]);
      showToast(`e-Challan Issued: ${vItem.plateNumber} for ${vItem.violationType} (₹${vItem.fineAmount})`);
    });

    return () => {
      socket.off('traffic_update');
      socket.off('emergency_alert');
      socket.off('accident_alert');
      socket.off('violation_logged');
    };
  }, [isVoiceMuted]);

  // Handlers for Societal & Emergency Actions
  const handleTriggerEmergency = async (direction, type = 'ambulance') => {
    try {
      await api.triggerEmergency(direction, type);
      showToast(`Priority Corridor Dispatched for ${type.toUpperCase()} on ${direction}`, true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearEmergency = async () => {
    try {
      await api.clearEmergency();
      showToast(`Emergency Corridor Cleared. Resuming dynamic cycles.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerPedestrian = async (direction, isElderly = false) => {
    try {
      const res = await api.triggerPedestrian(direction, isElderly);
      showToast(isElderly 
        ? `♿ Elderly Crosswalk Extended on ${direction} (24s Countdown)` 
        : `🚶 Pedestrian Walk Activated on ${direction} (14s Countdown)`, true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerBusPriority = async (direction, route, passengers) => {
    try {
      await api.triggerBusPriority(direction, route, passengers);
      showToast(`🚌 Transit Signal Priority: Granted to Bus #${route} on ${direction} (65 passengers)`, true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerAccident = async (direction, details) => {
    try {
      await api.triggerAccident(direction, details);
      showToast(`💥 CRITICAL: Collision on ${direction} Approach. Signals locked RED. Dispatched EMS (108).`, true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAccident = async () => {
    try {
      await api.clearAccident();
      showToast(`Accident Cleared by Responders. Signals resuming normal cycle.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateViolation = async (direction, type) => {
    try {
      const item = await api.generateViolation(direction, type);
      setViolations(prev => [item, ...prev]);
      showToast(`e-Challan #${item.id} logged for ${item.plateNumber} (₹${item.fineAmount})`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualOverride = async (direction) => {
    try {
      await api.setManualOverride(direction);
      showToast(`Manual Override: Forced GREEN on ${direction} approach`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = async (newConfig) => {
    try {
      await api.updateSignalConfig(newConfig);
      showToast(`Signal optimization parameters successfully updated.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetPattern = async (pattern) => {
    try {
      await api.setTrafficPattern(pattern);
      showToast(`Traffic scenario shifted to: ${pattern.replace('_', ' ').toUpperCase()}`);
    } catch (e) {
      console.error(e);
    }
  };

  const approaches = trafficData?.approaches || {};
  const activeDir = trafficData?.activeDirection || 'North';
  const activeEmergency = trafficData?.activeEmergency;
  const activeAccident = trafficData?.activeAccident;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar 
        onOpenSettings={() => setIsSettingsOpen(true)}
        trafficData={trafficData}
        onOpenReport={() => setIsReportOpen(true)}
        isVoiceMuted={isVoiceMuted}
        onToggleVoice={() => setIsVoiceMuted(!isVoiceMuted)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Desktop Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {/* Notification Toast */}
          {toastMessage && (
            <div className="fixed top-16 right-6 z-50 bg-cyan-950/90 text-cyan-200 border border-cyan-500/50 px-4 py-2.5 rounded-xl shadow-xl backdrop-blur font-mono text-xs animate-bounce">
              {toastMessage}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
              <MetricCards trafficData={trafficData} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 4-Way Simulator Canvas */}
                <div className="lg:col-span-7">
                  <IntersectionCanvas 
                    trafficData={trafficData}
                    onTriggerEmergency={handleTriggerEmergency}
                    onManualOverride={handleManualOverride}
                    onTriggerPedestrian={handleTriggerPedestrian}
                    onTriggerBusPriority={handleTriggerBusPriority}
                    onTriggerAccident={handleTriggerAccident}
                  />
                </div>

                {/* 4 Approach Cards */}
                <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['North', 'South', 'East', 'West'].map(dir => (
                    <ApproachCard
                      key={dir}
                      direction={dir}
                      data={approaches[dir]}
                      isActive={activeDir === dir}
                      isEmergency={activeEmergency?.direction === dir || activeAccident?.direction === dir}
                      onManualOverride={handleManualOverride}
                      onTriggerEmergency={handleTriggerEmergency}
                    />
                  ))}
                </div>
              </div>

              {/* Performance Comparison */}
              <PerformanceComparison trafficData={trafficData} />
            </div>
          )}

          {/* TAB 2: 4-WAY SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <IntersectionCanvas 
                trafficData={trafficData}
                onTriggerEmergency={handleTriggerEmergency}
                onManualOverride={handleManualOverride}
                onTriggerPedestrian={handleTriggerPedestrian}
                onTriggerBusPriority={handleTriggerBusPriority}
                onTriggerAccident={handleTriggerAccident}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['North', 'South', 'East', 'West'].map(dir => (
                  <ApproachCard
                    key={dir}
                    direction={dir}
                    data={approaches[dir]}
                    isActive={activeDir === dir}
                    isEmergency={activeEmergency?.direction === dir}
                    onManualOverride={handleManualOverride}
                    onTriggerEmergency={handleTriggerEmergency}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SOCIETAL & GREEN IMPACT */}
          {activeTab === 'societal' && (
            <div className="max-w-6xl mx-auto">
              <SocietalImpactPanel
                trafficData={trafficData}
                onTriggerPedestrian={handleTriggerPedestrian}
                onTriggerBusPriority={handleTriggerBusPriority}
                onTriggerAccident={handleTriggerAccident}
                onClearAccident={handleClearAccident}
                onTriggerEmergency={handleTriggerEmergency}
              />
            </div>
          )}

          {/* TAB 4: VIOLATIONS & E-CHALLAN */}
          {activeTab === 'violations' && (
            <div className="max-w-6xl mx-auto">
              <ViolationsPanel
                violations={violations}
                onGenerateViolation={handleGenerateViolation}
              />
            </div>
          )}

          {/* TAB 5: CCTV AI FEEDS */}
          {activeTab === 'cameras' && (
            <div className="max-w-7xl mx-auto">
              <CameraFeeds trafficData={trafficData} />
            </div>
          )}

          {/* TAB 6: BENCHMARK */}
          {activeTab === 'benchmark' && (
            <div className="max-w-6xl mx-auto">
              <PerformanceComparison trafficData={trafficData} />
            </div>
          )}

          {/* TAB 7: EMERGENCY CORRIDOR */}
          {activeTab === 'emergency' && (
            <div className="max-w-5xl mx-auto">
              <EmergencyPanel 
                trafficData={trafficData}
                onTriggerEmergency={handleTriggerEmergency}
                onClearEmergency={handleClearEmergency}
              />
            </div>
          )}

          {/* TAB 8: TRAFFIC ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="max-w-6xl mx-auto">
              <TrafficCharts trafficData={trafficData} />
            </div>
          )}

          {/* TAB 9: VIVA DEFENSE GUIDE */}
          {activeTab === 'viva' && (
            <VivaGuide />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-800 flex justify-around py-2 px-1 z-40 bg-slate-950/90 backdrop-blur">
        {[
          { id: 'overview', label: 'Home', icon: LayoutDashboard },
          { id: 'societal', label: 'Social', icon: HeartHandshake },
          { id: 'violations', label: 'Police', icon: ShieldAlert },
          { id: 'benchmark', label: 'AI vs Fixed', icon: Award },
          { id: 'viva', label: 'Viva', icon: BookOpen }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-1 text-[10px] ${
                isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentConfig={trafficData?.config}
        onSaveConfig={handleSaveConfig}
        trafficPattern={trafficData?.trafficPattern}
        onSetPattern={handleSetPattern}
      />

      {/* Official Printable Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        trafficData={trafficData}
      />
    </div>
  );
}
