import { useState, useEffect, useRef } from "react";
import {
  Activity, AlertTriangle, Bot, ChevronRight, Clock, Cpu, Download,
  FileText, Filter, Gauge, History, Layers, Play, RefreshCw, Settings,
  Shield, Thermometer, TrendingUp, Wrench, X, Zap, Send, ChevronDown,
  BarChart2, AlertCircle, CheckCircle, Package, ArrowRight, Calendar,
  Database, Wind, Crosshair
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine
} from "recharts";

// ── Dummy data ────────────────────────────────────────────────────────────────

const generateTelemetry = (base, variance, points = 48) =>
  Array.from({ length: points }, (_, i) => ({
    t: i,
    v: +(base + (Math.random() - 0.5) * variance).toFixed(2),
  }));

const TELEMETRY = {
  temperature: generateTelemetry(74, 12),
  pressure:    generateTelemetry(32, 6),
  vibration:   generateTelemetry(0.45, 0.3),
  power:       generateTelemetry(118, 20),
};

const COMPONENTS = {
  engineL: {
    id: "engineL", label: "Engine Left", x: 170, y: 230, w: 60, h: 80,
    health: 72, status: "warning", temp: "684°C", pressure: "34.2 bar",
    vibration: "0.62 g", failProb: 23, failDate: "2025-11-14",
    rul: "312 hrs", manufacturer: "CFM International", material: "Inconel 718",
  },
  engineR: {
    id: "engineR", label: "Engine Right", x: 530, y: 230, w: 60, h: 80,
    health: 91, status: "healthy", temp: "641°C", pressure: "33.8 bar",
    vibration: "0.38 g", failProb: 6, failDate: "2026-04-02",
    rul: "910 hrs", manufacturer: "CFM International", material: "Inconel 718",
  },
  hydraulic: {
    id: "hydraulic", label: "Hydraulic System", x: 310, y: 280, w: 140, h: 50,
    health: 58, status: "critical", temp: "91°C", pressure: "207 bar",
    vibration: "0.19 g", failProb: 61, failDate: "2025-09-30",
    rul: "88 hrs", manufacturer: "Parker Hannifin", material: "Steel 4340",
  },
  electrical: {
    id: "electrical", label: "Electrical System", x: 290, y: 340, w: 180, h: 40,
    health: 85, status: "healthy", temp: "52°C", pressure: "N/A",
    vibration: "0.07 g", failProb: 9, failDate: "2026-06-10",
    rul: "1240 hrs", manufacturer: "Honeywell", material: "Copper/Al alloy",
  },
  landingGear: {
    id: "landingGear", label: "Landing Gear", x: 295, y: 390, w: 170, h: 55,
    health: 79, status: "warning", temp: "38°C", pressure: "186 psi",
    vibration: "0.44 g", failProb: 18, failDate: "2025-12-22",
    rul: "510 hrs", manufacturer: "Safran", material: "Titanium Ti-6Al-4V",
  },
  wingL: {
    id: "wingL", label: "Wing Left", x: 60, y: 290, w: 200, h: 100,
    health: 95, status: "healthy", temp: "22°C", pressure: "N/A",
    vibration: "0.12 g", failProb: 3, failDate: "2027-01-15",
    rul: "3200 hrs", manufacturer: "Airbus", material: "CFRP",
  },
  wingR: {
    id: "wingR", label: "Wing Right", x: 500, y: 290, w: 200, h: 100,
    health: 93, status: "healthy", temp: "22°C", pressure: "N/A",
    vibration: "0.15 g", failProb: 4, failDate: "2026-12-30",
    rul: "3050 hrs", manufacturer: "Airbus", material: "CFRP",
  },
  tail: {
    id: "tail", label: "Tail Assembly", x: 295, y: 110, w: 170, h: 70,
    health: 88, status: "healthy", temp: "28°C", pressure: "N/A",
    vibration: "0.21 g", failProb: 7, failDate: "2026-05-18",
    rul: "1890 hrs", manufacturer: "Airbus", material: "Aluminum 7075",
  },
  avionics: {
    id: "avionics", label: "Avionics Bay", x: 310, y: 200, w: 140, h: 45,
    health: 97, status: "healthy", temp: "41°C", pressure: "N/A",
    vibration: "0.03 g", failProb: 1, failDate: "2028-03-01",
    rul: "5500 hrs", manufacturer: "Thales", material: "PCB / Composite",
  },
};

