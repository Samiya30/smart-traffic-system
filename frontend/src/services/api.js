/**
 * API and WebSocket client service for frontend
 */

import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

export const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

export const api = {
  // Traffic
  getLiveTraffic: async () => {
    const res = await fetch(`${BACKEND_URL}/api/traffic/live`);
    return res.json();
  },
  getTrafficStats: async () => {
    const res = await fetch(`${BACKEND_URL}/api/traffic/stats`);
    return res.json();
  },
  setTrafficPattern: async (pattern) => {
    const res = await fetch(`${BACKEND_URL}/api/traffic/pattern`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pattern })
    });
    return res.json();
  },

  // Signals
  getSignalStatus: async () => {
    const res = await fetch(`${BACKEND_URL}/api/signals/status`);
    return res.json();
  },
  updateSignalConfig: async (config) => {
    const res = await fetch(`${BACKEND_URL}/api/signals/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return res.json();
  },
  setManualOverride: async (direction, disable = false) => {
    const res = await fetch(`${BACKEND_URL}/api/signals/manual-override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, disable })
    });
    return res.json();
  },

  // Emergency
  triggerEmergency: async (direction, vehicleType = 'ambulance') => {
    const res = await fetch(`${BACKEND_URL}/api/alerts/emergency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, vehicleType })
    });
    return res.json();
  },
  clearEmergency: async () => {
    const res = await fetch(`${BACKEND_URL}/api/alerts/emergency/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  // Societal: Bus Priority (Transit Signal Priority)
  triggerBusPriority: async (direction = 'East', route = '500D Metro Feeder', passengers = 65) => {
    const res = await fetch(`${BACKEND_URL}/api/traffic/bus-priority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, route, passengers })
    });
    return res.json();
  },

  // Societal: Accessible Pedestrian Crosswalk
  triggerPedestrian: async (direction = 'North', isElderlyOrDisabled = false) => {
    const res = await fetch(`${BACKEND_URL}/api/traffic/pedestrian`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, isElderlyOrDisabled })
    });
    return res.json();
  },

  // Societal: Accident Incident Containment
  triggerAccident: async (direction = 'South', details = 'Two-Wheeler & Sedan Collision') => {
    const res = await fetch(`${BACKEND_URL}/api/traffic/accident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, details })
    });
    return res.json();
  },
  clearAccident: async () => {
    const res = await fetch(`${BACKEND_URL}/api/traffic/accident/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  // Violations & e-Challan
  getViolations: async () => {
    const res = await fetch(`${BACKEND_URL}/api/traffic/violations`);
    return res.json();
  },
  generateViolation: async (direction = 'North', violationType = 'Red Light Jump') => {
    const res = await fetch(`${BACKEND_URL}/api/traffic/violations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction, violationType })
    });
    return res.json();
  },

  // Intersections
  getIntersections: async () => {
    const res = await fetch(`${BACKEND_URL}/api/intersections`);
    return res.json();
  },

  // Alerts
  getAlerts: async () => {
    const res = await fetch(`${BACKEND_URL}/api/alerts`);
    return res.json();
  }
};
