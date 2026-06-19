import { useState, useEffect, useRef } from "react";
import {
  Activity, AlertTriangle, ArrowDown, ArrowRight, ArrowUp, BarChart2,
  Bell, Bot, Calendar, CheckCircle, ChevronRight, Cpu, Database,
  Download, FileText, Gauge, Layers, Play, RefreshCw, Send, Settings,
  Shield, Thermometer, TrendingDown, TrendingUp, Wrench, X, Zap, Wind,
  Package, Clock, AlertCircle, Target, Crosshair, TriangleAlert
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
  ComposedChart
} from "recharts";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#F8FAFC", sidebar: "#0F172A", card: "#FFFFFF",
  primary: "#2563EB", success: "#10B981", warning: "#F59E0B", critical: "#EF4444",
  border: "#E2E8F0", muted: "#64748B", ink: "#0F172A", soft: "#F1F5F9",
};

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const AIRCRAFT = {
  id: "ASX-014", model: "A320-14", reg: "F-WXWB",
  health: 71, status: "warning", lastUpdated: "2025-07-18 09:42 UTC",
  fleet: 24, fleetRank: 7,
};

// Failure probability over time (last 30 days trending forward)
const genProb = (base, drift, n = 30) =>
  Array.from({ length: n }, (_, i) => ({
    day: `D-${n - i}`,
    engine: +(Math.min(99, base.engine + drift.engine * i + (Math.random() - 0.5) * 4)).toFixed(1),
    hydraulic: +(Math.min(99, base.hydraulic + drift.hydraulic * i + (Math.random() - 0.5) * 5)).toFixed(1),
    electrical: +(Math.min(99, base.electrical + drift.electrical * i + (Math.random() - 0.5) * 2)).toFixed(1),
    gear: +(Math.min(99, base.gear + drift.gear * i + (Math.random() - 0.5) * 3)).toFixed(1),
  }));

const PROB_DATA = genProb(
  { engine: 8, hydraulic: 22, electrical: 4, gear: 6 },
  { engine: 0.6, hydraulic: 1.2, electrical: 0.15, gear: 0.35 }
);

const HEALTH_DEGRADATION = Array.from({ length: 30 }, (_, i) => ({
  day: `D+${i + 1}`,
  nominal: +(90 - i * 0.3).toFixed(1),
  predicted: +(85 - i * 1.1 + (Math.random() - 0.5) * 2).toFixed(1),
  threshold: 60,
}));

const VIBRATION_DATA = Array.from({ length: 48 }, (_, i) => ({
  h: `${i}h`,
  engine: +(0.38 + Math.sin(i * 0.4) * 0.12 + Math.random() * 0.15 + i * 0.006).toFixed(3),
  hydraulic: +(0.19 + Math.random() * 0.08 + i * 0.003).toFixed(3),
  normal: 0.5,
}));

const RISK_CARDS = [
  { id: "engine", label: "Engine (Left)", risk: 23, prev: 18, trend: "up", icon: <Zap size={18} />, failDate: "Nov 14, 2025", rul: 312, color: C.warning },
  { id: "hydraulic", label: "Hydraulic System", risk: 61, prev: 49, trend: "up", icon: <Gauge size={18} />, failDate: "Sep 30, 2025", rul: 88, color: C.critical },
  { id: "electrical", label: "Electrical System", risk: 9, prev: 11, trend: "down", icon: <Zap size={18} />, failDate: "Jun 10, 2026", rul: 1240, color: C.success },
  { id: "gear", label: "Landing Gear", risk: 18, prev: 15, trend: "up", icon: <Layers size={18} />, failDate: "Dec 22, 2025", rul: 510, color: C.warning },
];

const RUL_DATA = [
  { label: "Engine Left", rul: 312, max: 1500, status: "warning", unit: "FH" },
  { label: "Hydraulic System", rul: 88, max: 1500, status: "critical", unit: "FH" },
  { label: "Electrical System", rul: 1240, max: 2000, status: "healthy", unit: "FH" },
  { label: "Landing Gear", rul: 510, max: 1500, status: "warning", unit: "FH" },
  { label: "Engine Right", rul: 910, max: 1500, status: "healthy", unit: "FH" },
  { label: "Avionics Bay", rul: 5500, max: 6000, status: "healthy", unit: "FH" },
];

