import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench, Calendar, ClipboardList, Users, Package, BarChart2,
  Cpu, Play, ChevronRight, ChevronDown, ChevronLeft, AlertTriangle,
  CheckCircle, Clock, Zap, Settings, RefreshCw, FileText, Bell,
  Star, Shield, TrendingUp, TrendingDown, Activity, Filter,
  Download, PlusCircle, X, Info, ArrowRight, Layers, Database,
  User, Radio, Truck, Hash, AlertCircle, Timer,
  LayoutGrid, List, ChevronUp, Circle, Minus, Plus, Eye
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, Cell
} from "recharts";

// ── PALETTE & TOKENS ────────────────────────────────────────────────────────
const C = {
  blue: "#2563EB",
  indigo: "#4F46E5",
  emerald: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  violet: "#7C3AED",
  slate: "#64748B",
};

// ── DATA ────────────────────────────────────────────────────────────────────

const WORK_ORDERS = [
  { id: "WO-4471", aircraft: "A320-14", task: "Engine borescope inspection", priority: "high", status: "In Progress", deadline: "2026-06-19", tech: "R. Sharma", hours: 6, hangar: "H-3" },
  { id: "WO-4472", aircraft: "B737-22", task: "Hydraulic system seal replacement", priority: "urgent", status: "Pending", deadline: "2026-06-18", tech: "A. Kumar", hours: 8, hangar: "H-1" },
  { id: "WO-4473", aircraft: "A350-07", task: "Scheduled 6000-cycle inspection", priority: "normal", status: "Scheduled", deadline: "2026-06-21", tech: "S. Patel", hours: 14, hangar: "H-2" },
  { id: "WO-4474", aircraft: "B787-31", task: "Landing gear actuator overhaul", priority: "high", status: "In Progress", deadline: "2026-06-20", tech: "M. Nair", hours: 10, hangar: "H-4" },
  { id: "WO-4475", aircraft: "A321-08", task: "APU compressor wash & inspection", priority: "normal", status: "Completed", deadline: "2026-06-17", tech: "V. Reddy", hours: 3, hangar: "H-1" },
  { id: "WO-4476", aircraft: "ATR-72-09", task: "Propeller blade NDT check", priority: "high", status: "Delayed", deadline: "2026-06-18", tech: "D. Singh", hours: 5, hangar: "H-2" },
  { id: "WO-4477", aircraft: "E190-03", task: "Avionics bay cleaning & seal", priority: "normal", status: "Pending", deadline: "2026-06-22", tech: "Unassigned", hours: 4, hangar: "H-3" },
  { id: "WO-4478", aircraft: "A320-22", task: "Emergency hydraulic return line repair", priority: "urgent", status: "In Progress", deadline: "2026-06-18", tech: "R. Sharma", hours: 7, hangar: "H-1" },
];

const TECHNICIANS = [
  { id: "T1", name: "Rahul Sharma", role: "Senior AME", skill: "Engine & Hydraulic", level: 5, tasks: 2, available: false, efficiency: 96, avatar: "RS", color: "#2563EB" },
  { id: "T2", name: "Anil Kumar", role: "AME Grade-A", skill: "Hydraulic Systems", level: 4, tasks: 1, available: true, efficiency: 89, avatar: "AK", color: "#7C3AED" },
  { id: "T3", name: "Suresh Patel", role: "Senior AME", skill: "Structural & NDT", level: 5, tasks: 1, available: true, efficiency: 93, avatar: "SP", color: "#0891B2" },
  { id: "T4", name: "Meera Nair", role: "AME Grade-B", skill: "Landing Gear", level: 3, tasks: 1, available: false, efficiency: 82, avatar: "MN", color: "#047857" },
  { id: "T5", name: "Vikram Reddy", role: "AME Grade-A", skill: "Avionics & APU", level: 4, tasks: 0, available: true, efficiency: 91, avatar: "VR", color: "#B45309" },
  { id: "T6", name: "Deepak Singh", role: "AME Grade-B", skill: "Propellers & NDT", level: 3, tasks: 1, available: false, efficiency: 78, avatar: "DS", color: "#DC2626" },
];

