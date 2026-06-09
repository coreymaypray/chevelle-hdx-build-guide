/* ============================================================
   chevelle-app.js — vanilla port of the refined React redesign
   Zero dependencies. Offline. Single render() with scroll
   preservation; ephemeral UI state lives in state.ui so it
   survives re-renders. Interactions via event delegation.
   ============================================================ */
(function () {
'use strict';

const DATA = window.CHEVELLE_DATA;
const { STAGE, PHASES, SKILLS, GLOSSARY } = DATA;

/* ---------- helpers ---------- */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---------- icon set (transcribed from ui.jsx PATHS) ---------- */
const ICON = {
  home:    '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  build:   '<path d="M4 6h10"/><path d="M4 12h16"/><path d="M4 18h7"/><circle cx="18" cy="6" r="2"/><circle cx="15" cy="18" r="2"/>',
  gauge:   '<path d="M12 14 16 9"/><circle cx="12" cy="13" r="9"/><path d="M3.5 13h2M18.5 13h2M12 4v2"/>',
  route:   '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.5"/>',
  engine:  '<path d="M7 9h3V6h4l2 3h2v3h-2v3h-3v3H8l-2-3H4V9h3"/>',
  layers:  '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  wrench:  '<path d="M14.5 5.5a3.5 3.5 0 0 0-4.6 4.3l-6 6 2.3 2.3 6-6a3.5 3.5 0 0 0 4.3-4.6l-2.1 2.1-1.7-1.7 2.1-2.1Z"/>',
  book:    '<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4Z"/><path d="M5 18h14"/>',
  alert:   '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
  list:    '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  dollar:  '<path d="M12 2v20"/><path d="M17 5.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  recom:   '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  search:  '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sun:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  moon:    '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>',
  check:   '<path d="m4 12 5 5L20 6"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  chevronL:'<path d="m15 6-6 6 6 6"/>',
  info:    '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  x:       '<path d="M6 6 18 18M18 6 6 18"/>',
  zoom:    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3-3M11 8v6M8 11h6"/>',
  plus:    '<path d="M12 5v14M5 12h14"/>',
  minus:   '<path d="M5 12h14"/>',
  reset:   '<path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.3 2.6L3 8"/><path d="M3 3v5h5"/>',
  panel:   '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  clock:   '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bolt:    '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
  arrowR:  '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowL:  '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  spark:   '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
  flag:    '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  sliders: '<path d="M4 7h9M19 7h1M4 12h1M11 12h9M4 17h5M15 17h5"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="12" cy="17" r="2"/>',
};
function icon(name, size, cls, style) {
  size = size || 20;
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"'
    + (cls ? ' class="' + cls + '"' : '')
    + ' style="width:' + size + 'px;height:' + size + 'px;' + (style || '') + '">'
    + (ICON[name] || '') + '</svg>';
}

/* ---------- atoms ---------- */
function progressRing(pct, size, stroke, done) {
  size = size || 30; stroke = stroke || 3.4;
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - pct);
  return '<svg width="' + size + '" height="' + size + '" class="ring' + (done ? ' ring-done' : '') + '">'
    + '<circle class="ring-bg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + stroke + '"/>'
    + '<circle class="ring-fg" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + stroke + '" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '"/></svg>';
}
function stageTag(stage) {
  const S = STAGE[stage];
  if (!S) return '';
  const color = 'oklch(0.7 0.16 ' + S.hue + ')';
  return '<span class="stage-tag" style="background:color-mix(in oklab, ' + color + ' 16%, transparent);color:' + color + '">'
    + '<span class="sdot" style="background:' + color + '"></span>' + esc(S.label) + '</span>';
}
function pill(iconName, text) {
  return '<span class="pill">' + (iconName ? icon(iconName, 14) : '') + esc(text) + '</span>';
}
function callout(type, text) {
  return '<div class="callout ' + type + '">' + icon(type === 'warn' ? 'alert' : 'info', 18) + '<div>' + esc(text) + '</div></div>';
}
function barneyChip(topic, text, open) {
  return '<div class="barney' + (open ? ' open' : '') + '" data-act="barney">'
    + '<button class="barney-head"><span class="b-i">🔰</span><span class="b-t">' + esc(topic) + '</span><span class="b-c">Why?</span>'
    + icon('chevron', 15, 'b-x') + '</button>'
    + '<div class="barney-body">' + esc(text) + '</div></div>';
}

/* ---------- progress helpers ---------- */
function phaseProgress(phase, checks) {
  const total = phase.substeps.length; let done = 0;
  for (let i = 0; i < total; i++) if (checks[phase.id + ':' + i]) done++;
  return { done, total, pct: total ? done / total : 0, complete: done === total && total > 0, started: done > 0 };
}
function overallProgress(phases, checks) {
  let t = 0, d = 0;
  phases.forEach(p => { t += p.substeps.length; p.substeps.forEach((_, i) => { if (checks[p.id + ':' + i]) d++; }); });
  return { done: d, total: t, pct: t ? d / t : 0 };
}

/* ---------- nav config ---------- */
const NAV = [
  { group: 'Build', items: [
    { id: 'home', label: 'Overview', icon: 'home' },
    { id: 'build', label: 'Build Steps', icon: 'build' },
  ]},
  { group: 'Reference', items: [
    { id: 'dash', label: 'Dash Layout', icon: 'gauge' },
    { id: 'wiring', label: 'Wiring & Diagrams', icon: 'route' },
    { id: 'engine', label: 'Engine Bay', icon: 'engine' },
    { id: 'skills', label: 'Skills', icon: 'wrench' },
    { id: 'glossary', label: 'Glossary', icon: 'book' },
    { id: 'specs', label: 'Specs & Torque', icon: 'layers' },
    { id: 'trouble', label: 'Troubleshooting', icon: 'alert' },
  ]},
  { group: 'Track', items: [
    { id: 'recom', label: 'Recommission', icon: 'recom' },
    { id: 'budget', label: 'Budget & Parts', icon: 'dollar' },
  ]},
];
const VIEW_TITLES = {
  home: 'Overview', build: 'Build Steps', dash: 'Dash Layout', wiring: 'Wiring & Diagrams',
  skills: 'Skills', glossary: 'Glossary', specs: 'Specs & Torque', trouble: 'Troubleshooting',
  recom: 'Recommissioning', budget: 'Budget & Parts', engine: 'Engine Bay',
};

/* ---------- reference data (verbatim from views.jsx) ---------- */
const DASH_GAUGES = [
  { key: 'tach', n: 'Tachometer', range: '0 – 8000 RPM', cx: 78, cy: 62, r: 34, color: '#3fb950',
    sender: 'Coil negative (–) signal', cal: 'Set cylinder count to 8', wire: 'Green signal wire',
    trace: ['Coil negative (–)', 'Green tach lead', 'HDX control box', 'Cluster — RPM'],
    note: 'Keep the tach lead 6 inches from plug wires and the coil or you get EMI flutter at idle.' },
  { key: 'speed', n: 'Speedometer', range: '0 – 120 MPH', cx: 242, cy: 62, r: 34, color: '#5aa9ff',
    sender: 'VSS at trans tailshaft', cal: 'GPS calibrate (easiest)', wire: 'VSS pulse',
    trace: ['Trans tailshaft VSS', 'Pulse signal', 'HDX control box', 'Cluster — MPH'],
    note: 'Confirm the pulse count if using an electronic VSS. GPS calibration avoids guessing it.' },
  { key: 'oil', n: 'Oil Pressure', range: '0 – 100 PSI', cx: 138, cy: 84, r: 22, color: '#e0a13a',
    sender: '3-wire HDX sender, block port', cal: 'None — factory cal', wire: 'Sig / pwr / gnd',
    trace: ['Block port sender', '3-wire lead', 'HDX control box', 'Cluster — PSI'],
    note: 'NPT sender — two wraps of Teflon, hand-tight plus ¼ turn. Don’t crank it.' },
  { key: 'temp', n: 'Water Temp', range: '100 – 260 °F', cx: 182, cy: 84, r: 22, color: '#f0533f',
    sender: 'Intake manifold sender', cal: 'None — factory cal', wire: 'Sig / pwr / gnd',
    trace: ['Intake manifold sender', '3-wire lead', 'HDX control box', 'Cluster — °F'],
    note: 'Drain coolant below the port before you pull the plug, or you get a faceful.' },
  { key: 'volt', n: 'Voltmeter', range: '8 – 18 V', cx: 44, cy: 108, r: 17, color: '#caa53a',
    sender: 'System voltage at box', cal: 'None', wire: 'Switched 12V',
    trace: ['Switched 12V', 'HDX control box', 'Cluster — Volts'],
    note: 'A low reading at idle is almost always a bad ground, not a bad alternator.' },
  { key: 'fuel', n: 'Fuel Level', range: 'E – F', cx: 276, cy: 108, r: 17, color: '#9b7bd8',
    sender: 'Tank sending unit', cal: 'Calibrate empty & full', wire: 'Sender signal',
    trace: ['Tank sending unit', 'Rear body harness', 'HDX control box', 'Cluster — Fuel'],
    note: 'If it reads backwards, the sender is inverted — flip the invert setting, don’t rewire.' },
];
const ENGINE_PARTS = [
  { n: 'Oil Pressure Sender', loc: 'Block oil galley port', thread: '¼" NPT', wire: '3-wire to HDX box', note: 'Teflon tape, ¼ turn past snug. Route the lead away from the headers.' },
  { n: 'Coolant Temp Sender', loc: 'Intake manifold port', thread: '⅜" NPT', wire: '3-wire to HDX box', note: 'Drain coolant below the port first.' },
  { n: 'Speed Sender / VSS', loc: 'Trans tailshaft', thread: 'Adapter / cable', wire: 'Pulse to HDX box', note: 'Cable-drive or electronic depending on trans. Note the pulse count.' },
  { n: 'Tach Signal', loc: 'Ignition coil (–)', thread: '—', wire: 'Green signal lead', note: 'Keep 6 inches from plug wires to avoid EMI on the signal.' },
  { n: 'Charging / Alternator', loc: 'Alternator + battery', thread: '—', wire: 'Charge wire + ground strap', note: 'Engine-to-chassis ground strap is essential for stable gauges.' },
];
const DIAGRAMS = [
  { src: 'aaw-diagrams/aaw-schematic-1971-72.png', label: 'Full Schematic 1971–72', d: 'Complete vehicle wiring schematic' },
  { src: 'aaw-diagrams/aaw-bag-h-instrument.png', label: 'Bag H — Instrument', d: 'Instrument cluster connections' },
  { src: 'aaw-diagrams/aaw-bag-h-circuit-board.png', label: 'Bag H — Circuit Board', d: 'Gauges vs warning-light pinout' },
  { src: 'aaw-diagrams/aaw-bag-j-engine-wiring.png', label: 'Bag J — Engine Wiring', d: 'Engine bay harness detail' },
  { src: 'aaw-diagrams/aaw-bag-m-rear-body.png', label: 'Bag M — Rear Body', d: 'Tail lights, fuel sender, ground' },
  { src: 'aaw-diagrams/aaw-fuse-panel-layout.png', label: 'Fuse Panel Layout', d: '18 AAW fuse slots + amp ratings' },
  { src: 'aaw-diagrams/aaw-fuse-panel-install.png', label: 'Fuse Panel Install', d: '26 numbered connections' },
];
const CIRCUITS = [
  { c: 'Ignition switched 12V', col: '#f0533f', colN: 'Pink', fn: 'Gauges, radio — hot in RUN/ACC only' },
  { c: 'Constant 12V', col: '#e0a13a', colN: 'Orange', fn: 'Clock, memory, horn — always hot' },
  { c: 'Chassis ground', col: '#777', colN: 'Black', fn: 'Return to battery negative' },
  { c: 'Tach signal', col: '#3fb950', colN: 'Green', fn: 'From coil negative to HDX box' },
  { c: 'Headlight', col: '#5aa9ff', colN: 'Blue', fn: 'Low/high beam feed' },
];
const TROUBLE = [
  { icon: '①', title: 'Gauges jitter or read erratically', body: 'Almost always a bad ground. Check the HDX control box ground and the cluster ground — scrape to bare metal and use a star washer.' },
  { icon: '②', title: 'Tach reads double or half', body: 'Wrong cylinder count in the HDX menu. Set it to 8 for the Big Block.' },
  { icon: '③', title: 'Fuel gauge reads backwards', body: 'Sender is inverted. Flip the invert setting in the HDX menu rather than rewiring.' },
  { icon: '④', title: 'Temp or oil gauge pegged or dead', body: 'Wrong (non-HDX) sender with the wrong ohm range. Use Dakota Digital spec senders only.' },
  { icon: '⑤', title: 'Tach noise / fluttering at idle', body: 'EMI from plug wires or coil. Re-route the tach signal at least 6 inches away and twist the pair.' },
  { icon: '⑥', title: 'Speedometer reads wrong', body: 'Re-run calibration — GPS mode is easiest. Confirm the pulse count if using electronic VSS.' },
  { icon: '⑦', title: 'No power to cluster', body: 'Check switched 12V at the connector with a test light, key on. Verify the fuse.' },
  { icon: '⑧', title: 'Backlight won\'t dim', body: 'Dimmer wire not connected or on constant 12V. Route to the factory dimmer circuit.' },
  { icon: '⑨', title: 'TFT screen blank', body: 'Ribbon cable not fully seated to the control box. Re-seat firmly.' },
  { icon: '⑩', title: 'Everything acts strange at once', body: 'Single shared bad ground at the control box. Fix the box ground first before chasing individual gauges.' },
];
const TORQUE = [
  ['Seat track bolts', 'Grade 8', '35 ft-lb'], ['Seat belt anchors', 'Grade 8', '40 ft-lb'],
  ['Steering column U-joint', '—', '30 ft-lb'], ['Dash support brackets', 'M6', '9 ft-lb'],
  ['Oil pressure sender', '¼" NPT', 'hand + ¼ turn'], ['Coolant temp sender', '⅜" NPT', 'hand + ¼ turn'],
];
const PARTS = [
  'HDX-70C-CVL cluster', 'HDX control box', 'BIM expansion', 'AAW Classic Update harness',
  'Oil pressure sender', 'Coolant temp sender', 'VSS / speed sender', 'Dynamat Xtreme (36 sq ft)',
  'Hi-Tech SS dash kit', 'Molded carpet', 'Headliner kit', 'Door panels',
];
const RECOM_ITEMS = [
  'Drain & replace engine oil + filter', 'Flush & refill coolant', 'Bleed & flush brake fluid',
  'Replace fuel filter, drain old fuel', 'Inspect all flex brake lines for cracks', 'Charge battery on proper charger',
  'Prime oil pump before first crank', 'Check all belts & hoses', 'Inspect tires for dry rot & set pressure',
  'Test all lights & signals', 'Verify charging system voltage', 'Short shakedown drive — watch gauges',
];
const BUDGET = [
  ['Gauges', 'Dakota Digital HDX-70C-CVL', 1395], ['Wiring', 'AAW Classic Update harness', 685],
  ['Interior', 'Hi-Tech SS dash kit', 520], ['Interior', 'Carpet + headliner + panels', 940],
  ['Sound', 'Dynamat Xtreme bulk', 310], ['Engine', 'Senders + NPT fittings', 165],
  ['Recommission', 'Fluids, filters, brake parts', 430], ['Misc', 'Connectors, loom, hardware', 180],
];

/* ============================================================
   STATE
   ============================================================ */
const LS_KEY = 'chevelle_refined_v1';
const SET_KEY = 'chevelle_refined_settings_v1';
const ACCENTS = ['#ff6a2b', '#e23b3b', '#3f7bf0', '#1f9d57', '#caa53a'];
const SETTING_DEFAULTS = { theme: 'dark', accent: '#ff6a2b', density: 'comfortable', layout: 'split', barneyDefault: false };

function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } }

