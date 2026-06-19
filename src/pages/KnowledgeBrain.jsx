import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, Bell, Boxes, Brain, CalendarCheck,
  CheckCircle2, ChevronDown, ChevronRight, ClipboardList, Clock, Cpu,
  Download, FileText, Gauge, GitBranch, Layers, LayoutDashboard, Leaf,
  Loader2, MapPin, Menu, MessageSquare, Minus, Network, Plane, PlaneTakeoff,
  Radio, RefreshCw, Search, Settings, ShieldAlert, Sparkles, TrendingDown,
  TrendingUp, Wrench, X
} from 'lucide-react';

/* ----------------------------------------------------------------------- */
/* DUMMY DATA                                                               */
/* ----------------------------------------------------------------------- */

const FLEET_AIRCRAFT = [
  { id: 'AS-1142', type: 'A320', risk: 'safe',     score: 12, base: 'KJFK', hours: 18420, lastInspection: '2026-05-28', issue: null, confidence: null },
  { id: 'AS-1187', type: 'A320', risk: 'safe',     score: 18, base: 'KORD', hours: 21110, lastInspection: '2026-06-02', issue: null, confidence: null },
  { id: 'AS-1203', type: 'B737', risk: 'medium',   score: 54, base: 'KDFW', hours: 26840, lastInspection: '2026-04-19', issue: 'APU starter valve wear trending above baseline', confidence: 68 },
  { id: 'AS-1219', type: 'B737', risk: 'safe',     score: 9,  base: 'KSEA', hours: 14290, lastInspection: '2026-06-10', issue: null, confidence: null },
  { id: 'AS-1244', type: 'A350', risk: 'critical', score: 88, base: 'EGLL', hours: 31760, lastInspection: '2026-03-30', issue: 'Hydraulic pump pressure drop consistent with fleet cluster', confidence: 91 },
  { id: 'AS-1267', type: 'A350', risk: 'safe',     score: 21, base: 'EDDF', hours: 19980, lastInspection: '2026-06-05', issue: null, confidence: null },
  { id: 'AS-1302', type: 'B787', risk: 'medium',   score: 61, base: 'RJTT', hours: 28310, lastInspection: '2026-04-22', issue: 'Avionics cooling fan vibration signature rising', confidence: 73 },
  { id: 'AS-1318', type: 'B787', risk: 'safe',     score: 14, base: 'OMDB', hours: 16540, lastInspection: '2026-06-08', issue: null, confidence: null },
  { id: 'AS-1339', type: 'A220', risk: 'safe',     score: 7,  base: 'CYYZ', hours: 11200, lastInspection: '2026-06-12', issue: null, confidence: null },
  { id: 'AS-1356', type: 'A220', risk: 'medium',   score: 47, base: 'KBOS', hours: 17650, lastInspection: '2026-05-01', issue: 'Fuel flow transducer anomaly matched to known cluster', confidence: 59 },
  { id: 'AS-1372', type: 'B777', risk: 'safe',     score: 16, base: 'WSSS', hours: 22980, lastInspection: '2026-06-06', issue: null, confidence: null },
  { id: 'AS-1391', type: 'B777', risk: 'critical', score: 91, base: 'OTHH', hours: 33410, lastInspection: '2026-03-18', issue: 'Landing gear proximity sensor drift accelerating', confidence: 88 },
  { id: 'AS-1408', type: 'A320', risk: 'safe',     score: 11, base: 'KLAX', hours: 15870, lastInspection: '2026-06-11', issue: null, confidence: null },
  { id: 'AS-1422', type: 'A320', risk: 'medium',   score: 58, base: 'LFPG', hours: 24990, lastInspection: '2026-04-27', issue: 'Hydraulic pressure pattern matched at 79% similarity', confidence: 79 },
  { id: 'AS-1447', type: 'B737', risk: 'safe',     score: 19, base: 'KATL', hours: 20130, lastInspection: '2026-06-09', issue: null, confidence: null },
  { id: 'AS-1463', type: 'B737', risk: 'safe',     score: 22, base: 'KPHX', hours: 18760, lastInspection: '2026-06-04', issue: null, confidence: null },
  { id: 'AS-1481', type: 'A350', risk: 'medium',   score: 49, base: 'LEMD', hours: 23410, lastInspection: '2026-05-09', issue: 'Hydraulic pump signature drifting toward cluster norm', confidence: 64 },
  { id: 'AS-1502', type: 'A350', risk: 'safe',     score: 13, base: 'LIRF', hours: 17220, lastInspection: '2026-06-07', issue: null, confidence: null },
  { id: 'AS-1519', type: 'B787', risk: 'safe',     score: 8,  base: 'VHHH', hours: 12880, lastInspection: '2026-06-13', issue: null, confidence: null },
  { id: 'AS-1534', type: 'B787', risk: 'critical', score: 84, base: 'ZBAA', hours: 30150, lastInspection: '2026-03-25', issue: 'Cooling fan wear pattern beyond predictive threshold', confidence: 85 },
  { id: 'AS-1551', type: 'A220', risk: 'safe',     score: 15, base: 'CYUL', hours: 13990, lastInspection: '2026-06-10', issue: null, confidence: null },
  { id: 'AS-1568', type: 'A220', risk: 'safe',     score: 10, base: 'KMSP', hours: 12410, lastInspection: '2026-06-14', issue: null, confidence: null },
  { id: 'AS-1583', type: 'B777', risk: 'medium',   score: 52, base: 'RKSI', hours: 25670, lastInspection: '2026-04-30', issue: 'Proximity sensor drift detected, early stage', confidence: 55 },
  { id: 'AS-1599', type: 'B777', risk: 'safe',     score: 17, base: 'NZAA', hours: 19340, lastInspection: '2026-06-03', issue: null, confidence: null },
];

