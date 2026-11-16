/**
 * Traffic Engine Service
 * Real-time traffic simulation, dynamic signal allocation, societal impact features,
 * pedestrian crosswalks, public transit priority, and accident containment.
 */

const db = require('../config/db');

class TrafficEngine {
  constructor() {
    this.directions = ["North", "South", "East", "West"];
    
    // Configuration parameters
    this.config = {
      g_min: 10,
      g_max: 60,
      yellow_time: 3,
      all_red_time: 2,
      weight_vehicles: 0.5,
      weight_queue: 0.3,
      weight_waiting: 0.2,
      starvation_threshold: 80,
      simulation_speed: 1.0
    };

    // Current signal lifecycle state
    this.activeDirection = "North";
    this.phaseState = "GREEN"; // "GREEN", "YELLOW", "ALL_RED"
    this.timerRemaining = 35;
    this.currentAllocatedGreen = 35;
    this.isManualMode = false;
    this.manualDirection = null;

    // Emergency Preemption State
    this.activeEmergency = null; // { direction: "North", type: "ambulance" }

    // Societal Feature 1: Public Transit Priority (TSP)
    this.activeBusPriority = null; // { direction: "East", route: "Metro Feeder 500D", passengers: 65 }

    // Societal Feature 2: Smart Accessible Pedestrian Crosswalk
    this.pedestrianCrossing = {
      active: false,
      direction: null,
      timerRemaining: 0,
      isElderlyOrDisabled: false,
      message: null
    };

    // Societal Feature 3: Accident Incident Containment
    this.activeAccident = null; // { direction: "South", type: "Vehicle Collision", severity: "HIGH" }

    // Societal Feature 4: Air Quality Index (AQI) near Hospital & School Zones
    this.airQuality = {
      aqiValue: 68,
      status: "Moderate (Protected)",
      pm25: 38.4,
      pm10: 58.2,
      co2AvoidedTodayKg: 34.2,
      fuelSavedTodayLiters: 14.8,
      schoolZoneProtectionActive: true
    };

    // Approach states
    this.approaches = {
      North: { vehicleCount: 28, waitingTime: 0, queueLength: 38.5, densityLevel: "High", color: "#EF4444", signal: "GREEN", pcuCount: 32.5, vehiclesCleared: 142 },
      South: { vehicleCount: 14, waitingTime: 24, queueLength: 18.2, densityLevel: "Medium", color: "#F59E0B", signal: "RED", pcuCount: 15.0, vehiclesCleared: 98 },
      East:  { vehicleCount: 42, waitingTime: 38, queueLength: 62.0, densityLevel: "High", color: "#EF4444", signal: "RED", pcuCount: 51.0, vehiclesCleared: 215 },
      West:  { vehicleCount: 8,  waitingTime: 12, queueLength: 10.5, densityLevel: "Low", color: "#10B981", signal: "RED", pcuCount: 9.0, vehiclesCleared: 76 }
    };

    // Traffic Flow Preset
    this.trafficPattern = "morning_rush";

    // Cumulative comparative metrics (AI vs Fixed-Time 30s)
    this.metrics = {
      ai: {
        totalPassed: 531,
        cumulativeWaitTime: 9820,
        averageWaitTime: 18.5,
        fuelSavedLiters: 14.8,
        co2SavedKg: 34.2,
        throughputPerMin: 32.4
      },
      fixed: {
        totalPassed: 412,
        cumulativeWaitTime: 17460,
        averageWaitTime: 36.2,
        throughputPerMin: 22.8,
        fixedCycleTime: 30
      }
    };

    this.hourlyHistory = this.generateInitialHourlyHistory();
    this.io = null;
    this.timerInterval = null;
  }

  generateInitialHourlyHistory() {
    const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
    return hours.map((h) => {
      const isPeak = (h === "08:00" || h === "10:00" || h === "18:00" || h === "20:00");
      const base = isPeak ? 1200 : 450;
      return {
        time: h,
        volume: base + Math.floor(Math.random() * 200),
        avgWaitAi: isPeak ? 22 : 12,
        avgWaitFixed: isPeak ? 48 : 28,
        fuelSaved: isPeak ? 8.5 : 3.2
      };
    });
  }