const persisted = load(LS_KEY, {});
const state = {
  view: persisted.view || 'home',
  activePhase: persisted.activePhase == null ? 0 : persisted.activePhase,
  checks: persisted.checks || {},
  barneyMode: persisted.barneyMode == null ? false : persisted.barneyMode,
  collapsed: persisted.collapsed || false,
  search: '',
  settings: Object.assign({}, SETTING_DEFAULTS, load(SET_KEY, {})),
  settingsOpen: false,
  ui: { expanded: {}, accordion: null, dashSel: 'tach', glossLocal: '', barneyOpen: {} },
};

function persist() {
  localStorage.setItem(LS_KEY, JSON.stringify({
    view: state.view, activePhase: state.activePhase, checks: state.checks,
    barneyMode: state.barneyMode, collapsed: state.collapsed,
  }));
}
function persistSettings() { localStorage.setItem(SET_KEY, JSON.stringify(state.settings)); }

function resolvedTheme() {
  return state.settings.theme === 'auto'
    ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : state.settings.theme;
}
function applySettings() {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolvedTheme());
  root.style.setProperty('--accent', state.settings.accent);
  if (state.settings.density === 'compact') {
    root.style.setProperty('--pad', '13px'); root.style.setProperty('--gap', '14px'); root.style.setProperty('--fs-base', '15px');
  } else {
    root.style.setProperty('--pad', '16px'); root.style.setProperty('--gap', '20px'); root.style.setProperty('--fs-base', '16px');
  }
  document.body.classList.toggle('barney-on', !!state.barneyMode);
}