const FAILURE_PATTERNS = [
  {
    id: 'p1',
    name: 'Hydraulic Pressure Drop Cluster',
    aircraft: ['A320', 'B737', 'A350'],
    component: 'Hydraulic Pump',
    similarity: 87,
    affected: 6,
    description: 'Pressure telemetry across six airframes shows a matching decay curve in the primary hydraulic pump prior to fault, independent of aircraft family. The swarm model first flagged this on AS-1244 and has since back-matched the same signature to AS-1422 and AS-1481 at lower severity.',
  },
  {
    id: 'p2',
    name: 'APU Starter Valve Degradation',
    aircraft: ['B737', 'A220'],
    component: 'APU Starter Valve',
    similarity: 74,
    affected: 4,
    description: 'Starter valve cycle counts correlate with ground-time temperature exposure above 38°C. AS-1203 is the leading indicator; the model predicts onset on two additional B737 airframes within 30 flight cycles.',
  },
  {
    id: 'p3',
    name: 'Avionics Cooling Fan Wear',
    aircraft: ['A350', 'B787'],
    component: 'Cooling Fan Assembly',
    similarity: 68,
    affected: 3,
    description: 'Vibration spectra on the avionics bay cooling fan show early bearing wear harmonics. Pattern strength is rising on AS-1302 and AS-1534, with a shared supplier batch identified as a contributing factor.',
  },
  {
    id: 'p4',
    name: 'Landing Gear Sensor Drift',
    aircraft: ['A320', 'A321', 'B777'],
    component: 'Proximity Sensor',
    similarity: 81,
    affected: 5,
    description: 'Proximity sensor calibration drift is converging across the A320 family and has now appeared on a B777, suggesting a firmware-level rather than airframe-specific cause. AS-1391 carries the highest confidence reading.',
  },
  {
    id: 'p5',
    name: 'Fuel Flow Sensor Anomaly',
    aircraft: ['B737', 'B777'],
    component: 'Fuel Flow Transducer',
    similarity: 59,
    affected: 2,
    description: 'Transducer readings on AS-1356 deviate intermittently from redundant sensor pairs. Similarity to a prior resolved cluster is moderate; the model is still building confidence before recommending action.',
  },
];

const AI_INSIGHTS = [
  { severity: 'critical', text: 'Hydraulic pump failure pattern detected across 6 aircraft types. Propagation risk: 72%. Recommended preventive inspection within 48 hours.' },
  { severity: 'warning', text: 'APU starter valve wear correlates with ground-time temperature exposure above 38°C, now appearing on two additional airframes.' },
  { severity: 'warning', text: 'Landing gear sensor drift is converging across the A320 family with 91% model confidence; flagged for fleet-wide firmware review.' },
  { severity: 'info', text: 'Swarm model updated 14,228 parameters after ingesting telemetry from AS-1244 and AS-1391; predictive accuracy improved 3.1%.' },
];

