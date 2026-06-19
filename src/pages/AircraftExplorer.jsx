import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Activity, TriangleAlert, AlertOctagon, Search,
  ChevronDown, LayoutGrid, Table2, Bell, Settings, Download,
  FileText, Plus, ChevronLeft, ChevronRight, Eye, Cpu,
  Zap, Filter, ArrowUpDown, MapPin, Clock, Gauge,
  PanelRightClose, PanelRightOpen, MoreVertical, X
} from "lucide-react";

// ── DATA ────────────────────────────────────────────────────────────────────

const NAV_MAIN = [
  { label: "Dashboard", active: false },
  { label: "Fleet Overview", active: false },
  { label: "Aircraft Registry", active: true },
  { label: "Digital Twin", active: false },
  { label: "Predictive Maintenance", active: false },
  { label: "Decision Twin", active: false },
];
const NAV_OPS = [
  "Maintenance Planner", "Fleet Intelligence", "Knowledge Brain",
  "Material Intelligence", "Sustainability",
];

const AIRCRAFT = [
  { id: "A320-14", model: "Airbus A320", type: "A320", location: "Delhi Hub", health: 72, status: "Warning", rul: 1200, lastMaint: "15 Days Ago", failProb: 12 },
  { id: "A350-07", model: "Airbus A350", type: "A350", location: "Mumbai Hub", health: 94, status: "Healthy", rul: 2800, lastMaint: "3 Days Ago", failProb: 3 },
  { id: "B737-22", model: "Boeing 737", type: "B737", location: "Bangalore Hub", health: 41, status: "Critical", rul: 320, lastMaint: "48 Days Ago", failProb: 67 },
  { id: "B787-03", model: "Boeing 787", type: "B787", location: "Chennai Hub", health: 88, status: "Healthy", rul: 3100, lastMaint: "7 Days Ago", failProb: 5 },
  { id: "A320-09", model: "Airbus A320", type: "A320", location: "Hyderabad Hub", health: 61, status: "Warning", rul: 870, lastMaint: "22 Days Ago", failProb: 28 },
  { id: "CARGO-11", model: "Cargo Freighter", type: "Cargo", location: "Delhi Hub", health: 83, status: "Healthy", rul: 1950, lastMaint: "10 Days Ago", failProb: 8 },
  { id: "A350-15", model: "Airbus A350", type: "A350", location: "Kolkata Hub", health: 96, status: "Healthy", rul: 4200, lastMaint: "1 Day Ago", failProb: 2 },
  { id: "B737-08", model: "Boeing 737", type: "B737", location: "Pune Hub", health: 55, status: "Warning", rul: 640, lastMaint: "31 Days Ago", failProb: 41 },
  { id: "HELI-04", model: "Bell 412", type: "Helicopter", location: "Offshore DP3", health: 78, status: "Warning", rul: 480, lastMaint: "18 Days Ago", failProb: 19 },
];

const statusColor = (s) => ({
  Healthy: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
  Warning: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  Critical: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", border: "border-red-200" },
  Maintenance: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", border: "border-purple-200" },
}[s] || {});

const healthBar = (h) =>
  h >= 80 ? "bg-emerald-500" : h >= 50 ? "bg-amber-500" : "bg-red-500";

// ── SIDEBAR ─────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-[228px] bg-[#0F172A] flex flex-col z-30 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-[60px] border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
          <Plane size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white text-[13px] font-semibold leading-none">AURA-SWARM X</p>
          <p className="text-slate-400 text-[11px] mt-0.5">Fleet Intelligence Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-slate-500 text-[10px] font-semibold tracking-widest uppercase px-3 mb-2">Main</p>
        {NAV_MAIN.map(({ label, active }) => (
          <button
            key={label}
            className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] mb-0.5 transition-colors ${
              active
                ? "bg-[#2563EB] text-white font-medium"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}

        <p className="text-slate-500 text-[10px] font-semibold tracking-widest uppercase px-3 mb-2 mt-5">Operations</p>
        {NAV_OPS.map((label) => (
          <button
            key={label}
            className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] mb-0.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            {label}
          </button>
        ))}

        <p className="text-slate-500 text-[10px] font-semibold tracking-widest uppercase px-3 mb-2 mt-5">Config</p>
        <button className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
          Settings
        </button>
      </nav>

      {/* Status */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 text-[12px]">All systems nominal</span>
        </div>
      </div>
    </aside>
  );
}