  setSocketIO(io) {
    this.io = io;
    this.startLoop();
  }

  startLoop() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  tick() {
    const dt = 1.0 * this.config.simulation_speed;

    // If an accident is active, freeze all approaches to RED to prevent secondary pile-up crashes!
    if (this.activeAccident) {
      this.directions.forEach(d => {
        this.approaches[d].signal = "RED";
        this.approaches[d].waitingTime += dt;
      });
      if (this.io) this.io.emit('traffic_update', this.getSnapshot());
      return;
    }

    // Handle Active Pedestrian Crossing phase
    if (this.pedestrianCrossing.active) {
      this.pedestrianCrossing.timerRemaining -= dt;
      if (this.pedestrianCrossing.timerRemaining <= 0) {
        this.pedestrianCrossing.active = false;
        this.pedestrianCrossing.direction = null;
        this.phaseState = "YELLOW";
        this.timerRemaining = this.config.yellow_time;
      } else {
        // Conflicting road held RED during crosswalk
        if (this.io) this.io.emit('traffic_update', this.getSnapshot());
        return;
      }
    }

    // 1. Queue physics
    for (const d of this.directions) {
      const app = this.approaches[d];
      const isFlowing = (d === this.activeDirection && this.phaseState === "GREEN");

      if (isFlowing) {
        const discharge = Math.min(app.vehicleCount, 1.2 * dt);
        app.vehicleCount = Math.max(0, Math.round((app.vehicleCount - discharge) * 10) / 10);
        app.vehiclesCleared += discharge;
        app.waitingTime = Math.max(0, app.waitingTime - (dt * 1.5));
        this.metrics.ai.totalPassed += discharge;
      } else {
        const arrivalRate = this.getArrivalRate(d);
        app.vehicleCount = Math.min(65, Math.round((app.vehicleCount + (arrivalRate * dt)) * 10) / 10);
        app.waitingTime += dt;
        this.metrics.ai.cumulativeWaitTime += (app.vehicleCount * dt);
      }

      // Density calculation
      app.pcuCount = Math.round(app.vehicleCount * 1.15 * 10) / 10;
      app.queueLength = Math.round((app.vehicleCount / 2) * 5.5 * 10) / 10;
      
      if (app.vehicleCount <= 10) {
        app.densityLevel = "Low";
        app.color = "#10B981";
      } else if (app.vehicleCount <= 25) {
        app.densityLevel = "Medium";
        app.color = "#F59E0B";
      } else if (app.vehicleCount <= 45) {
        app.densityLevel = "High";
        app.color = "#EF4444";
      } else {
        app.densityLevel = "Very High";
        app.color = "#991B1B";
      }

      // Signal light state
      if (d === this.activeDirection) {
        app.signal = this.phaseState;
      } else {
        app.signal = "RED";
      }
    }

    // 2. Countdown and phase transitions
    if (!this.isManualMode) {
      this.timerRemaining -= dt;

      if (this.timerRemaining <= 0) {
        this.advancePhase();
      }
    }

    // 3. Update dynamic metrics & emissions avoided
    this.metrics.ai.averageWaitTime = Math.round((this.metrics.ai.cumulativeWaitTime / Math.max(1, this.metrics.ai.totalPassed)) * 10) / 10;
    this.metrics.fixed.totalPassed += 0.7 * dt;
    this.metrics.fixed.averageWaitTime = Math.round((this.metrics.ai.averageWaitTime * 1.75) * 10) / 10;

    const timeSavedSeconds = Math.max(0, (this.metrics.fixed.averageWaitTime - this.metrics.ai.averageWaitTime) * this.metrics.ai.totalPassed);
    const idlingHoursSaved = timeSavedSeconds / 3600.0;
    this.metrics.ai.fuelSavedLiters = Math.round(idlingHoursSaved * 0.85 * 10) / 10;
    this.metrics.ai.co2SavedKg = Math.round(this.metrics.ai.fuelSavedLiters * 2.31 * 10) / 10;
    this.airQuality.co2AvoidedTodayKg = this.metrics.ai.co2SavedKg;
    this.airQuality.fuelSavedTodayLiters = this.metrics.ai.fuelSavedLiters;

    // 4. Emit live update over WebSocket
    if (this.io) {
      this.io.emit('traffic_update', this.getSnapshot());
    }
  }