const ROOT_CAUSES = [
  { cause: "Pressure Instability", pct: 35, color: "#EF4444" },
  { cause: "Seal Degradation", pct: 28, color: "#F59E0B" },
  { cause: "Temperature Variation", pct: 22, color: "#F97316" },
  { cause: "Historical Pattern Match", pct: 15, color: "#8B5CF6" },
];

const SIMILAR_CASES = [
  {
    id: "A320-09", failure: "Hydraulic Seal Failure", outcome: "AOG — 14 hrs",
    action: "Full pump replacement + seal kit. Aircraft returned to service after 14-hr AOG.", date: "Mar 2025",
    severity: "critical", similarity: 94,
  },
  {
    id: "B737-12", failure: "Hydraulic Pressure Loss", outcome: "Precautionary Landing",
    action: "Emergency fluid top-off + leak isolation. Permanent fix at next base stop.", date: "Jan 2025",
    severity: "warning", similarity: 81,
  },
  {
    id: "A320-07", failure: "Pump Cavitation", outcome: "On-Ground Repair",
    action: "Hydraulic pump replaced at FH 18,342. Fluid flushed and system tested.", date: "Nov 2024",
    severity: "warning", similarity: 76,
  },
  {
    id: "A320-02", failure: "Burst Hydraulic Line", outcome: "Major Incident",
    action: "Line replaced, full system bleed. 32-hr AOG. Safety report filed with EASA.", date: "Sep 2024",
    severity: "critical", similarity: 71,
  },
];

const AI_RECS = [
  {
    priority: 1, component: "Hydraulic System",
    action: "Replace hydraulic pump and full seal kit within 48 flight hours",
    reason: "Failure probability (61%) exceeds EASA safety threshold of 40%. Seal degradation confirmed by pressure delta analysis.",
    benefits: [
      { label: "Reduce unplanned downtime", value: "42%" },
      { label: "Reduce repair cost vs AOG", value: "18%" },
      { label: "Improve fleet safety score", value: "+0.8 pts" },
    ],
    window: "Before Sep 22, 2025", urgency: "critical",
  },
  {
    priority: 2, component: "Engine Left",
    action: "Borescope inspection at next A-check. Monitor EGT trend daily.",
    reason: "High-cycle fatigue signature detected in turbine blade vibration spectrum. Risk trending upward over 12 days.",
    benefits: [
      { label: "Prevent blade FOD event", value: "High" },
      { label: "Extend engine life", value: "+280 FH" },
      { label: "Avoid unscheduled removal", value: "Likely" },
    ],
    window: "Next transit stop", urgency: "warning",
  },
  {
    priority: 3, component: "Landing Gear",
    action: "Actuator backlash measurement and lubrication check at next 48-hr transit.",
    reason: "Actuator wear pattern detected at 510 FH remaining. Consistent with fleet average failure onset.",
    benefits: [
      { label: "Prevent hard landing risk", value: "Medium" },
      { label: "Defer overhaul", value: "+200 FH" },
      { label: "Cost avoidance", value: "~$12K" },
    ],
    window: "Within 7 days", urgency: "warning",
  },
];

const FLEET_ALERTS = [
  { aircraft: "ASX-014", msg: "Hydraulic failure imminent", level: "critical" },
  { aircraft: "ASX-007", msg: "Engine vibration anomaly", level: "warning" },
  { aircraft: "ASX-019", msg: "Gear actuator wear", level: "warning" },
  { aircraft: "ASX-003", msg: "Avionics anomaly resolved", level: "healthy" },
];

const FLEET_RISK = [
  { label: "ASX-014", score: 61, color: C.critical },
  { label: "ASX-007", score: 38, color: C.warning },
  { label: "ASX-019", score: 29, color: C.warning },
  { label: "ASX-011", score: 18, color: C.success },
  { label: "ASX-003", score: 12, color: C.success },
];

// ─── Utility components ───────────────────────────────────────────────────────

