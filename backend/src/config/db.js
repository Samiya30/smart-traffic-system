/**
 * Database configuration and mock-persistent datastore.
 * Implements relational schema with violations, AQI metrics, and societal impact data.
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', '..', 'data', 'traffic_db.json');

// Initial seed data
const defaultState = {
  users: [
    {
      id: "usr-01",
      name: "Samiya Sharma (Chief Traffic Controller)",
      email: "admin@smarttraffic.ai",
      password_hash: "admin123",
      role: "Super Admin",
      created_at: new Date().toISOString()
    },
    {
      id: "usr-02",
      name: "Traffic Dispatch Operator",
      email: "operator@smarttraffic.ai",
      password_hash: "operator123",
      role: "Traffic Operator",
      created_at: new Date().toISOString()
    }
  ],
  intersections: [
    {
      id: "int-01",
      name: "MG Road & Ring Road Junction",
      location: "Central Business District, Tech Corridor",
      status: "ONLINE",
      latitude: 12.9716,
      longitude: 77.5946,
      created_at: new Date().toISOString()
    },
    {
      id: "int-02",
      name: "Silicon Valley Crossing",
      location: "Sector 4, Innovation Boulevard (350m down corridor)",
      status: "ONLINE",
      latitude: 12.9352,
      longitude: 77.6245,
      created_at: new Date().toISOString()
    },
    {
      id: "int-03",
      name: "Airport Expressway Terminal",
      location: "North Transit Highway (800m down corridor)",
      status: "ONLINE",
      latitude: 13.1986,
      longitude: 77.7066,
      created_at: new Date().toISOString()
    }
  ],
  cameras: [
    { id: "cam-n", intersection_id: "int-01", direction: "North", source_url: "rtsp://live.traffic.ai/int-01/north", status: "ACTIVE" },
    { id: "cam-s", intersection_id: "int-01", direction: "South", source_url: "rtsp://live.traffic.ai/int-01/south", status: "ACTIVE" },
    { id: "cam-e", intersection_id: "int-01", direction: "East", source_url: "rtsp://live.traffic.ai/int-01/east", status: "ACTIVE" },
    { id: "cam-w", intersection_id: "int-01", direction: "West", source_url: "rtsp://live.traffic.ai/int-01/west", status: "ACTIVE" }
  ],
  violations: [
    {
      id: "CHAL-8921",
      plateNumber: "KA-01-MJ-4921",
      vehicleType: "Car (Sedan)",
      violationType: "Red Light Jump",
      fineAmount: 1000,
      direction: "North",
      speedKmh: 48,
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      status: "ISSUED",
      color: "#3b82f6"
    },
    {
      id: "CHAL-8922",
      plateNumber: "DL-3C-AS-8102",
      vehicleType: "Motorcycle",
      violationType: "Speed Limit Exceeded (74 km/h in 50 zone)",
      fineAmount: 2000,
      direction: "East",
      speedKmh: 74,
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      status: "ISSUED",
      color: "#ec4899"
    },
    {
      id: "CHAL-8923",
      plateNumber: "MH-12-PQ-9043",
      vehicleType: "Heavy Freight Truck",
      violationType: "Stop Line Intrusion & Pedestrian Blockade",
      fineAmount: 500,
      direction: "South",
      speedKmh: 35,
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      status: "PAID",
      color: "#8b5cf6"
    }
  ],
  alerts: [
    {
      id: "alt-01",
      intersection_id: "int-01",
      direction: "East",
      type: "HIGH_CONGESTION",
      message: "Heavy queue exceeding 62 meters detected on East approach",
      severity: "warning",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
    }
  ],
  emergency_alerts: []
};

class Database {
  constructor() {
    this.data = { ...defaultState };
    this.init();
  }

  init() {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        if (!this.data.violations) this.data.violations = defaultState.violations;
      } else {
        this.save();
      }
    } catch (e) {
      console.warn("Using in-memory database store:", e.message);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      // ignore
    }
  }

  getIntersections() {
    return this.data.intersections;
  }

  getViolations() {
    return this.data.violations || [];
  }

  addViolation(violation) {
    if (!this.data.violations) this.data.violations = [];
    const item = {
      id: `CHAL-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      status: "ISSUED",
      ...violation
    };
    this.data.violations.unshift(item);
    if (this.data.violations.length > 50) this.data.violations.pop();
    this.save();
    return item;
  }

  getAlerts() {
    return this.data.alerts;
  }

  addAlert(alert) {
    this.data.alerts.unshift({
      id: `alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...alert
    });
    if (this.data.alerts.length > 50) this.data.alerts.pop();
    this.save();
  }

  addEmergencyAlert(alert) {
    const item = {
      id: `emg-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: "ACTIVE",
      ...alert
    };
    this.data.emergency_alerts.unshift(item);
    this.save();
    return item;
  }

  clearEmergencyAlert(direction) {
    this.data.emergency_alerts = this.data.emergency_alerts.map(a => 
      (a.direction === direction && a.status === "ACTIVE") ? { ...a, status: "RESOLVED", cleared_at: new Date().toISOString() } : a
    );
    this.save();
  }

  authenticate(email, password) {
    return this.data.users.find(u => u.email === email && u.password_hash === password);
  }
}

module.exports = new Database();
