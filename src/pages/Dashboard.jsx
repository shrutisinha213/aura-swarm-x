import { useState, useRef, useEffect } from "react";
import {
  Rocket, LayoutDashboard, Plane, ClipboardList, Cpu, Activity, Brain,
  CalendarClock, Network, MessageSquare, Boxes, Leaf, Settings,
  Search, Bell, MessageCircle, HelpCircle, Download, RefreshCw,
  ShieldCheck, AlertTriangle, AlertOctagon, Wrench, TrendingUp,
  ChevronDown, ChevronRight, X, Eye, PlayCircle, FileText,
  Sparkles, Send, Filter, SlidersHorizontal, Plus, ShieldAlert,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from "recharts";

/* ───────────────────────── Dummy Data ───────────────────────── */

const NAV_MAIN = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Fleet Overview", icon: Plane },
  { label: "Aircraft Registry", icon: ClipboardList },
  { label: "Digital Twin", icon: Cpu },
  { label: "Predictive Maintenance", icon: Activity },
  { label: "Decision Twin", icon: Brain },
];
const NAV_OPS = [
  { label: "Maintenance Planner", icon: CalendarClock },
  { label: "Fleet Intelligence", icon: Network },
  { label: "Knowledge Brain", icon: MessageSquare },
  { label: "Material Intelligence", icon: Boxes },
  { label: "Sustainability", icon: Leaf },
];
const NAV_CONFIG = [{ label: "Settings", icon: Settings }];

const KPI_DATA = [
  { label: "Total Aircraft", value: "120", icon: Plane, iconBg: "#EFF6FF", iconColor: "#2563EB", trend: "+3 this month", trendType: "up", valueColor: "#0F172A" },
  { label: "Healthy", value: "95", icon: ShieldCheck, iconBg: "#ECFDF5", iconColor: "#10B981", trend: "79.2% of fleet", trendType: "up", valueColor: "#10B981" },
  { label: "Warning", value: "18", icon: AlertTriangle, iconBg: "#FFFBEB", iconColor: "#F59E0B", trend: "+4 since yesterday", trendType: "down", valueColor: "#F59E0B" },
  { label: "Critical", value: "7", icon: AlertOctagon, iconBg: "#FEF2F2", iconColor: "#EF4444", trend: "Requires action", trendType: "down", valueColor: "#EF4444" },
  { label: "In Maintenance", value: "12", icon: Wrench, iconBg: "#F5F3FF", iconColor: "#7C3AED", trend: "Avg 3.2 days", trendType: "neutral", valueColor: "#7C3AED" },
];

const DONUT_DATA = [
  { name: "Healthy", value: 95, color: "#10B981" },
  { name: "Warning", value: 18, color: "#F59E0B" },
  { name: "Critical", value: 7, color: "#EF4444" },
];

const BAR_DATA = [
  { system: "Engine", failures: 12, color: "rgba(239,68,68,.75)" },
  { system: "Hydraulics", failures: 8, color: "rgba(245,158,11,.75)" },
  { system: "Avionics", failures: 6, color: "rgba(37,99,235,.75)" },
  { system: "Lg. Gear", failures: 4, color: "rgba(124,58,237,.75)" },
  { system: "Fuel", failures: 3, color: "rgba(245,158,11,.75)" },
  { system: "APU", failures: 5, color: "rgba(16,185,129,.75)" },
];

function genAvailability() {
  const labels = [0, 9, 19, 29];
  return Array.from({ length: 30 }, (_, i) => ({
    day: labels.includes(i) ? `${i + 1}d` : "",
    pct: +(79 + Math.sin(i / 3.2) * 3.5 + i * 0.26 + Math.random() * 1.4).toFixed(1),
  }));
}
const AVAILABILITY_DATA = genAvailability();