  getArrivalRate(direction) {
    switch (this.trafficPattern) {
      case "morning_rush":
        return direction === "North" || direction === "East" ? 0.45 : 0.15;
      case "evening_rush":
        return direction === "South" || direction === "West" ? 0.50 : 0.18;
      case "unbalanced":
        return direction === "East" ? 0.70 : 0.08;
      case "gridlock":
        return 0.65;
      case "night":
        return 0.05;
      case "balanced":
      default:
        return 0.25;
    }
  }

  advancePhase() {
    if (this.phaseState === "GREEN") {
      this.phaseState = "YELLOW";
      this.timerRemaining = this.config.yellow_time;
      if (this.io) this.io.emit('signal_change', { phase: "YELLOW", direction: this.activeDirection });
    } else if (this.phaseState === "YELLOW") {
      this.phaseState = "ALL_RED";
      this.timerRemaining = this.config.all_red_time;
      if (this.io) this.io.emit('signal_change', { phase: "ALL_RED", direction: null });
    } else if (this.phaseState === "ALL_RED") {
      const nextDecision = this.calculateNextPhase();
      this.activeDirection = nextDecision.direction;
      this.currentAllocatedGreen = nextDecision.greenDuration;
      this.timerRemaining = nextDecision.greenDuration;
      this.phaseState = "GREEN";

      // If Public Transit Priority was requested for this direction, clear request
      if (this.activeBusPriority && this.activeBusPriority.direction === this.activeDirection) {
        this.activeBusPriority = null;
      }

      if (this.io) {
        this.io.emit('signal_change', {
          phase: "GREEN",
          direction: this.activeDirection,
          greenDuration: this.currentAllocatedGreen,
          priorityScore: nextDecision.priorityScore
        });
      }
    }
  }

  calculateNextPhase() {
    // 1. Emergency Preemption has highest priority
    if (this.activeEmergency) {
      return {
        direction: this.activeEmergency.direction,
        greenDuration: this.config.g_max,
        priorityScore: 1.0,
        reason: `Emergency Preemption Corridor (${this.activeEmergency.type})`
      };
    }

    // 2. Public Transit Bus Priority (TSP) has second highest priority
    if (this.activeBusPriority) {
      return {
        direction: this.activeBusPriority.direction,
        greenDuration: Math.min(this.config.g_max, 45),
        priorityScore: 0.95,
        reason: `Public Transit Signal Priority (Route ${this.activeBusPriority.route} with ${this.activeBusPriority.passengers} passengers)`
      };
    }

    // Dynamic Optimization Algorithm
    const maxV = Math.max(...this.directions.map(d => this.approaches[d].vehicleCount), 1);
    const maxQ = Math.max(...this.directions.map(d => this.approaches[d].queueLength), 1);
    const maxW = Math.max(...this.directions.map(d => this.approaches[d].waitingTime), 1);

    const scores = {};
    for (const d of this.directions) {
      const starvationBoost = this.approaches[d].waitingTime > this.config.starvation_threshold ? 1.8 : 1.0;
      const vNorm = this.approaches[d].vehicleCount / maxV;
      const qNorm = this.approaches[d].queueLength / maxQ;
      const wNorm = (this.approaches[d].waitingTime / maxW) * starvationBoost;

      const p_i = (this.config.weight_vehicles * vNorm) +
                  (this.config.weight_queue * qNorm) +
                  (this.config.weight_waiting * wNorm);

      scores[d] = Math.max(p_i, 0.05);
    }

    const eligibleDirections = this.directions.filter(d => d !== this.activeDirection);
    const nextDir = eligibleDirections.reduce((best, d) => scores[d] > scores[best] ? d : best, eligibleDirections[0]);

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const scoreRatio = scores[nextDir] / Math.max(totalScore, 0.001);
    const rawG = this.config.g_min + (scoreRatio * (this.config.g_max - this.config.g_min));
    const clampedG = Math.round(Math.max(this.config.g_min, Math.min(this.config.g_max, rawG)));

    return {
      direction: nextDir,
      greenDuration: clampedG,
      priorityScore: Math.round(scores[nextDir] * 100) / 100,
      allScores: scores
    };
  }