const STATUS_COLOR = {
  healthy:  { fill: "#10B981", stroke: "#059669", glow: "rgba(16,185,129,0.4)" },
  warning:  { fill: "#F59E0B", stroke: "#D97706", glow: "rgba(245,158,11,0.4)" },
  critical: { fill: "#EF4444", stroke: "#DC2626", glow: "rgba(239,68,68,0.4)" },
};

const FAILURES = [
  { id: 1, component: "Hydraulic System", prob: 61, date: "Sep 30, 2025", cause: "Seal degradation + pressure fluctuation", confidence: 88, severity: "critical" },
  { id: 2, component: "Engine Left", prob: 23, date: "Nov 14, 2025", cause: "High-cycle fatigue in turbine blade", confidence: 74, severity: "warning" },
  { id: 3, component: "Landing Gear", prob: 18, date: "Dec 22, 2025", cause: "Actuator wear beyond limits", confidence: 67, severity: "warning" },
];

const HISTORY = [
  { id: 1, date: "Jul 12, 2025", event: "Engine Left Borescope", tech: "J. Morales", type: "inspection", detail: "No cracks detected. Combustion liner shows minor oxidation. EGT within limits." },
  { id: 2, date: "May 03, 2025", event: "Hydraulic Fluid Change", tech: "A. Patel", type: "repair", detail: "Fluid replaced at 5,200 FH. New Skydrol LD-4 installed. Leak-check passed." },
  { id: 3, date: "Mar 17, 2025", event: "Landing Gear Lubrication", tech: "T. Nguyen", type: "service", detail: "All attachment points lubricated per AMM 32-10-00. Shock strut serviced." },
  { id: 4, date: "Jan 08, 2025", event: "Full C-Check Overhaul", tech: "MRO Team", type: "overhaul", detail: "Complete strip-down inspection. 14 items deferred, 3 on watch list. A/C returned to service." },
  { id: 5, date: "Oct 29, 2024", event: "Avionics Software Update", tech: "R. Singh", type: "inspection", detail: "OIS v4.7.2 installed. FMS database updated. BITE test passed all checks." },
];

const SIMULATION_CURVES = {
  "30d": Array.from({ length: 30 }, (_, i) => ({ d: i + 1, h: Math.max(30, 80 - i * 0.9 + (Math.random()-0.5)*4) })),
  "90d": Array.from({ length: 90 }, (_, i) => ({ d: i + 1, h: Math.max(20, 80 - i * 0.68 + (Math.random()-0.5)*5) })),
  heavy: Array.from({ length: 30 }, (_, i) => ({ d: i + 1, h: Math.max(15, 80 - i * 2.1 + (Math.random()-0.5)*6) })),
  delayed: Array.from({ length: 30 }, (_, i) => ({ d: i + 1, h: Math.max(10, 80 - i * 2.8 + (Math.random()-0.5)*7) })),
};

const AI_CANNED = [
  { q: "Why is hydraulic health decreasing?", a: "Seal degradation detected at 207 bar operating pressure — 12% above nominal. Fluid viscosity index has dropped 8 cSt over 400 FH, indicating oxidation. Recommend hydraulic fluid analysis and seal replacement before 88 FH." },
  { q: "Should I repair or replace this component?", a: "Based on the current Remaining Useful Life of 88 FH and a replacement cost/repair cost ratio of 0.61, replacement is recommended. Continued repair cycles carry a 61% failure probability within 60 days." },
  { q: "Show similar failures in fleet.", a: "3 similar hydraulic events found: A320-07 (Seal failure at FH 18,342), A320-11 (Pressure loss at FH 19,100), A320-02 (Burst line at FH 17,900). Average failure onset: 88 FH after current anomaly pattern." },
  { q: "Recommend maintenance actions.", a: "Priority 1 — Hydraulic System: schedule seal inspection within 48 FH. Priority 2 — Engine Left: borescope at next A-check. Priority 3 — Landing Gear: actuator backlash measurement at next transit stop." },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

const Badge = ({ status }) => {
  const map = { healthy: ["#10B981","Healthy"], warning: ["#F59E0B","Warning"], critical: ["#EF4444","Critical"] };
  const [color, label] = map[status] || ["#6B7280","Unknown"];
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>
      {label}
    </span>
  );
};