const PARTS = [
  { id: "P1", name: "Hydraulic Seal Kit A320", category: "Hydraulic", stock: 3, min: 5, supplier: "Parker Hannifin", lead: "3 days", criticality: "critical", unit: "sets" },
  { id: "P2", name: "CFM56 Fan Blade", category: "Engine", stock: 2, min: 2, supplier: "CFM International", lead: "7 days", criticality: "critical", unit: "units" },
  { id: "P3", name: "Proximity Sensor MLG", category: "Landing Gear", stock: 8, min: 4, supplier: "Safran Landing", lead: "5 days", criticality: "high", unit: "units" },
  { id: "P4", name: "APU Fuel Control Valve", category: "APU", stock: 1, min: 2, supplier: "Honeywell", lead: "10 days", criticality: "critical", unit: "units" },
  { id: "P5", name: "Pitot-Static Tube Assy", category: "Avionics", stock: 12, min: 4, supplier: "Thales Group", lead: "2 days", criticality: "normal", unit: "units" },
  { id: "P6", name: "O-Ring Set (MIL-SPEC)", category: "Structural", stock: 45, min: 20, supplier: "Trelleborg", lead: "1 day", criticality: "normal", unit: "packs" },
  { id: "P7", name: "Bleed Air Pressure Reg.", category: "Engine", stock: 0, min: 1, supplier: "Liebherr Aerosp.", lead: "14 days", criticality: "critical", unit: "units" },
  { id: "P8", name: "Carbon Brake Assembly", category: "Landing Gear", stock: 6, min: 4, supplier: "Messier-Bugatti", lead: "4 days", criticality: "high", unit: "units" },
];

const RESOURCES = [
  { label: "Engineers", available: 4, total: 6, icon: User, color: C.blue },
  { label: "Technicians", available: 2, total: 8, icon: Wrench, color: C.violet },
  { label: "Hangars", available: 2, total: 4, icon: LayoutGrid, color: C.emerald },
  { label: "Tool Sets", available: 5, total: 8, icon: Settings, color: C.amber },
];

const GANTT_ROWS = [
  { aircraft: "A320-14", task: "Engine Borescope", start: 1, duration: 3, color: C.blue, status: "active" },
  { aircraft: "B737-22", task: "Hydraulic Repair", start: 0, duration: 2, color: C.red, status: "urgent" },
  { aircraft: "A350-07", task: "6000-Cycle Insp.", start: 3, duration: 5, color: C.indigo, status: "planned" },
  { aircraft: "B787-31", task: "LG Actuator OH", start: 2, duration: 4, color: C.amber, status: "active" },
  { aircraft: "A321-08", task: "APU Compressor", start: 0, duration: 1, color: C.emerald, status: "done" },
  { aircraft: "ATR-72-09", task: "Propeller NDT", start: 1, duration: 2, color: C.red, status: "delayed" },
];
const GANTT_DAYS = ["Jun 18", "Jun 19", "Jun 20", "Jun 21", "Jun 22", "Jun 23", "Jun 24"];

const CALENDAR_EVENTS = {
  18: [{ type: "urgent", label: "Hyd. Repair B737" }, { type: "active", label: "Engine Insp. A320" }],
  19: [{ type: "active", label: "Engine Insp. A320" }, { type: "planned", label: "A321 APU" }],
  20: [{ type: "planned", label: "LG OH B787" }, { type: "urgent", label: "ATR NDT" }],
  21: [{ type: "planned", label: "A350 Inspection" }],
  22: [{ type: "planned", label: "E190 Avionics" }],
  24: [{ type: "planned", label: "A350 Inspection" }],
  25: [{ type: "planned", label: "A350 Inspection" }],
};