/* ============================================================
   VIEW RENDERERS (return HTML strings)
   ============================================================ */
function railHTML() {
  const ov = overallProgress(PHASES, state.checks);
  const completePhases = PHASES.filter(p => phaseProgress(p, state.checks).complete).length;
  let nav = '';
  NAV.forEach(grp => {
    nav += '<div><div class="rail-group-label">' + grp.group + '</div>';
    grp.items.forEach(it => {
      const meta = it.id === 'build' ? '<span class="nv-meta">' + completePhases + '/' + PHASES.length + '</span>' : '';
      nav += '<button class="nav-item' + (state.view === it.id ? ' active' : '') + '" data-act="view" data-view="' + it.id + '" title="' + esc(it.label) + '">'
        + icon(it.icon, 20) + '<span class="lbl">' + esc(it.label) + '</span>' + meta + '</button>';
    });
    nav += '</div>';
  });
  return '<aside class="rail">'
    + '<div class="rail-head"><div class="rail-mark">' + icon('gauge', 24, '', 'color:#fff') + '</div>'
    + '<div class="rail-title"><div class="t1">1972 Chevelle SS</div><div class="t2">HDX Build Guide</div></div></div>'
    + '<div class="rail-progress-wrap"><div class="rail-progress-top"><span class="rp-pct">' + Math.round(ov.pct * 100) + '%</span>'
    + '<span class="rp-lab">' + completePhases + ' / ' + PHASES.length + ' phases</span></div>'
    + '<div class="rail-progress-bar"><div class="rail-progress-fill" style="width:' + (ov.pct * 100) + '%"></div></div></div>'
    + '<nav class="rail-nav">' + nav + '</nav></aside>';
}

function topbarHTML() {
  const view = state.view;
  const crumb = view === 'build' ? 'Build'
    : (['dash', 'wiring', 'engine', 'skills', 'glossary', 'specs', 'trouble'].indexOf(view) > -1 ? 'Reference'
      : (['recom', 'budget'].indexOf(view) > -1 ? 'Track' : 'Build'));
  const theme = resolvedTheme();
  return '<header class="topbar">'
    + '<button class="tb-collapse" data-act="collapse" title="Toggle sidebar">' + icon('panel', 20) + '</button>'
    + '<div class="tb-title"><div class="crumb">' + crumb + '</div><h1>' + esc(VIEW_TITLES[view]) + '</h1></div>'
    + '<div class="tb-spacer"></div>'
    + '<label class="tb-search">' + icon('search') + '<input id="tb-search-input" value="' + esc(state.search) + '" placeholder="Search steps, terms…"/>'
    + (state.search ? '' : '<kbd>⌘K</kbd>') + '</label>'
    + '<button class="barney-toggle' + (state.barneyMode ? ' on' : '') + '" data-act="barneymode" title="Expand all plain-language explainers">'
    + '<span class="bt-icon">🔰</span><span>Barney Mode</span><span class="bt-switch"></span></button>'
    + '<button class="icon-btn" data-act="theme" title="Toggle theme">' + icon(theme === 'light' ? 'moon' : 'sun', 19) + '</button>'
    + '<button class="icon-btn" data-act="settings" title="Settings">' + icon('sliders', 19) + '</button>'
    + '</header>';
}