const HealthBar = ({ value, height = 8 }) => {
  const color = value >= 85 ? "#10B981" : value >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ background: "#F1F5F9", borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.8s ease" }} />
    </div>
  );
};

const TelemetryChart = ({ data, color, label, unit }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: "20px 16px 12px", border: "1px solid #E2E8F0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label}</span>
    </div>
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="t" tick={false} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#0F172A", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }}
          formatter={(v) => [`${v} ${unit}`, label]} labelFormatter={() => ""} />
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#g-${label})`} dot={false} animationDuration={1200} />
      </AreaChart>
    </ResponsiveContainer>
    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>Unit: {unit}</div>
  </div>
);

// ── Aircraft SVG Viewer ────────────────────────────────────────────────────────

const AircraftViewer = ({ onSelect, selectedId }) => {
  const [hovered, setHovered] = useState(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const comp = hovered ? COMPONENTS[hovered] : null;

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }} onMouseMove={handleMouseMove}>
      <svg ref={svgRef} viewBox="0 0 760 540" width="100%" height="100%" style={{ display: "block" }}>
        {/* Fuselage body */}
        <ellipse cx="380" cy="295" rx="75" ry="165" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
        {/* Nose */}
        <ellipse cx="380" cy="180" rx="38" ry="52" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
        {/* Cockpit windows */}
        <ellipse cx="370" cy="195" rx="10" ry="7" fill="#93C5FD" opacity="0.8" />
        <ellipse cx="390" cy="195" rx="10" ry="7" fill="#93C5FD" opacity="0.8" />
        {/* Fuselage windows row */}
        {[230, 258, 286, 314, 342, 370].map((y, i) => (
          <g key={i}>
            <rect x="348" y={y} width="12" height="9" rx="3" fill="#BFDBFE" opacity="0.7" />
            <rect x="400" y={y} width="12" height="9" rx="3" fill="#BFDBFE" opacity="0.7" />
          </g>
        ))}

        {/* Clickable component overlays */}
        {Object.values(COMPONENTS).map((c) => {
          const sc = STATUS_COLOR[c.status];
          const isHov = hovered === c.id;
          const isSel = selectedId === c.id;
          return (
            <rect
              key={c.id}
              x={c.x} y={c.y} width={c.w} height={c.h}
              rx={8}
              fill={sc.fill + (isHov ? "55" : "33")}
              stroke={sc.stroke}
              strokeWidth={isSel ? 3 : isHov ? 2 : 1.5}
              strokeDasharray={isSel ? "0" : "4 2"}
              style={{ cursor: "pointer", filter: isHov ? `drop-shadow(0 0 8px ${sc.glow})` : "none", transition: "all 0.2s" }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(c.id)}
            />
          );
        })}

        {/* Component labels */}
        {Object.values(COMPONENTS).map((c) => (
          <text key={c.id + "-lbl"} x={c.x + c.w / 2} y={c.y + c.h / 2 + 4}
            textAnchor="middle" fontSize="10" fontWeight="600"
            fill={STATUS_COLOR[c.status].stroke}
            style={{ pointerEvents: "none", userSelect: "none" }}>
            {c.label.split(" ").slice(-1)[0]}
          </text>
        ))}

        {/* Legend */}
        {[["#10B981","Healthy"],["#F59E0B","Warning"],["#EF4444","Critical"]].map(([color, lbl], i) => (
          <g key={lbl} transform={`translate(${24 + i * 110}, 510)`}>
            <rect width={12} height={12} rx={3} fill={color + "44"} stroke={color} strokeWidth={1.5} />
            <text x={18} y={10} fontSize={11} fill="#64748B" fontWeight={500}>{lbl}</text>
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {comp && (
        <div style={{
          position: "absolute", left: tipPos.x + 14, top: tipPos.y - 10,
          background: "#0F172A", color: "#fff", borderRadius: 10, padding: "10px 14px",
          fontSize: 12, pointerEvents: "none", zIndex: 50, minWidth: 180,
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)"
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: STATUS_COLOR[comp.status].fill }}>{comp.label}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 12px", color: "#CBD5E1" }}>
            <span>Health</span><span style={{ fontWeight: 600 }}>{comp.health}%</span>
            <span>Fail Risk</span><span style={{ fontWeight: 600, color: STATUS_COLOR[comp.status].fill }}>{comp.failProb}%</span>
            <span>Temp</span><span style={{ fontWeight: 600 }}>{comp.temp}</span>
            <span>RUL</span><span style={{ fontWeight: 600 }}>{comp.rul}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DigitalTwinPage() {
  const [selectedComp, setSelectedComp] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [telemetryRange, setTelemetryRange] = useState("24h");
  const [simMode, setSimMode] = useState("30d");
  const [historyModal, setHistoryModal] = useState(null);
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", text: "Hello! I'm AURA-AI, your digital twin intelligence assistant. Ask me anything about A320-14." }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aiEndRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiMessages]);

  const handleSelectComp = (id) => {
    setSelectedComp(id);
    setDrawerOpen(true);
  };

  const comp = selectedComp ? COMPONENTS[selectedComp] : null;

  const handleAiSend = (text) => {
    const msg = text || aiInput;
    if (!msg.trim()) return;
    setAiMessages(m => [...m, { role: "user", text: msg }]);
    setAiInput("");
    setAiTyping(true);
    const canned = AI_CANNED.find(c => c.q === msg);
    setTimeout(() => {
      setAiMessages(m => [...m, { role: "assistant", text: canned?.a || "Analyzing telemetry and maintenance records... Based on current sensor data, I recommend scheduling an inspection within the next 72 flight hours." }]);
      setAiTyping(false);
    }, 1200);
  };

  const TYPE_ICON = { inspection: <Crosshair size={14}/>, repair: <Wrench size={14}/>, service: <Settings size={14}/>, overhaul: <Layers size={14}/> };
  const TYPE_COLOR = { inspection: "#2563EB", repair: "#F59E0B", service: "#10B981", overhaul: "#8B5CF6" };

  const sectionFade = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
  });

  // Sidebar layout
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif", background: "#F8FAFC" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, minHeight: "100vh", background: "#0F172A", display: "flex",
        flexDirection: "column", padding: "24px 0", position: "sticky", top: 0,
        flexShrink: 0, zIndex: 40
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
            { icon: <BarChart2 size={16}/>, label: "Fleet Overview" },
            { icon: <Cpu size={16}/>, label: "Digital Twin", active: true },
            { icon: <Activity size={16}/>, label: "Live Telemetry" },
            { icon: <AlertTriangle size={16}/>, label: "Failure Predictions" },
            { icon: <Wrench size={16}/>, label: "Maintenance" },
            { icon: <Package size={16}/>, label: "Parts & Inventory" },
            { icon: <Database size={16}/>, label: "Fleet Database" },
            { icon: <Bot size={16}/>, label: "AI Assistant" },
            { icon: <Shield size={16}/>, label: "Compliance" },
            { icon: <Settings size={16}/>, label: "Settings" },
          ].map(({ icon, label, active }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 10, cursor: "pointer", color: active ? "#fff" : "#64748B",
              background: active ? "rgba(37,99,235,0.18)" : "transparent",
              borderLeft: active ? "3px solid #2563EB" : "3px solid transparent",
              fontWeight: active ? 600 : 400, fontSize: 13,
              transition: "all 0.15s",
            }}>
              {icon}{label}
            </div>
          ))}
        </nav>

        {/* Aircraft Insights */}
        <div style={{ margin: "0 12px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "16px" }}>
          <div style={{ color: "#94A3B8", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 12 }}>AIRCRAFT INSIGHTS</div>
          {[
            { label: "Overall Health", value: "76%", color: "#F59E0B" },
            { label: "Risk Level", value: "Medium", color: "#F59E0B" },
            { label: "Next Maintenance", value: "88 FH", color: "#2563EB" },
            { label: "Critical Components", value: "1", color: "#EF4444" },
            { label: "Fleet Ranking", value: "#7 / 24", color: "#10B981" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "#64748B", fontSize: 11 }}>{label}</span>
              <span style={{ color, fontWeight: 700, fontSize: 11 }}>{value}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* ── Navbar ── */}
        <header style={{
          background: "#fff", borderBottom: "1px solid #E2E8F0", padding: "0 32px",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 30
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#64748B" }}>
            <span style={{ color: "#2563EB", fontWeight: 600 }}>Fleet</span>
            <ChevronRight size={14} />
            <span>A320 Family</span>
            <ChevronRight size={14} />
            <span style={{ color: "#0F172A", fontWeight: 600 }}>A320-14 Digital Twin</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ background: "#F1F5F9", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
              Twin Live — 1.2s latency
            </div>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#2563EB,#7C3AED)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>AE</span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "32px", display: "flex", flexDirection: "column", gap: 28, minWidth: 0 }}>

          {/* ── Section 1: Header ── */}
          <div style={{ ...sectionFade(0), display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <Cpu size={22} color="#2563EB" />
                <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", margin: 0 }}>Digital Twin</h1>
                <span style={{ background: "#EFF6FF", color: "#2563EB", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", border: "1px solid #BFDBFE" }}>LIVE</span>
              </div>
              <p style={{ margin: 0, color: "#64748B", fontSize: 14 }}>Real-time virtual representation of aircraft <strong style={{ color: "#0F172A" }}>A320-14</strong> · Reg: F-WXWB · Fleet ID: ASX-014</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { icon: <RefreshCw size={14}/>, label: "Refresh Twin", primary: false },
                { icon: <Play size={14}/>, label: "Run Simulation", primary: false },
                { icon: <FileText size={14}/>, label: "Generate Report", primary: true },
              ].map(({ icon, label, primary }) => (
                <button key={label} style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
                  background: primary ? "#2563EB" : "#fff", color: primary ? "#fff" : "#374151",
                  border: `1px solid ${primary ? "#2563EB" : "#E2E8F0"}`, borderRadius: 10,
                  fontWeight: 600, fontSize: 13, cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  {icon}{label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Sections 2+3: Twin Viewer + Drawer ── */}
          <div style={{ ...sectionFade(100), display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* Aircraft Viewer Card */}
            <div style={{ flex: 1, background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E2E8F0", height: 600, overflow: "hidden", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 15 }}>Aircraft Twin Viewer</div>
                  <div style={{ color: "#64748B", fontSize: 12, marginTop: 2 }}>Click any component to inspect</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#64748B", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "4px 8px" }}>Top View</span>
                  <span style={{ fontSize: 11, color: "#64748B", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "4px 8px" }}>9 Components</span>
                </div>
              </div>
              <div style={{ height: "calc(100% - 60px)" }}>
                <AircraftViewer onSelect={handleSelectComp} selectedId={selectedComp} />
              </div>
            </div>

            {/* Component Panel Drawer */}
            <div style={{
              width: drawerOpen ? 300 : 0, overflow: "hidden", flexShrink: 0,
              transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
            }}>
              {comp && (
                <div style={{ width: 300, background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", height: 600, overflow: "auto", flexShrink: 0 }}>
                  {/* Drawer Header */}
                  <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #F1F5F9", position: "sticky", top: 0, background: "#fff", zIndex: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 14 }}>{comp.label}</div>
                        <div style={{ marginTop: 4 }}><Badge status={comp.status} /></div>
                      </div>
                      <button onClick={() => setDrawerOpen(false)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                        <X size={14} />
                      </button>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: "#64748B" }}>Health Score</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: comp.health >= 85 ? "#10B981" : comp.health >= 60 ? "#F59E0B" : "#EF4444" }}>{comp.health}%</span>
                      </div>
                      <HealthBar value={comp.health} height={6} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ padding: "16px 20px" }}>
                    {[
                      { icon: <Thermometer size={13}/>, label: "Temperature", value: comp.temp },
                      { icon: <Gauge size={13}/>, label: "Pressure", value: comp.pressure },
                      { icon: <Activity size={13}/>, label: "Vibration", value: comp.vibration },
                    ].map(({ icon, label, value }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#F8FAFC", borderRadius: 10, marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#64748B", fontSize: 12 }}>{icon}{label}</div>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "#0F172A" }}>{value}</span>
                      </div>
                    ))}

                    <div style={{ background: comp.failProb >= 50 ? "#FEF2F2" : comp.failProb >= 20 ? "#FFFBEB" : "#F0FDF4", border: `1px solid ${comp.failProb >= 50 ? "#FECACA" : comp.failProb >= 20 ? "#FDE68A" : "#A7F3D0"}`, borderRadius: 12, padding: "14px", marginTop: 4, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#64748B" }}>Failure Probability</span>
                        <span style={{ fontWeight: 800, fontSize: 14, color: comp.failProb >= 50 ? "#EF4444" : comp.failProb >= 20 ? "#F59E0B" : "#10B981" }}>{comp.failProb}%</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: "#64748B" }}>Predicted Failure</span>
                        <span style={{ fontWeight: 600, fontSize: 12, color: "#0F172A" }}>{comp.failDate}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "#64748B" }}>Remaining Useful Life</span>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "#2563EB" }}>{comp.rul}</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { label: "Open Component Details", icon: <ArrowRight size={13}/>, primary: true },
                        { label: "Generate Work Order", icon: <FileText size={13}/>, primary: false },
                        { label: "Run AI Analysis", icon: <Bot size={13}/>, primary: false },
                      ].map(({ label, icon, primary }) => (
                        <button key={label} style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                          padding: "9px", background: primary ? "#2563EB" : "#F8FAFC",
                          color: primary ? "#fff" : "#374151", border: `1px solid ${primary ? "#2563EB" : "#E2E8F0"}`,
                          borderRadius: 10, fontWeight: 600, fontSize: 12, cursor: "pointer",
                        }}>
                          {icon}{label}
                        </button>
                      ))}
                    </div>

                    {/* Material */}
                    <div style={{ marginTop: 16, padding: "14px", background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: "0.07em", marginBottom: 10 }}>MATERIAL</div>
                      <div style={{ fontSize: 12, color: "#0F172A", fontWeight: 600 }}>{comp.material}</div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{comp.manufacturer}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Section 4: Live Telemetry ── */}
          <div style={sectionFade(150)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={18} color="#2563EB" />
                <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 16 }}>Live Telemetry</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["24h","7d","30d"].map(r => (
                  <button key={r} onClick={() => setTelemetryRange(r)} style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", border: "1px solid #E2E8F0",
                    background: telemetryRange === r ? "#2563EB" : "#fff",
                    color: telemetryRange === r ? "#fff" : "#374151",
                    transition: "all 0.15s",
                  }}>{r === "24h" ? "24 Hours" : r === "7d" ? "7 Days" : "30 Days"}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <TelemetryChart data={TELEMETRY.temperature} color="#EF4444" label="Temperature" unit="°C" />
              <TelemetryChart data={TELEMETRY.pressure} color="#2563EB" label="Pressure" unit="bar" />
              <TelemetryChart data={TELEMETRY.vibration} color="#F59E0B" label="Vibration" unit="g" />
              <TelemetryChart data={TELEMETRY.power} color="#8B5CF6" label="Power Consumption" unit="kW" />
            </div>
          </div>

          {/* ── Section 5: Failure Predictions ── */}
          <div style={sectionFade(200)}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <AlertTriangle size={18} color="#EF4444" />
              <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 16 }}>Failure Predictions</span>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {FAILURES.map(f => (
                <div key={f.id} style={{ flex: "1 1 260px", background: "#fff", borderRadius: 16, padding: "20px", border: `1px solid ${f.severity === "critical" ? "#FECACA" : "#FDE68A"}`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: f.severity === "critical" ? "#EF4444" : "#F59E0B" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{f.component}</span>
                    <Badge status={f.severity} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px" }}>
                      <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>FAIL PROBABILITY</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: f.severity === "critical" ? "#EF4444" : "#F59E0B" }}>{f.prob}%</div>
                    </div>
                    <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px" }}>
                      <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>PREDICTED DATE</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{f.date}</div>
                    </div>
                  </div>
                  <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px", marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>ROOT CAUSE</div>
                    <div style={{ fontSize: 12, color: "#374151" }}>{f.cause}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#64748B" }}>Confidence</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, marginLeft: 10 }}>
                      <div style={{ flex: 1, background: "#E2E8F0", borderRadius: 99, height: 6 }}>
                        <div style={{ width: `${f.confidence}%`, height: 6, borderRadius: 99, background: "#2563EB" }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#2563EB" }}>{f.confidence}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 6: Simulation Panel ── */}
          <div style={sectionFade(250)}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Play size={18} color="#2563EB" />
              <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 16 }}>Simulation Panel</span>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  { key: "30d", label: "Simulate Next 30 Days" },
                  { key: "90d", label: "Simulate Next 90 Days" },
                  { key: "heavy", label: "Simulate Heavy Usage" },
                  { key: "delayed", label: "Simulate Delayed Maintenance" },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setSimMode(key)} style={{
                    padding: "9px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", border: "1px solid #E2E8F0", transition: "all 0.15s",
                    background: simMode === key ? "#2563EB" : "#F8FAFC",
                    color: simMode === key ? "#fff" : "#374151",
                  }}>{label}</button>
                ))}
              </div>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SIMULATION_CURVES[simMode]} margin={{ top: 8, right: 16, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#9CA3AF" }} label={{ value: "Days", position: "insideBottom", offset: -2, fill: "#9CA3AF", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9CA3AF" }} label={{ value: "Health %", angle: -90, position: "insideLeft", fill: "#9CA3AF", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#0F172A", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(v) => [`${v.toFixed(1)}%`, "Predicted Health"]} />
                    <ReferenceLine y={60} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: "Warning", fill: "#F59E0B", fontSize: 10 }} />
                    <ReferenceLine y={30} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "Critical", fill: "#EF4444", fontSize: 10 }} />
                    <Area type="monotone" dataKey="h" stroke="#2563EB" strokeWidth={2.5} fill="url(#simGrad)" dot={false} animationDuration={1000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Section 7: Material Intelligence ── */}
          <div style={sectionFade(300)}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Layers size={18} color="#8B5CF6" />
              <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 16 }}>Material Intelligence</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
              {[
                { comp: "Engine Left", material: "Inconel 718", manufacturer: "Special Metals Corp", supplier: "Tier-1 Direct", age: "7.2 yrs", fatigue: 63, rec: "Monitor", recColor: "#F59E0B" },
                { comp: "Hydraulic System", material: "Steel 4340 + Seals", manufacturer: "Parker Hannifin", supplier: "OEM Direct", age: "9.1 yrs", fatigue: 79, rec: "Replace Soon", recColor: "#EF4444" },
                { comp: "Wing Structures", material: "CFRP T800", manufacturer: "Toray", supplier: "Tier-1", age: "9.1 yrs", fatigue: 14, rec: "Good Condition", recColor: "#10B981" },
                { comp: "Avionics", material: "PCB FR4 / Au", manufacturer: "Thales", supplier: "OEM Direct", age: "4.3 yrs", fatigue: 8, rec: "Good Condition", recColor: "#10B981" },
              ].map(m => (
                <div key={m.comp} style={{ background: "#fff", borderRadius: 16, padding: "18px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 13, marginBottom: 12 }}>{m.comp}</div>
                  {[
                    ["Material", m.material],
                    ["Manufacturer", m.manufacturer],
                    ["Supplier", m.supplier],
                    ["Age", m.age],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: "#64748B" }}>{k}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#0F172A" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#64748B" }}>Fatigue Score</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.fatigue > 60 ? "#EF4444" : m.fatigue > 30 ? "#F59E0B" : "#10B981" }}>{m.fatigue}%</span>
                  </div>
                  <HealthBar value={100 - m.fatigue} height={5} />
                  <div style={{ marginTop: 12, background: m.recColor + "18", border: `1px solid ${m.recColor}33`, borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: m.recColor }}>{m.rec}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    {["Inspect Material","View Lifecycle"].map(l => (
                      <button key={l} style={{ flex: 1, fontSize: 10, fontWeight: 600, padding: "6px 4px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", color: "#374151", cursor: "pointer" }}>{l}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 8: Maintenance History ── */}
          <div style={sectionFade(350)}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <History size={18} color="#2563EB" />
              <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 16 }}>Maintenance History</span>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E2E8F0" }}>
              {HISTORY.map((h, i) => (
                <div key={h.id} style={{ display: "flex", gap: 16, marginBottom: i < HISTORY.length - 1 ? 0 : 0 }}>
                  {/* Timeline spine */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 32 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: TYPE_COLOR[h.type] + "18", border: `2px solid ${TYPE_COLOR[h.type]}`, display: "flex", alignItems: "center", justifyContent: "center", color: TYPE_COLOR[h.type], flexShrink: 0 }}>
                      {TYPE_ICON[h.type]}
                    </div>
                    {i < HISTORY.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: "#E2E8F0", margin: "4px 0", minHeight: 24 }} />
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, paddingBottom: i < HISTORY.length - 1 ? 20 : 0, cursor: "pointer" }}
                    onClick={() => setHistoryModal(h)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 700, color: "#0F172A", fontSize: 14 }}>{h.event}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: "#64748B" }}>{h.date}</span>
                        <span style={{ fontSize: 10, background: TYPE_COLOR[h.type] + "18", color: TYPE_COLOR[h.type], padding: "2px 8px", borderRadius: 5, fontWeight: 700, textTransform: "uppercase" }}>{h.type}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Tech: {h.tech} · <span style={{ color: "#2563EB", textDecoration: "underline" }}>View Report</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 9: AI Assistant ── */}
          <div style={sectionFade(400)}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Bot size={18} color="#8B5CF6" />
              <span style={{ fontWeight: 700, color: "#0F172A", fontSize: 16 }}>AURA-AI Assistant</span>
              <span style={{ background: "#F3E8FF", color: "#8B5CF6", border: "1px solid #DDD6FE", borderRadius: 6, padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>GPT-4o Powered</span>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              {/* Chat window */}
              <div style={{ height: 340, overflowY: "auto", padding: "20px" }}>
                {aiMessages.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 16, justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    {m.role === "assistant" && (
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Bot size={14} color="#fff" />
                      </div>
                    )}
                    <div style={{
                      maxWidth: "75%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: m.role === "user" ? "#2563EB" : "#F8FAFC",
                      color: m.role === "user" ? "#fff" : "#374151",
                      fontSize: 13, lineHeight: 1.6,
                      border: m.role === "assistant" ? "1px solid #E2E8F0" : "none",
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {aiTyping && (
                  <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#8B5CF6,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Bot size={14} color="#fff" />
                    </div>
                    <div style={{ padding: "12px 16px", background: "#F8FAFC", borderRadius: "14px 14px 14px 4px", border: "1px solid #E2E8F0", display: "flex", gap: 5, alignItems: "center" }}>
                      {[0,1,2].map(d => (
                        <div key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: "#8B5CF6", animation: `bounce 1.2s infinite ${d * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={aiEndRef} />
              </div>

              {/* Quick questions */}
              <div style={{ padding: "0 20px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {AI_CANNED.map(c => (
                  <button key={c.q} onClick={() => handleAiSend(c.q)} style={{
                    fontSize: 11, padding: "5px 10px", borderRadius: 8, border: "1px solid #E2E8F0",
                    background: "#F8FAFC", color: "#374151", cursor: "pointer", fontWeight: 500,
                    transition: "all 0.15s",
                  }}>{c.q}</button>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: "12px 20px 20px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 10 }}>
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAiSend()}
                  placeholder="Ask AURA-AI about A320-14..."
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13, outline: "none", color: "#0F172A", background: "#F8FAFC" }}
                />
                <button onClick={() => handleAiSend()} style={{
                  width: 40, height: 40, borderRadius: 10, background: "#2563EB", border: "none",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Send size={16} color="#fff" />
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* ── Maintenance History Modal ── */}
      {historyModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setHistoryModal(null)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "32px", maxWidth: 480, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, color: "#0F172A", fontSize: 17 }}>{historyModal.event}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{historyModal.date} · {historyModal.tech}</div>
              </div>
              <button onClick={() => setHistoryModal(null)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} color="#64748B" />
              </button>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 16, fontSize: 13, color: "#374151", lineHeight: 1.7, border: "1px solid #E2E8F0" }}>
              {historyModal.detail}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button style={{ flex: 1, padding: "10px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Download Report</button>
              <button onClick={() => setHistoryModal(null)} style={{ flex: 1, padding: "10px", background: "#F8FAFC", color: "#374151", border: "1px solid #E2E8F0", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Bounce animation for typing indicator */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