// ── TOP NAVBAR ───────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed top-0 left-[228px] right-0 h-[60px] bg-white border-b border-[#E2E8F0] flex items-center px-8 z-20 gap-6">
      <div className="text-[13px] text-slate-400">
        Dashboard / <span className="text-slate-600">Aircraft Explorer</span>
      </div>
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search aircraft ID, component, engineer..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-[#E2E8F0] text-[13px] bg-[#F8FAFC] focus:outline-none focus:border-[#2563EB] text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="relative">
          <button className="w-9 h-9 rounded-full border border-[#E2E8F0] flex items-center justify-center text-slate-500 hover:bg-slate-50">
            <Bell size={16} />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">7</span>
        </div>
        <div className="relative">
          <button className="w-9 h-9 rounded-full border border-[#E2E8F0] flex items-center justify-center text-slate-500 hover:bg-slate-50">
            <Settings size={16} />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">3</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[13px] font-semibold">CW</div>
      </div>
    </header>
  );
}

// ── KPI CARD ─────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, accent }) {
  const accents = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", val: "text-blue-700" },
    green: { bg: "bg-emerald-50", text: "text-emerald-600", val: "text-emerald-700" },
    yellow: { bg: "bg-amber-50", text: "text-amber-500", val: "text-amber-600" },
    red: { bg: "bg-red-50", text: "text-red-500", val: "text-red-600" },
  }[accent];

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex flex-col justify-between"
      style={{ width: 260, minHeight: 130 }}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400">{label}</p>
        <div className={`w-9 h-9 rounded-xl ${accents.bg} flex items-center justify-center`}>
          <Icon size={18} className={accents.text} />
        </div>
      </div>
      <div>
        <p className={`text-4xl font-bold ${accents.val} leading-none mb-1`}>{value}</p>
        {sub && <p className="text-[12px] text-slate-400">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ── SELECT ────────────────────────────────────────────────────────────────────

function Select({ label, options, value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-[13px] text-slate-700 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ── AIRCRAFT CARD ─────────────────────────────────────────────────────────────

function AircraftCard({ ac, index }) {
  const sc = statusColor(ac.status);
  const hColor = healthBar(ac.health);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(0,0,0,0.10)" }}
      className="bg-white rounded-2xl border border-[#E2E8F0] flex flex-col overflow-hidden cursor-pointer"
      style={{ minHeight: 260 }}
    >
      {/* Top */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Plane size={20} className="text-[#2563EB]" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-[#0F172A]">{ac.id}</p>
            <p className="text-[12px] text-slate-400">{ac.model}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
          {ac.status}
        </span>
      </div>

      {/* Middle */}
      <div className="px-5 py-4 flex-1">
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 mb-4">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-slate-400" />
            <span className="text-[12px] text-slate-500">{ac.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-400" />
            <span className="text-[12px] text-slate-500">{ac.lastMaint}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge size={12} className="text-slate-400" />
            <span className="text-[12px] text-slate-500">{ac.rul} FH RUL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="text-slate-400" />
            <span className="text-[12px] text-slate-500">{ac.failProb}% fail risk</span>
          </div>
        </div>

        {/* Health Bar */}
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Health Score</span>
            <span className="text-[12px] font-bold text-[#0F172A]">{ac.health}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ac.health}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`h-full rounded-full ${hColor}`}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 pb-5">
        <button className="flex-1 py-1.5 rounded-lg border border-[#E2E8F0] text-[12px] font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-1.5">
          <Eye size={12} /> View Details
        </button>
        <button className="flex-1 py-1.5 rounded-lg border border-[#E2E8F0] text-[12px] font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-1.5">
          <Cpu size={12} /> Open Twin
        </button>
        <button className="flex-1 py-1.5 rounded-lg bg-[#2563EB] text-[12px] font-medium text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
          <Zap size={12} /> Run AI
        </button>
      </div>
    </motion.div>
  );
}

// ── TABLE VIEW ────────────────────────────────────────────────────────────────

function TableView({ data }) {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
            {["Aircraft ID", "Type", "Location", "Health", "Status", "RUL", "Last Maint.", "Actions"].map((h) => (
              <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((ac, i) => {
            const sc = statusColor(ac.status);
            const hColor = ac.health >= 80 ? "text-emerald-600" : ac.health >= 50 ? "text-amber-600" : "text-red-600";
            return (
              <motion.tr
                key={ac.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors"
              >
                <td className="px-5 py-3.5 font-semibold text-[#0F172A]">{ac.id}</td>
                <td className="px-5 py-3.5 text-slate-500">{ac.type}</td>
                <td className="px-5 py-3.5 text-slate-500">{ac.location}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${healthBar(ac.health)}`} style={{ width: `${ac.health}%` }} />
                    </div>
                    <span className={`font-semibold ${hColor}`}>{ac.health}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {ac.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-600 font-medium">{ac.rul} FH</td>
                <td className="px-5 py-3.5 text-slate-500">{ac.lastMaint}</td>
                <td className="px-5 py-3.5 relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === ac.id ? null : ac.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-slate-600 hover:bg-slate-50 text-[12px] font-medium"
                  >
                    Actions <ChevronDown size={12} />
                  </button>
                  <AnimatePresence>
                    {openMenu === ac.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-4 top-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-10 overflow-hidden w-44"
                      >
                        {["View Details", "Open Twin", "Run Prediction", "Generate Report"].map((a) => (
                          <button key={a} onClick={() => setOpenMenu(null)}
                            className="block w-full text-left px-4 py-2.5 text-[13px] text-slate-700 hover:bg-[#F8FAFC] transition-colors">
                            {a}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── FLEET INSIGHTS PANEL ──────────────────────────────────────────────────────

function InsightsPanel({ open }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="bg-white border-l border-[#E2E8F0] overflow-hidden flex-shrink-0"
        >
          <div className="p-5 w-[260px]">
            <p className="text-[13px] font-bold text-[#0F172A] mb-4">Fleet Insights</p>

            {[
              { label: "Healthy Aircraft", val: 95, color: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500", pct: 79 },
              { label: "Warning Aircraft", val: 18, color: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-400", pct: 15 },
              { label: "Critical Aircraft", val: 7, color: "text-red-600", bg: "bg-red-50", bar: "bg-red-500", pct: 6 },
            ].map(({ label, val, color, bg, bar, pct }) => (
              <div key={label} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-slate-500">{label}</span>
                  <span className={`text-[13px] font-bold ${color}`}>{val}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7 }}
                    className={`h-full rounded-full ${bar}`}
                  />
                </div>
              </div>
            ))}

            <div className="mt-6 space-y-3">
              {[
                { label: "Average RUL", val: "1,450 hrs", icon: Gauge },
                { label: "Upcoming Maint.", val: "12 aircraft", icon: Clock },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-slate-400" />
                    <span className="text-[12px] text-slate-500">{label}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#0F172A]">{val}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-[11px] font-semibold text-amber-700 mb-1">⚠ Attention Needed</p>
              <p className="text-[12px] text-amber-600">18 aircraft require inspection within 72 hours.</p>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function AircraftExplorer() {
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(true);

  const filtered = AIRCRAFT.filter((ac) => {
    const q = search.toLowerCase();
    const matchSearch = !q || ac.id.toLowerCase().includes(q) || ac.model.toLowerCase().includes(q) || ac.location.toLowerCase().includes(q);
    const matchStatus = !statusFilter || ac.status === statusFilter;
    const matchType = !typeFilter || ac.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
      <Sidebar />
      <Navbar />

      <div className="pl-[228px] pt-[60px] flex h-screen overflow-hidden">
        {/* Scrollable main */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">

            {/* Page Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A]">Aircraft Explorer</h1>
                <p className="text-[14px] text-slate-400 mt-1">Browse and monitor aircraft across the entire fleet.</p>
              </div>
              <div className="flex items-center gap-2.5">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2E8F0] text-[13px] font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                  <Download size={14} /> Export Data
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2E8F0] text-[13px] font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                  <FileText size={14} /> Generate Fleet Report
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] text-[13px] font-medium text-white hover:bg-blue-700 transition-colors">
                  <Plus size={14} /> Add Aircraft
                </motion.button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="flex gap-5 mb-6">
              <KpiCard icon={Plane} label="Total Aircraft" value="120" sub="Across all hubs" accent="blue" />
              <KpiCard icon={Activity} label="Avg Fleet Health" value="91%" sub="Above threshold" accent="green" />
              <KpiCard icon={TriangleAlert} label="Requiring Attention" value="18" sub="+4 since yesterday" accent="yellow" />
              <KpiCard icon={AlertOctagon} label="Critical Aircraft" value="7" sub="Action required" accent="red" />
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] px-5 flex items-center gap-4 mb-6" style={{ height: 80 }}>
              {/* Search */}
              <div className="relative" style={{ width: 420 }}>
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Aircraft ID, Model, Location, Component…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[13px] bg-[#F8FAFC] focus:outline-none focus:border-[#2563EB] text-slate-700 placeholder:text-slate-400"
                />
              </div>

              <div className="w-px h-8 bg-[#E2E8F0]" />

              <Select label="All Statuses" options={["Healthy","Warning","Critical","Maintenance"]} value={statusFilter} onChange={setStatusFilter} />
              <Select label="Aircraft Type" options={["A320","A350","B737","B787","Cargo","Helicopter"]} value={typeFilter} onChange={setTypeFilter} />
              <Select label="Risk Level" options={["Low","Medium","High","Critical"]} value={riskFilter} onChange={setRiskFilter} />
              <Select label="Sort By" options={["Health Score","Remaining Useful Life","Last Maintenance","Failure Probability","Flight Hours"]} value={sortBy} onChange={setSortBy} />

              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={() => setPanelOpen(!panelOpen)}
                  className="p-2 rounded-lg border border-[#E2E8F0] text-slate-500 hover:bg-slate-50 transition-colors"
                  title={panelOpen ? "Close Insights" : "Open Insights"}
                >
                  {panelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                </button>

                <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1">
                  <button
                    onClick={() => setView("grid")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${view === "grid" ? "bg-white shadow-sm text-[#2563EB] border border-[#E2E8F0]" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <LayoutGrid size={14} /> Grid
                  </button>
                  <button
                    onClick={() => setView("table")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${view === "table" ? "bg-white shadow-sm text-[#2563EB] border border-[#E2E8F0]" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    <Table2 size={14} /> Table
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Plane size={28} className="text-slate-300" />
                </div>
                <p className="text-[16px] font-semibold text-slate-400 mb-2">No aircraft match your filters.</p>
                <button
                  onClick={() => { setSearch(""); setStatusFilter(""); setTypeFilter(""); setRiskFilter(""); }}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-[13px] font-medium hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : view === "grid" ? (
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {filtered.map((ac, i) => <AircraftCard key={ac.id} ac={ac} index={i} />)}
              </div>
            ) : (
              <TableView data={filtered} />
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8 pb-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E2E8F0] text-[13px] font-medium text-slate-500 bg-white hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-[13px] font-semibold transition-colors border ${
                    page === p
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "bg-white text-slate-600 border-[#E2E8F0] hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(4, page + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E2E8F0] text-[13px] font-medium text-slate-500 bg-white hover:bg-slate-50 transition-colors"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Fleet Insights Side Panel */}
        <InsightsPanel open={panelOpen} />
      </div>
    </div>
  );
}