const AIRCRAFT_DOTS = [
  { id: "ASX-001", left: "17%", top: "38%", health: "Healthy", status: "In Transit" },
  { id: "ASX-014", left: "31%", top: "25%", health: "Warning", status: "Approaching" },
  { id: "ASX-007", left: "51%", top: "46%", health: "Critical", status: "Grounded" },
  { id: "ASX-033", left: "67%", top: "30%", health: "Healthy", status: "In Transit" },
  { id: "ASX-088", left: "80%", top: "54%", health: "Warning", status: "Holding" },
];

const HUBS = [
  { icon: "✈", label: "DXB Hub", left: "22%", top: "62%" },
  { icon: "🔧", label: "MX Center", left: "59%", top: "22%" },
  { icon: "✈", label: "SIN Hub", left: "78%", top: "68%" },
];

const ALERT_DATA = {
  critical: [
    { id: "ASX-007", desc: "Engine bearing wear — P1", time: "2m ago", icon: AlertOctagon, bg: "#FEF2F2", color: "#EF4444" },
    { id: "ASX-041", desc: "Hydraulic system leak confirmed", time: "8m ago", icon: AlertOctagon, bg: "#FEF2F2", color: "#EF4444" },
    { id: "ASX-092", desc: "Fuel pressure below threshold", time: "15m ago", icon: AlertOctagon, bg: "#FEF2F2", color: "#EF4444" },
  ],
  warning: [
    { id: "ASX-014", desc: "Compressor vibration elevated", time: "1h ago", icon: AlertTriangle, bg: "#FFFBEB", color: "#F59E0B" },
    { id: "ASX-060", desc: "Brake wear at 80% consumed", time: "2h ago", icon: AlertTriangle, bg: "#FFFBEB", color: "#F59E0B" },
    { id: "ASX-088", desc: "Auxiliary power variance", time: "3h ago", icon: AlertTriangle, bg: "#FFFBEB", color: "#F59E0B" },
  ],
  maint: [
    { id: "ASX-022", desc: "C-Check due in 48 hours", time: "Scheduled", icon: Wrench, bg: "#F5F3FF", color: "#7C3AED" },
    { id: "ASX-019", desc: "Engine borescope inspection due", time: "Tomorrow", icon: Wrench, bg: "#F5F3FF", color: "#7C3AED" },
  ],
  cyber: [
    { id: "ASX-033", desc: "Anomalous FMC data pattern", time: "4h ago", icon: ShieldAlert, bg: "#ECFEFF", color: "#0E7490" },
  ],
};

const FLEET_TABLE = [
  { id: "ASX-001", type: "B737-800", health: "Healthy", status: "In Transit", rul: 4200, insp: "2025-11-12" },
  { id: "ASX-007", type: "A320neo", health: "Critical", status: "Grounded", rul: 310, insp: "2025-10-05" },
  { id: "ASX-014", type: "B777-300", health: "Warning", status: "Approaching", rul: 1850, insp: "2025-11-01" },
  { id: "ASX-019", type: "A350-900", health: "Healthy", status: "Departing", rul: 5100, insp: "2025-11-20" },
  { id: "ASX-022", type: "B737-MAX", health: "Maintenance", status: "In MX", rul: 2200, insp: "2025-09-30" },
  { id: "ASX-033", type: "A320neo", health: "Healthy", status: "In Transit", rul: 3800, insp: "2025-10-28" },
  { id: "ASX-041", type: "B777-200", health: "Critical", status: "Grounded", rul: 480, insp: "2025-08-15" },
  { id: "ASX-055", type: "A330-300", health: "Healthy", status: "Landing", rul: 4700, insp: "2025-11-08" },
  { id: "ASX-060", type: "B737-800", health: "Warning", status: "Holding", rul: 1100, insp: "2025-10-22" },
  { id: "ASX-072", type: "A320neo", health: "Healthy", status: "Departing", rul: 3200, insp: "2025-11-15" },
  { id: "ASX-088", type: "B787-9", health: "Warning", status: "Holding", rul: 900, insp: "2025-10-10" },
];