const LEARNING_FLOW = [
  { id: 'AS-1142', type: 'A320', risk: 'safe',     note: 'Baseline telemetry source' },
  { id: 'AS-1481', type: 'A350', risk: 'medium',   note: 'Pattern validated, severity rising' },
  { id: 'AS-1244', type: 'A350', risk: 'critical', note: 'Failure predicted, 91% confidence' },
];

const OVERVIEW_CARDS = [
  { label: 'Total Fleet Learning Events', value: '18,442', icon: Network, iconBg: 'bg-blue-50', iconText: 'text-blue-600', valueText: 'text-slate-900', delta: '+342 today', deltaColor: 'text-emerald-600', trend: 'up', tag: 'Fleet' },
  { label: 'Active Failure Patterns', value: '5', icon: GitBranch, iconBg: 'bg-amber-50', iconText: 'text-amber-600', valueText: 'text-amber-600', delta: '+1 this week', deltaColor: 'text-amber-600', trend: 'up', tag: 'Monitor' },
  { label: 'Cross-Aircraft Alerts', value: '12', icon: Radio, iconBg: 'bg-sky-50', iconText: 'text-sky-600', valueText: 'text-sky-600', delta: '+4 last 24h', deltaColor: 'text-sky-600', trend: 'up', tag: 'Active' },
  { label: 'High Risk Aircraft Clusters', value: '3', icon: ShieldAlert, iconBg: 'bg-red-50', iconText: 'text-red-600', valueText: 'text-red-600', delta: 'Action required', deltaColor: 'text-red-600', trend: 'flat', tag: 'Critical' },
];

const NAV_GROUPS = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard },
      { label: 'Fleet Overview', icon: PlaneTakeoff },
      { label: 'Aircraft Registry', icon: ClipboardList },
      { label: 'Digital Twin', icon: Boxes },
      { label: 'Predictive Maintenance', icon: Activity },
      { label: 'Decision Twin', icon: GitBranch },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Maintenance Planner', icon: CalendarCheck },
      { label: 'Fleet Intelligence', icon: Network, active: true },
      { label: 'Knowledge Brain', icon: Brain },
      { label: 'Material Intelligence', icon: Layers },
      { label: 'Sustainability', icon: Leaf },
    ],
  },
  {
    title: 'Config',
    items: [{ label: 'Settings', icon: Settings }],
  },
];

/* ----------------------------------------------------------------------- */
/* HELPERS                                                                  */
/* ----------------------------------------------------------------------- */