function clusterMiniHTML(litCount) {
  const gauges = [
    { cx: 70, cy: 60, r: 30, lbl: 'TACH' }, { cx: 230, cy: 60, r: 30, lbl: 'SPEED' },
    { cx: 130, cy: 80, r: 20, lbl: 'OIL' }, { cx: 170, cy: 80, r: 20, lbl: 'TEMP' },
    { cx: 40, cy: 104, r: 16, lbl: 'VOLT' }, { cx: 260, cy: 104, r: 16, lbl: 'FUEL' },
  ];
  let g = '';
  gauges.forEach((x, i) => {
    const lit = i < litCount;
    const tx = x.cx + x.r * 0.55 * Math.cos((-50 + i * 22) * Math.PI / 180);
    const ty = x.cy + x.r * 0.55 * Math.sin((-50 + i * 22) * Math.PI / 180);
    g += '<g><circle class="cg-face' + (lit ? ' lit' : '') + '" cx="' + x.cx + '" cy="' + x.cy + '" r="' + x.r + '"/>'
      + '<circle class="cg-ring' + (lit ? ' lit' : '') + '" cx="' + x.cx + '" cy="' + x.cy + '" r="' + x.r + '"/>'
      + '<line class="cg-tick" x1="' + x.cx + '" y1="' + x.cy + '" x2="' + tx + '" y2="' + ty + '"/>'
      + '<text class="cg-lbl" x="' + x.cx + '" y="' + (x.cy + x.r + 9) + '">' + x.lbl + '</text></g>';
  });
  return '<div class="cluster-mini"><svg viewBox="0 0 300 130">' + g + '</svg></div>';
}

function homeHTML() {
  const ov = overallProgress(PHASES, state.checks);
  const completed = PHASES.filter(p => phaseProgress(p, state.checks).complete).length;
  const current = PHASES.find(p => !phaseProgress(p, state.checks).complete) || PHASES[PHASES.length - 1];
  const curPr = phaseProgress(current, state.checks);
  const remainingHrs = PHASES.filter(p => !phaseProgress(p, state.checks).complete)
    .reduce((s, p) => { const m = (p.time.match(/\d+/g) || []).map(Number); return s + (m.length ? (m.reduce((a, b) => a + b, 0) / m.length) : 2); }, 0);
  const lit = Math.round(ov.pct * 6);
  const quick = [
    { id: 'wiring', icon: 'route', l: 'Wiring Diagrams', d: 'AAW schematics + zoom' },
    { id: 'skills', icon: 'wrench', l: 'Skills', d: '8 how-to references' },
    { id: 'specs', icon: 'layers', l: 'Torque Specs', d: 'Fasteners & parts' },
    { id: 'trouble', icon: 'alert', l: 'Troubleshoot', d: 'Top 10 gotchas' },
  ];
  let quickH = '';
  quick.forEach(q => {
    quickH += '<button class="quick" data-act="view" data-view="' + q.id + '">' + icon(q.icon, 22)
      + '<div><div class="ql">' + esc(q.l) + '</div><div class="qd">' + esc(q.d) + '</div></div></button>';
  });
  let tl = '';
  PHASES.forEach(p => {
    const pr = phaseProgress(p, state.checks);
    const cls = pr.complete ? 'done' : (p.id === current.id ? 'cur' : '');
    tl += '<button class="tl-node ' + cls + '" data-act="phase" data-phase="' + p.id + '">'
      + '<div class="tl-dot">' + (pr.complete ? icon('check', 15) : p.n) + '</div>'
      + '<div class="tl-lab">' + esc(p.title) + '</div></button>';
  });
  return '<div class="page"><div class="home-grid">'
    + '<div class="card hero-card"><div class="hero-photo"><img src="dash-reference.jpg" alt="Chevelle SS dash"/>'
    + '<div class="hero-meta"><div class="car">1972 Chevelle SS</div><div class="sub">Dakota Digital HDX-70C-CVL · American Autowire Classic Update · Big Block 396/454</div></div></div>'
    + '<div class="hero-body"><div class="section-eyebrow">Resume where you left off</div>'
    + '<div class="resume-row" style="margin-top:12px">' + progressRing(curPr.pct, 56, 5, curPr.complete)
    + '<div class="resume-info"><div class="rk">Phase ' + current.n + ' of ' + PHASES.length + '</div><div class="rt">' + esc(current.title) + '</div>'
    + '<div class="rsub">' + curPr.done + ' of ' + curPr.total + ' steps done · ' + esc(current.time) + (current.critical ? ' · ⚠ critical checkpoint' : '') + '</div></div>'
    + '<button class="solid-btn" data-act="phase" data-phase="' + current.id + '">' + (curPr.started ? 'Continue' : 'Start') + ' ' + icon('arrowR', 18) + '</button></div></div></div>'
    + '<div style="display:flex;flex-direction:column;gap:var(--gap)"><div class="stat-grid">'
    + '<div class="stat"><div class="sv mono">' + Math.round(ov.pct * 100) + '<span class="unit">%</span></div><div class="sl">Complete</div></div>'
    + '<div class="stat"><div class="sv mono">' + completed + '<span class="unit">/' + PHASES.length + '</span></div><div class="sl">Phases done</div></div>'
    + '<div class="stat"><div class="sv mono">' + ov.done + '<span class="unit">/' + ov.total + '</span></div><div class="sl">Steps checked</div></div>'
    + '<div class="stat"><div class="sv mono">~' + Math.round(remainingHrs) + '<span class="unit">hr</span></div><div class="sl">Est. remaining</div></div></div>'
    + '<div class="card pad" style="display:flex;flex-direction:column;gap:12px"><div class="section-eyebrow">Cluster comes alive as you build</div>'
    + clusterMiniHTML(lit) + '<div class="faint" style="font-size:13px;text-align:center">' + lit + ' of 6 gauges lit</div></div></div></div>'
    + '<div class="quick-row">' + quickH + '</div>'
    + '<div class="card pad timeline-card"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
    + '<div class="section-eyebrow">Build timeline · ' + PHASES.length + ' phases</div>'
    + '<button class="ghost-btn" style="height:34px" data-act="view" data-view="build">Open Build ' + icon('arrowR', 15) + '</button></div>'
    + '<div class="timeline">' + tl + '</div></div></div>';
}

function substepHTML(phase, i, s) {
  const checked = !!state.checks[phase.id + ':' + i];
  const exp = !!state.ui.expanded[phase.id + ':' + i];
  return '<div class="substep' + (checked ? ' checked' : '') + (exp ? ' exp' : '') + '">'
    + '<div class="ss-row" data-act="check" data-pid="' + phase.id + '" data-idx="' + i + '" style="cursor:pointer">'
    + '<div class="ss-n mono">' + (i + 1) + '</div><div class="ss-check">' + icon('check', 15) + '</div>'
    + '<div class="ss-main"><div class="ss-text">' + esc(s.text) + '</div>'
    + (s.detail ? '<button class="ss-detailbtn" data-act="expand" data-pid="' + phase.id + '" data-idx="' + i + '">' + icon('chevron', 13) + ' ' + (exp ? 'Hide detail' : 'More detail') + '</button>' : '')
    + '</div></div>'
    + (s.detail ? '<div class="ss-detail">' + esc(s.detail) + '</div>' : '')
    + '</div>';
}

