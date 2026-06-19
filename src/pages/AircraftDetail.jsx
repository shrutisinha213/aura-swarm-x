import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Shield, Zap, Cog, Layers, Brain, Activity, Thermometer,
  Gauge, Wind, AlertTriangle, CheckCircle, XCircle, Clock,
  FileText, RefreshCw, ChevronRight, X, Download, Calendar,
  BarChart2, TrendingUp, TrendingDown, MapPin, User, Hash,
  Send, ChevronDown, Wrench, AlertOctagon, Info, Settings,
  ArrowLeft, ExternalLink, PlayCircle, ClipboardList, Cpu
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

// ─── Dummy Data ────────────────────────────────────────────────────────────────
const AIRCRAFT = {
  id: "A320-14",
  model: "Airbus A320neo",
  registration: "VT-AXF",
  manufacturer: "Airbus S.A.S.",
  serial: "MSN-10842",
  owner: "IndiGo Airlines",
  location: "Delhi Hub",
  fleet: "Domestic Fleet",
  age: "9 Years",
  flightHours: "18,400 FH",
  flightCycles: "11,250",
  lastMaintenance: "15 Days Ago",
  currentRoute: "DEL → BOM",
  health: 72,
  status: "Warning",
  rul: 1200,
  failureRisk: 12,
  lastUpdated: "2 minutes ago",
  utilization: "82%",
  avgDailyFlights: "6.4",
  carbonScore: "B+",
  fleetRanking: "#14 of 120",
  predictedFailureDate: "18 Aug 2026",
  confidenceScore: 92,
};

const SYSTEMS = [
  {
    id: "engine",
    name: "Engine",
    icon: Wind,
    health: 58,
    status: "Warning",
    temp: "487°C",
    failureRisk: "18%",
    rul: "840h",
    vibration: "2.4 mm/s",
    pressure: "34.2 bar",
    rootCause: "Bearing wear on Stage 2 fan detected via vibration signature analysis.",
    recommendations: [
      "Schedule borescope inspection within 72h",
      "Monitor N1/N2 ratio deviation",
      "Review ACARS engine trend data",
    ],
  },
  {
    id: "hydraulics",
    name: "Hydraulics",
    icon: Gauge,
    health: 45,
    status: "Critical",
    temp: "68°C",
    failureRisk: "31%",
    rul: "320h",
    vibration: "3.9 mm/s",
    pressure: "27.1 bar",
    rootCause: "System B pressure decay of 4.2% per cycle exceeds the 2% threshold.",
    recommendations: [
      "Inspect actuator seals on inboard ailerons",
      "Check reservoir level and fluid contamination",
      "Ground aircraft if decay exceeds 6% next cycle",
    ],
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: Zap,
    health: 91,
    status: "Healthy",
    temp: "41°C",
    failureRisk: "4%",
    rul: "4200h",
    vibration: "0.3 mm/s",
    pressure: "28V DC",
    rootCause: "No anomalies detected. Bus voltage within nominal limits.",
    recommendations: [
      "Routine BITE check at next scheduled A-check",
    ],
  },
  {
    id: "landing-gear",
    name: "Landing Gear",
    icon: Cog,
    health: 79,
    status: "Warning",
    temp: "52°C",
    failureRisk: "9%",
    rul: "1800h",
    vibration: "1.1 mm/s",
    pressure: "195 bar",
    rootCause: "Nose gear shimmy damper showing increased play at high taxi speeds.",
    recommendations: [
      "Inspect shimmy damper fluid level",
      "Check torque link wear",
      "Monitor at next gate arrival",
    ],
  },
  {
    id: "structures",
    name: "Structures",
    icon: Layers,
    health: 88,
    status: "Healthy",
    temp: "24°C",
    failureRisk: "3%",
    rul: "6100h",
    vibration: "0.6 mm/s",
    pressure: "N/A",
    rootCause: "Fatigue life within acceptable range. No crack propagation detected.",
    recommendations: [
      "Standard visual inspection at D-check",
    ],
  },
];