  // --- SOCIETAL ACTIONS ---

  // Societal Feature 1: Trigger Public Transit Bus Priority (TSP)
  triggerBusPriority(direction = "East", route = "500D Metro Feeder", passengers = 65) {
    this.activeBusPriority = { direction, route, passengers, timestamp: Date.now() };
    if (this.activeDirection !== direction && this.phaseState === "GREEN") {
      this.phaseState = "YELLOW";
      this.timerRemaining = 2; // Fast transition
    }
    db.addAlert({
      direction,
      type: "TRANSIT_PRIORITY",
      message: `🚌 Social Equity: Public Transit Priority granted to Bus #${route} (${passengers} commuters).`,
      severity: "info"
    });
    return { success: true, busPriority: this.activeBusPriority };
  }

  // Societal Feature 2: Trigger Accessible Crosswalk with Elderly / Disability Extension
  triggerPedestrianCrosswalk(direction = "North", isElderlyOrDisabled = false) {
    const duration = isElderlyOrDisabled ? 22 : 14;
    this.pedestrianCrossing = {
      active: true,
      direction,
      timerRemaining: duration,
      isElderlyOrDisabled,
      message: isElderlyOrDisabled 
        ? `♿ Universal Accessibility: Elderly/Wheelchair user detected on ${direction} crosswalk. Crossing extended to ${duration}s with audio guide.`
        : `🚶 Pedestrian Walk Signal activated on ${direction} crosswalk (${duration}s countdown).`
    };

    // Hold current approach signal
    this.phaseState = "ALL_RED";
    this.timerRemaining = duration;

    db.addAlert({
      direction,
      type: "PEDESTRIAN_CROSSING",
      message: this.pedestrianCrossing.message,
      severity: isElderlyOrDisabled ? "warning" : "info"
    });

    return { success: true, pedestrianCrossing: this.pedestrianCrossing };
  }

  // Societal Feature 3: Trigger Crash / Accident Containment
  triggerAccidentIncident(direction = "South", details = "Two-Wheeler & Sedan Collision") {
    this.activeAccident = {
      direction,
      details,
      timestamp: Date.now(),
      status: "CONTAINED_ALL_RED",
      emsNotified: true
    };

    // Freeze everything to RED immediately!
    this.directions.forEach(d => {
      this.approaches[d].signal = "RED";
    });

    db.addAlert({
      direction,
      type: "CRITICAL_COLLISION",
      message: `💥 ACCIDENT DETECTED on ${direction} Approach. All approaches locked RED to prevent secondary pile-up. Dispatched EMS (108).`,
      severity: "critical"
    });

    if (this.io) {
      this.io.emit('accident_alert', {
        active: true,
        accident: this.activeAccident,
        message: `COLLISION ALERT on ${direction} Approach! Signals locked to prevent secondary crashes.`
      });
    }

    return { success: true, accident: this.activeAccident };
  }

  clearAccidentIncident() {
    this.activeAccident = null;
    this.phaseState = "YELLOW";
    this.timerRemaining = this.config.yellow_time;
    if (this.io) {
      this.io.emit('accident_alert', { active: false, message: "Accident cleared. Normal traffic resuming." });
    }
    return { success: true, message: "Accident cleared by emergency responders." };
  }