const AI_SUGGESTIONS = [
  { id: 1, type: "optimize", icon: TrendingDown, color: C.emerald, title: "Reschedule A320 borescope to Jun 20", detail: "Moves WO-4471 out of hangar H-3 conflict, saving 14% overlap downtime. Frees R. Sharma for WO-4478 completion.", saving: "14% downtime" },
  { id: 2, type: "resource", icon: Users, color: C.blue, title: "Auto-assign Vikram Reddy to WO-4477", detail: "V. Reddy is idle with 91% efficiency score. Avionics task matches his skill profile exactly.", saving: "1 idle shift" },
  { id: 3, type: "parts", icon: Package, color: C.amber, title: "Expedite hydraulic seal kit order", detail: "Stock at 3 sets vs. 5-set minimum. Two open WOs need this part. Lead time: 3 days. Order now to avoid delay.", saving: "Risk: WO delay" },
  { id: 4, type: "sequence", icon: Layers, color: C.violet, title: "Merge A320-14 and A320-22 hangar slots", detail: "Both A320 variants share the same OEM documentation and tooling. Running in parallel saves 22% total hangar time.", saving: "22% hangar time" },
];

const DOWNTIME_DATA = [
  { day: "Mon", planned: 18, actual: 22 },
  { day: "Tue", planned: 14, actual: 14 },
  { day: "Wed", planned: 20, actual: 16 },
  { day: "Thu", planned: 12, actual: 18 },
  { day: "Fri", planned: 16, actual: 13 },
  { day: "Sat", planned: 8, actual: 9 },
  { day: "Sun", planned: 6, actual: 6 },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  "In Progress": { color: "text-blue-700", bg: "bg-blue-100", border: "border-blue-200", dot: "bg-blue-500" },
  "Pending": { color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200", dot: "bg-amber-400" },
  "Scheduled": { color: "text-indigo-700", bg: "bg-indigo-100", border: "border-indigo-200", dot: "bg-indigo-400" },
  "Completed": { color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200", dot: "bg-emerald-400" },
  "Delayed": { color: "text-red-700", bg: "bg-red-100", border: "border-red-200", dot: "bg-red-500" },
};
const PRIORITY_CONFIG = {
  urgent: { label: "URGENT", color: "text-red-700", bg: "bg-red-100", border: "border-red-200" },
  high: { label: "HIGH", color: "text-orange-700", bg: "bg-orange-100", border: "border-orange-200" },
  normal: { label: "NORMAL", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
};
const GANTT_STATUS = {
  urgent: "bg-red-500",
  active: "bg-blue-500",
  planned: "bg-indigo-400",
  done: "bg-emerald-400",
  delayed: "bg-red-400",
};
const CAL_TYPE = {
  urgent: "bg-red-500",
  active: "bg-blue-500",
  planned: "bg-indigo-400",
  done: "bg-emerald-400",
};

function GlassCard({ children, className = "", hover = false, onClick }) {
  return (
    <div onClick={onClick}
      className={`bg-white/70 backdrop-blur-md border border-white/65 rounded-2xl shadow-sm ${hover ? "hover:shadow-md hover:bg-white/85 cursor-pointer transition-all duration-200" : ""} ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, sub, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-blue-600" />
        <div>
          <h2 className="font-bold text-sm text-slate-800 leading-tight">{title}</h2>
          {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const p = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;
  return (
    <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full border ${p.color} ${p.bg} ${p.border}`}>
      {p.label}
    </span>
  );
}

function PulsingDot({ color = "bg-emerald-400" }) {
  return (
    <span className="relative flex h-2 w-2">
      <motion.span animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }} transition={{ repeat: Infinity, duration: 2 }}
        className={`absolute inline-flex h-full w-full rounded-full ${color}`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}

// ── WORK ORDER MODAL ─────────────────────────────────────────────────────────
function WOModal({ wo, onClose }) {
  if (!wo) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black tracking-widest text-blue-600">{wo.id}</span>
              <PriorityBadge priority={wo.priority} />
              <StatusBadge status={wo.status} />
            </div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">{wo.task}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={16} className="text-slate-500" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: "Aircraft", value: wo.aircraft },
            { label: "Technician", value: wo.tech },
            { label: "Hangar", value: wo.hangar },
            { label: "Est. Hours", value: `${wo.hours}h` },
            { label: "Deadline", value: wo.deadline },
            { label: "Status", value: wo.status },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">{label}</div>
              <div className="text-sm font-bold text-slate-800">{value}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">Assign Technician</button>
          <button className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">Mark In Progress</button>
          <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── CALENDAR ─────────────────────────────────────────────────────────────────
function CalendarView({ onDayClick }) {
  const [month] = useState({ year: 2026, month: 5 }); // June 2026
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDay = new Date(month.year, month.month, 1).getDay();
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const today = 18;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button className="p-1 rounded-lg hover:bg-slate-100 transition-colors"><ChevronLeft size={14} className="text-slate-500" /></button>
        <span className="text-sm font-bold text-slate-800">June 2026</span>
        <button className="p-1 rounded-lg hover:bg-slate-100 transition-colors"><ChevronRight size={14} className="text-slate-500" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {days.map(d => <div key={d} className="text-center text-[9px] font-bold text-slate-400 uppercase py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const events = CALENDAR_EVENTS[day] || [];
          const isToday = day === today;
          const isPast = day < today;
          return (
            <motion.div key={day} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => events.length && onDayClick(day, events)}
              className={`min-h-[52px] rounded-xl p-1.5 border transition-all cursor-pointer
                ${isToday ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-500/25" :
                  events.length ? "bg-white/80 border-blue-200 hover:border-blue-400 hover:shadow-sm" :
                    isPast ? "bg-slate-50/50 border-slate-100" : "bg-white/50 border-white/80 hover:bg-white/80"}`}>
              <div className={`text-[10px] font-black mb-1 ${isToday ? "text-white" : isPast ? "text-slate-400" : "text-slate-700"}`}>{day}</div>
              <div className="space-y-0.5">
                {events.slice(0, 2).map((ev, ei) => (
                  <div key={ei} className={`text-[8px] font-bold px-1 py-0.5 rounded text-white truncate ${CAL_TYPE[ev.type] || "bg-blue-400"}`}>
                    {ev.label}
                  </div>
                ))}
                {events.length > 2 && <div className="text-[8px] text-slate-400 pl-1">+{events.length - 2}</div>}
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {[
          { color: "bg-red-500", label: "Urgent" },
          { color: "bg-blue-500", label: "Active" },
          { color: "bg-indigo-400", label: "Planned" },
          { color: "bg-emerald-400", label: "Done" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GANTT ────────────────────────────────────────────────────────────────────
function GanttChart() {
  const total = GANTT_DAYS.length;
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 560 }}>
        {/* Header */}
        <div className="grid mb-2" style={{ gridTemplateColumns: "140px 1fr" }}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-2">Aircraft / Task</div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
            {GANTT_DAYS.map(d => (
              <div key={d} className="text-center text-[9px] font-bold text-slate-400 border-l border-slate-200 pl-1 truncate">{d}</div>
            ))}
          </div>
        </div>
        {/* Rows */}
        <div className="space-y-1.5">
          {GANTT_ROWS.map((row, ri) => (
            <motion.div key={ri} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: ri * 0.07 + 0.2 }}
              className="grid items-center rounded-lg overflow-hidden hover:bg-white/60 transition-colors"
              style={{ gridTemplateColumns: "140px 1fr" }}>
              <div className="px-2 py-1.5">
                <div className="text-xs font-bold text-slate-800 truncate">{row.aircraft}</div>
                <div className="text-[9px] text-slate-400 truncate">{row.task}</div>
              </div>
              <div className="relative grid h-8" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
                {/* Grid lines */}
                {GANTT_DAYS.map((_, di) => (
                  <div key={di} className="border-l border-slate-100 h-full" />
                ))}
                {/* Bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: ri * 0.07 + 0.4, duration: 0.5, ease: "easeOut" }}
                  className="absolute top-1 bottom-1 rounded-md flex items-center px-2 origin-left"
                  style={{
                    left: `${(row.start / total) * 100}%`,
                    width: `${(row.duration / total) * 100}%`,
                    background: row.color + "dd",
                  }}>
                  <span className="text-[9px] font-bold text-white truncate">{row.task}</span>
                  {row.status === "delayed" && <AlertTriangle size={9} className="text-white ml-1 shrink-0" />}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function MaintenancePlannerPage() {
  const [selectedWO, setSelectedWO] = useState(null);
  const [expandedWO, setExpandedWO] = useState(null);
  const [calModal, setCalModal] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [techAssigned, setTechAssigned] = useState({});
  const [aiRunning, setAiRunning] = useState(false);
  const [aiDone, setAiDone] = useState(true);
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());
  const [activeTab, setActiveTab] = useState("list");

  const runAI = () => {
    setAiRunning(true);
    setAiDone(false);
    setTimeout(() => { setAiRunning(false); setAiDone(true); }, 2000);
  };

  const applySuggestion = (id) => {
    setAppliedSuggestions(prev => new Set([...prev, id]));
  };

  const urgentCount = WORK_ORDERS.filter(w => w.priority === "urgent").length;
  const activeCount = WORK_ORDERS.filter(w => w.status === "In Progress").length;
  const pendingCount = WORK_ORDERS.filter(w => w.status === "Pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-100/70 font-sans text-slate-800">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute top-1/2 -right-52 w-[440px] h-[440px] rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-teal-200/15 blur-3xl" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-4 py-5 space-y-5">

        {/* ── SECTION 1: HEADER ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <GlassCard className="px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Wrench size={22} className="text-white" />
                  </div>
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }} transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black tracking-[0.18em] text-blue-600">AURA-SWARM X</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                      OPERATIONS MODE ACTIVE
                    </span>
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">Maintenance Planner</h1>
                  <p className="text-xs text-slate-500 mt-0.5">AI-optimized maintenance scheduling and execution system</p>
                </div>
              </div>

              {/* KPIs */}
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Active Work Orders", value: activeCount, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50 border-blue-200", sub: "in progress" },
                  { label: "Under Maintenance", value: "4", icon: Wrench, color: "text-violet-600", bg: "bg-violet-50 border-violet-200", sub: "aircraft" },
                  { label: "Upcoming (72h)", value: pendingCount + 3, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", sub: "tasks" },
                  { label: "Downtime Reduced", value: "18%", icon: TrendingDown, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", sub: "vs last week" },
                ].map((k) => (
                  <div key={k.label} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${k.bg}`}>
                    <k.icon size={16} className={k.color} />
                    <div>
                      <div className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">{k.label}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-900">{k.value}</span>
                        <span className="text-[10px] text-slate-400">{k.sub}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {urgentCount > 0 && (
                  <motion.div animate={{ opacity: [1, 0.6, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200">
                    <AlertTriangle size={16} className="text-red-600" />
                    <div>
                      <div className="text-[9px] text-red-400 font-medium uppercase tracking-wide">Urgent</div>
                      <div className="text-xl font-black text-red-700">{urgentCount}</div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ── ROW 1: CALENDAR + WORK ORDERS ─────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-5">

          {/* SECTION 2: CALENDAR */}
          <motion.div className="col-span-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="p-4">
              <SectionHeader icon={Calendar} title="Maintenance Calendar" sub="Click a day to view work orders" />
              <CalendarView onDayClick={(day, events) => setCalModal({ day, events })} />
            </GlassCard>
          </motion.div>

          {/* SECTION 3: WORK ORDER LIST */}
          <motion.div className="col-span-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <GlassCard className="p-4">
              <SectionHeader
                icon={ClipboardList}
                title="Work Orders"
                sub={`${WORK_ORDERS.length} total · ${urgentCount} urgent`}
                right={
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg bg-white/70 border border-white/80 hover:bg-white/90 transition-colors">
                      <Filter size={12} className="text-slate-500" />
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
                      <PlusCircle size={12} /> New WO
                    </button>
                  </div>
                }
              />
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {WORK_ORDERS.map((wo, i) => {
                  const isExpanded = expandedWO === wo.id;
                  return (
                    <motion.div key={wo.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.2 }}>
                      <div
                        onClick={() => setExpandedWO(isExpanded ? null : wo.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200
                          ${isExpanded ? "bg-blue-50/80 border-blue-200 shadow-sm" : "bg-white/60 border-white/80 hover:bg-white/85 hover:shadow-sm"}
                          ${wo.priority === "urgent" ? "border-l-4 border-l-red-500" : wo.priority === "high" ? "border-l-4 border-l-orange-400" : ""}`}>
                        <div className="shrink-0">
                          <div className="text-[10px] font-mono font-bold text-slate-500">{wo.id}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{wo.task}</div>
                          <div className="text-[10px] text-slate-400">{wo.aircraft} · {wo.tech} · {wo.hangar}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <PriorityBadge priority={wo.priority} />
                          <StatusBadge status={wo.status} />
                          <span className="text-[10px] text-slate-400 hidden lg:block">{wo.deadline}</span>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedWO(wo); }}
                            className="p-1 rounded-lg hover:bg-blue-100 transition-colors">
                            <Eye size={12} className="text-blue-500" />
                          </button>
                          {isExpanded ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
                        </div>
                      </div>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <div className="mx-2 mb-1 p-3 rounded-b-xl bg-blue-50/60 border border-t-0 border-blue-200 grid grid-cols-4 gap-3 text-xs">
                              {[
                                { l: "Hangar", v: wo.hangar },
                                { l: "Est. Hours", v: `${wo.hours}h` },
                                { l: "Technician", v: wo.tech },
                                { l: "Deadline", v: wo.deadline },
                              ].map(({ l, v }) => (
                                <div key={l}>
                                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{l}</div>
                                  <div className="font-bold text-slate-700 mt-0.5">{v}</div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* ── ROW 2: RESOURCES + TECHNICIANS + PARTS ────────────────────────── */}
        <div className="grid grid-cols-12 gap-5">

          {/* SECTION 4: RESOURCE ALLOCATION */}
          <motion.div className="col-span-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-4 h-full">
              <SectionHeader icon={LayoutGrid} title="Resource Allocation" sub="Drag to assign" />
              <div className="space-y-3 mb-4">
                {RESOURCES.map((r, i) => {
                  const pct = Math.round((r.available / r.total) * 100);
                  const Icon = r.icon;
                  return (
                    <div key={r.label} className="p-3 rounded-xl bg-white/70 border border-white/80">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon size={13} style={{ color: r.color }} />
                          <span className="text-xs font-bold text-slate-700">{r.label}</span>
                        </div>
                        <span className="text-xs font-black text-slate-800">{r.available}<span className="text-slate-400 font-normal">/{r.total}</span></span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ delay: i * 0.1 + 0.4, duration: 0.6 }}
                          className="h-full rounded-full" style={{ background: r.color }} />
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1">{r.available} available</div>
                    </div>
                  );
                })}
              </div>
              {/* Downtime chart */}
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Weekly Downtime (hrs)</div>
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={DOWNTIME_DATA} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94A3B8" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                  <Bar dataKey="planned" fill="#2563EB" opacity={0.5} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="actual" fill="#EF4444" opacity={0.7} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-3 mt-1.5">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 opacity-50" /><span className="text-[9px] text-slate-400">Planned</span></div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 opacity-70" /><span className="text-[9px] text-slate-400">Actual</span></div>
              </div>
            </GlassCard>
          </motion.div>

          {/* SECTION 5: TECHNICIAN BOARD */}
          <motion.div className="col-span-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard className="p-4 h-full">
              <SectionHeader icon={Users} title="Technician Board" sub="Click to assign · drag to reorder" />
              <div className="grid grid-cols-2 gap-2.5">
                {TECHNICIANS.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 + 0.3 }}
                    draggable
                    onDragStart={() => setDragOver(t.id)}
                    onDragEnd={() => setDragOver(null)}
                    className={`p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-200
                      ${dragOver === t.id ? "shadow-lg scale-105 bg-blue-50 border-blue-300" : "bg-white/65 border-white/80 hover:shadow-sm hover:bg-white/85"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ background: t.color }}>
                        {t.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{t.name}</div>
                        <div className="text-[9px] text-slate-400 truncate">{t.role}</div>
                      </div>
                      <div className={`ml-auto w-2 h-2 rounded-full shrink-0 ${t.available ? "bg-emerald-400" : "bg-amber-400"}`} />
                    </div>
                    <div className="text-[9px] text-slate-500 mb-2 truncate">{t.skill}</div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star key={si} size={9} className={si < t.level ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                        ))}
                      </div>
                      <span className="text-[9px] font-bold text-slate-600">{t.tasks} task{t.tasks !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${t.efficiency}%` }}
                          transition={{ delay: i * 0.06 + 0.5, duration: 0.5 }}
                          className="h-full rounded-full" style={{ background: t.color }} />
                      </div>
                      <span className="text-[9px] font-black" style={{ color: t.color }}>{t.efficiency}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Drop zone */}
              <motion.div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => setDragOver(null)}
                className={`mt-3 h-10 rounded-xl border-2 border-dashed flex items-center justify-center transition-all duration-200
                  ${dragOver ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-transparent"}`}>
                <span className={`text-xs font-medium ${dragOver ? "text-blue-600" : "text-slate-300"}`}>
                  {dragOver ? "Drop to assign to selected work order" : "Drag technician here to assign"}
                </span>
              </motion.div>
            </GlassCard>
          </motion.div>

          {/* SECTION 6: SPARE PARTS */}
          <motion.div className="col-span-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-4 h-full">
              <SectionHeader
                icon={Package}
                title="Spare Parts Inventory"
                sub={`${PARTS.filter(p => p.stock <= p.min).length} items need reorder`}
                right={<button className="p-1.5 rounded-lg bg-white/70 border border-white/80 hover:bg-white/90 transition-colors"><RefreshCw size={11} className="text-slate-500" /></button>}
              />
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {PARTS.map((p, i) => {
                  const low = p.stock <= p.min;
                  const out = p.stock === 0;
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.3 }}
                      className={`p-2.5 rounded-xl border transition-colors hover:shadow-sm
                        ${out ? "bg-red-50/80 border-red-200" : low ? "bg-amber-50/80 border-amber-200" : "bg-white/65 border-white/80"}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800 leading-tight">{p.name}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0
                          ${p.criticality === "critical" ? "bg-red-100 text-red-700 border border-red-200" :
                            p.criticality === "high" ? "bg-orange-100 text-orange-700 border border-orange-200" :
                              "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                          {p.criticality.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-3">
                          <span className={`font-black ${out ? "text-red-600" : low ? "text-amber-600" : "text-emerald-600"}`}>
                            {out ? "OUT OF STOCK" : `${p.stock} ${p.unit}`}
                          </span>
                          <span className="text-slate-400">{p.supplier}</span>
                        </div>
                        <span className="text-slate-400">Lead: {p.lead}</span>
                      </div>
                      {(low || out) && (
                        <div className="mt-1.5">
                          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${out ? "bg-red-500" : "bg-amber-400"}`}
                              style={{ width: out ? "5%" : `${(p.stock / p.min) * 60}%` }} />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* ── ROW 3: GANTT + AI PANEL ───────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-5">

          {/* SECTION 7: GANTT TIMELINE */}
          <motion.div className="col-span-7" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <GlassCard className="p-4">
              <SectionHeader
                icon={BarChart2}
                title="Maintenance Timeline"
                sub="Jun 18–24, 2026 · click bars to expand"
                right={
                  <div className="flex gap-1.5">
                    {["urgent", "active", "planned", "done", "delayed"].map(s => (
                      <div key={s} className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${GANTT_STATUS[s]}`} />
                        <span className="text-[9px] text-slate-400 capitalize">{s}</span>
                      </div>
                    ))}
                  </div>
                }
              />
              <GanttChart />
            </GlassCard>
          </motion.div>

          {/* SECTION 8: AI OPTIMIZATION */}
          <motion.div className="col-span-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard className="p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu size={15} className="text-indigo-600" />
                  <div>
                    <h2 className="font-bold text-sm text-slate-800">AI Optimization</h2>
                    <p className="text-[10px] text-slate-400">Schedule · resource · cost intelligence</p>
                  </div>
                </div>
                <button onClick={runAI}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors">
                  {aiRunning ? <RefreshCw size={11} className="animate-spin" /> : <Play size={11} />}
                  {aiRunning ? "Running…" : "Re-run AI"}
                </button>
              </div>

              <div className="space-y-2.5">
                {AI_SUGGESTIONS.map((s, i) => {
                  const Icon = s.icon;
                  const applied = appliedSuggestions.has(s.id);
                  return (
                    <motion.div key={s.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.4 }}
                      className={`p-3 rounded-xl border transition-all duration-200
                        ${applied ? "bg-emerald-50/80 border-emerald-200" : "bg-white/65 border-white/80 hover:shadow-sm"}`}>
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: (applied ? "#10B981" : s.color) + "18" }}>
                          {applied ? <CheckCircle size={14} className="text-emerald-600" /> : <Icon size={14} style={{ color: s.color }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <span className="text-xs font-bold text-slate-800 leading-tight">{s.title}</span>
                            <span className="text-[9px] font-black shrink-0 px-1.5 py-0.5 rounded-full"
                              style={{ color: s.color, background: s.color + "15" }}>
                              {s.saving}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed mb-2">{s.detail}</p>
                          {!applied ? (
                            <button onClick={() => applySuggestion(s.id)}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-white transition-colors hover:opacity-90"
                              style={{ background: s.color }}>
                              Apply suggestion
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600">✓ Applied</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {aiRunning && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw size={12} className="text-indigo-600 animate-spin" />
                    <span className="text-xs font-bold text-indigo-700">Recalculating optimal schedule…</span>
                  </div>
                  {["Parsing 8 work orders", "Checking technician availability", "Optimizing hangar allocation"].map((step, si) => (
                    <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: si * 0.35 }}
                      className="flex items-center gap-1.5 text-[10px] text-indigo-600 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {step}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* ── SECTION 9: ACTION PANEL ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <GlassCard className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 mr-2">
                <Play size={14} className="text-blue-600" />
                <span className="text-sm font-bold text-slate-800">Actions</span>
              </div>
              {[
                { label: "Generate Work Order", icon: PlusCircle, color: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25" },
                { label: "Optimize Schedule", icon: Cpu, color: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25" },
                { label: "Auto-Assign Resources", icon: Users, color: "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/25" },
                { label: "Export Plan", icon: Download, color: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25" },
                { label: "Send Engineer Alerts", icon: Bell, color: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25" },
              ].map((btn) => {
                const BtnIcon = btn.icon;
                return (
                  <motion.button key={btn.label} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-colors ${btn.color}`}>
                    <BtnIcon size={14} />
                    {btn.label}
                  </motion.button>
                );
              })}
              <div className="ml-auto flex items-center gap-2">
                <PulsingDot color="bg-emerald-400" />
                <span className="text-[10px] text-slate-500 font-medium">All systems operational · Last sync 30s ago</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Footer */}
        <div className="text-center pb-4 flex items-center justify-center gap-3 text-[10px] text-slate-400">
          <span>AURA-SWARM X · Maintenance Planner v2.4.1</span>
          <span>·</span>
          <span>June 2026 · {WORK_ORDERS.length} work orders</span>
          <span>·</span>
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
            className="text-emerald-500 font-bold">● OPERATIONS LIVE</motion.span>
        </div>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedWO && <WOModal wo={selectedWO} onClose={() => setSelectedWO(null)} />}
      </AnimatePresence>

      {/* Calendar Day Modal */}
      <AnimatePresence>
        {calModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setCalModal(null)}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-5"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">June {calModal.day}, 2026</h3>
                <button onClick={() => setCalModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={14} className="text-slate-500" />
                </button>
              </div>
              <div className="space-y-2">
                {calModal.events.map((ev, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${CAL_TYPE[ev.type] === "bg-red-500" ? "bg-red-50 border-red-200" : CAL_TYPE[ev.type] === "bg-blue-500" ? "bg-blue-50 border-blue-200" : "bg-indigo-50 border-indigo-200"}`}>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${CAL_TYPE[ev.type] || "bg-blue-400"}`} />
                    <span className="text-sm font-semibold text-slate-800">{ev.label}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setCalModal(null)}
                className="mt-4 w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
                View Work Orders
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