const TIMELINE = [
  {
    year: "2022",
    date: "March 2022",
    event: "Engine Overhaul",
    engineer: "Capt. R. Sharma",
    type: "major",
    actions: "Full CFM LEAP-1A engine overhaul. Hot section replacement, LPT blade set renewed.",
    parts: "LPT Blade Set, Combustion Liner, HP Turbine Shroud",
    cost: "₹4,20,00,000",
    downtime: "18 days",
  },
  {
    year: "2023",
    date: "July 2023",
    event: "Hydraulic System Repair",
    engineer: "Eng. P. Nair",
    type: "repair",
    actions: "System B actuator overhaul. Full fluid flush and filter element replacement.",
    parts: "Actuator Seals Kit, Filter Elements x4, Reservoir Cap Assembly",
    cost: "₹8,50,000",
    downtime: "2 days",
  },
  {
    year: "2024",
    date: "January 2024",
    event: "C-Check Inspection",
    engineer: "Eng. A. Verma",
    type: "inspection",
    actions: "Full C-check per MPD. Zonal inspection complete. No crack findings.",
    parts: "Various consumables",
    cost: "₹1,20,00,000",
    downtime: "9 days",
  },
  {
    year: "2025",
    date: "February 2025",
    event: "Landing Gear Service",
    engineer: "Eng. D. Kulkarni",
    type: "service",
    actions: "NLG shimmy damper servicing. MLG brake units replaced.",
    parts: "Shimmy Damper Fluid, Brake Units x4",
    cost: "₹14,00,000",
    downtime: "1 day",
  },
  {
    year: "Now",
    date: "June 2026",
    event: "Current Status",
    engineer: "—",
    type: "current",
    actions: "Active monitoring. Hydraulic anomaly flagged by AURA-SWARM X.",
    parts: "—",
    cost: "—",
    downtime: "—",
  },
];

const AI_SUGGESTIONS = [
  "Why is hydraulic vibration increasing?",
  "Which component is most likely to fail?",
  "Should I repair or replace the actuator?",
  "Show similar historical failures.",
];

const AI_RESPONSES = {
  "Why is hydraulic vibration increasing?": {
    rootCause: "Cavitation in System B hydraulic pump due to fluid aeration. Air ingestion likely from reservoir low-level condition.",
    recommendation: "Perform reservoir bleed procedure. Inspect suction line for air ingress. If vibration exceeds 4.5 mm/s, ground the aircraft.",
    confidence: 89,
  },
  "Which component is most likely to fail?": {
    rootCause: "Hydraulic System B actuator seals show thermal degradation signatures consistent with 85% wear rate at current cycle count.",
    recommendation: "Prioritize actuator seal inspection within next 2 flight cycles. Engine bearing is secondary concern.",
    confidence: 91,
  },
  "Should I repair or replace the actuator?": {
    rootCause: "Cost-benefit analysis: repair cost ₹8.5L, replacement ₹24L. Remaining service life after repair estimated at 800 cycles.",
    recommendation: "Repair is economically justified. However, if downtime exceeds 48h, replacement delivers better fleet availability ROI.",
    confidence: 85,
  },
  "Show similar historical failures.": {
    rootCause: "3 comparable events in fleet: A320-07 (2024), A320-22 (2023), A320-31 (2025). All resolved with actuator seal kit replacement.",
    recommendation: "Pattern confirms seal degradation at 11,000–12,000 cycle range. Recommend fleet-wide inspection for aircraft in this range.",
    confidence: 94,
  },
};

function generateTrend(base, variance, points = 30, trend = 0) {
  return Array.from({ length: points }, (_, i) => ({
    t: i,
    v: +(base + trend * i + (Math.random() - 0.5) * variance).toFixed(1),
  }));
}