const CRITICAL_TABLE = [
  { id: "ASX-007", type: "A320neo", issue: "Engine bearing wear — P1", sev: "P1", rul: 310 },
  { id: "ASX-041", type: "B777-200", issue: "Hydraulic system leak", sev: "P1", rul: 480 },
  { id: "ASX-092", type: "B787-9", issue: "Fuel pressure below threshold", sev: "P1", rul: 210 },
  { id: "ASX-055b", type: "B737-800", issue: "Avionics anomaly", sev: "P2", rul: 620 },
  { id: "ASX-018", type: "A330-300", issue: "Landing gear sensor fault", sev: "P2", rul: 740 },
  { id: "ASX-037", type: "A320neo", issue: "APU fault code 4", sev: "P3", rul: 850 },
  { id: "ASX-104", type: "B737-MAX", issue: "Cabin pressure anomaly", sev: "P2", rul: 550 },
];

const AI_REPLIES = [
  "Analyzing ASX-007... Engine bearing wear at 94.2% threshold. Grounding within 6 hours is mandatory. I can auto-generate the AOG maintenance order and notify the MRO team.",
  "Fleet availability projected at 82.4% for the next 30 days. I've identified 3 consolidation windows to reduce hangar time by 18%. Shall I optimize the schedule?",
  "Material stock alert: Hydraulic seals HY-4421 at 12 units (threshold: 40). Recommend immediate procurement request from approved supplier list.",
  "Running failure prediction for ASX-014 compressor vibration... Estimated RUL reduction to 800h if unaddressed. Recommend C-check within 72 hours.",
];

/* ───────────────────────── Helpers ───────────────────────── */

const healthBadgeClasses = {
  Healthy: "bg-emerald-50 text-emerald-800",
  Warning: "bg-amber-50 text-amber-800",
  Critical: "bg-red-50 text-red-800",
  Maintenance: "bg-violet-50 text-violet-800",
};

const dotColor = { Healthy: "#10B981", Warning: "#F59E0B", Critical: "#EF4444" };

const sevColors = {
  P1: { bg: "#FEF2F2", color: "#DC2626" },
  P2: { bg: "#FFFBEB", color: "#D97706" },
  P3: { bg: "#F5F3FF", color: "#7C3AED" },
};

function rulColor(rul) {
  return rul < 500 ? "#EF4444" : rul < 2000 ? "#F59E0B" : "#10B981";
}

/* ───────────────────────── Small UI Pieces ───────────────────────── */

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] cursor-pointer mb-0.5 text-[12px] font-medium transition-all
        ${active ? "bg-[#2563EB] text-white" : "text-[#94A3B8] hover:bg-white/[0.06] hover:text-[#E2E8F0]"}`}
    >
      <Icon size={15} className="flex-shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function IconButton({ icon: Icon, badge }) {
  return (
    <div className="relative w-[34px] h-[34px] rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center cursor-pointer text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
      <Icon size={15} />
      {badge && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[9px] flex items-center justify-center text-white font-bold border-2 border-white">
          {badge}
        </span>
      )}
    </div>
  );
}

function KpiCard({ item, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#E2E8F0] rounded-[10px] p-4 pl-[18px] pr-[18px] cursor-pointer transition-all hover:border-[#2563EB] hover:shadow-[0_2px_12px_rgba(37,99,235,0.08)]"
    >
      <div className="flex items-start justify-between mb-3.5">
        <div className="text-[11px] text-[#64748B] font-semibold uppercase tracking-wide leading-tight max-w-[100px]">
          {item.label}
        </div>
        <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
          <item.icon size={16} style={{ color: item.iconColor }} />
        </div>
      </div>
      <div className="text-[26px] font-bold leading-none tracking-tight" style={{ color: item.valueColor }}>
        {item.value}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded
            ${item.trendType === "up" ? "bg-emerald-50 text-emerald-700" : item.trendType === "down" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}
        >
          {item.trend}
        </span>
      </div>
    </div>
  );
}

function ChartCard({ title, sub, children, className = "" }) {
  return (
    <div className={`bg-white border border-[#E2E8F0] rounded-[10px] p-[18px] ${className}`}>
      <div className="font-bold text-[#0F172A] text-[13px]">{title}</div>
      <div className="text-[11px] text-[#64748B] mt-0.5 mb-3.5">{sub}</div>
      {children}
    </div>
  );
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[11px] shadow-lg">
      {payload[0].name}: <strong>{payload[0].value}</strong> aircraft
    </div>
  );
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[11px] shadow-lg">
      {label}: <strong>{payload[0].value}</strong> predicted failures
    </div>
  );
}

function LineTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[11px] shadow-lg">
      Availability: <strong>{payload[0].value}%</strong>
    </div>
  );
}

/* ───────────────────────── Main Component ───────────────────────── */

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [alertTab, setAlertTab] = useState("critical");
  const [hoveredDot, setHoveredDot] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [criticalModalOpen, setCriticalModalOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      role: "ai",
      text: "Good morning, Cpt. Williams. Fleet health is at 79.2%. I've flagged 7 critical aircraft for immediate review. ASX-007 shows engine bearing wear above threshold — recommend grounding within 6 flight hours. Shall I generate a maintenance order?",
      time: "09:42 UTC",
    },
  ]);
  const aiReplyIndex = useRef(0);
  const aiMsgsEndRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    aiMsgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const tabClasses = {
    critical: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
    warning: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    maint: "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]",
    cyber: "bg-[#ECFEFF] text-[#0E7490] border-[#A5F3FC]",
  };

  function sendAiMessage(text) {
    const value = text ?? aiInput;
    if (!value.trim()) return;
    setAiMessages((prev) => [...prev, { role: "user", text: value, time: "Now" }]);
    setAiInput("");
    setTimeout(() => {
      const reply = AI_REPLIES[aiReplyIndex.current % AI_REPLIES.length];
      aiReplyIndex.current += 1;
      setAiMessages((prev) => [...prev, { role: "ai", text: reply, time: "Just now" }]);
    }, 750);
  }

  return (
    <div className="flex h-screen min-h-[720px] bg-[#F8FAFC] text-[#0F172A] text-[13px] overflow-hidden font-sans">
      {/* ───── Sidebar ───── */}
      <div className="w-[224px] min-w-[224px] bg-[#0F172A] flex flex-col overflow-y-auto flex-shrink-0">
        <div className="px-[18px] pt-[22px] pb-[18px] border-b border-white/[0.07] flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] bg-[#2563EB] rounded-lg flex items-center justify-center text-white flex-shrink-0">
            <Rocket size={17} />
          </div>
          <div>
            <div className="font-bold text-[13px] tracking-wide text-[#F1F5F9]">AURA-SWARM X</div>
            <div className="text-[10px] text-[#64748B] mt-0.5">Fleet Intelligence Platform</div>
          </div>
        </div>
        <div className="px-2.5 py-3 flex-1">
          <div className="text-[10px] text-[#475569] uppercase tracking-wide font-semibold px-2 py-2.5">Main</div>
          {NAV_MAIN.map((item) => (
            <NavItem key={item.label} {...item} active={activeNav === item.label} onClick={() => setActiveNav(item.label)} />
          ))}
          <div className="text-[10px] text-[#475569] uppercase tracking-wide font-semibold px-2 pt-2.5 pb-1">Operations</div>
          {NAV_OPS.map((item) => (
            <NavItem key={item.label} {...item} active={activeNav === item.label} onClick={() => setActiveNav(item.label)} />
          ))}
          <div className="text-[10px] text-[#475569] uppercase tracking-wide font-semibold px-2 pt-2.5 pb-1">Config</div>
          {NAV_CONFIG.map((item) => (
            <NavItem key={item.label} {...item} active={activeNav === item.label} onClick={() => setActiveNav(item.label)} />
          ))}
        </div>
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-2 px-2.5 py-2 bg-emerald-500/10 border border-emerald-500/[0.18] rounded-lg">
            <span className="w-[7px] h-[7px] rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-[10px] text-emerald-300 font-semibold">All systems nominal</span>
          </div>
        </div>
      </div>

      {/* ───── Main ───── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <div className="h-[58px] border-b border-[#E2E8F0] flex items-center px-6 gap-4 flex-shrink-0 bg-white">
          <div className="text-[12px] text-[#64748B]">
            Dashboard <b className="text-[#0F172A] font-semibold">/ Fleet Command Center</b>
          </div>
          <div className="flex-1 max-w-[380px] mx-auto relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search aircraft ID, component, engineer..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-[34px] pr-3 py-[7px] text-[12px] outline-none focus:border-[#2563EB] transition-colors placeholder:text-[#94A3B8]"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <IconButton icon={Bell} badge={7} />
            <IconButton icon={MessageCircle} badge={3} />
            <IconButton icon={HelpCircle} />
            <div className="w-px h-[22px] bg-[#E2E8F0]" />
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white text-[11px] font-bold cursor-pointer">
              CW
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-[22px] px-6 flex flex-col gap-[18px]">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[19px] font-bold text-[#0F172A]">Fleet Command Center</div>
              <div className="text-[12px] text-[#64748B] mt-0.5">Real-time fleet intelligence and maintenance operations</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] text-[#10B981] bg-emerald-50 border border-emerald-200 px-2.5 py-[5px] rounded-md flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live · UTC 09:42
              </div>
              <button className="flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-[7px] rounded-lg border border-[#E2E8F0] text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-all">
                <Download size={13} /> Export
              </button>
              <button className="flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-[7px] rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all">
                <RefreshCw size={13} /> Sync Fleet
              </button>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-5 gap-3">
            {KPI_DATA.map((item) => (
              <KpiCard
                key={item.label}
                item={item}
                onClick={() => {
                  if (item.label === "Critical") setCriticalModalOpen(true);
                }}
              />
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-3.5">
            <ChartCard title="Fleet Health Distribution" sub="Status breakdown · 120 aircraft total">
              <div className="flex gap-3.5 flex-wrap mb-2">
                {DONUT_DATA.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <span className="w-[9px] h-[9px] rounded-sm" style={{ background: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
              <div style={{ height: 170 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={DONUT_DATA} dataKey="value" nameKey="name" innerRadius="72%" outerRadius="100%" stroke="#FFFFFF" strokeWidth={4}>
                      {DONUT_DATA.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Predicted Failures — Next 30 Days" sub="By aircraft system · Component-level analysis">
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BAR_DATA}>
                    <CartesianGrid stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="system" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(37,99,235,0.05)" }} />
                    <Bar dataKey="failures" radius={[4, 4, 0, 0]}>
                      {BAR_DATA.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Fleet Availability Trend" sub="30-day rolling operational readiness" className="col-span-2">
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={AVAILABILITY_DATA}>
                    <defs>
                      <linearGradient id="availGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                    <YAxis
                      domain={[74, 94]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 10, fill: "#94A3B8" }}
                      axisLine={{ stroke: "#E2E8F0" }}
                      tickLine={false}
                    />
                    <Tooltip content={<LineTooltip />} />
                    <Area type="monotone" dataKey="pct" stroke="#2563EB" strokeWidth={2} fill="url(#availGradient)" dot={false} activeDot={{ r: 4, fill: "#2563EB" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Map + Alerts row */}
          <div className="grid gap-3.5" style={{ gridTemplateColumns: "1fr 300px" }}>
            {/* Fleet Map */}
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-4">
              <div className="font-bold text-[#0F172A] text-[13px]">Live Fleet Map</div>
              <div className="text-[11px] text-[#64748B] mt-0.5 mb-3.5">Real-time positions · maintenance hubs · airports</div>
              <div
                ref={mapRef}
                className="relative w-full rounded-lg overflow-hidden"
                style={{
                  height: 230,
                  background: "#0D1929",
                  backgroundImage:
                    "linear-gradient(rgba(37,99,235,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.07) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
                onClick={(e) => {
                  if (e.target === mapRef.current) setHoveredDot(null);
                }}
              >
                {AIRCRAFT_DOTS.map((ac) => (
                  <div
                    key={ac.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ left: ac.left, top: ac.top }}
                    onClick={() => setHoveredDot(hoveredDot === ac.id ? null : ac.id)}
                  >
                    <span
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-ping"
                      style={{ width: 22, height: 22, background: dotColor[ac.health], opacity: 0.25 }}
                    />
                    <span
                      className="relative block rounded-full border-2"
                      style={{ width: 10, height: 10, background: dotColor[ac.health], borderColor: dotColor[ac.health] }}
                    />
                  </div>
                ))}

                {HUBS.map((hub) => (
                  <div key={hub.label} className="absolute -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ left: hub.left, top: hub.top }}>
                    <div className="text-[15px]">{hub.icon}</div>
                    <div className="text-[9px] text-[#94A3B8] mt-0.5 whitespace-nowrap">{hub.label}</div>
                  </div>
                ))}

                {hoveredDot && (() => {
                  const ac = AIRCRAFT_DOTS.find((a) => a.id === hoveredDot);
                  return (
                    <div
                      className="absolute bg-white border border-[#E2E8F0] rounded-lg p-3 text-[12px] z-20 min-w-[165px] shadow-lg"
                      style={{ left: `calc(${ac.left} + 18px)`, top: `calc(${ac.top} - 14px)` }}
                    >
                      <div className="font-bold text-[#0F172A] mb-0.5">{ac.id}</div>
                      <div className="text-[11px] text-[#64748B] mb-2">
                        <span style={{ color: dotColor[ac.health], fontWeight: 700 }}>{ac.health}</span> · {ac.status}
                      </div>
                      <div className="flex gap-1.5">
                        <button className="text-[10px] px-2 py-1 rounded-md bg-[#2563EB] text-white font-semibold">Open Aircraft</button>
                        <button className="text-[10px] px-2 py-1 rounded-md border border-[#E2E8F0] text-[#0F172A] font-semibold">Digital Twin</button>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="flex gap-3.5 mt-2.5 flex-wrap">
                {[["#10B981", "Healthy"], ["#F59E0B", "Warning"], ["#EF4444", "Critical"]].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] p-4 flex flex-col">
              <div className="font-bold text-[#0F172A] text-[13px] mb-2.5">Live Alerts</div>
              <div className="flex gap-1 mb-3 border-b border-[#E2E8F0] pb-2.5 flex-wrap">
                {[
                  { key: "critical", label: "Critical", count: 7 },
                  { key: "warning", label: "Warnings" },
                  { key: "maint", label: "MX Due" },
                  { key: "cyber", label: "Cyber" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setAlertTab(tab.key)}
                    className={`text-[11px] font-semibold px-2.5 py-[5px] rounded-md border transition-all
                      ${alertTab === tab.key ? tabClasses[tab.key] : "text-[#64748B] border-transparent hover:bg-[#F8FAFC]"}`}
                  >
                    {tab.label}
                    {tab.count && (
                      <span className="ml-1 text-[9px] bg-[#FECACA] text-[#991B1B] px-1 py-px rounded">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
                {ALERT_DATA[alertTab].map((al) => (
                  <div
                    key={al.id + al.desc}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] cursor-pointer hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all"
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: al.bg }}>
                      <al.icon size={14} style={{ color: al.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-[#0F172A]">{al.id}</div>
                      <div className="text-[11px] text-[#64748B] truncate">{al.desc}</div>
                      <div className="text-[10px] text-[#94A3B8] mt-0.5">{al.time}</div>
                    </div>
                    <ChevronRight size={13} className="text-[#CBD5E1] mt-1.5 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Aircraft Registry Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-[#E2E8F0]">
              <div>
                <div className="font-bold text-[#0F172A] text-[13px]">Aircraft Registry</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">Active fleet · 120 aircraft · last synced 14s ago</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-[6px] rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
                  <Filter size={12} /> All Types
                </button>
                <button className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-[6px] rounded-md border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
                  <SlidersHorizontal size={12} /> All Status
                </button>
                <button className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-[6px] rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all">
                  <Plus size={13} /> Add Aircraft
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-fixed">
                <colgroup>
                  <col style={{ width: 100 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 150 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 90 }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    {["Aircraft ID", "Aircraft Type", "Health", "Status", "RUL (hrs)", "Last Inspection", "Actions"].map((h) => (
                      <th key={h} className="text-left px-[14px] py-[10px] text-[10px] font-bold text-[#64748B] uppercase tracking-wide border-b border-[#E2E8F0] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FLEET_TABLE.map((ac, i) => {
                    const pct = Math.min(100, Math.round(ac.rul / 60));
                    const fc = rulColor(ac.rul);
                    return (
                      <tr key={ac.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-[14px] py-[11px]">
                          <span className="font-mono font-bold text-[12px] text-[#0F172A]">{ac.id}</span>
                        </td>
                        <td className="px-[14px] py-[11px] text-[12px]">{ac.type}</td>
                        <td className="px-[14px] py-[11px]">
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-[7px] py-[3px] rounded ${healthBadgeClasses[ac.health]}`}>
                            {ac.health}
                          </span>
                        </td>
                        <td className="px-[14px] py-[11px] text-[12px] text-[#64748B]">{ac.status}</td>
                        <td className="px-[14px] py-[11px]">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1 bg-[#E2E8F0] rounded-full overflow-hidden min-w-[50px]">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: fc }} />
                            </div>
                            <span className="text-[11px] text-[#64748B] min-w-[40px] text-right">{ac.rul.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-[14px] py-[11px] text-[12px] text-[#64748B]">{ac.insp}</td>
                        <td className="px-[14px] py-[11px] relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-[5px] rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-all"
                          >
                            Actions <ChevronDown size={11} />
                          </button>
                          {openDropdown === i && (
                            <div className="absolute right-[14px] top-[38px] bg-white border border-[#E2E8F0] rounded-lg min-w-[170px] z-50 shadow-xl overflow-hidden">
                              {[
                                { label: "View Aircraft", icon: Eye },
                                { label: "Open Digital Twin", icon: Cpu },
                                { label: "Run Simulation", icon: PlayCircle },
                              ].map((opt) => (
                                <div
                                  key={opt.label}
                                  onClick={() => setOpenDropdown(null)}
                                  className="flex items-center gap-2 px-3.5 py-2 text-[12px] text-[#0F172A] cursor-pointer hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                                >
                                  <opt.icon size={13} className="text-[#64748B]" /> {opt.label}
                                </div>
                              ))}
                              <div className="h-px bg-[#E2E8F0]" />
                              {[
                                { label: "Maintenance Plan", icon: CalendarClock },
                                { label: "Generate Report", icon: FileText },
                              ].map((opt) => (
                                <div
                                  key={opt.label}
                                  onClick={() => setOpenDropdown(null)}
                                  className="flex items-center gap-2 px-3.5 py-2 text-[12px] text-[#0F172A] cursor-pointer hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
                                >
                                  <opt.icon size={13} className="text-[#64748B]" /> {opt.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* FABs */}
          <div className="flex gap-2 justify-end pb-1">
            <button className="flex items-center gap-1.5 text-[12px] font-semibold px-4 py-[9px] rounded-lg bg-white border border-[#E2E8F0] text-[#0F172A] hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
              <FileText size={14} /> Fleet Report
            </button>
            <button
              onClick={() => setAiOpen(true)}
              className="flex items-center gap-1.5 text-[12px] font-semibold px-4 py-[9px] rounded-lg bg-[#0F172A] text-white hover:bg-[#1E293B] transition-all"
            >
              <Sparkles size={14} /> Ask AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* ───── Critical Aircraft Modal ───── */}
      {criticalModalOpen && (
        <div
          className="absolute inset-0 bg-[#0F172A]/45 z-[150] flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && setCriticalModalOpen(false)}
        >
          <div className="bg-white border border-[#E2E8F0] rounded-2xl w-[700px] max-w-[95%] max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center gap-2.5 px-[22px] py-4 border-b border-[#E2E8F0]">
              <div className="w-[34px] h-[34px] rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444]">
                <AlertOctagon size={16} />
              </div>
              <div>
                <div className="font-bold text-[14px] text-[#0F172A]">Critical Aircraft — Immediate Action Required</div>
                <div className="text-[11px] text-[#64748B]">7 aircraft require urgent intervention</div>
              </div>
              <button
                onClick={() => setCriticalModalOpen(false)}
                className="ml-auto w-7 h-7 rounded-md border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#EF4444] hover:text-[#EF4444] transition-all"
              >
                <X size={14} />
              </button>
            </div>
            <div className="overflow-y-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: 90 }} />
                  <col style={{ width: 95 }} />
                  <col style={{ width: 185 }} />
                  <col style={{ width: 62 }} />
                  <col style={{ width: 68 }} />
                  <col style={{ width: 100 }} />
                </colgroup>
                <thead>
                  <tr>
                    {["Aircraft", "Type", "Issue", "Sev.", "RUL", "Action"].map((h) => (
                      <th key={h} className="text-left px-[14px] py-[10px] text-[10px] font-bold text-[#64748B] uppercase tracking-wide border-b border-[#E2E8F0]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CRITICAL_TABLE.map((a) => (
                    <tr key={a.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                      <td className="px-[14px] py-[10px] font-mono font-bold text-[11px]">{a.id}</td>
                      <td className="px-[14px] py-[10px] text-[11px] text-[#64748B]">{a.type}</td>
                      <td className="px-[14px] py-[10px] text-[11px]">{a.issue}</td>
                      <td className="px-[14px] py-[10px]">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: sevColors[a.sev].bg, color: sevColors[a.sev].color }}
                        >
                          {a.sev}
                        </span>
                      </td>
                      <td className="px-[14px] py-[10px] text-[11px]" style={a.rul < 500 ? { color: "#DC2626", fontWeight: 700 } : {}}>
                        {a.rul}
                      </td>
                      <td className="px-[14px] py-[10px]">
                        <button className="text-[10px] font-semibold px-2.5 py-1 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                          Ground
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───── AI Assistant Panel ───── */}
      <div
        className={`absolute top-0 h-full w-[410px] bg-white border-l border-[#E2E8F0] z-[200] flex flex-col shadow-2xl transition-[right] duration-300 ease-out`}
        style={{ right: aiOpen ? 0 : -430 }}
      >
        <div className="px-4 py-3.5 border-b border-[#E2E8F0] flex items-center gap-2.5 bg-[#0F172A]">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0">
            <Sparkles size={15} />
          </div>
          <div>
            <div className="text-[13px] font-bold text-[#F1F5F9]">AURA Intelligence</div>
            <div className="text-[10px] text-[#10B981] flex items-center gap-1">
              <span className="w-[5px] h-[5px] rounded-full bg-[#10B981]" /> Online
            </div>
          </div>
          <button
            onClick={() => setAiOpen(false)}
            className="ml-auto w-[26px] h-[26px] rounded-md border border-white/10 flex items-center justify-center text-[#94A3B8] hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
          {aiMessages.map((m, i) =>
            m.role === "ai" ? (
              <div key={i}>
                <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl rounded-bl-sm px-[13px] py-[10px] text-[12px] leading-relaxed text-[#0F172A] max-w-[92%]">
                  {m.text}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">{m.time}</div>
              </div>
            ) : (
              <div key={i} className="flex flex-col items-end">
                <div className="bg-[#2563EB] text-white rounded-xl rounded-br-sm px-[13px] py-[10px] text-[12px] leading-relaxed max-w-[86%]">
                  {m.text}
                </div>
                <div className="text-[10px] text-[#94A3B8] mt-0.5">{m.time}</div>
              </div>
            )
          )}
          <div ref={aiMsgsEndRef} />
        </div>

        <div className="p-3 border-t border-[#E2E8F0]">
          <div className="flex gap-1.5">
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
              placeholder="Ask about fleet, components, schedules..."
              className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#2563EB] transition-colors placeholder:text-[#94A3B8]"
            />
            <button
              onClick={() => sendAiMessage()}
              className="w-9 h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