function phaseDetailHTML(phase) {
  const pr = phaseProgress(phase, state.checks);
  const prev = PHASES.find(p => p.n === phase.n - 1);
  const next = PHASES.find(p => p.n === phase.n + 1);
  let h = '<div class="phase-detail"><div class="pd-head">'
    + '<div class="pd-n mono"' + (pr.complete ? ' style="background:var(--good);color:#fff;border-color:var(--good)"' : '') + '>'
    + (pr.complete ? icon('check', 22) : phase.n) + '</div>'
    + '<div class="pd-titles"><h2>' + esc(phase.title) + '</h2><div class="pd-sub">' + stageTag(phase.stage) + pill('clock', phase.time)
    + (phase.critical ? '<span class="pill" style="color:var(--bad);border-color:color-mix(in oklab,var(--bad) 35%,transparent)">' + icon('alert') + 'Critical checkpoint</span>' : '')
    + '</div></div></div>';
  if (phase.goal) h += '<p class="pd-goal">' + esc(phase.goal) + '</p>';
  h += '<div class="pd-prog">' + progressRing(pr.pct, 40, 4.4, pr.complete)
    + '<div class="pp-bar"><div class="pp-fill' + (pr.complete ? ' done' : '') + '" style="width:' + (pr.pct * 100) + '%"></div></div>'
    + '<span class="pp-txt mono">' + pr.done + '/' + pr.total + '</span>'
    + '<button class="ghost-btn" style="height:36px" data-act="checkall" data-pid="' + phase.id + '">' + (pr.complete ? 'Clear all' : 'Check all') + '</button></div>';
  if (phase.barney) h += barneyChip(phase.barney.topic, phase.barney.text, state.barneyMode || !!state.ui.barneyOpen[phase.id]);
  if (phase.callouts) phase.callouts.forEach(c => { h += callout(c.type, c.text); });
  if (phase.tools && phase.tools.length) {
    h += '<div class="block-label">' + icon('wrench', 14) + ' Tools for this phase</div><div class="tools-wrap">';
    phase.tools.forEach(t => { h += pill(null, t); });
    h += '</div>';
  }
  if (phase.materials) h += '<div class="kit-bag"><div class="kb-t">📦 Materials</div><div class="kb-c">' + esc(phase.materials) + '</div></div>';
  if (phase.diagrams && phase.diagrams.length) {
    h += '<div class="block-label">' + icon('route', 14) + ' Diagrams · tap to zoom</div><div class="diagram-strip">';
    phase.diagrams.forEach(d => {
      h += '<button class="diagram-thumb" data-act="zoom" data-src="' + esc(d.src) + '" data-label="' + esc(d.label) + '">'
        + '<div class="dt-img"><img src="' + esc(d.src) + '" alt="' + esc(d.label) + '"/><span class="dt-zoom">' + icon('zoom', 15) + '</span></div>'
        + '<div class="dt-cap">' + esc(d.label) + '</div></button>';
    });
    h += '</div>';
  }
  h += '<div class="block-label">' + icon('list', 14) + ' Steps · ' + pr.done + '/' + pr.total + ' done</div><div class="substeps">';
  phase.substeps.forEach((s, i) => { h += substepHTML(phase, i, s); });
  h += '</div><div class="pd-nav">'
    + (prev ? '<button class="ghost-btn" data-act="phase" data-phase="' + prev.id + '">' + icon('arrowL', 15) + ' ' + prev.n + '. ' + esc(prev.title) + '</button>' : '<span></span>')
    + (next ? '<button class="ghost-btn" data-act="phase" data-phase="' + next.id + '">' + next.n + '. ' + esc(next.title) + ' ' + icon('arrowR', 15) + '</button>' : '<span class="pill" style="height:40px">' + icon('flag') + 'Last phase</span>')
    + '</div></div>';
  return h;
}

function buildHTML() {
  const phase = PHASES.find(p => p.id === state.activePhase) || PHASES[0];
  let list = '';
  PHASES.forEach(p => {
    const pr = phaseProgress(p, state.checks);
    list += '<button class="pl-item' + (p.id === state.activePhase ? ' active' : '') + '" data-act="phase" data-phase="' + p.id + '">'
      + '<div class="pl-num' + (pr.complete ? ' done' : (pr.started ? ' partial' : '')) + '">' + (pr.complete ? icon('check', 15) : p.n) + '</div>'
      + '<div class="pl-body"><div class="pl-title">' + esc(p.title) + '</div><div class="pl-meta"><span class="mono">' + esc(p.time) + '</span>'
      + (p.critical ? '<span class="pl-crit">· critical</span>' : '')
      + (!p.critical && pr.started && !pr.complete ? '<span>· ' + pr.done + '/' + pr.total + '</span>' : '') + '</div></div>'
      + (!pr.complete && pr.started ? progressRing(pr.pct, 22, 2.6) : '') + '</button>';
  });
  return '<div class="page"><div class="build-split' + (state.settings.layout === 'stack' ? ' stacked build-stack' : '') + '">'
    + '<div class="card phase-list-card">' + list + '</div>'
    + '<div class="card pad" style="padding:24px 26px">' + phaseDetailHTML(phase) + '</div></div></div>';
}

function accordionHTML(items) {
  let h = '<div class="ref-grid">';
  items.forEach((it, i) => {
    h += '<div class="skill-card' + (state.ui.accordion === i ? ' open' : '') + '">'
      + '<button class="skill-head" data-act="acc" data-idx="' + i + '"><span class="sk-i">' + esc(it.icon) + '</span>'
      + '<span class="sk-t">' + esc(it.title) + '</span>' + icon('chevron', 18, 'sk-x') + '</button>'
      + '<div class="skill-body">' + esc(it.body) + '</div></div>';
  });
  return h + '</div>';
}

function skillsHTML() {
  return '<div class="page"><p class="muted" style="margin-bottom:18px;max-width:62ch">Reusable how-tos for the tasks you’ll repeat across the build. Tap any card to expand.</p>'
    + accordionHTML(SKILLS) + '</div>';
}

function mark(text, q) {
  if (!q) return esc(text);
  const idx = text.toLowerCase().indexOf(q);
  if (idx < 0) return esc(text);
  return esc(text.slice(0, idx)) + '<mark>' + esc(text.slice(idx, idx + q.length)) + '</mark>' + esc(text.slice(idx + q.length));
}
function glossaryHTML() {
  const q = (state.search || state.ui.glossLocal).trim().toLowerCase();
  const list = q ? GLOSSARY.filter(g => (g.term + ' ' + g.def).toLowerCase().indexOf(q) > -1) : GLOSSARY;
  let body;
  if (!list.length) body = '<div class="empty">' + icon('search') + '<div>No terms match “' + esc(q) + '”.</div></div>';
  else {
    body = '<div class="gloss-grid">';
    list.forEach(g => { body += '<div class="gloss-item"><div class="gt">' + mark(g.term, q) + '</div><div class="gd">' + mark(g.def, q) + '</div></div>'; });
    body += '</div>';
  }
  return '<div class="page"><div class="gloss-search">' + icon('search')
    + '<input id="gloss-input" value="' + esc(state.ui.glossLocal) + '" placeholder="Filter terms…"/></div>' + body + '</div>';
}