const SENSOR_DATA = {
  temperature: generateTrend(487, 18, 30, 0.4),
  pressure: generateTrend(27.1, 1.5, 30, -0.1),
  vibration: generateTrend(2.4, 0.6, 30, 0.08),
  fuelEfficiency: generateTrend(94.2, 1.2, 30, -0.15),
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const statusColor = (s) =>
  s === "Healthy" ? "text-emerald-600 bg-emerald-50 border-emerald-200"
  : s === "Warning" ? "text-amber-600 bg-amber-50 border-amber-200"
  : "text-red-600 bg-red-50 border-red-200";

const statusDot = (s) =>
  s === "Healthy" ? "bg-emerald-500"
  : s === "Warning" ? "bg-amber-500"
  : "bg-red-500";

const healthColor = (h) =>
  h >= 80 ? "#10B981" : h >= 60 ? "#F59E0B" : "#EF4444";

const healthBg = (h) =>
  h >= 80 ? "bg-emerald-50 border-emerald-200"
  : h >= 60 ? "bg-amber-50 border-amber-200"
  : "bg-red-50 border-red-200";

const timelineColor = {
  major: "bg-blue-500",
  repair: "bg-amber-500",
  inspection: "bg-purple-500",
  service: "bg-teal-500",
  current: "bg-emerald-500",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" } }),
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function CircularGauge({ value, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = healthColor(value);
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs font-bold tracking-widest uppercase text-slate-400">{label}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function Card({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-2xl ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Section 2: System Health Cards ───────────────────────────────────────────
function SystemCard({ sys, onSelect }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ scale: 1.025, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
      onClick={() => onSelect(sys)}
      className={`bg-white border rounded-2xl p-4 cursor-pointer select-none transition-shadow ${healthBg(sys.health)}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
          <sys.icon size={18} className="text-slate-600" />
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(sys.status)}`}>
          {sys.status}
        </span>
      </div>
      <div className="mb-2">
        <p className="font-700 text-slate-800 font-semibold text-sm">{sys.name}</p>
      </div>
      <div className="mb-3">
        <div className="flex items-end gap-1 mb-1">
          <span className="text-2xl font-bold leading-none" style={{ color: healthColor(sys.health) }}>
            {sys.health}
          </span>
          <span className="text-xs text-slate-400 mb-0.5">%</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: healthColor(sys.health) }}
            initial={{ width: 0 }}
            animate={{ width: `${sys.health}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 text-[11px]">
        <div><span className="text-slate-400">Temp</span><br /><span className="text-slate-700 font-medium">{sys.temp}</span></div>
        <div><span className="text-slate-400">Risk</span><br /><span className="font-medium" style={{ color: healthColor(sys.health) }}>{sys.failureRisk}</span></div>
        <div className="col-span-2 mt-1"><span className="text-slate-400">RUL </span><span className="text-slate-700 font-medium">{sys.rul}</span></div>
      </div>
    </motion.div>
  );
}

// ─── Component Drawer ──────────────────────────────────────────────────────────
function ComponentDrawer({ sys, onClose }) {
  return (
    <AnimatePresence>
      {sys && (
        <>
          <motion.div
            className="fixed inset-0 bg-slate-900/40 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 h-full w-[420px] bg-white z-50 shadow-2xl flex flex-col"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                  <sys.icon size={18} className="text-slate-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">{sys.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(sys.status)}`}>{sys.status}</span>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Live Readings</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Health", val: `${sys.health}%`, color: healthColor(sys.health) },
                    { label: "Temperature", val: sys.temp },
                    { label: "Pressure", val: sys.pressure },
                    { label: "Vibration", val: sys.vibration },
                    { label: "Failure Risk", val: sys.failureRisk, color: sys.failureRisk > "20%" ? "#EF4444" : "#F59E0B" },
                    { label: "RUL", val: sys.rul },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-[11px] text-slate-400 mb-1">{item.label}</p>
                      <p className="font-bold text-slate-800 text-sm" style={item.color ? { color: item.color } : {}}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle size={13} /> Root Cause Analysis
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">{sys.rootCause}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recommendations</p>
                <div className="space-y-2">
                  {sys.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-2.5 rounded-xl transition-colors">
                <ExternalLink size={14} /> Full Page
              </button>
              <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors">
                <ClipboardList size={14} /> Work Order
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Section 4: Digital Twin Preview ──────────────────────────────────────────
function DigitalTwinPreview() {
  const [hover, setHover] = useState(null);
  const parts = [
    { id: "nose", label: "Nose Section", x: 82, y: 48, w: 52, h: 22, health: 91, risk: "3%", status: "Healthy" },
    { id: "fuselage", label: "Fuselage", x: 134, y: 40, w: 290, h: 38, health: 88, risk: "5%", status: "Healthy" },
    { id: "tail", label: "Tail Section", x: 424, y: 30, w: 70, h: 58, health: 85, risk: "6%", status: "Healthy" },
    { id: "left-wing", label: "Left Wing", x: 200, y: 78, w: 160, h: 28, health: 79, risk: "9%", status: "Warning" },
    { id: "right-wing", label: "Right Wing", x: 200, y: 14, w: 160, h: 28, health: 79, risk: "9%", status: "Warning" },
    { id: "engine-l", label: "Engine (Left)", x: 218, y: 90, w: 80, h: 22, health: 58, risk: "18%", status: "Warning" },
    { id: "engine-r", label: "Engine (Right)", x: 218, y: 6, w: 80, h: 22, health: 58, risk: "18%", status: "Warning" },
    { id: "hydraulics", label: "Hydraulics", x: 260, y: 50, w: 100, h: 18, health: 45, risk: "31%", status: "Critical" },
    { id: "landing-f", label: "Nose Gear", x: 130, y: 74, w: 20, h: 18, health: 79, risk: "9%", status: "Warning" },
    { id: "landing-m", label: "Main Gear L", x: 300, y: 74, w: 20, h: 18, health: 82, risk: "7%", status: "Healthy" },
  ];

  return (
    <div className="relative w-full h-72 bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "linear-gradient(rgba(37,99,235,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.4) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
      />
      <svg viewBox="0 0 560 120" className="w-[94%] max-w-2xl relative z-10" style={{ filter: "drop-shadow(0 0 8px rgba(37,99,235,0.3))" }}>
        {parts.map((p) => {
          const c = healthColor(p.health);
          const isHov = hover === p.id;
          return (
            <g key={p.id} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
              <rect
                x={p.x} y={p.y} width={p.w} height={p.h}
                rx="5"
                fill={c + (isHov ? "dd" : "55")}
                stroke={c}
                strokeWidth={isHov ? 2 : 1}
                style={{ transition: "all 0.18s" }}
              />
            </g>
          );
        })}
      </svg>
      <AnimatePresence>
        {hover && (() => {
          const p = parts.find((x) => x.id === hover);
          if (!p) return null;
          return (
            <motion.div
              key={hover}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 min-w-[160px] z-20"
            >
              <p className="font-bold text-slate-800 text-sm mb-1">{p.label}</p>
              <div className="text-xs space-y-0.5">
                <div className="flex justify-between"><span className="text-slate-400">Health</span><span className="font-medium" style={{ color: healthColor(p.health) }}>{p.health}%</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Risk</span><span className="font-medium text-slate-700">{p.risk}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Status</span><span className={`font-bold text-xs ${p.status === "Healthy" ? "text-emerald-600" : p.status === "Warning" ? "text-amber-600" : "text-red-600"}`}>{p.status}</span></div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
      <div className="absolute bottom-4 left-4 flex gap-3 text-xs">
        {[["#10B981", "Healthy"], ["#F59E0B", "Warning"], ["#EF4444", "Critical"]].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
            <span className="text-slate-400">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section 5: Sensor Charts ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="text-slate-400 mb-0.5">t+{label}</p>
      <p className="font-bold text-slate-800">{payload[0].value}{unit}</p>
    </div>
  );
};

function SensorChart({ title, data, color, unit, threshold }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-slate-800 text-sm">{title}</p>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.18} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
          {threshold && <ReferenceLine y={threshold} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} />}
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#g-${color.replace("#", "")})`} dot={false} activeDot={{ r: 4, fill: color }} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Section 6: Timeline ───────────────────────────────────────────────────────
function MaintenanceTimeline({ onEventClick }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" />
      {TIMELINE.map((ev, i) => (
        <motion.div key={i} variants={fadeUp} custom={i} className="relative mb-8 last:mb-0">
          <div className={`absolute -left-5 top-1.5 w-4 h-4 rounded-full border-2 border-white ring-2 ring-slate-200 ${timelineColor[ev.type]}`} />
          <div
            onClick={() => ev.type !== "current" && onEventClick(ev)}
            className={`bg-white border border-slate-200 rounded-xl p-4 transition-all ${ev.type !== "current" ? "cursor-pointer hover:border-blue-300 hover:shadow-md" : ""}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-slate-800 text-sm">{ev.event}</p>
                <p className="text-xs text-slate-400 mt-0.5">{ev.date}</p>
              </div>
              <div className="flex items-center gap-2">
                {ev.type === "current" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                )}
                {ev.type !== "current" && <ChevronRight size={14} className="text-slate-400" />}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{ev.actions}</p>
            {ev.cost !== "—" && (
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-slate-400">Cost: <span className="text-slate-700 font-medium">{ev.cost}</span></span>
                <span className="text-slate-400">Downtime: <span className="text-slate-700 font-medium">{ev.downtime}</span></span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Maintenance Report Modal ──────────────────────────────────────────────────
function MaintenanceModal({ ev, onClose }) {
  return (
    <AnimatePresence>
      {ev && (
        <>
          <motion.div className="fixed inset-0 bg-slate-900/50 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200">
              <div className="flex items-center justify-between p-5 border-b border-slate-200">
                <div>
                  <p className="font-bold text-slate-800">{ev.event}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{ev.date}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { label: "Engineer", val: ev.engineer, icon: User },
                  { label: "Actions Performed", val: ev.actions, icon: Wrench },
                  { label: "Parts Replaced", val: ev.parts, icon: Settings },
                  { label: "Total Cost", val: ev.cost, icon: BarChart2 },
                  { label: "Downtime", val: ev.downtime, icon: Clock },
                ].map(({ label, val, icon: Icon }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-sm text-slate-800 font-medium mt-0.5">{val}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-slate-200">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl w-full justify-center transition-colors">
                  <Download size={14} /> Download PDF Report
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Section 9: AI Assistant ───────────────────────────────────────────────────
function AIAssistant() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const ask = (q) => {
    const query = q || input;
    if (!query.trim()) return;
    setInput(query);
    setLoading(true);
    setResponse(null);
    setTimeout(() => {
      setResponse(AI_RESPONSES[query] || {
        rootCause: "Insufficient telemetry data for definitive root cause. Recommend manual inspection.",
        recommendation: "Engage MRO team for physical assessment within 24 hours.",
        confidence: 67,
      });
      setLoading(false);
    }, 900);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
          <Brain size={15} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">AURA Intelligence</p>
          <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Online
          </p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {AI_SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => ask(s)}
            className="w-full text-left text-xs text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl px-3 py-2.5 transition-all leading-snug">
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Ask about this aircraft..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 transition-colors"
        />
        <button onClick={() => ask()} className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
          <Send size={14} />
        </button>
      </div>
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500"
                  animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
            <span className="text-xs text-slate-400">Analyzing telemetry...</span>
          </motion.div>
        )}
        {response && !loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Root Cause</p>
              <p className="text-xs text-slate-700 leading-relaxed">{response.rootCause}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recommendation</p>
              <p className="text-xs text-slate-700 leading-relaxed">{response.recommendation}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-slate-400">Confidence</p>
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full bg-blue-500"
                  initial={{ width: 0 }} animate={{ width: `${response.confidence}%` }} transition={{ duration: 0.7 }} />
              </div>
              <p className="text-[10px] font-bold text-blue-600">{response.confidence}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Right Sidebar Insights ────────────────────────────────────────────────────
function InsightSidebar() {
  const trendData = Array.from({ length: 10 }, (_, i) => ({ v: 80 - i * 1.5 + Math.random() * 3 }));
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Health Trend</p>
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={trendData}>
            <Line type="monotone" dataKey="v" stroke="#F59E0B" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1"><TrendingDown size={12} /> Declining 1.5%/week</p>
      </Card>
      <Card className="p-4 space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk & Operations</p>
        {[
          { label: "Risk Level", val: "Elevated", color: "text-amber-600" },
          { label: "Next A-Check", val: "12 Jul 2026", color: "text-slate-700" },
          { label: "Fleet Ranking", val: "#14 / 120", color: "text-slate-700" },
          { label: "Carbon Score", val: "B+", color: "text-emerald-600" },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{label}</span>
            <span className={`text-xs font-bold ${color}`}>{val}</span>
          </div>
        ))}
      </Card>
      <Card className="p-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Similar Fleet Issues</p>
        <div className="space-y-2.5">
          {[
            { id: "A320-07", issue: "Hydraulic seal failure", date: "2024" },
            { id: "A320-22", issue: "Actuator pressure loss", date: "2023" },
            { id: "A320-31", issue: "System B decay", date: "2025" },
          ].map((s) => (
            <div key={s.id} className="flex items-start gap-2 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold text-slate-700">{s.id}</span>
                <span className="text-slate-400"> — {s.issue} ({s.date})</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Sidebar Nav ───────────────────────────────────────────────────────────────
const NAV = [
  { label: "Dashboard", icon: BarChart2 },
  { label: "Fleet Overview", icon: Plane },
  { label: "Aircraft Registry", icon: ClipboardList },
  { label: "Digital Twin", icon: Cpu },
  { label: "Predictive MX", icon: Activity },
  { label: "Decision Twin", icon: Brain },
  { label: "MX Planner", icon: Calendar },
  { label: "Fleet Intelligence", icon: TrendingUp },
  { label: "Knowledge Brain", icon: FileText },
  { label: "Material Intel.", icon: Layers },
  { label: "Sustainability", icon: Zap },
  { label: "Settings", icon: Settings },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AircraftDetail() {
  const [activeSystem, setActiveSystem] = useState(null);
  const [activeTimeline, setActiveTimeline] = useState(null);
  const [activeNav, setActiveNav] = useState(2);
  const [sensorRange] = useState("30d");

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">

      {/* Sidebar */}
      <nav className="w-[220px] flex-shrink-0 bg-[#0F172A] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/8 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Plane size={15} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-bold text-[12px] tracking-wide leading-tight">AURA-SWARM X</p>
            <p className="text-slate-500 text-[10px]">Fleet Intelligence</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-3 px-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-2">Main</p>
          {NAV.slice(0, 6).map(({ label, icon: Icon }, i) => (
            <button key={label} onClick={() => setActiveNav(i)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-left transition-all text-[12px] font-medium
                ${activeNav === i ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/6 hover:text-slate-200"}`}>
              <Icon size={15} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-2 mt-2">Operations</p>
          {NAV.slice(6).map(({ label, icon: Icon }, i) => (
            <button key={label} onClick={() => setActiveNav(i + 6)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-left transition-all text-[12px] font-medium
                ${activeNav === i + 6 ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/6 hover:text-slate-200"}`}>
              <Icon size={15} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-white/8">
          <div className="flex items-center gap-2 px-2.5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-[10px] text-emerald-400 font-semibold">All systems nominal</span>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 flex-shrink-0">
          <button className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline">
            <ArrowLeft size={13} /> Fleet
          </button>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-blue-600 cursor-pointer hover:underline font-medium">Dashboard</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-blue-600 cursor-pointer hover:underline font-medium">Aircraft Registry</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-slate-700 font-semibold">A320-14</span>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative w-80">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </span>
              <input placeholder="Search components, faults, logs..." className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-blue-400 transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-slate-500"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center border-2 border-white">7</span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center cursor-pointer">CW</div>
          </div>
        </header>

        {/* Scrollable content + right sidebar */}
        <div className="flex-1 flex overflow-hidden">

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Section 1: Aircraft Header */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <Card className="p-6 overflow-hidden">
                <div className="flex items-stretch gap-6">

                  {/* Left: Silhouette */}
                  <div className="w-52 flex-shrink-0 bg-slate-950 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: "linear-gradient(rgba(37,99,235,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.4) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    <svg viewBox="0 0 200 80" className="w-44 drop-shadow-xl" style={{ filter: "drop-shadow(0 0 6px rgba(37,99,235,.5))" }}>
                      <ellipse cx="100" cy="40" rx="78" ry="14" fill="#2563EB" fillOpacity="0.7" />
                      <ellipse cx="36" cy="40" rx="14" ry="8" fill="#2563EB" fillOpacity="0.5" />
                      <rect x="60" y="54" width="55" height="12" rx="6" fill="#1D4ED8" fillOpacity="0.6" />
                      <rect x="60" y="14" width="55" height="12" rx="6" fill="#1D4ED8" fillOpacity="0.6" />
                      <rect x="72" y="58" width="28" height="8" rx="4" fill="#3B82F6" fillOpacity="0.7" />
                      <rect x="72" y="14" width="28" height="8" rx="4" fill="#3B82F6" fillOpacity="0.7" />
                      <ellipse cx="164" cy="40" rx="18" ry="9" fill="#1E40AF" fillOpacity="0.6" />
                    </svg>
                  </div>

                  {/* Middle: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{AIRCRAFT.id}</h1>
                        <p className="text-slate-500 text-sm mt-0.5">{AIRCRAFT.model}</p>
                      </div>
                      <span className={`mt-1 text-xs font-bold px-2.5 py-1 rounded-full border ${statusColor(AIRCRAFT.status)}`}>{AIRCRAFT.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      {[
                        { icon: MapPin, label: "Location", val: AIRCRAFT.location },
                        { icon: Layers, label: "Fleet", val: AIRCRAFT.fleet },
                        { icon: Clock, label: "Age", val: AIRCRAFT.age },
                        { icon: Activity, label: "Flight Hours", val: AIRCRAFT.flightHours },
                        { icon: RefreshCw, label: "Cycles", val: AIRCRAFT.flightCycles },
                        { icon: Wrench, label: "Last MX", val: AIRCRAFT.lastMaintenance },
                      ].map(({ icon: Icon, label, val }) => (
                        <div key={label} className="flex items-center gap-2">
                          <Icon size={13} className="text-slate-400 flex-shrink-0" />
                          <span className="text-xs text-slate-400">{label}:</span>
                          <span className="text-xs font-semibold text-slate-700 truncate">{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors">
                        <FileText size={13} /> Generate Report
                      </button>
                      <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors">
                        <Cpu size={13} /> Open Digital Twin
                      </button>
                    </div>
                  </div>

                  {/* Right: Health Gauge */}
                  <div className="w-52 flex-shrink-0 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="relative mb-2">
                      <CircularGauge value={AIRCRAFT.health} size={100} stroke={9} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold" style={{ color: healthColor(AIRCRAFT.health) }}>{AIRCRAFT.health}%</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Health</span>
                      </div>
                    </div>
                    <div className="w-full space-y-1.5 text-xs">
                      {[
                        { l: "RUL", v: `${AIRCRAFT.rul.toLocaleString()} hrs`, c: "text-slate-700" },
                        { l: "Failure Risk", v: `${AIRCRAFT.failureRisk}%`, c: "text-amber-600 font-bold" },
                        { l: "Updated", v: AIRCRAFT.lastUpdated, c: "text-slate-400" },
                      ].map(({ l, v, c }) => (
                        <div key={l} className="flex justify-between">
                          <span className="text-slate-400">{l}</span>
                          <span className={`${c} font-medium`}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Section 2: System Health Cards */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
              <SectionLabel label="System Health" />
              <div className="grid grid-cols-5 gap-3">
                {SYSTEMS.map((sys, i) => (
                  <motion.div key={sys.id} variants={fadeUp} custom={i * 0.5 + 1.5} initial="hidden" animate="visible">
                    <SystemCard sys={sys} onSelect={setActiveSystem} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Section 3: Aircraft Summary */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
              <SectionLabel label="Aircraft Summary" />
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Aircraft Information</p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Manufacturer", val: AIRCRAFT.manufacturer },
                      { label: "Serial Number", val: AIRCRAFT.serial },
                      { label: "Registration", val: AIRCRAFT.registration },
                      { label: "Owner / Operator", val: AIRCRAFT.owner },
                      { label: "Current Route", val: AIRCRAFT.currentRoute },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-xs text-slate-400">{label}</span>
                        <span className="text-xs font-semibold text-slate-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Operational Metrics</p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Fleet Utilization", val: AIRCRAFT.utilization },
                      { label: "Avg Daily Flights", val: AIRCRAFT.avgDailyFlights },
                      { label: "Carbon Score", val: AIRCRAFT.carbonScore },
                      { label: "Fleet Ranking", val: AIRCRAFT.fleetRanking },
                      { label: "Predicted Failure", val: AIRCRAFT.predictedFailureDate },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-xs text-slate-400">{label}</span>
                        <span className="text-xs font-semibold text-slate-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Section 4: Digital Twin Preview */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
              <SectionLabel label="Digital Twin Preview" />
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Interactive Aircraft Model</p>
                    <p className="text-xs text-slate-400 mt-0.5">Hover over systems to inspect health status</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors">
                      <PlayCircle size={13} /> Run Simulation
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-xl transition-colors">
                      <ExternalLink size={13} /> Full Digital Twin
                    </button>
                  </div>
                </div>
                <DigitalTwinPreview />
              </Card>
            </motion.div>

            {/* Section 5: Sensor Analytics */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
              <SectionLabel label="Sensor Analytics" />
              <div className="grid grid-cols-2 gap-4">
                <SensorChart title="Temperature Trend" data={SENSOR_DATA.temperature} color="#EF4444" unit="°C" threshold={520} />
                <SensorChart title="Pressure Trend" data={SENSOR_DATA.pressure} color="#3B82F6" unit="bar" threshold={25} />
                <SensorChart title="Vibration Trend" data={SENSOR_DATA.vibration} color="#F59E0B" unit="mm/s" threshold={4} />
                <SensorChart title="Fuel Efficiency" data={SENSOR_DATA.fuelEfficiency} color="#10B981" unit="%" />
              </div>
            </motion.div>

            {/* Section 6: Maintenance Timeline */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
              <SectionLabel label="Maintenance History" />
              <Card className="p-6">
                <MaintenanceTimeline onEventClick={setActiveTimeline} />
              </Card>
            </motion.div>

            {/* Section 7: Predictions */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6}>
              <SectionLabel label="AI Predictions" />
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Failure Probability", val: `${AIRCRAFT.failureRisk}%`, sub: "Next 30 days", color: "#F59E0B", icon: AlertTriangle },
                  { label: "Remaining Useful Life", val: `${AIRCRAFT.rul.toLocaleString()}h`, sub: "Hours remaining", color: "#2563EB", icon: Clock },
                  { label: "Predicted Failure", val: "18 Aug", sub: "2026", color: "#EF4444", icon: Calendar },
                  { label: "Confidence Score", val: `${AIRCRAFT.confidenceScore}%`, sub: "Model accuracy", color: "#10B981", icon: CheckCircle },
                ].map(({ label, val, sub, color, icon: Icon }, i) => (
                  <motion.div key={label} variants={fadeUp} custom={i * 0.3 + 6} initial="hidden" animate="visible">
                    <Card className="p-4 text-center">
                      <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: color + "18" }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                      <p className="text-2xl font-bold" style={{ color }}>{val}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                      <p className="text-xs font-semibold text-slate-600 mt-1">{label}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                  <Brain size={14} /> Open Decision Twin
                </button>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                  <ClipboardList size={14} /> Generate Work Order
                </button>
              </div>
            </motion.div>

            {/* Section 8: Quick Actions */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={7}>
              <SectionLabel label="Quick Actions" />
              <Card className="p-4">
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Open Digital Twin", icon: Cpu, style: "bg-blue-600 hover:bg-blue-700 text-white" },
                    { label: "Run Prediction", icon: Activity, style: "bg-purple-600 hover:bg-purple-700 text-white" },
                    { label: "Generate Work Order", icon: ClipboardList, style: "bg-emerald-600 hover:bg-emerald-700 text-white" },
                    { label: "Schedule Maintenance", icon: Calendar, style: "bg-amber-500 hover:bg-amber-600 text-white" },
                    { label: "Generate Report", icon: FileText, style: "bg-slate-100 hover:bg-slate-200 text-slate-700" },
                  ].map(({ label, icon: Icon, style }) => (
                    <button key={label} className={`flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors ${style}`}>
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Section 9: AI Assistant */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={8}>
              <SectionLabel label="AI Assistant" />
              <AIAssistant />
            </motion.div>

            <div className="h-6" />
          </div>

          {/* Right Sidebar: Insights */}
          <aside className="w-72 flex-shrink-0 overflow-y-auto p-4 border-l border-slate-200 bg-white space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 py-2">Aircraft Insights</p>
            <InsightSidebar />
          </aside>
        </div>
      </div>

      {/* Component Drawer */}
      <ComponentDrawer sys={activeSystem} onClose={() => setActiveSystem(null)} />

      {/* Maintenance Modal */}
      <MaintenanceModal ev={activeTimeline} onClose={() => setActiveTimeline(null)} />
    </div>
  );
}