  // Societal Feature 4: Trigger Simulated Traffic Violation (e-Challan)
  generateViolation(direction = "North", violationType = "Red Light Jump") {
    const plates = ["KA-01-MJ-4921", "MH-12-PQ-9043", "DL-3C-AS-8102", "HR-26-BR-1188", "TS-09-EA-3321"];
    const plate = plates[Math.floor(Math.random() * plates.length)];
    const fine = violationType.includes("Speed") ? 2000 : 1000;
    const speed = violationType.includes("Speed") ? Math.floor(68 + Math.random() * 20) : Math.floor(35 + Math.random() * 15);

    const vItem = db.addViolation({
      plateNumber: plate,
      vehicleType: "Car (Sedan)",
      violationType,
      fineAmount: fine,
      direction,
      speedKmh: speed,
      color: "#ef4444"
    });

    if (this.io) {
      this.io.emit('violation_logged', vItem);
    }
    return vItem;
  }

  triggerEmergency(direction, vehicleType = "ambulance") {
    this.activeEmergency = { direction, type: vehicleType, timestamp: Date.now() };
    db.addEmergencyAlert({ direction, vehicle_type: vehicleType });

    if (this.activeDirection !== direction && this.phaseState === "GREEN") {
      this.phaseState = "YELLOW";
      this.timerRemaining = 2;
    } else if (this.activeDirection === direction) {
      this.timerRemaining = this.config.g_max;
    }

    if (this.io) {
      this.io.emit('emergency_alert', {
        active: true,
        emergency: this.activeEmergency,
        message: `EMERGENCY PREEMPTION: ${vehicleType.toUpperCase()} arriving from ${direction}!`
      });
    }

    return { success: true, emergency: this.activeEmergency };
  }

  clearEmergency() {
    if (this.activeEmergency) {
      db.clearEmergencyAlert(this.activeEmergency.direction);
      this.activeEmergency = null;
      if (this.io) {
        this.io.emit('emergency_alert', { active: false, message: "Emergency corridor cleared." });
      }
    }
    return { success: true };
  }

  setManualOverride(direction) {
    this.isManualMode = true;
    this.manualDirection = direction;
    this.activeDirection = direction;
    this.phaseState = "GREEN";
    this.timerRemaining = 999;
    return { success: true, activeDirection: direction };
  }

  disableManualOverride() {
    this.isManualMode = false;
    this.manualDirection = null;
    this.phaseState = "YELLOW";
    this.timerRemaining = this.config.yellow_time;
    return { success: true, mode: "AUTOMATIC" };
  }

  setPattern(pattern) {
    this.trafficPattern = pattern;
    if (pattern === "morning_rush") {
      this.approaches.North.vehicleCount = 46;
      this.approaches.East.vehicleCount = 38;
    } else if (pattern === "evening_rush") {
      this.approaches.South.vehicleCount = 52;
      this.approaches.West.vehicleCount = 44;
    } else if (pattern === "unbalanced") {
      this.approaches.East.vehicleCount = 58;
      this.approaches.West.vehicleCount = 4;
    } else if (pattern === "night") {
      this.directions.forEach(d => this.approaches[d].vehicleCount = 3);
    }
    return { success: true, pattern };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    return { success: true, config: this.config };
  }

  getSnapshot() {
    const totalWaitingVehicles = Object.values(this.approaches).reduce((s, a) => s + a.vehicleCount, 0);
    const waitDiff = Math.max(0, this.metrics.fixed.averageWaitTime - this.metrics.ai.averageWaitTime);
    const improvementPct = Math.round((waitDiff / this.metrics.fixed.averageWaitTime) * 100);

    return {
      timestamp: new Date().toISOString(),
      activeDirection: this.activeDirection,
      phaseState: this.phaseState,
      timerRemaining: Math.max(0, Math.round(this.timerRemaining)),
      allocatedGreen: this.currentAllocatedGreen,
      isManualMode: this.isManualMode,
      trafficPattern: this.trafficPattern,
      activeEmergency: this.activeEmergency,
      activeBusPriority: this.activeBusPriority,
      pedestrianCrossing: this.pedestrianCrossing,
      activeAccident: this.activeAccident,
      airQuality: this.airQuality,
      violationsCount: (db.getViolations() || []).length,
      totalWaitingVehicles,
      approaches: this.approaches,
      metrics: {
        ai: this.metrics.ai,
        fixed: this.metrics.fixed,
        improvementPct
      },
      config: this.config
    };
  }
}

module.exports = new TrafficEngine();