function dashHTML() {
  const sel = state.ui.dashSel;
  const g = DASH_GAUGES.find(x => x.key === sel) || DASH_GAUGES[0];
  let cluster = '<div class="cluster-mini dash-cluster"><svg viewBox="0 0 320 150">';
  DASH_GAUGES.forEach((x, i) => {
    const on = sel === x.key, ang = (-50 + i * 22) * Math.PI / 180;
    cluster += '<g style="cursor:pointer" data-act="dash" data-key="' + x.key + '">'
      + '<circle class="cg-face' + (on ? ' lit' : '') + '" cx="' + x.cx + '" cy="' + x.cy + '" r="' + x.r + '"/>'
      + '<circle cx="' + x.cx + '" cy="' + x.cy + '" r="' + x.r + '" fill="none" stroke-width="' + (on ? 3 : 2.4) + '" stroke="' + (on ? x.color : 'var(--line-strong)') + '"/>'
      + '<line x1="' + x.cx + '" y1="' + x.cy + '" x2="' + (x.cx + x.r * 0.6 * Math.cos(ang)) + '" y2="' + (x.cy + x.r * 0.6 * Math.sin(ang)) + '" stroke="' + (on ? x.color : 'var(--text-3)') + '" stroke-width="' + (on ? 2 : 1.4) + '" stroke-linecap="round"/>'
      + '<text class="cg-lbl" x="' + x.cx + '" y="' + (x.cy + x.r + 10) + '"' + (on ? ' style="fill:' + x.color + '"' : '') + '>' + x.key.toUpperCase() + '</text></g>';
  });
  cluster += '</svg></div>';
  let flow = '<div class="trace-flow">';
  g.trace.forEach((t, i) => {
    flow += '<span class="trace-node"' + (i === 0 ? ' style="border-color:' + g.color + ';color:' + g.color + '"' : '') + '>' + esc(t) + '</span>'
      + (i < g.trace.length - 1 ? icon('arrowR', 15, 'trace-arrow') : '');
  });
  flow += '</div>';
  return '<div class="page"><p class="muted" style="margin-bottom:18px;max-width:62ch">HDX-70C-CVL layout — six analog gauges plus two TFT message screens. <strong style="color:var(--text)">Tap a gauge</strong> to trace its wiring, sender, and calibration.</p>'
    + '<div class="dash-split"><div class="card pad"><div class="section-eyebrow" style="margin-bottom:10px">Instrument cluster</div>' + cluster
    + '<div class="dash-ref-photo" style="margin-top:14px;cursor:zoom-in" data-act="zoom" data-src="dash-reference-closeup.jpg" data-label="SS Dash — close-up">'
    + '<img src="dash-reference-closeup.jpg" alt="HDX dash closeup"/><span class="dt-zoom" style="position:absolute;right:10px;top:10px">' + icon('zoom', 15) + '</span></div></div>'
    + '<div class="card pad trace-card"><div class="trace-head"><span class="trace-swatch" style="background:' + g.color + '"></span>'
    + '<div><div class="h-md">' + esc(g.n) + '</div><div class="mono" style="color:' + g.color + ';font-size:13px">' + esc(g.range) + '</div></div></div>'
    + '<div class="trace-spec"><span class="ts-k">Sender</span><span class="ts-v">' + esc(g.sender) + '</span></div>'
    + '<div class="trace-spec"><span class="ts-k">Wire</span><span class="ts-v">' + esc(g.wire) + '</span></div>'
    + '<div class="trace-spec"><span class="ts-k">Calibration</span><span class="ts-v">' + esc(g.cal) + '</span></div>'
    + '<div class="block-label" style="margin:18px 0 10px">' + icon('route', 14) + ' Signal path</div>' + flow
    + callout('note', g.note) + '</div></div></div>';
}

function engineHTML() {
  let cards = '';
  ENGINE_PARTS.forEach(p => {
    cards += '<div class="gloss-item"><div class="gt">' + esc(p.n) + '</div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 8px"><span class="pill" style="font-size:12px">' + esc(p.loc) + '</span>'
      + (p.thread !== '—' ? '<span class="pill mono" style="font-size:12px">' + esc(p.thread) + '</span>' : '') + '</div>'
      + '<div class="mono" style="font-size:12.5px;color:var(--accent);margin-bottom:5px">' + esc(p.wire) + '</div>'
      + '<div class="gd">' + esc(p.note) + '</div></div>';
  });
  return '<div class="page"><p class="muted" style="margin-bottom:16px;max-width:62ch">Big-Block 396/454 sender and signal locations. Tap the diagram to zoom; cards below give thread size, wiring, and the install gotcha.</p>'
    + '<button class="diagram-thumb" style="display:block;width:100%;margin-bottom:22px" data-act="zoom" data-src="aaw-diagrams/aaw-bag-j-engine-diagram.png" data-label="Bag J — Engine bay diagram">'
    + '<div class="dt-img" style="aspect-ratio:16/8"><img src="aaw-diagrams/aaw-bag-j-engine-diagram.png" alt="Engine bay diagram"/><span class="dt-zoom">' + icon('zoom', 15) + '</span></div>'
    + '<div class="dt-cap">Bag J — Engine bay wiring & sender locations</div></button>'
    + '<div class="block-label">' + icon('engine', 14) + ' Under-hood components</div><div class="ref-grid">' + cards + '</div></div>';
}

function wiringHTML() {
  let strip = '';
  DIAGRAMS.forEach(d => {
    strip += '<button class="diagram-thumb" data-act="zoom" data-src="' + esc(d.src) + '" data-label="' + esc(d.label) + '">'
      + '<div class="dt-img"><img src="' + esc(d.src) + '" alt="' + esc(d.label) + '"/><span class="dt-zoom">' + icon('zoom', 15) + '</span></div>'
      + '<div class="dt-cap">' + esc(d.label) + '<div class="faint" style="font-weight:400;font-size:12px">' + esc(d.d) + '</div></div></button>';
  });
  let circ = '';
  CIRCUITS.forEach((c, i) => {
    circ += '<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;' + (i ? 'border-top:1px solid var(--line)' : '') + '">'
      + '<span style="width:16px;height:16px;border-radius:4px;background:' + c.col + ';flex-shrink:0;box-shadow:inset 0 1px 2px rgba(0,0,0,.4)"></span>'
      + '<div style="min-width:150px"><div style="font-weight:600;font-size:14.5px">' + esc(c.c) + '</div><div class="faint mono" style="font-size:12px">' + esc(c.colN) + '</div></div>'
      + '<div class="muted" style="font-size:14px">' + esc(c.fn) + '</div></div>';
  });
  return '<div class="page"><p class="muted" style="margin-bottom:16px;max-width:62ch">American Autowire diagrams — tap any to open the full-resolution zoom viewer. Below, a quick circuit lookup.</p>'
    + '<div class="diagram-strip" style="margin-bottom:24px">' + strip + '</div>'
    + '<div class="block-label">' + icon('route', 14) + ' Circuit lookup</div><div class="card" style="overflow:hidden">' + circ + '</div></div>';
}

function troubleHTML() {
  return '<div class="page"><p class="muted" style="margin-bottom:18px;max-width:62ch">The most common HDX-70C-CVL install issues, ranked by frequency. Tap to expand.</p>'
    + accordionHTML(TROUBLE) + '</div>';
}