const Badge = ({ status, label, small }) => {
  const map = {
    healthy: [C.success, label || "Healthy"],
    warning: [C.warning, label || "Warning"],
    critical: [C.critical, label || "Critical"],
  };
  const [color, text] = map[status] || [C.muted, label || status];
  return (
    <span style={{
      background: color + "18", color, border: `1px solid ${color}33`,
      borderRadius: 6, padding: small ? "1px 8px" : "3px 11px",
      fontSize: small ? 10 : 11, fontWeight: 700, letterSpacing: "0.05em",
      whiteSpace: "nowrap",
    }}>{text}</span>
  );
};

const SectionTitle = ({ icon, title, sub, style: s }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, ...s }}>
    <div style={{ color: C.primary }}>{icon}</div>
    <div>
      <div style={{ fontWeight: 800, color: C.ink, fontSize: 16, lineHeight: 1 }}>{title}</div>
      {sub && <div style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>{sub}</div>}
    </div>
  </div>
);

const RiskBar = ({ value, color, animate }) => (
  <div style={{ background: C.soft, borderRadius: 99, height: 8, overflow: "hidden" }}>
    <div style={{
      height: "100%", borderRadius: 99, background: color,
      width: animate ? `${value}%` : "0%",
      transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
    }} />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0F172A", border: "none", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
      <div style={{ color: "#94A3B8", marginBottom: 6, fontSize: 11 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          <span style={{ color: "#CBD5E1" }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}{p.name.includes("Prob") || p.name.includes("%") ? "%" : ""}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PredictiveMaintenancePage() {
  const [timeFilter, setTimeFilter] = useState("30D");
  const [barsAnimated, setBarsAnimated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeRec, setActiveRec] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setBarsAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fade = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(18px)",
    transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
  });

  const statusColor = { healthy: C.success, warning: C.warning, critical: C.critical };

  const filteredProbData = timeFilter === "24H" ? PROB_DATA.slice(-2) : timeFilter === "7D" ? PROB_DATA.slice(-7) : PROB_DATA;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif", background: C.bg }}>

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside style={{
        width: 240, minHeight: "100vh", background: C.sidebar,
        display: "flex", flexDirection: "column", padding: "24px 0",
        position: "sticky", top: 0, flexShrink: 0, zIndex: 40,
      }}>
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#2563EB,#7C3AED)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wind size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "-0.01em" }}>AURA-SWARM X</div>
              <div style={{ color: "#64748B", fontSize: 10, marginTop: 1, letterSpacing: "0.05em" }}>FLEET INTELLIGENCE</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { icon: <BarChart2 size={16} />, label: "Fleet Overview" },
            { icon: <Cpu size={16} />, label: "Digital Twin" },
            { icon: <Activity size={16} />, label: "Live Telemetry" },
            { icon: <AlertTriangle size={16} />, label: "Failure Predictions" },
            { icon: <Wrench size={16} />, label: "Predictive Maintenance", active: true },
            { icon: <Package size={16} />, label: "Parts & Inventory" },
            { icon: <Database size={16} />, label: "Fleet Database" },
            { icon: <Bot size={16} />, label: "AI Assistant" },
            { icon: <Shield size={16} />, label: "Compliance" },
            { icon: <Settings size={16} />, label: "Settings" },
          ].map(({ icon, label, active }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 10, cursor: "pointer",
              color: active ? "#fff" : "#64748B",
              background: active ? "rgba(37,99,235,0.18)" : "transparent",
              borderLeft: active ? "3px solid #2563EB" : "3px solid transparent",
              fontWeight: active ? 600 : 400, fontSize: 13, transition: "all 0.15s",
            }}>{icon}{label}</div>
          ))}
        </nav>

        {/* Fleet Risk Sidebar Widget */}
        <div style={{ margin: "0 12px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
          <div style={{ color: "#94A3B8", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 12 }}>FLEET RISK OVERVIEW</div>
          {FLEET_RISK.map(f => (
            <div key={f.label} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#CBD5E1", fontSize: 11 }}>{f.label}</span>
                <span style={{ color: f.color, fontWeight: 700, fontSize: 11 }}>{f.score}%</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, height: 4 }}>
                <div style={{ width: barsAnimated ? `${f.score}%` : "0%", height: 4, borderRadius: 99, background: f.color, transition: "width 1.2s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Navbar */}
        <header style={{
          background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "0 32px",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.muted }}>
            <span style={{ color: C.primary, fontWeight: 600 }}>Fleet</span>
            <ChevronRight size={14} />
            <span>A320 Family</span>
            <ChevronRight size={14} />
            <span style={{ color: C.ink, fontWeight: 600 }}>Predictive Maintenance · {AIRCRAFT.id}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ background: C.soft, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.success, boxShadow: `0 0 6px ${C.success}` }} />
              AI Engine Active
            </div>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <Bell size={18} color={C.muted} />
              <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, background: C.critical, borderRadius: "50%", fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>3</div>
            </div>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#2563EB,#7C3AED)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>AE</span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: 32, display: "flex", gap: 24, alignItems: "flex-start", minWidth: 0 }}>

          {/* ── Left main column ─────────────────────────────────────────── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 28, minWidth: 0 }}>

            {/* ── S1: Header ─────────────────────────────────────────────── */}
            <div style={{ ...fade(0), background: "#fff", borderRadius: 16, padding: "24px 28px", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
              {/* accent strip */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.primary}, #7C3AED)` }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: C.ink, letterSpacing: "-0.02em" }}>{AIRCRAFT.id}</span>
                    <span style={{ fontSize: 15, color: C.muted, fontWeight: 500 }}>/ {AIRCRAFT.model}</span>
                    <Badge status={AIRCRAFT.status} />
                    <span style={{ background: "#EFF6FF", color: C.primary, border: "1px solid #BFDBFE", borderRadius: 6, padding: "2px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>
                      AI PREDICTION ENGINE ACTIVE
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    {[
                      ["Registration", AIRCRAFT.reg],
                      ["Fleet Rank", `#${AIRCRAFT.fleetRank} / ${AIRCRAFT.fleet}`],
                      ["Last Updated", AIRCRAFT.lastUpdated],
                    ].map(([k, v]) => (
                      <div key={k} style={{ fontSize: 12 }}>
                        <span style={{ color: C.muted }}>{k}: </span>
                        <span style={{ color: C.ink, fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Health ring */}
                <div style={{ textAlign: "center" }}>
                  <svg width={80} height={80} viewBox="0 0 80 80">
                    <circle cx={40} cy={40} r={32} fill="none" stroke={C.soft} strokeWidth={8} />
                    <circle cx={40} cy={40} r={32} fill="none"
                      stroke={AIRCRAFT.health >= 85 ? C.success : AIRCRAFT.health >= 60 ? C.warning : C.critical}
                      strokeWidth={8} strokeLinecap="round"
                      strokeDasharray={`${(AIRCRAFT.health / 100) * 201} 201`}
                      transform="rotate(-90 40 40)"
                      style={{ transition: "stroke-dasharray 1.2s ease" }} />
                    <text x={40} y={44} textAnchor="middle" fontSize={18} fontWeight={800} fill={C.ink}>{AIRCRAFT.health}</text>
                  </svg>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, marginTop: -4 }}>HEALTH SCORE</div>
                </div>
              </div>
            </div>

            {/* ── S2: Failure Prediction Cards ───────────────────────────── */}
            <div style={fade(80)}>
              <SectionTitle icon={<AlertTriangle size={18} />} title="Failure Risk Assessment" sub="Real-time AI-computed probability per system" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                {RISK_CARDS.map((c, i) => (
                  <div key={c.id} style={{
                    background: "#fff", borderRadius: 16, padding: "20px", border: `1px solid ${C.border}`,
                    position: "relative", overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    ...fade(80 + i * 60),
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 3 }}>{c.label.toUpperCase()}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontSize: 36, fontWeight: 900, color: c.color, letterSpacing: "-0.02em" }}>{c.risk}</span>
                          <span style={{ fontSize: 16, color: c.color, fontWeight: 600 }}>%</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                        <div style={{ width: 38, height: 38, background: c.color + "18", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: c.color }}>
                          {c.icon}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: c.trend === "up" ? C.critical : C.success }}>
                          {c.trend === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                          {Math.abs(c.risk - c.prev)}% vs last week
                        </div>
                      </div>
                    </div>
                    <RiskBar value={c.risk} color={c.color} animate={barsAnimated} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: C.muted }}>
                      <span>Predicted failure: <strong style={{ color: C.ink }}>{c.failDate}</strong></span>
                      <span style={{ color: c.color, fontWeight: 700 }}>RUL: {c.rul} FH</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── S3: RUL Section ────────────────────────────────────────── */}
            <div style={fade(200)}>
              <SectionTitle icon={<Clock size={18} />} title="Remaining Useful Life" sub="Estimated flight hours before scheduled replacement" />
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: `1px solid ${C.border}` }}>
                {RUL_DATA.map((r, i) => {
                  const pct = Math.round((r.rul / r.max) * 100);
                  const col = r.status === "critical" ? C.critical : r.status === "warning" ? C.warning : C.success;
                  return (
                    <div key={r.label} style={{ marginBottom: i < RUL_DATA.length - 1 ? 18 : 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: col }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{r.label}</span>
                          <Badge status={r.status} small />
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: col }}>{r.rul.toLocaleString()}</span>
                          <span style={{ fontSize: 11, color: C.muted, marginLeft: 4 }}>{r.unit} remaining</span>
                        </div>
                      </div>
                      <div style={{ background: C.soft, borderRadius: 99, height: 10, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 99, background: `linear-gradient(90deg, ${col}cc, ${col})`,
                          width: barsAnimated ? `${pct}%` : "0%",
                          transition: `width 1.4s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`,
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 4, textAlign: "right" }}>{pct}% of service life remaining (max {r.max.toLocaleString()} {r.unit})</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── S4: Root Cause Analysis ────────────────────────────────── */}
            <div style={fade(250)}>
              <SectionTitle icon={<Target size={18} />} title="Root Cause Analysis" sub="AI-decomposed failure drivers · Hydraulic System" />
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    {ROOT_CAUSES.map((rc, i) => (
                      <div key={rc.cause} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{rc.cause}</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: rc.color }}>{rc.pct}%</span>
                        </div>
                        <div style={{ background: C.soft, borderRadius: 99, height: 12, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 99, background: rc.color,
                            width: barsAnimated ? `${rc.pct * 2}%` : "0%",
                            transition: `width 1.3s ease ${i * 100}ms`,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Donut chart */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <svg width={160} height={160} viewBox="0 0 160 160">
                      {ROOT_CAUSES.reduce((acc, rc, i) => {
                        const r = 60, cx = 80, cy = 80;
                        const total = 100;
                        const circumference = 2 * Math.PI * r;
                        const offset = acc.offset;
                        const dash = (rc.pct / total) * circumference;
                        const rotation = (offset / total) * 360 - 90;
                        acc.elements.push(
                          <circle key={rc.cause} cx={cx} cy={cy} r={r}
                            fill="none" stroke={rc.color} strokeWidth={22}
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            strokeDashoffset={0}
                            transform={`rotate(${rotation} ${cx} ${cy})`}
                            strokeLinecap="butt"
                          />
                        );
                        acc.offset += rc.pct;
                        return acc;
                      }, { elements: [], offset: 0 }).elements}
                      <circle cx={80} cy={80} r={49} fill="#fff" />
                      <text x={80} y={76} textAnchor="middle" fontSize={13} fontWeight={800} fill={C.ink}>61%</text>
                      <text x={80} y={92} textAnchor="middle" fontSize={9} fill={C.muted}>FAIL RISK</text>
                    </svg>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", paddingLeft: 12 }}>
                      {ROOT_CAUSES.map(rc => (
                        <div key={rc.cause} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: rc.color, flexShrink: 0 }} />
                          <span style={{ color: C.muted }}>{rc.cause}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── S5: Trend Graphs ───────────────────────────────────────── */}
            <div style={fade(300)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <SectionTitle icon={<Activity size={18} />} title="Trend Analysis" sub="Multi-system temporal analysis" style={{ marginBottom: 0 }} />
                <div style={{ display: "flex", gap: 6 }}>
                  {["24H", "7D", "30D"].map(f => (
                    <button key={f} onClick={() => setTimeFilter(f)} style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${C.border}`,
                      background: timeFilter === f ? C.primary : "#fff",
                      color: timeFilter === f ? "#fff" : "#374151",
                      transition: "all 0.15s",
                    }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Failure Probability Over Time */}
                <div style={{ background: "#fff", borderRadius: 16, padding: "20px 20px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Failure Probability Over Time</div>
                  <ResponsiveContainer width="100%" height={190}>
                    <LineChart data={filteredProbData} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={40} stroke={C.warning} strokeDasharray="4 4" label={{ value: "Safety Threshold", fill: C.warning, fontSize: 9 }} />
                      <Line type="monotone" dataKey="hydraulic" stroke={C.critical} strokeWidth={2.5} dot={false} name="Hydraulic %" animationDuration={1200} />
                      <Line type="monotone" dataKey="engine" stroke={C.warning} strokeWidth={2} dot={false} name="Engine %" animationDuration={1200} />
                      <Line type="monotone" dataKey="gear" stroke="#8B5CF6" strokeWidth={1.5} dot={false} name="Gear %" animationDuration={1200} />
                      <Line type="monotone" dataKey="electrical" stroke={C.success} strokeWidth={1.5} dot={false} name="Electrical %" animationDuration={1200} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
                    {[["Hydraulic", C.critical], ["Engine", C.warning], ["Gear", "#8B5CF6"], ["Electrical", C.success]].map(([l, c]) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.muted }}>
                        <div style={{ width: 20, height: 2, background: c, borderRadius: 2 }} />{l}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health Degradation Curve */}
                <div style={{ background: "#fff", borderRadius: 16, padding: "20px 20px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Health Degradation Forecast — Next 30 Days</div>
                  <ResponsiveContainer width="100%" height={170}>
                    <AreaChart data={HEALTH_DEGRADATION} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                      <defs>
                        <linearGradient id="nomGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.success} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={C.success} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.critical} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={C.critical} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} interval={4} />
                      <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={60} stroke={C.warning} strokeDasharray="4 4" label={{ value: "Critical Floor", fill: C.warning, fontSize: 9 }} />
                      <Area type="monotone" dataKey="nominal" stroke={C.success} strokeWidth={2} fill="url(#nomGrad)" dot={false} name="Nominal Health" animationDuration={1200} />
                      <Area type="monotone" dataKey="predicted" stroke={C.critical} strokeWidth={2.5} fill="url(#predGrad)" dot={false} name="Predicted Health" animationDuration={1200} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Vibration Trend */}
                <div style={{ background: "#fff", borderRadius: 16, padding: "20px 20px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 14 }}>Vibration Trend Analysis — Last 48 Hours</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <ComposedChart data={VIBRATION_DATA} margin={{ top: 4, right: 16, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="h" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} interval={7} />
                      <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={0.5} stroke={C.critical} strokeDasharray="3 3" label={{ value: "Limit 0.5g", fill: C.critical, fontSize: 9 }} />
                      <Bar dataKey="hydraulic" fill={C.primary + "44"} name="Hydraulic (g)" radius={[2, 2, 0, 0]} animationDuration={1000} />
                      <Line type="monotone" dataKey="engine" stroke={C.warning} strokeWidth={2} dot={false} name="Engine (g)" animationDuration={1200} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ── S6: Similar Cases ──────────────────────────────────────── */}
            <div style={fade(350)}>
              <SectionTitle icon={<Database size={18} />} title="Similar Fleet Failure Cases" sub="AI-matched historical events across AURA-SWARM fleet" />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {SIMILAR_CASES.map((c, i) => (
                  <div key={c.id} style={{
                    background: "#fff", borderRadius: 14, padding: "18px 20px",
                    border: `1px solid ${C.border}`, display: "flex", gap: 16, alignItems: "flex-start",
                    transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer",
                    ...fade(350 + i * 50),
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    {/* Similarity score */}
                    <div style={{ textAlign: "center", flexShrink: 0, width: 60 }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: c.similarity >= 90 ? C.critical : C.warning }}>{c.similarity}%</div>
                      <div style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>MATCH</div>
                    </div>
                    <div style={{ width: 1, background: C.border, alignSelf: "stretch" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ fontWeight: 800, color: C.ink, fontSize: 14 }}>{c.id}</span>
                        <Badge status={c.severity} label={c.failure} small />
                        <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>{c.date}</span>
                      </div>
                      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 11, background: C.soft, borderRadius: 6, padding: "3px 9px", color: "#374151" }}>Outcome: <strong>{c.outcome}</strong></span>
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{c.action}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── S7: AI Recommendations ─────────────────────────────────── */}
            <div style={fade(400)}>
              <SectionTitle icon={<Bot size={18} />} title="AI Recommendations" sub="AURA-AI prioritized action plan based on current risk state" />
              {/* Tab selectors */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {AI_RECS.map((r, i) => (
                  <button key={r.component} onClick={() => setActiveRec(i)} style={{
                    padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", border: `1px solid ${activeRec === i ? (r.urgency === "critical" ? C.critical : C.warning) : C.border}`,
                    background: activeRec === i ? (r.urgency === "critical" ? C.critical : C.warning) : "#fff",
                    color: activeRec === i ? "#fff" : "#374151",
                    display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
                  }}>
                    <span style={{ width: 18, height: 18, background: "rgba(255,255,255,0.25)", borderRadius: "50%", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{r.priority}</span>
                    {r.component}
                  </button>
                ))}
              </div>

              {(() => {
                const r = AI_RECS[activeRec];
                const uc = r.urgency === "critical" ? C.critical : C.warning;
                return (
                  <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${uc}44`, overflow: "hidden" }}>
                    <div style={{ height: 4, background: uc }} />
                    <div style={{ padding: "24px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, marginBottom: 20 }}>
                        <div>
                          <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>RECOMMENDED ACTION</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, lineHeight: 1.4 }}>{r.action}</div>
                        </div>
                        <div style={{ textAlign: "center", background: uc + "10", borderRadius: 12, padding: "12px 16px" }}>
                          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>ACTION WINDOW</div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: uc }}>{r.window}</div>
                        </div>
                      </div>

                      <div style={{ background: "#FFF8F0", border: `1px solid ${uc}33`, borderRadius: 12, padding: "14px", marginBottom: 18 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: uc, marginBottom: 6 }}>WHY THIS ACTION</div>
                        <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{r.reason}</div>
                      </div>

                      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", marginBottom: 10 }}>EXPECTED BENEFITS</div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {r.benefits.map(b => (
                          <div key={b.label} style={{ flex: "1 1 160px", background: C.soft, borderRadius: 12, padding: "14px", border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 18, fontWeight: 900, color: C.success }}>{b.value}</div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{b.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ── S8: Action Panel ───────────────────────────────────────── */}
            <div style={fade(450)}>
              <SectionTitle icon={<Zap size={18} />} title="Actions" sub="Trigger workflows from the current predictive state" />
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { label: "Open Digital Twin", icon: <Cpu size={14} />, primary: true },
                    { label: "Generate Work Order", icon: <FileText size={14} />, primary: false },
                    { label: "Simulate Delay Impact", icon: <Play size={14} />, primary: false },
                    { label: "Export Report", icon: <Download size={14} />, primary: false },
                    { label: "Alert Maintenance Team", icon: <Bell size={14} />, danger: true },
                  ].map(({ label, icon, primary, danger }) => (
                    <button key={label} onClick={() => showToast(`${label} initiated`, danger ? "warning" : "success")} style={{
                      display: "flex", alignItems: "center", gap: 7, padding: "10px 20px",
                      borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer",
                      border: `1px solid ${danger ? C.critical : primary ? C.primary : C.border}`,
                      background: danger ? C.critical : primary ? C.primary : "#fff",
                      color: danger || primary ? "#fff" : "#374151",
                      transition: "all 0.15s",
                    }}>{icon}{label}</button>
                  ))}
                </div>
              </div>
            </div>

          </div>{/* end left column */}

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 80 }}>

            {/* Critical Alerts */}
            <div style={{ ...fade(100), background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>Critical Alerts</span>
                <span style={{ background: C.critical + "18", color: C.critical, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>3</span>
              </div>
              {FLEET_ALERTS.map(a => {
                const col = a.level === "critical" ? C.critical : a.level === "warning" ? C.warning : C.success;
                return (
                  <div key={a.aircraft} style={{ padding: "12px 18px", borderBottom: `1px solid ${C.soft}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{a.aircraft}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{a.msg}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upcoming Maintenance */}
            <div style={{ ...fade(150), background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "18px" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 14 }}>Upcoming Maintenance Windows</div>
              {[
                { aircraft: "ASX-014", event: "Hydraulic Seal Replacement", date: "Sep 22", urgent: true },
                { aircraft: "ASX-014", event: "Engine L Borescope", date: "Oct 15", urgent: false },
                { aircraft: "ASX-007", event: "A-Check", date: "Oct 28", urgent: false },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < 2 ? 12 : 0, paddingBottom: i < 2 ? 12 : 0, borderBottom: i < 2 ? `1px solid ${C.soft}` : "none" }}>
                  <div style={{ width: 38, textAlign: "center", background: m.urgent ? C.critical + "18" : C.soft, borderRadius: 8, padding: "4px 0", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: m.urgent ? C.critical : C.ink, lineHeight: 1 }}>{m.date.split(" ")[1]}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>{m.date.split(" ")[0]}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{m.event}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{m.aircraft}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Aircraft Comparison */}
            <div style={{ ...fade(200), background: "#fff", borderRadius: 16, border: `1px solid ${C.border}`, padding: "18px" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 14 }}>Health Comparison Score</div>
              {[
                { id: "ASX-003", score: 94 }, { id: "ASX-011", score: 88 }, { id: "ASX-007", score: 79 },
                { id: "ASX-014", score: 71, highlight: true }, { id: "ASX-019", score: 63 },
              ].map((a, i) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: a.highlight ? "6px 8px" : "0 0", background: a.highlight ? C.primary + "10" : "transparent", borderRadius: a.highlight ? 8 : 0, border: a.highlight ? `1px solid ${C.primary}33` : "none" }}>
                  <span style={{ fontSize: 11, fontWeight: a.highlight ? 800 : 500, color: a.highlight ? C.primary : C.muted, width: 64 }}>{a.id}</span>
                  <div style={{ flex: 1, background: C.soft, borderRadius: 99, height: 8 }}>
                    <div style={{ width: barsAnimated ? `${a.score}%` : "0%", height: 8, borderRadius: 99, background: a.score >= 85 ? C.success : a.score >= 70 ? C.warning : C.critical, transition: `width 1.4s ease ${i * 80}ms` }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: a.score >= 85 ? C.success : a.score >= 70 ? C.warning : C.critical, width: 32, textAlign: "right" }}>{a.score}</span>
                </div>
              ))}
            </div>

            {/* AI Insight Card */}
            <div style={{ ...fade(250), background: "linear-gradient(135deg,#1E1B4B,#1E3A5F)", borderRadius: 16, padding: "20px", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, background: "rgba(255,255,255,0.12)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={14} color="#A5B4FC" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 13 }}>AURA-AI Insight</span>
              </div>
              <p style={{ fontSize: 12, color: "#CBD5E1", lineHeight: 1.7, margin: "0 0 14px" }}>
                Hydraulic system failure pattern matches <strong style={{ color: "#fff" }}>3 prior fleet events</strong>. Historical data shows average AOG of <strong style={{ color: "#EF4444" }}>14 hours</strong> if unaddressed. Immediate action recommended.
              </p>
              <div style={{ display: "flex", justify: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", borderRadius: 6, padding: "3px 9px", color: "#A5B4FC", fontWeight: 600 }}>Confidence: 88%</span>
                <span style={{ fontSize: 10, background: "rgba(239,68,68,0.2)", borderRadius: 6, padding: "3px 9px", color: "#FCA5A5", fontWeight: 600 }}>Risk: Critical</span>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 200,
          background: toast.type === "warning" ? C.warning : "#0F172A",
          color: "#fff", borderRadius: 12, padding: "14px 20px",
          fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          animation: "slideUp 0.3s ease",
        }}>
          <CheckCircle size={16} />{toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