const RISK_META = {
  safe:     { label: 'Safe',     dot: 'bg-emerald-500', border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-400' },
  medium:   { label: 'Medium',   dot: 'bg-amber-500',   border: 'border-amber-200',   bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-400' },
  critical: { label: 'Critical', dot: 'bg-red-500',     border: 'border-red-200',     bg: 'bg-red-50',     text: 'text-red-600',     ring: 'ring-red-400' },
};

const SEVERITY_META = {
  critical: { border: 'border-red-400', bg: 'bg-red-50', icon: 'text-red-500', label: 'Critical' },
  warning:  { border: 'border-amber-400', bg: 'bg-amber-50', icon: 'text-amber-500', label: 'Watch' },
  info:     { border: 'border-blue-400', bg: 'bg-blue-50', icon: 'text-blue-500', label: 'Info' },
};

function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp size={14} className="text-emerald-500" />;
  if (trend === 'down') return <TrendingDown size={14} className="text-red-500" />;
  return <Minus size={14} className="text-slate-400" />;
}

function fmtTime(date) {
  return date.toLocaleTimeString('en-US', { hour12: false });
}

/* ----------------------------------------------------------------------- */
/* SIDEBAR                                                                  */
/* ----------------------------------------------------------------------- */

function SidebarNav() {
  return (
    <>
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white tracking-tight truncate">AURA-SWARM X</p>
          <p className="text-[11px] text-slate-500 truncate">Fleet Intelligence Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${
                      item.active
                        ? 'bg-blue-600 text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 cursor-blink" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs text-emerald-400">All systems nominal</span>
        </div>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------------- */
/* LEARNING GRAPH SUBCOMPONENTS                                             */
/* ----------------------------------------------------------------------- */

function LearningNode({ node }) {
  const meta = RISK_META[node.risk];
  return (
    <div className={`w-full md:w-48 shrink-0 rounded-lg border ${meta.border} ${meta.bg} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 font-mono text-sm text-slate-800">
          <Plane size={14} className={meta.text} /> {node.id}
        </span>
        <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      </div>
      <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">{node.type}</p>
      <p className="text-xs text-slate-500 leading-snug">{node.note}</p>
    </div>
  );
}

function LearningConnector({ label }) {
  return (
    <div className="relative flex-1 flex items-center justify-center px-2 py-6 md:py-0">
      <div className="absolute left-1/2 top-0 h-6 w-px bg-slate-200 md:hidden" />
      <div className="hidden md:block relative h-px w-full bg-slate-200 overflow-hidden">
        <span className="pulse-dot absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_2px_rgba(37,99,235,0.45)]" />
      </div>
      <div className="absolute -top-3 md:top-1/2 md:-translate-y-1/2 bg-white px-2 md:px-3">
        <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-blue-600 whitespace-nowrap">
          {label} <ArrowRight size={12} className="md:hidden rotate-90" />
        </span>
      </div>
      <ArrowRight size={14} className="hidden md:block absolute right-0 text-slate-300" />
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* MAIN PAGE                                                                */
/* ----------------------------------------------------------------------- */

export default function FleetIntelligencePage() {
  const [now, setNow] = useState(new Date());
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [expandedPattern, setExpandedPattern] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [log, setLog] = useState([
    { time: '00:00:00', text: 'Fleet intelligence session initialized.' },
  ]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pushLog = useCallback((text) => {
    setLog((prev) => [{ time: fmtTime(new Date()), text }, ...prev].slice(0, 6));
  }, []);

  const handleAction = useCallback((key) => {
    if (key === 'analyze') {
      setIsAnalyzing(true);
      pushLog('Fleet-wide analysis initiated across 24 aircraft...');
      setTimeout(() => {
        setIsAnalyzing(false);
        pushLog('Analysis complete — 3 new cross-aircraft correlations identified.');
      }, 1800);
      return;
    }
    if (key === 'report') pushLog('Risk report generated — FLT-INT-0619.pdf queued.');
    if (key === 'maintenance') pushLog('Preventive maintenance directive sent to 3 high-risk aircraft.');
    if (key === 'export') pushLog('Intelligence report exported to fleet ops archive.');
  }, [pushLog]);

  const riskCount = (risk) => FLEET_AIRCRAFT.filter((a) => a.risk === risk).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .pulse-dot { animation: pulse-travel 2.6s linear infinite; }
          .cursor-blink { animation: blink 1s steps(1) infinite; }
        }
        @keyframes pulse-travel {
          0% { left: 0%; opacity: 0; }
          8% { opacity: 1; }
          92% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>

      <div className="flex">
        {/* ============ DESKTOP SIDEBAR ============ */}
        <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-[#0B1220] z-30">
          <SidebarNav />
        </aside>

        {/* ============ MOBILE SIDEBAR DRAWER ============ */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close navigation"
              onClick={() => setMobileNavOpen(false)}
              className="absolute inset-0 bg-black/50"
            />
            <div className="relative flex flex-col w-64 h-full bg-[#0B1220]">
              <button
                onClick={() => setMobileNavOpen(false)}
                className="absolute top-4 right-3 text-slate-400 hover:text-white p-1"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
              <SidebarNav />
            </div>
          </div>
        )}

        {/* ============ CONTENT COLUMN ============ */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full">

          {/* ============ TOP BAR ============ */}
          <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
            <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>

              <div className="hidden sm:flex items-center gap-1.5 text-sm whitespace-nowrap">
                <span className="text-slate-400">Operations</span>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-slate-900 font-medium">Fleet Intelligence Center</span>
              </div>

              <div className="flex-1 flex justify-center px-1 sm:px-2">
                <div className="relative w-full max-w-md">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search aircraft ID, component, pattern..."
                    className="w-full rounded-lg bg-slate-100 border border-transparent pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">7</span>
                </button>
                <button
                  className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                  aria-label="Fleet alerts"
                >
                  <Radio size={18} />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">3</span>
                </button>
                <button
                  className="hidden sm:inline-flex p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                  aria-label="Messages"
                >
                  <MessageSquare size={18} />
                </button>
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center ml-1">
                  OP
                </div>
              </div>
            </div>
          </header>

          {/* ============ MAIN CONTENT ============ */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1600px] w-full">

            {/* ============ SECTION 1: PAGE HEADER ============ */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Fleet Intelligence Center
                </h1>
                <p className="text-slate-500 mt-1">Swarm learning system for aircraft fleets</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 cursor-blink" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <Sparkles size={12} /> AI Swarm Active
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 font-mono">
                  <Clock size={12} /> {fmtTime(now)} UTC
                </span>
                <button
                  onClick={() => handleAction('export')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                >
                  <Download size={15} /> Export
                </button>
                <button
                  onClick={() => handleAction('analyze')}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                >
                  {isAnalyzing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                  {isAnalyzing ? 'Syncing...' : 'Sync Fleet'}
                </button>
              </div>
            </div>

            {/* ============ SECTION 2: OVERVIEW CARDS ============ */}
            <section aria-label="Fleet intelligence overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {OVERVIEW_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
                      <div className={`h-9 w-9 rounded-lg ${card.iconBg} flex items-center justify-center ${card.iconText} shrink-0`}>
                        <Icon size={17} />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold tabular-nums ${card.valueText}`}>{card.value}</p>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className={`flex items-center gap-1 text-xs font-medium ${card.deltaColor}`}>
                        <TrendIcon trend={card.trend} /> {card.delta}
                      </span>
                      <span className="text-xs text-slate-400">{card.tag}</span>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* ============ SECTION 3: FLEET RISK HEATMAP ============ */}
            <section aria-label="Fleet risk heatmap" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Gauge size={18} className="text-blue-600" /> Fleet Risk Heatmap
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">24 aircraft &middot; click a tile for detail</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  {Object.entries(RISK_META).map(([key, meta]) => (
                    <span key={key} className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${meta.dot}`} /> {meta.label} ({riskCount(key)})
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
                {FLEET_AIRCRAFT.map((ac) => {
                  const meta = RISK_META[ac.risk];
                  const isSelected = selectedAircraft?.id === ac.id;
                  return (
                    <button
                      key={ac.id}
                      onClick={() => setSelectedAircraft(ac)}
                      className={`group relative rounded-lg border ${meta.border} ${meta.bg} px-2 py-3 text-left transition-all hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${isSelected ? `ring-2 ring-offset-1 ${meta.ring}` : ''}`}
                    >
                      <span className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      <p className="font-mono text-[11px] sm:text-xs text-slate-700">{ac.id}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ac.type}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ============ SECTION 4: SIMILAR FAILURE PATTERNS ============ */}
            <section aria-label="Similar failure patterns" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-1">
                <Network size={18} className="text-blue-600" /> Similar Failure Patterns
              </h2>
              <p className="text-sm text-slate-500 mb-3">Clustered across the fleet by the swarm learning model</p>

              <div className="divide-y divide-slate-100">
                {FAILURE_PATTERNS.map((p) => {
                  const isOpen = expandedPattern === p.id;
                  return (
                    <div key={p.id}>
                      <button
                        onClick={() => setExpandedPattern(isOpen ? null : p.id)}
                        className="w-full flex items-center gap-4 py-3.5 text-left rounded-md hover:bg-slate-50 px-2 -mx-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {p.aircraft.join(', ')} &middot; {p.component}
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 w-32">
                          <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-blue-600" style={{ width: `${p.similarity}%` }} />
                          </div>
                          <span className="font-mono text-xs text-blue-600 w-9 text-right">{p.similarity}%</span>
                        </div>
                        <span className="sm:hidden font-mono text-xs text-blue-600">{p.similarity}%</span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="pb-4 pl-1 pr-8 -mt-1">
                          <p className="text-sm text-slate-600 leading-relaxed">{p.description}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            Affects <span className="text-slate-700 font-mono">{p.affected}</span> aircraft fleet-wide
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ============ SECTION 5: LEARNING GRAPH (UI MOCK) ============ */}
            <section aria-label="Aircraft to aircraft learning graph" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-1">
                <Cpu size={18} className="text-blue-600" /> Aircraft-to-Aircraft Learning Graph
              </h2>
              <p className="text-sm text-slate-500 mb-6">How one airframe's telemetry propagates into a fleet-wide prediction</p>

              <div className="flex flex-col md:flex-row md:items-center">
                <LearningNode node={LEARNING_FLOW[0]} />
                <LearningConnector label="shares data" />
                <LearningNode node={LEARNING_FLOW[1]} />
                <LearningConnector label="predicts" />
                <LearningNode node={LEARNING_FLOW[2]} />
              </div>
            </section>

            {/* ============ SECTION 6: AI INSIGHTS PANEL ============ */}
            <section aria-label="AI insights" className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/40 to-white p-5 sm:p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-1">
                <Brain size={18} className="text-blue-600" /> AI Insights
              </h2>
              <p className="text-sm text-slate-500 mb-4">Generated by the swarm model from current fleet telemetry</p>

              <div className="space-y-3">
                {AI_INSIGHTS.map((insight, i) => {
                  const meta = SEVERITY_META[insight.severity];
                  return (
                    <div key={i} className={`flex gap-3 rounded-lg border-l-4 ${meta.border} ${meta.bg} px-4 py-3`}>
                      <AlertTriangle size={16} className={`${meta.icon} mt-0.5 shrink-0`} />
                      <div>
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${meta.icon}`}>{meta.label}</span>
                        <p className="text-sm text-slate-700 leading-relaxed mt-0.5">{insight.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ============ SECTION 7: RECOMMENDED ACTIONS PANEL ============ */}
            <section aria-label="Recommended actions" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Wrench size={18} className="text-blue-600" /> Recommended Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => handleAction('analyze')}
                  disabled={isAnalyzing}
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed px-4 py-3 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                >
                  {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
                  {isAnalyzing ? 'Analyzing fleet...' : 'Run Fleet Analysis'}
                </button>
                <button
                  onClick={() => handleAction('report')}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                >
                  <FileText size={16} /> Generate Risk Report
                </button>
                <button
                  onClick={() => handleAction('maintenance')}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                >
                  <ShieldAlert size={16} /> Trigger Preventive Maintenance
                </button>
                <button
                  onClick={() => handleAction('export')}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                >
                  <Download size={16} /> Export Intelligence Report
                </button>
              </div>

              <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900 p-4 font-mono text-xs space-y-1.5 max-h-40 overflow-y-auto">
                {log.map((entry, i) => (
                  <p key={i} className={i === 0 ? 'text-emerald-400' : 'text-slate-500'}>
                    <span className="text-slate-600">[{entry.time}]</span> {entry.text}
                  </p>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ============ AIRCRAFT DETAIL SLIDE-OVER ============ */}
      {selectedAircraft && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label="Close aircraft detail"
            onClick={() => setSelectedAircraft(null)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full max-w-sm bg-white border-l border-slate-200 h-full overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Plane size={18} className="text-blue-600" /> {selectedAircraft.id}
              </h3>
              <button
                onClick={() => setSelectedAircraft(null)}
                className="text-slate-400 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 rounded"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className={`inline-flex items-center gap-2 rounded-full border ${RISK_META[selectedAircraft.risk].border} ${RISK_META[selectedAircraft.risk].bg} px-3 py-1 mb-6`}>
              <span className={`h-2 w-2 rounded-full ${RISK_META[selectedAircraft.risk].dot}`} />
              <span className={`text-xs font-mono uppercase tracking-wider ${RISK_META[selectedAircraft.risk].text}`}>
                {RISK_META[selectedAircraft.risk].label} &middot; score {selectedAircraft.score}
              </span>
            </div>

            <dl className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <dt className="text-slate-500">Aircraft Type</dt>
                <dd className="text-slate-800 font-mono">{selectedAircraft.type}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <dt className="text-slate-500 flex items-center gap-1"><MapPin size={13} /> Home Base</dt>
                <dd className="text-slate-800 font-mono">{selectedAircraft.base}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <dt className="text-slate-500">Flight Hours</dt>
                <dd className="text-slate-800 font-mono">{selectedAircraft.hours.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <dt className="text-slate-500">Last Inspection</dt>
                <dd className="text-slate-800 font-mono">{selectedAircraft.lastInspection}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Swarm Model Flag</p>
              {selectedAircraft.issue ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedAircraft.issue}</p>
                  <p className="text-xs text-amber-600 font-mono mt-2">Model confidence: {selectedAircraft.confidence}%</p>
                </div>
              ) : (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <p className="text-sm text-slate-700">No active flags from the swarm model.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => { handleAction('maintenance'); setSelectedAircraft(null); }}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-3 text-sm font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
            >
              <RefreshCw size={16} /> Queue for Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}