function specsHTML() {
  let tq = '';
  TORQUE.forEach((r, i) => {
    tq += '<div style="display:flex;align-items:center;padding:13px 16px;' + (i ? 'border-top:1px solid var(--line)' : '') + '">'
      + '<div style="flex:1;font-weight:550;font-size:14.5px">' + esc(r[0]) + '</div>'
      + '<div class="mono muted" style="width:90px;font-size:13px">' + esc(r[1]) + '</div>'
      + '<div class="mono" style="width:120px;text-align:right;color:var(--accent);font-weight:600;font-size:13.5px">' + esc(r[2]) + '</div></div>';
  });
  let parts = '';
  PARTS.forEach(p => { parts += '<div class="pill" style="padding:12px 14px;justify-content:flex-start;font-size:14px">' + esc(p) + '</div>'; });
  return '<div class="page"><div class="block-label">' + icon('bolt', 14) + ' Torque & fastener specs</div>'
    + '<div class="card" style="overflow:hidden;margin-bottom:24px">' + tq + '</div>'
    + '<div class="block-label">' + icon('layers', 14) + ' Key parts inventory</div><div class="ref-grid">' + parts + '</div></div>';
}

function recomHTML() {
  const done = RECOM_ITEMS.filter((_, i) => state.checks['recom:' + i]).length;
  let items = '';
  RECOM_ITEMS.forEach((t, i) => {
    items += '<div class="substep' + (state.checks['recom:' + i] ? ' checked' : '') + '">'
      + '<div class="ss-row" style="cursor:pointer" data-act="check" data-pid="recom" data-idx="' + i + '">'
      + '<div class="ss-n mono">' + (i + 1) + '</div><div class="ss-check">' + icon('check', 15) + '</div>'
      + '<div class="ss-main"><div class="ss-text">' + esc(t) + '</div></div></div></div>';
  });
  return '<div class="page"><p class="muted" style="margin-bottom:14px;max-width:62ch">Car sat for 3 years. Work each item before attempting first start. <strong style="color:var(--text)">' + done + '/' + RECOM_ITEMS.length + ' done.</strong></p>'
    + callout('warn', 'Prime the oil pump before first crank. Dry-starting after a long sit destroys bearings.')
    + '<div class="substeps" style="margin-top:16px">' + items + '</div></div>';
}

function budgetHTML() {
  const total = BUDGET.reduce((s, r) => s + r[2], 0);
  const cats = {}; BUDGET.forEach(r => { cats[r[0]] = (cats[r[0]] || 0) + r[2]; });
  let rows = '';
  BUDGET.forEach((r, i) => {
    rows += '<div style="display:flex;align-items:center;padding:13px 16px;' + (i ? 'border-top:1px solid var(--line)' : '') + '">'
      + '<span class="stage-tag" style="background:var(--surface-2);color:var(--text-3);margin-right:14px;min-width:96px">' + esc(r[0]) + '</span>'
      + '<div style="flex:1;font-size:14.5px">' + esc(r[1]) + '</div>'
      + '<div class="mono" style="font-weight:600;font-size:14.5px">$' + r[2].toLocaleString() + '</div></div>';
  });
  return '<div class="page"><div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">'
    + '<div class="stat"><div class="sv mono">$' + total.toLocaleString() + '</div><div class="sl">Total spend</div></div>'
    + '<div class="stat"><div class="sv mono">' + BUDGET.length + '</div><div class="sl">Line items</div></div>'
    + '<div class="stat"><div class="sv mono">' + Object.keys(cats).length + '</div><div class="sl">Categories</div></div></div>'
    + '<div class="card" style="overflow:hidden">' + rows + '</div></div>';
}

/* settings popover */
function settingsHTML() {
  if (!state.settingsOpen) return '';
  const s = state.settings;
  const radio = (act, val, opts) => opts.map(o =>
    '<button class="seg-btn' + (val === o ? ' on' : '') + '" data-act="' + act + '" data-val="' + o + '">' + o + '</button>').join('');
  const swatches = ACCENTS.map(c =>
    '<button class="acc-sw' + (s.accent === c ? ' on' : '') + '" data-act="set-accent" data-val="' + c + '" style="background:' + c + '"></button>').join('');
  return '<div class="settings-backdrop" data-act="settings-close"></div>'
    + '<div class="settings-panel"><div class="settings-head"><strong>Settings</strong>'
    + '<button class="icon-btn" data-act="settings-close">' + icon('x', 18) + '</button></div>'
    + '<div class="set-row"><span class="set-lbl">Theme</span><div class="seg">' + radio('set-theme', s.theme, ['auto', 'dark', 'light']) + '</div></div>'
    + '<div class="set-row"><span class="set-lbl">Accent</span><div class="acc-row">' + swatches + '</div></div>'
    + '<div class="set-row"><span class="set-lbl">Density</span><div class="seg">' + radio('set-density', s.density, ['comfortable', 'compact']) + '</div></div>'
    + '<div class="set-row"><span class="set-lbl">Build layout</span><div class="seg">' + radio('set-layout', s.layout, ['split', 'stack']) + '</div></div>'
    + '<div class="set-row"><span class="set-lbl">Barney on by default</span><button class="barney-toggle' + (s.barneyDefault ? ' on' : '') + '" data-act="set-barneydefault" style="height:34px"><span class="bt-switch"></span></button></div>'
    + '</div>';
}

function viewHTML() {
  switch (state.view) {
    case 'home': return homeHTML();
    case 'build': return buildHTML();
    case 'dash': return dashHTML();
    case 'engine': return engineHTML();
    case 'wiring': return wiringHTML();
    case 'skills': return skillsHTML();
    case 'glossary': return glossaryHTML();
    case 'specs': return specsHTML();
    case 'trouble': return troubleHTML();
    case 'recom': return recomHTML();
    case 'budget': return budgetHTML();
    default: return homeHTML();
  }
}

/* ============================================================
   RENDER ENGINE (full render + content-only render, scroll-safe)
   ============================================================ */
const appEl = document.getElementById('app');

function render() {
  const sc = appEl.querySelector('.scroll');
  const top = sc ? sc.scrollTop : 0;
  appEl.innerHTML = '<div class="app' + (state.collapsed ? ' rail-collapsed' : '') + '">'
    + railHTML() + '<div class="work">' + topbarHTML() + '<div class="scroll">' + viewHTML() + '</div></div>'
    + settingsHTML() + '</div>';
  const nsc = appEl.querySelector('.scroll'); if (nsc) nsc.scrollTop = top;
}
function renderContent() {
  const sc = appEl.querySelector('.scroll');
  const top = sc ? sc.scrollTop : 0;
  if (sc) sc.innerHTML = viewHTML();
  if (sc) sc.scrollTop = top;
  // settings panel lives at app level; refresh if open
  const existing = appEl.querySelector('.settings-panel');
  if (state.settingsOpen && !existing) render();
  else if (!state.settingsOpen && existing) render();
}

/* ============================================================
   EVENT DELEGATION
   ============================================================ */
function openPhase(id) { state.activePhase = id; state.view = 'build'; state.ui.accordion = null; persist(); render(); }

appEl.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const act = t.getAttribute('data-act');
  switch (act) {
    case 'view': state.view = t.getAttribute('data-view'); state.ui.accordion = null; persist(); render(); break;
    case 'phase': openPhase(Number(t.getAttribute('data-phase'))); break;
    case 'collapse': state.collapsed = !state.collapsed; persist(); render(); break;
    case 'theme': state.settings.theme = resolvedTheme() === 'dark' ? 'light' : 'dark'; persistSettings(); applySettings(); render(); break;
    case 'barneymode': state.barneyMode = !state.barneyMode; persist(); applySettings(); render(); break;
    case 'settings': state.settingsOpen = true; render(); break;
    case 'settings-close': state.settingsOpen = false; render(); break;
    case 'check': {
      const pid = t.getAttribute('data-pid'); const idx = t.getAttribute('data-idx');
      const key = (pid === 'recom' ? 'recom' : Number(pid)) + ':' + idx;
      if (state.checks[key]) delete state.checks[key]; else state.checks[key] = true;
      persist(); render(); break;
    }
    case 'checkall': {
      const pid = Number(t.getAttribute('data-pid'));
      const phase = PHASES.find(p => p.id === pid);
      const allOn = phaseProgress(phase, state.checks).complete;
      phase.substeps.forEach((_, i) => { const k = pid + ':' + i; if (allOn) delete state.checks[k]; else state.checks[k] = true; });
      persist(); render(); break;
    }
    case 'expand': {
      const k = Number(t.getAttribute('data-pid')) + ':' + t.getAttribute('data-idx');
      state.ui.expanded[k] = !state.ui.expanded[k]; renderContent(); break;
    }
    case 'barney': {
      const phase = PHASES.find(p => p.id === state.activePhase);
      if (phase) { state.ui.barneyOpen[phase.id] = !state.ui.barneyOpen[phase.id]; renderContent(); }
      break;
    }
    case 'acc': { const i = Number(t.getAttribute('data-idx')); state.ui.accordion = state.ui.accordion === i ? null : i; renderContent(); break; }
    case 'dash': state.ui.dashSel = t.getAttribute('data-key'); renderContent(); break;
    case 'zoom': openLightbox(t.getAttribute('data-src'), t.getAttribute('data-label')); break;
    case 'set-theme': state.settings.theme = t.getAttribute('data-val'); persistSettings(); applySettings(); render(); break;
    case 'set-density': state.settings.density = t.getAttribute('data-val'); persistSettings(); applySettings(); render(); break;
    case 'set-layout': state.settings.layout = t.getAttribute('data-val'); persistSettings(); render(); break;
    case 'set-accent': state.settings.accent = t.getAttribute('data-val'); persistSettings(); applySettings(); render(); break;
    case 'set-barneydefault':
      state.settings.barneyDefault = !state.settings.barneyDefault;
      state.barneyMode = state.settings.barneyDefault;
      persistSettings(); persist(); applySettings(); render(); break;
  }
});

appEl.addEventListener('input', e => {
  if (e.target.id === 'tb-search-input') {
    state.search = e.target.value;
    if (state.view === 'glossary') { const sc = appEl.querySelector('.scroll'); if (sc) sc.innerHTML = viewHTML(); }
  } else if (e.target.id === 'gloss-input') {
    state.ui.glossLocal = e.target.value;
    const sc = appEl.querySelector('.scroll'); if (sc) { const top = sc.scrollTop; sc.innerHTML = viewHTML(); sc.scrollTop = top; }
    const inp = document.getElementById('gloss-input'); if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  }
});

window.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault(); const el = document.getElementById('tb-search-input'); if (el) el.focus();
  }
  if (e.key === 'Escape') { if (document.querySelector('.lightbox')) closeLightbox(); else if (state.settingsOpen) { state.settingsOpen = false; render(); } }
});

/* ============================================================
   LIGHTBOX (port of Lightbox component)
   ============================================================ */
let lb = null;
function openLightbox(src, label) {
  closeLightbox();
  const z = { scale: 1, x: 0, y: 0, dragging: false, sx: 0, sy: 0, lastTap: 0, pointers: new Map(), pinchDist: 0 };
  const el = document.createElement('div');
  el.className = 'lightbox';
  el.innerHTML = '<div class="lb-bar"><div class="lb-title">' + esc(label) + '</div>'
    + '<button class="lb-btn" data-z="out">' + icon('minus', 20) + '</button>'
    + '<button class="lb-btn" data-z="in">' + icon('plus', 20) + '</button>'
    + '<button class="lb-btn" data-z="reset">' + icon('reset', 20) + '</button>'
    + '<button class="lb-btn" data-z="close">' + icon('x', 20) + '</button></div>'
    + '<div class="lb-stage"><img src="' + esc(src) + '" alt="' + esc(label) + '" draggable="false"/></div>'
    + '<div class="lb-hint">Scroll / pinch / +− to zoom · drag to pan · double-tap to reset · Esc to close</div>';
  document.body.appendChild(el);
  const stage = el.querySelector('.lb-stage');
  const img = el.querySelector('img');
  const apply = () => { img.style.transform = 'translate(' + z.x + 'px,' + z.y + 'px) scale(' + z.scale + ')'; };
  const reset = () => { z.scale = 1; z.x = 0; z.y = 0; apply(); };
  const zoom = f => { z.scale = Math.max(1, Math.min(6, z.scale * f)); if (z.scale === 1) { z.x = 0; z.y = 0; } apply(); };
  el.querySelector('.lb-bar').addEventListener('click', ev => {
    const b = ev.target.closest('[data-z]'); if (!b) return;
    const a = b.getAttribute('data-z');
    if (a === 'out') zoom(0.83); else if (a === 'in') zoom(1.25); else if (a === 'reset') reset(); else closeLightbox();
  });
  stage.addEventListener('wheel', ev => { ev.preventDefault(); zoom(ev.deltaY < 0 ? 1.15 : 0.87); }, { passive: false });
  stage.addEventListener('pointerdown', ev => {
    stage.setPointerCapture(ev.pointerId);
    z.pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (z.pointers.size === 2) { const p = [...z.pointers.values()]; z.pinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); }
    else {
      z.dragging = true; z.sx = ev.clientX - z.x; z.sy = ev.clientY - z.y; stage.classList.add('grabbing');
      const now = Date.now(); if (now - z.lastTap < 300) reset(); z.lastTap = now;
    }
  });
  stage.addEventListener('pointermove', ev => {
    if (!z.pointers.has(ev.pointerId)) return;
    z.pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (z.pointers.size === 2) {
      const p = [...z.pointers.values()]; const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (z.pinchDist) zoom(d / z.pinchDist); z.pinchDist = d;
    } else if (z.dragging && z.scale !== 1) { z.x = ev.clientX - z.sx; z.y = ev.clientY - z.sy; apply(); }
  });
  const up = ev => { z.pointers.delete(ev.pointerId); if (z.pointers.size < 2) z.pinchDist = 0; z.dragging = false; stage.classList.remove('grabbing'); };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('click', ev => { if (ev.target === stage) closeLightbox(); });
  lb = el;
}
function closeLightbox() { if (lb) { lb.remove(); lb = null; } }

/* ============================================================
   INIT
   ============================================================ */
applySettings();
if (state.settings.barneyDefault && persisted.barneyMode == null) state.barneyMode = true;
render();
if (window.matchMedia) {
  try { window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (state.settings.theme === 'auto') { applySettings(); render(); } }); } catch (e) {}
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(r => console.log('SW registered:', r.scope)).catch(err => console.log('SW failed:', err));
}
})();
