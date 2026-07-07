/* ============================================================
   chevelle-app.js — vanilla port of the refined React redesign
   v9: real wiring data (verified vs Dakota Digital MAN 650542H/
   650572B + AAW 510105), Parts Map, fuse panel, global search,
   budget tracker, backup, full recommission, structured trouble.
   Zero dependencies. Offline. Single render() with scroll
   preservation; ephemeral UI state lives in state.ui.
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

/* ---------- icon set ---------- */
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
  pin:     '<path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  download:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/>',
  upload:  '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M4 19h16"/>',
  trash:   '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
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
    { id: 'parts', label: 'Parts Map', icon: 'pin' },
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
  parts: 'Parts Map', skills: 'Skills', glossary: 'Glossary', specs: 'Specs & Torque',
  trouble: 'Troubleshooting', recom: 'Recommissioning', budget: 'Budget & Parts', engine: 'Engine Bay',
};

/* ============================================================
   REFERENCE DATA — verified vs Dakota Digital MAN 650542H /
   650572B and AAW 510105 (see old guide, repo history v7).
   ============================================================ */

/* Real HDX-70C-CVL arrangement: tach left large + TFT below,
   speedo right large + TFT below, right pod 2x2:
   oil TL / temp TR / fuel BL / volt BR. viewBox 0 0 420 190.
   Swatch colors = the ACTUAL signal-wire color for each gauge. */
const DASH_GAUGES = [
  { key: 'tach', n: 'Tachometer', range: '0 – 8000 RPM', cx: 88, cy: 88, r: 58, tft: { x: 58, y: 156, w: 60, h: 14 }, color: '#d8d8e0',
    sender: 'Coil (–) [points] or HEI TACH terminal',
    wire: 'WHITE 18 AWG — Dakota sender sub-harness, direct to Control Box',
    cal: 'Set cylinder count to 8 (396/454)',
    fuse: null,
    trace: ['Coil (–) / HEI TACH', 'Firewall grommet', 'Dakota sender sub-harness', 'HDX Control Box TACH', 'Cluster — RPM'],
    note: 'Route the tach lead at least 6 inches from plug wires and the coil. Suppression (spiral-wound) plug wires are mandatory — solid-core wires cause erratic readings. If it reads double or half, fix the cylinder-count setting.' },
  { key: 'speed', n: 'Speedometer', range: '0 – 140 MPH', cx: 220, cy: 88, r: 58, tft: { x: 190, y: 156, w: 60, h: 14 }, color: '#9b59d0',
    sender: 'Cable-drive adapter (SEN-01-5 type) at trans tailshaft',
    wire: 'PURPLE signal / RED 5V / BLACK gnd — 22 AWG',
    cal: 'GPS auto-cal (easiest) or tire size + axle ratio',
    fuse: null,
    trace: ['Trans tailshaft adapter', 'Floor grommet', 'Dakota sender sub-harness', 'HDX Control Box SPEED', 'Cluster — MPH'],
    note: 'Must be calibrated or it reads wrong. If there is no reading at all, check that the adapter is fully seated in the tailshaft — it can slip out under vibration.' },
  { key: 'oil', n: 'Oil Pressure', range: '0 – 100 PSI', cx: 330, cy: 58, r: 26, color: '#d8d8e0',
    sender: 'SEN-03-8 (3-wire + shield), block oil-galley port, driver side, 1/8" NPT',
    wire: 'WHITE sig / RED 5V / BLACK gnd + bare shield — 22 AWG',
    cal: 'None — factory calibrated',
    fuse: null,
    trace: ['SEN-03-8 at block port', 'Firewall grommet', 'Dakota sender sub-harness', 'HDX Control Box OIL', 'Cluster — PSI'],
    note: 'The old GM single-wire sender will NOT work — if oil reads zero, wrong sender is the #1 cause. Teflon tape, hand-tight + ¼ turn only. The RED 5V comes from the Control Box, not a 12V source.' },
  { key: 'temp', n: 'Water Temp', range: '100 – 260 °F', cx: 388, cy: 58, r: 26, color: '#1f8a4c',
    sender: 'SEN-04-5, intake manifold water jacket, passenger-side front (3/8"→1/8" NPT reducing bushing)',
    wire: 'Two-wire Dakota lead — both wires to Control Box (TEMP INPUT-SIG + TEMP INPUT-GND)',
    cal: 'None — factory calibrated',
    fuse: null,
    trace: ['SEN-04-5 at intake port', 'Firewall grommet', 'Dakota sender sub-harness', 'HDX Control Box TEMP (SIG + GND)', 'Cluster — °F'],
    note: 'Both sender wires land on the Control Box — TEMP INPUT-SIG and TEMP INPUT-GND (MAN 650542H). Teflon tape on the threads is fine; the ground does NOT rely on them. Missing the 3/8"-to-1/8" NPT reducer bushing = no seal = coolant leak. Drain coolant below the port before pulling the plug.' },
  { key: 'fuel', n: 'Fuel Level', range: 'E – F', cx: 330, cy: 122, r: 26, color: '#c8a165',
    sender: 'Factory tank sending unit (0–90 Ω, 1972 GM)',
    wire: 'TAN — twisted pair DIRECT to FUEL INPUT-SIG + GND (no fuse)',
    cal: 'Calibrate empty & full points in HDX menu',
    fuse: null,
    trace: ['Tank sender (0–90 Ω)', 'Bag M rear harness run', 'Twisted pair (SIG+GND)', 'HDX FUEL INPUT', 'Cluster — Fuel'],
    note: 'Per MAN 650542H p.11 the sender signal runs unfused, twisted pair, direct to the box. If the gauge reads backwards the sender range is inverted — use Settings → Calibration → Fuel → Invert, don’t rewire.' },
  { key: 'volt', n: 'Voltmeter', range: '8 – 16 V', cx: 388, cy: 122, r: 26, color: '#caa53a',
    sender: 'Internal — reads system voltage at the Control Box',
    wire: 'Via RED (constant — CLOCK fuse) + PINK (switched — GAUGES fuse) feeds',
    cal: 'None',
    fuse: { label: 'GAUGES', amps: 5 },
    trace: ['GAUGES fuse 5A (PINK)', 'HDX Control Box', 'Cluster — Volts'],
    note: 'Key OFF: 12.4–12.7 V battery rest. Running: 13.5–14.5 V charging. A low reading at idle is almost always a bad ground, not the alternator. Disconnect and insulate the old ammeter bypass wire — it interferes.' },
];

/* AAW 500707 fuse panel — transcribed from the shipped diagram
   aaw-diagrams/aaw-fuse-panel-layout.png (18 positions, top-to-bottom
   as drawn). The printed panel legend has NO slot numbers — fuses are
   identified by circuit name only; `slot` here is purely an internal
   grid-position / selection id, never shown as a panel number.
   ATC colors: tan=5A, red=10A, blue=15A, yellow=20A, green=30A. */
const FUSES = [
  { slot: 1,  label: 'DASH LTS', amps: 10, feed: 'Battery — via headlight switch dimmer', hdx: null, detail: 'Instrument / dash illumination, fed through the headlight-switch rheostat.' },
  { slot: 2,  label: 'FUEL',     amps: 15, feed: 'Ignition', hdx: null, detail: 'Factory fuel circuit. The HDX fuel sender signal is UNFUSED — a fuel-gauge problem means checking the TAN twisted pair and rear body ground, not this fuse.' },
  { slot: 3,  label: 'BRK/CTSY', amps: 15, feed: 'Battery', hdx: null, detail: 'Brake lights + courtesy lamps — hot at all times.' },
  { slot: 4,  label: 'BAT 2',    amps: 30, feed: 'Battery', hdx: null, detail: 'Spare battery-feed circuit.' },
  { slot: 5,  label: 'GAUGES',   amps: 5,  feed: 'Ignition', hdx: 'PINK switched 12V feed — the HDX taps this fuse position. Gauges dark with key ON? Check here FIRST.', detail: 'Instrument power — 5A tan fuse on the ignition bus.' },
  { slot: 6,  label: 'FAN',      amps: 30, feed: 'Ignition', hdx: null, detail: 'Heater blower fan feed.' },
  { slot: 7,  label: 'CLOCK',    amps: 10, feed: 'Battery (always hot)', hdx: 'RED constant 12V feed — keeps HDX memory alive. You land the HDX RED here yourself.', detail: 'Constant-power circuit — keeps the HDX clock and settings alive with the key off.' },
  { slot: 8,  label: 'WIPER',    amps: 10, feed: 'Ignition', hdx: null, detail: 'Wiper motor feed — keep every terminal tight.' },
  { slot: 9,  label: 'AC/HEAT',  amps: 30, feed: 'Ignition', hdx: null, detail: 'HVAC feed.' },
  { slot: 10, label: 'LIGHTER',  amps: 10, feed: 'Battery', hdx: null, detail: 'Cigarette lighter / power port.' },
  { slot: 11, label: 'BAT 1',    amps: 20, feed: 'Battery', hdx: null, detail: 'Spare battery-feed circuit.' },
  { slot: 12, label: 'IGN 1',    amps: 20, feed: 'Ignition', hdx: null, detail: 'Spare ignition-switched feed.' },
  { slot: 13, label: 'ACCY 1',   amps: 30, feed: 'Accessory', hdx: null, detail: 'Spare accessory feed.' },
  { slot: 14, label: 'HAZARD',   amps: 15, feed: 'Battery', hdx: null, detail: 'Hazard flasher circuit — works with the key off.' },
  { slot: 15, label: 'PWR WDO',  amps: 30, feed: 'Ignition', hdx: null, detail: 'Power window option.' },
  { slot: 16, label: 'RADIO',    amps: 10, feed: 'Accessory', hdx: null, detail: 'Radio feed.' },
  { slot: 17, label: 'PARK LT',  amps: 10, feed: 'Battery — via headlight switch', hdx: null, detail: 'Park / marker lamps.' },
  { slot: 18, label: 'TURN',     amps: 10, feed: 'Ignition', hdx: null, detail: 'Turn-signal feed — the AAW TURN SW terminal takes the column-switch wire.' },
];
const fuseByLabel = l => FUSES.find(f => f.label === l);

/* 11 real circuits (old guide lines ~1219-1887) — fused circuits
   reference the FUSES entries above so panel data stays single-source */
const CIRCUITS = [
  { id: 'const12v', name: 'Constant 12V Power', swatch: '#e8453c',
    hdxWire: 'RED', aawWire: 'YELLOW (factory clock feed shares the slot)', awg: '18 AWG',
    fuse: fuseByLabel('CLOCK'), hotWhen: 'Always (key off too)', aawRef: 'AAW 500707 — CLOCK fuse',
    route: ['Battery (+)', 'Engine-bay main harness', 'Bulkhead connector (driver side, 6" left of center)', 'CLOCK fuse 10A', 'HDX Control Box RED'],
    warnings: ['Carries constant power — disconnect the battery before working this circuit; it can arc and cause fire if shorted.'],
    notes: ['The HDX RED wire is NOT part of the AAW harness — you land it on the CLOCK fuse position yourself.', 'Verify: 12.4V+ with key OFF and ON.'] },
  { id: 'sw12v', name: 'Switched 12V Ignition', swatch: '#f06fae',
    hdxWire: 'PINK', aawWire: 'PINK (AAW’s own stock-cluster PINK goes UNUSED — cap it)', awg: '18 AWG',
    fuse: fuseByLabel('GAUGES'), hotWhen: 'Key ON / ACC only', aawRef: 'AAW 500707 — GAUGES fuse',
    route: ['Ignition switch', 'AAW dash harness', 'GAUGES fuse 5A', 'HDX Control Box PINK'],
    warnings: ['If gauges go completely dark with key ON, check the GAUGES fuse FIRST — most common cause.'],
    notes: ['The HDX taps the same GAUGES fuse independently of the capped AAW wire.', 'Verify: 12.4V+ key ON, 0V key OFF.'] },
  { id: 'gnd', name: 'Control Box Ground', swatch: '#777f8c',
    hdxWire: 'BLACK', aawWire: '—', awg: '18 AWG dedicated run',
    fuse: null, hotWhen: '—', aawRef: 'Dedicated firewall/dash bolt',
    route: ['HDX Control Box BLACK', 'Dedicated bolt, driver side firewall/dash (bare metal + star washer)', 'Chassis → battery negative'],
    warnings: ['BAD GROUNDS cause 90% of gauge problems. Must measure < 0.5 Ω to battery negative.', 'Do NOT share this ground with radio, blower, or any high-draw accessory — shared return current injects jitter into the analog senders.'],
    notes: ['Sand to shiny bare metal, star washer under the ring terminal, dielectric grease after tightening.'] },
  { id: 'tach', name: 'Tachometer Signal', swatch: '#d8d8e0',
    hdxWire: 'WHITE', aawWire: 'AAW WHITE — capped on HDX builds (see Phase 2)', awg: '18 AWG',
    fuse: null, hotWhen: 'Engine running (signal)', aawRef: 'Dakota dedicated tach lead',
    route: ['Coil (–) [points] / HEI TACH terminal', 'Firewall grommet (≥6" from plug wires)', 'Dakota sender sub-harness', 'HDX Control Box TACH'],
    warnings: ['Route at least 6 inches from spark-plug wires and the distributor cap — EMI causes erratic readings.', 'Suppression (spiral-wound) plug wires are MANDATORY; solid-core wires break the tach.'],
    notes: ['Set HDX cylinder count to 8 for the 396/454 — wrong count reads exactly double or half.'] },
  { id: 'oil', name: 'Oil Pressure Sender', swatch: '#e0a13a',
    hdxWire: 'WHITE sig / RED 5V / BLACK gnd + bare shield', aawWire: 'AAW DK BLUE — capped on HDX builds', awg: '22 AWG sensor wire',
    fuse: null, hotWhen: '5V reference from Control Box', aawRef: 'Dakota SEN-03-8 sub-harness',
    route: ['SEN-03-8 at block oil-galley port (driver side, 1/8" NPT)', 'Away from headers (3-4" min, heat loom)', 'Firewall grommet', 'Dakota sender sub-harness', 'HDX Control Box OIL'],
    warnings: ['MUST use the Dakota Digital SEN-03-8 — the old GM single-wire sender will NOT work. Oil reading zero? Wrong sender is the #1 cause.', 'Hand-tight + ¼ turn with Teflon tape. Over-tightening cracks the block boss.'],
    notes: ['Ships in the HDX kit (MAN 650542H p.10). Don’t confuse with SEN-01-5 (speed sensor).'] },
  { id: 'temp', name: 'Water Temp Sender', swatch: '#1f8a4c',
    hdxWire: 'DARK GREEN signal', aawWire: 'AAW DK GREEN — capped on HDX builds', awg: '18 AWG',
    fuse: null, hotWhen: 'Sender signal (SIG + GND pair)', aawRef: 'Dakota SEN-04-5 sub-harness',
    route: ['SEN-04-5 at intake manifold water jacket (passenger front)', '3/8"→1/8" NPT reducing bushing', 'Firewall grommet', 'Dakota sender sub-harness', 'HDX Control Box TEMP (SIG + GND)'],
    warnings: ['Missing the 3/8"-to-1/8" NPT reducer bushing = no seal = coolant leak = engine damage. Verify bushing fit first.'],
    notes: ['2-wire sender: BOTH wires go to the Control Box (TEMP INPUT-SIG + TEMP INPUT-GND per MAN 650542H). If the reading is wrong, check both wires at the box — not the threads.'] },
  { id: 'speed', name: 'Speed Sensor (VSS)', swatch: '#9b59d0',
    hdxWire: 'PURPLE sig / RED 5V / BLACK gnd', aawWire: 'AAW Connector H (VSS) — unused; Dakota harness runs direct', awg: '22 AWG sensor wire',
    fuse: null, hotWhen: '5V reference from Control Box', aawRef: 'Cable-drive adapter at trans tailshaft',
    route: ['Adapter threads into tailshaft (where the mechanical cable was)', 'Floor/firewall grommet', 'Dakota sender sub-harness', 'HDX Control Box SPEED'],
    warnings: ['MUST be calibrated or the speedometer reads wrong — GPS method is the most accurate.'],
    notes: ['No reading at all? Verify the adapter is fully seated — it slips out under vibration.'] },
  { id: 'fuel', name: 'Fuel Level', swatch: '#c8a165',
    hdxWire: 'TAN (signal) + dedicated ground — twisted pair', aawWire: 'Bag M rear body harness path', awg: '18 AWG',
    fuse: null, hotWhen: 'Resistance signal — unfused', aawRef: 'Factory tank sender, 0–90 Ω (1972 GM)',
    route: ['Tank sending unit', 'Rear body run (Bag M path)', 'Twisted pair DIRECT', 'HDX FUEL INPUT-SIG + FUEL INPUT-GND'],
    warnings: ['MUST calibrate via HDX menu: drive to empty → mark Empty; fill up → mark Full.'],
    /* NOTE: the panel's FUEL 15A fuse is the factory fuel circuit; per MAN 650542H p.11 the
       HDX sender signal itself is unfused twisted pair — both are represented here deliberately. */
    notes: ['Reads backwards? The sender range is inverted — enable Settings → Calibration → Fuel → Invert instead of rewiring.'] },
  { id: 'dimmer', name: 'Dash Lighting / Dimmer', swatch: '#ff9a3c',
    hdxWire: 'ORANGE', aawWire: 'GREY (dimmed feed from headlight switch)', awg: '18 AWG',
    fuse: null, hotWhen: 'Headlights / park lights on', aawRef: 'AAW 520001 Digital Dim Wire Kit',
    route: ['Headlight switch rotary rheostat', 'AAW 520001 dim kit (GREY)', 'HDX Control Box ORANGE'],
    warnings: [],
    notes: ['Not connected = backlights default to full brightness (not a failure).', 'Flickering backlights → check this connection and the headlight-switch contacts.'] },
  { id: 'turn', name: 'Turn Signals', swatch: '#5aa9ff',
    hdxWire: 'HDX reads indicator status', aawWire: 'LT BLUE (left) / DK BLUE (right)', awg: '16 AWG',
    fuse: fuseByLabel('TURN'), hotWhen: 'Key ON, lever engaged', aawRef: 'AAW Bag G split · flasher can behind dash (driver side)',
    route: ['Column turn-signal switch', 'AAW dash harness', 'TURN fuse 10A', 'Bag G split: LT BLUE left / DK BLUE right', 'Front + rear sockets'],
    warnings: [],
    notes: ['No flash (solid on)? Replace the 2-pin flasher can. One side dead? Check that side’s bulbs — a burned bulb changes resistance and stops the flash.'] },
  { id: 'wiper', name: 'Wiper Motor', swatch: '#8b6cc4',
    hdxWire: '— (not an HDX circuit)', aawWire: 'PURPLE low / BROWN high / YELLOW park / LT BLUE washer', awg: '14–16 AWG',
    fuse: fuseByLabel('WIPER'), hotWhen: 'Key ON', aawRef: 'Bag G → bulkhead → Bag J · motor on firewall, passenger side',
    route: ['Wiper switch', 'AAW dash harness', 'WIPER fuse 10A', 'Bulkhead', 'Bag J engine harness', 'Wiper motor (firewall, passenger side)'],
    warnings: ['Motor-load circuit — loose wiper connections melt connectors. Make every terminal tight.'],
    notes: ['Standalone AAW circuit — included here because it shares the bulkhead route with the gauge wiring.'] },
];

/* Parts Map — where everything physically lives */
const PARTS_MAP = [
  { zone: 'Behind Dash', icon: 'panel',
    media: { src: 'behind-dash-reference.jpg', label: 'Behind the dash',
      caption: 'AAW fuse panel (left), steering column (center), Dakota Digital HDX Control Box with 8-pin display cable (right), heater box (far right)' },
    parts: [
      { n: 'HDX Control Box', pn: 'HDX-70C-CVL kit', loc: 'Behind dash, driver side — accessible for testing; away from HEI/coil', thread: '—',
        wiresIn: 'RED const 12V (CLOCK fuse) · PINK sw 12V (GAUGES fuse) · ORANGE dimmer · all sender leads',
        wiresOut: '8-pin display cable (~3 ft) to cluster · BLACK dedicated ground',
        note: 'Ignition EMI is the dominant display-cable failure mode — mount away from the coil (MAN 650542H p.4).' },
      { n: 'AAW Fuse Panel', pn: 'AAW 500707', loc: 'Firewall bulkhead, driver side, stock OEM hole', thread: '—',
        wiresIn: 'Battery + ignition feeds via bulkhead', wiresOut: '18 fused circuits — HDX taps GAUGES (PINK) + CLOCK (RED); fuel sender is unfused',
        note: 'Flasher can mounts bottom-right corner of the panel.' },
      { n: 'HDX Gauge Cluster', pn: 'HDX-70C-CVL', loc: 'In the SS dash bezel (Hi-Tech Classics dash kit)', thread: '—',
        wiresIn: '8-pin display cable from Control Box', wiresOut: '—',
        note: 'Six analog gauges + two TFT message screens. Don’t crease the flat cable during install.' },
      { n: 'Headlight Switch + Dim Kit', pn: 'AAW 500332 + 520001', loc: 'Dash, driver side (stock location)', thread: '—',
        wiresIn: 'Park/headlight feeds', wiresOut: 'GREY dimmed feed → HDX ORANGE (backlight dimming)',
        note: 'The rotary knob rheostat drives the HDX backlight level.' },
      { n: 'Floor Dimmer Switch', pn: 'AAW 500042', loc: 'Driver footwell floor (stock location)', thread: '—',
        wiresIn: 'Headlight circuit', wiresOut: 'Low/high beam select', note: 'High-beam indicator feeds the cluster.' },
      { n: 'Turn-Signal Flasher', pn: '2-pin can', loc: 'Behind dash, driver side (fuse panel bottom-right)', thread: '—',
        wiresIn: 'Fuse panel TURN feed', wiresOut: 'Column turn-signal switch', note: 'Signals stay solid instead of flashing? Replace this can.' },
      { n: 'Bulkhead Connector', pn: 'AAW 510105', loc: 'Firewall, driver side, ~6" left of center', thread: '—',
        wiresIn: 'Engine-bay harness (Bag J)', wiresOut: 'Dash harness (Bag G)',
        note: 'Seal with dielectric grease on terminals + RTV on the cavities — it’s the weather barrier.' },
      { n: 'Dedicated Ground Bolt', pn: '5/16"-18 + star washer', loc: 'Firewall/dash brace, driver side — bare metal', thread: '5/16"-18',
        wiresIn: 'HDX Control Box BLACK (18 AWG, no splices)', wiresOut: 'Chassis → battery negative',
        note: 'Must read < 0.5 Ω to battery negative. Never share it with other accessories.' },
    ]},
  { zone: 'Engine Bay', icon: 'engine',
    media: { src: 'aaw-diagrams/aaw-bag-j-engine-diagram.png', label: 'Bag J — Engine bay diagram', diagram: true },
    parts: [
      { n: 'Oil Pressure Sender', pn: 'SEN-03-8', loc: 'Block oil-galley port, driver side, mid-height (where the factory sender was)', thread: '1/8" NPT',
        wiresIn: '—', wiresOut: 'WHITE sig / RED 5V / BLACK gnd + bare shield (22 AWG) — Dakota sub-harness direct to Control Box',
        note: 'Teflon tape, hand-tight + ¼ turn. Route the lead 3-4" from headers (heat loom if tight).' },
      { n: 'Coolant Temp Sender', pn: 'SEN-04-5', loc: 'Intake manifold water jacket, passenger-side front', thread: '1/8" NPT via 3/8"→1/8" reducing bushing',
        wiresIn: '—', wiresOut: 'Two wires — Dakota lead direct to Control Box TEMP INPUT-SIG + TEMP INPUT-GND',
        note: 'Drain coolant below the port first. 45°/90° elbow if clearance is tight.' },
      { n: 'Tach Signal Source', pn: '—', loc: 'HEI: TACH terminal on cap · Points: coil negative (–)', thread: '—',
        wiresIn: '—', wiresOut: 'WHITE 18 AWG — Dakota lead direct to Control Box TACH', note: 'Keep ≥6" from plug wires. Suppression wires only.' },
      { n: 'Wiper Motor', pn: '—', loc: 'Firewall, passenger side (4-wire motor)', thread: '—',
        wiresIn: 'PURPLE low / BROWN high / YELLOW park / LT BLUE washer via Bag J', wiresOut: '—',
        note: '20A circuit — keep every connection tight or connectors melt.' },
      { n: 'Alternator + Ground Strap', pn: '—', loc: 'Alternator; strap from engine block to frame/firewall', thread: '—',
        wiresIn: 'Charge wire to battery via Bag Z', wiresOut: 'Engine→chassis ground path',
        note: 'The engine-to-chassis strap is essential for stable gauges — verify it during recommission.' },
      { n: 'Megafuse / Main Power', pn: 'AAW Bag Z (6 ga)', loc: 'Under hood, close to battery — reachable by 12 ft of 6 ga from the starter AND the fuse-panel main feed', thread: '—',
        wiresIn: 'Battery/starter post', wiresOut: 'Main feed to fuse panel via bulkhead', note: 'Protects the whole harness — mount before routing the main feed.' },
    ]},
  { zone: 'Transmission & Under Car', icon: 'route',
    parts: [
      { n: 'Speed Sensor Adapter', pn: 'Cable-drive (SEN-01-5 type)', loc: 'Transmission tailshaft — threads into the stock speedo-cable port', thread: 'Cable-port thread',
        wiresIn: '—', wiresOut: 'PURPLE sig / RED 5V / BLACK gnd (22 AWG) — Dakota sub-harness direct to Control Box',
        note: 'Seat it fully — it slips out under vibration (the classic no-speedo cause). Calibrate after install.' },
      { n: 'Frame/Body Ground', pn: '—', loc: 'Frame-to-body bolt, driver side', thread: '—',
        wiresIn: 'Chassis return paths', wiresOut: 'Battery negative', note: 'Clean to bare metal during recommission; part of the < 0.5 Ω ground chain.' },
    ]},
  { zone: 'Rear', icon: 'layers',
    parts: [
      { n: 'Fuel Tank Sending Unit', pn: 'Factory, 0–90 Ω', loc: 'Inside the fuel tank, top access', thread: '—',
        wiresIn: '—', wiresOut: 'TAN signal — twisted pair with ground, DIRECT to HDX FUEL INPUT (unfused)',
        note: 'No replacement needed — the HDX calibrates to the existing 0–90 Ω unit. Reads backwards → Invert setting.' },
      { n: 'Rear Body Harness', pn: 'AAW Bag M (510111)', loc: 'Under carpet along the rocker, to trunk', thread: '—',
        wiresIn: 'Dash harness rear plug', wiresOut: 'Tail lights, backup lamps, side markers, fuel sender, courtesy ground',
        note: 'Route under the carpet path along the rockers — keep clear of seat-belt anchor holes.' },
      { n: 'Rear Body Ground', pn: '—', loc: 'Trunk area, rear body panel', thread: '—',
        wiresIn: 'Tail-light + fuel-sender returns', wiresOut: 'Chassis', note: 'A bad rear ground makes tail lights dim AND the fuel gauge wander.' },
    ]},
];

/* Engine view cards (aligned with real part numbers) */
const ENGINE_PARTS = [
  { n: 'Oil Pressure Sender — SEN-03-8', loc: 'Block oil-galley port, driver side', thread: '1/8" NPT', wire: 'WHITE/RED/BLACK + shield — direct to Control Box', note: 'Teflon tape, ¼ turn past snug. Old GM single-wire sender will NOT work. Route away from headers.' },
  { n: 'Coolant Temp Sender — SEN-04-5', loc: 'Intake manifold, passenger front', thread: '3/8"→1/8" NPT bushing', wire: 'Two-wire lead — Control Box TEMP INPUT-SIG + TEMP INPUT-GND', note: 'Drain coolant below the port first. Verify the reducer bushing before installing.' },
  { n: 'Speed Sender — cable-drive', loc: 'Trans tailshaft', thread: 'Adapter into cable port', wire: 'PURPLE/RED/BLACK — direct to Control Box', note: 'Seat fully — slips out under vibration. GPS-calibrate after install.' },
  { n: 'Tach Signal', loc: 'HEI TACH terminal / coil (–)', thread: '—', wire: 'WHITE — direct to Control Box TACH', note: 'Keep 6 inches from plug wires; suppression wires mandatory.' },
  { n: 'Charging / Alternator', loc: 'Alternator + battery', thread: '—', wire: 'Charge wire (Bag Z) + engine→chassis ground strap', note: 'The ground strap is essential for stable gauges.' },
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

/* Troubleshooting Top-10 — structured, verbatim from old guide */
const TROUBLE = [
  { icon: '①', title: 'Bad Ground Connection',
    symptom: 'Gauges read erratically, flicker, or show wrong values. Gauges may work sometimes but not others.',
    cause: 'Ground wire bolted to painted surface, rusty metal, or shared with a high-draw circuit. The HDX system is extremely sensitive to ground quality.',
    fix: 'Sand the ground point to bare shiny metal with 80-grit. Use a star washer under the ring terminal. Use a DEDICATED bolt for the HDX Control Box ground — do not share with other accessories. Apply dielectric grease after tightening.',
    test: 'Measure resistance between HDX ground wire and battery negative terminal with a multimeter. Must read less than 0.5 ohms. If higher, clean or relocate the ground point.',
    procedure: { title: '⚠️ Gauge Jitter → Dedicated Ground Test', steps: [
      'With the engine running and gauges showing jitter, measure resistance between the Control Box ground wire (black wire at the dash bolt) and the battery negative terminal',
      'Good ground reads <0.5Ω (near zero). Higher = the bolt is touching paint, rust, or corrosion',
      'Stop the engine. Disconnect the Control Box ground wire at the dash bolt',
      'Sand the bolt to shiny bare metal with 80–120 grit, removing all paint and oxidation',
      'Sand the ring terminal until it is also bright and shiny',
      'Reconnect with a star washer under the ring terminal. Torque hand-tight + ¼ turn',
      'Apply dielectric grease around the connection',
      'Re-test — must now read <0.5Ω',
      'Diagnostic jumper (test ONLY): run a temporary 18 AWG wire from Control Box ground directly to battery negative. If gauges stabilize, the permanent ground point is still bad — clean or relocate it. Never leave the jumper in place.' ] } },
  { icon: '②', title: 'Wrong Oil Pressure Sender',
    symptom: 'Oil pressure gauge reads zero, pegged high, or wildly inaccurate. May work on startup then fail.',
    cause: 'Using the old GM single-wire sender instead of the Dakota Digital SEN-03-8 0-100 PSI solid-state sender that ships with the HDX kit (MAN 650542H p.10). The old GM sender is incompatible and will read zero.',
    fix: 'Remove the old GM single-wire sender. Install the SEN-03-8 and connect all 4 conductors: WHITE=SIG, RED=5V PWR, BLACK=GND, bare shield=DRN. Teflon tape on threads, 3-4 wraps.',
    test: 'With engine at operating temp, oil pressure should read 25-65 PSI at idle (20-40 PSI normal for a stock 396/454 warm idle). Still zero? Verify the 5V reference at the sender connector.',
    fieldTest: 'No spare sender? Pull the SEN-03-8 and bench-test: multimeter across signal and ground pins, warm the sender in a cup of warm (not boiling) water vs ambient air. Resistance varies between temperatures → sender is fine, problem is upstream (wiring, 5V feed, Control Box). Resistance flat → replace the sender.' },
  { icon: '③', title: 'Tach Wire EMI Interference',
    symptom: 'Tachometer reads erratically, bounces, shows double RPM, or works at idle but goes crazy at higher RPM.',
    cause: 'Tach signal wire routed alongside spark plug wires, coil wire, or other high-voltage ignition components. EMI corrupts the signal.',
    fix: 'Route the tach wire at least 6 inches from ALL plug wires and the coil wire. If wires must cross, cross at 90° only. Use shielded wire if the problem persists. Never bundle the tach wire with ignition wiring.',
    test: 'At idle, the tach should read steady within 25 RPM. Rev slowly — the reading should track smoothly. If it jumps, re-route further from the ignition components.' },
  { icon: '④', title: 'Solid-Core Spark Plug Wires',
    symptom: 'Multiple gauges erratic, tach bounces, speedometer jumps, radio interference. Worse at higher RPM.',
    cause: 'Solid-core (copper) plug wires generate massive EMI that disrupts all electronic gauges and the HDX Control Box.',
    fix: 'Replace with spiral-wound or carbon-core suppression wires ONLY (Taylor, MSD, ACCEL, Moroso). Mandatory for any electronic gauge system.',
    test: 'Wire resistance with a multimeter: 500-1500 ohms per foot is correct. Solid-core reads near 0. Replace any wire under 100 ohms/foot.' },
  { icon: '⑤', title: 'Reversed Constant/Switched 12V',
    symptom: 'Gauges stay on after key-off (drains battery), don’t power on at all, or lose memory settings at every key-off.',
    cause: 'The RED (constant, battery-hot) and PINK (switched, ignition-hot) power wires are swapped.',
    fix: 'RED = constant 12V (always hot — keeps memory alive). PINK = switched 12V (hot only in ON/ACC). Verify with a test light or multimeter before connecting.',
    test: 'Key OFF: RED shows 12V, PINK shows 0V. Key ON: both show 12V. Reversed? Swap at the fuse block.' },
  { icon: '⑥', title: 'Missing Temp Sender Bushing',
    symptom: 'Water temp sender doesn’t fit the intake manifold port — threads too small for the hole.',
    cause: 'The SEN-04-5 has 1/8" NPT threads; the Chevy intake port is 3/8" NPT.',
    fix: 'Use a 3/8"-to-1/8" NPT reducing bushing (brass, any parts store). Teflon tape all threads. Tight clearance? Add a 45° or 90° 1/8" NPT elbow.',
    test: 'At operating temp (15-20 min), the gauge should read 180-210°F. Reading off? Verify sender ground and signal connections.' },
  { icon: '⑦', title: 'Display Cable Damaged',
    symptom: 'Some or all gauges dead, TFTs dark, or intermittent failures. May work with hand pressure on the cable.',
    cause: 'The flat 8-pin display cable between Control Box and cluster was bent sharply, pinched, or creased during install.',
    fix: 'Mount the Control Box away from HEI/coil — ignition EMI is the dominant failure mode (MAN 650542H p.4). Route with slack, adhesive clips every 4-6". Damaged? Dakota Digital replacement: 605-332-6513.',
    test: 'Inspect the full cable length for creases and pinch marks. Gently flex while watching the gauges — flicker = damaged cable.' },
  { icon: '⑧', title: 'Speed Sensor Not Calibrated',
    symptom: 'Speedometer reads too high, too low, or not at all. Odometer accumulates wrong mileage.',
    cause: 'The HDX must be calibrated for your tire size and axle ratio — factory defaults rarely match.',
    fix: 'HDX Setup Menu (hold setup 5 s) → SPd → enter tire revs/mile + axle ratio, or use GPS calibration: drive a known distance and let it auto-calculate.',
    test: 'Compare to a GPS speedo app at 30, 50, 70 mph — within 1-2 mph everywhere. Re-calibrate if off.' },
  { icon: '⑨', title: 'Fuel Sender Not Calibrated',
    symptom: 'Reads full at half tank, empty with fuel left, or never reaches F/E.',
    cause: 'Senders vary in resistance range — the HDX must learn YOUR sender’s empty and full values.',
    fix: 'HDX Setup Menu → FUL → with tank near empty set the Empty point; fill completely, set the Full point. The HDX interpolates the rest.',
    test: 'After calibration: E when the tank is genuinely low, F when topped off. Add known fuel amounts to verify mid-range.' },
  { icon: '⑩', title: 'Ammeter vs Voltmeter Confusion',
    symptom: 'Voltmeter reads weird values, or the old ammeter bypass wire is still connected causing issues.',
    cause: 'The factory 1972 Chevelle used an ammeter; the HDX uses a voltmeter. The old ammeter bypass wire interferes if left connected.',
    fix: 'Disconnect and insulate the old ammeter bypass wire (heavy-gauge wire through the firewall). The HDX reads voltage internally through its RED/PINK power feeds — there is no separate voltmeter wire.',
    test: 'Key ON engine off: 12.2-12.8V. Running: 13.5-14.8V. Over 15V or under 12V running → check the alternator.' },
];

/* Torque — verified fastener reference (old guide ~7629-7649) */
const TORQUE = [
  ['Column clamp bracket', '3/8"-16 Gr5', '20 ft-lb'],
  ['Steering wheel nut', '3/4"-20', '35 ft-lb'],
  ['Seat tracks → floor', '5/16"-18, 4/seat', '30 ft-lb'],
  ['Seat belt anchors', 'GRADE 8 7/16"-20 (6 radial lines)', '30 ft-lb'],
  ['Oil drain plug', '5/8" / 15/16" hex', '25 ft-lb'],
  ['Spark plugs', '14mm, 8x', '15–25 ft-lb'],
  ['Wheel lug nuts', '7/16"-20 / 1/2"-20', '85–100 ft-lb, star pattern'],
  ['Oil / temp NPT senders', '1/8" NPT + Teflon', 'hand-tight + ¼ turn'],
];

const PARTS = [
  'HDX-70C-CVL cluster', 'HDX control box', 'SEN-03-8 oil sender', 'SEN-04-5 temp sender',
  'Cable-drive speed sensor', 'AAW 510105 Classic Update harness', 'AAW 500707 fuse panel',
  'AAW 520001 dim wire kit', '3/8"→1/8" NPT reducer bushing', 'Dynamat Xtreme (36 sq ft)',
  'Hi-Tech SS dash kit', 'Molded carpet', 'Headliner kit', 'Door panels',
];

/* Recommission — full verified checklist (old guide ~7028-7132), stable string ids */
const RECOM_GROUPS = [
  { g: 'Battery', items: [
    { id: 'bat-load',   text: 'Load test or replace battery (3 years is likely dead)' },
    { id: 'bat-clean',  text: 'Clean terminals with wire brush and baking soda' },
    { id: 'bat-cables', text: 'Check cable ends for corrosion — replace if green/crusty' },
    { id: 'bat-strap',  text: 'Verify ground strap from engine block to frame/body' } ] },
  { g: 'Fluids',
    note: 'Heater core flush matters: a radiator-only flush misses sludge trapped in the heater core. If the heater core ever clogs, you’re pulling the dash to replace it — a $10 flush now beats an $800 R&R later.',
    items: [
    { id: 'fl-oil',        text: 'Drain and replace engine oil + filter (old oil has moisture and acids)' },
    { id: 'fl-drain',      text: 'Drain coolant from radiator petcock AND both block drain plugs (driver and passenger side, lower)' },
    { id: 'fl-radflush',   text: 'Flush radiator with garden hose through the top inlet until water runs clear' },
    { id: 'fl-heatercore', text: 'If water runs brown/sludgy: flush heater core separately — disconnect both heater hoses at engine, run hose through one until clear water exits the other, then reverse' },
    { id: 'fl-refill',     text: 'Re-tighten block drain plugs with Teflon tape; refill with 50/50 conventional green coolant' },
    { id: 'fl-hoses',      text: 'Inspect radiator and heater hoses (squeeze test — firm, not spongy or cracked)' },
    { id: 'fl-trans',      text: 'Check transmission fluid level and condition' },
    { id: 'fl-ps',         text: 'Check power steering fluid' },
    { id: 'fl-diff',       text: 'Check differential fluid' } ] },
  { g: 'Fuel System', items: [
    { id: 'fuel-drain',  text: 'Drain old fuel from tank (3-year gas is varnished)' },
    { id: 'fuel-lines',  text: 'Inspect fuel lines for cracks or leaks' },
    { id: 'fuel-filter', text: 'Replace fuel filter' },
    { id: 'fuel-pump',   text: 'Inspect fuel pump — prime and check for flow before cranking' },
    { id: 'fuel-carb',   text: 'Check carburetor for stuck float/varnish — rebuild if needed' } ] },
  { g: 'Brakes',
    warn: 'Do NOT road-test until the pedal is firm. A spongy pedal after a proper bleed means trapped air OR an active leak. Both kill you the first time you need to stop hard. Re-bleed, inspect every fitting, repeat — don’t shortcut this.',
    items: [
    { id: 'brk-flush',     text: 'Flush and bleed ALL brake fluid (absorbs moisture — safety critical)' },
    { id: 'brk-pads',      text: 'Inspect brake pads/shoes for glazing' },
    { id: 'brk-rotors',    text: 'Check rotors/drums for surface rust — may need turning' },
    { id: 'brk-lines',     text: 'Inspect brake lines for corrosion or leaks' },
    { id: 'brk-cyls',      text: 'Check wheel cylinders for leaks (rear drums)' },
    { id: 'brk-seq',       text: 'Bleed sequence: RR → LR → RF → LF (furthest from master first)' },
    { id: 'brk-firmpedal', text: 'FIRM-PEDAL TEST: pump pedal 20-30 times, engine off. Pedal must feel firm with no more than ~1 inch travel before hard resistance. If still spongy or sinks under steady pressure → bleed again or find the leak.' },
    { id: 'brk-reinspect', text: 'Re-inspect every fitting and wheel cylinder/caliper for new fluid weeping after the bleed' },
    { id: 'brk-parking',   text: 'Test parking brake cable for free movement' } ] },
  { g: 'Ignition & Electrical',
    note: 'Plug heat range matters: stay with R44T (14mm) on a stock or mildly built 396/454. Hotter plugs (R45T, R46T) pre-ignite on pump gas and can hole a piston.',
    warn: 'Big-block timing trap: running too much advance on a 396/454 makes it ping audibly under load, then quietly hammers pistons for thousands of miles before failure. If you don’t know the cam, leave it at 8° and verify there’s no detonation under hard acceleration in 2nd gear.',
    items: [
    { id: 'ign-plugs',  text: 'Replace spark plugs with AC Delco R44T (or equivalent, 14mm heat range), gapped to .035"' },
    { id: 'ign-cap',    text: 'Check distributor cap and rotor for corrosion' },
    { id: 'ign-wires',  text: 'Inspect spark plug wires for cracks — MUST be spiral-wound or carbon-core suppression type (NOT solid-core). Solid-core wires cause erratic HDX gauge readings.' },
    { id: 'ign-fuses',  text: 'Check all fuses — replace any corroded ones' },
    { id: 'ign-belt',   text: 'Verify alternator belt tension and condition' },
    { id: 'ign-timing', text: 'Set initial timing CONSERVATIVELY: 6-8° BTDC for stock 396/454. Increase only if engine doesn’t ping on 93+ octane under load. Never exceed 12° without knowing cam profile and compression ratio.' },
    { id: 'ign-points', text: 'For points ignition: replace points and condenser, set dwell to 28-32°' } ] },
  { g: 'Tires', items: [
    { id: 'tire-dot',      text: 'Check DOT date code on OUTER sidewall near the bead (bottom edge). Format: WWYY — e.g. 1523 = week 15 of 2023.' },
    { id: 'tire-age',      text: 'Replace any tire older than 6 years regardless of tread depth — rubber dry-rots from the inside' },
    { id: 'tire-sidewall', text: 'Inspect sidewalls for dry-rot cracks and bulges' },
    { id: 'tire-pressure', text: 'Set pressure to spec (typically 28-32 PSI for 14"/15" vintage tires, cold)' },
    { id: 'tire-flatspot', text: 'Expect flat-spot vibration the first few miles — should resolve as tires warm up and round out' },
    { id: 'tire-lugs',     text: 'Re-torque lug nuts after 25-50 miles (85-100 ft-lbs, star pattern)' } ] },
  { g: 'First Start Procedure',
    prime: { title: '⚠️ Prime the Oil Pump Before First Start',
      lead: 'A big-block engine with no oil pressure for 5 seconds will destroy cam bearings and main bearings. This is not optional.',
      steps: [
        'Pull the coil wire from the distributor (disconnect ignition completely)',
        'Crank the engine with the starter in 10–15 second bursts, pausing 5 seconds between bursts',
        'Watch the oil pressure gauge — it should move within the first 5–10 seconds of cranking',
        'Once the gauge shows any pressure (10+ PSI), stop cranking, reconnect the coil wire, and proceed to start',
        'Start the engine normally and watch oil pressure immediately — should see 40+ PSI on a cold start',
        'If the gauge reads ZERO after 10 seconds of running: SHUT OFF THE ENGINE IMMEDIATELY. Do not crank it again until you confirm oil flow at the sender or pump' ] },
    warn: 'Zero oil pressure = stop now. Running a big-block dry destroys cam bearings and main bearings within seconds. If the gauge reads zero, kill the ignition before chasing the cause.',
    items: [
    { id: 'st-oillevel', text: 'Verify oil level (engine cold, level surface, not running for at least 30 min — hot or tilted gives a false reading)' },
    { id: 'st-prime',    text: 'Pull coil wire — crank engine 15 seconds to build oil pressure (or use an oil pump priming tool in a drill)' },
    { id: 'st-coil',     text: 'Reconnect coil wire' },
    { id: 'st-idle',     text: 'Start engine — let idle, do NOT rev' },
    { id: 'st-pressure', text: 'Watch oil pressure: should show 40+ PSI on initial cold start, settling to 20-40 PSI at warm idle. If gauge reads ZERO while cranking or at idle → SHUT OFF IMMEDIATELY.' },
    { id: 'st-leaks',    text: 'Check for leaks (oil, coolant, fuel) while idling' },
    { id: 'st-temp',     text: 'Monitor water temp — let it reach operating temp (~195°F), verify thermostat opens' },
    { id: 'st-pedal',    text: 'Test brake pedal feel before moving the car' } ] },
];

/* Planned-budget reference (static) */
const BUDGET = [
  ['Gauges', 'Dakota Digital HDX-70C-CVL', 1395], ['Wiring', 'AAW Classic Update harness', 685],
  ['Interior', 'Hi-Tech SS dash kit', 520], ['Interior', 'Carpet + headliner + panels', 940],
  ['Sound', 'Dynamat Xtreme bulk', 310], ['Engine', 'Senders + NPT fittings', 165],
  ['Recommission', 'Fluids, filters, brake parts', 430], ['Misc', 'Connectors, loom, hardware', 180],
];
const EXPENSE_CATS = ['Gauges', 'Wiring', 'Interior', 'Sound', 'Engine', 'Recommission', 'Tools', 'Services', 'Misc'];

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
  expenses: persisted.expenses || [],
  recomV: persisted.recomV || 1,
  recomLegacy: persisted.recomLegacy || null,
  search: '',
  settings: Object.assign({}, SETTING_DEFAULTS, load(SET_KEY, {})),
  settingsOpen: false,
  ui: { expanded: {}, accordion: null, dashSel: 'tach', glossLocal: '', barneyOpen: {}, circuitSel: null, fuseSel: null },
};

function persist() {
  localStorage.setItem(LS_KEY, JSON.stringify({
    view: state.view, activePhase: state.activePhase, checks: state.checks,
    barneyMode: state.barneyMode, collapsed: state.collapsed,
    expenses: state.expenses, recomV: state.recomV, recomLegacy: state.recomLegacy,
  }));
}
function persistSettings() { localStorage.setItem(SET_KEY, JSON.stringify(state.settings)); }

/* One-time migration: old numeric recom keys → stable string ids.
   Old items 9-11 ('Test all lights', 'Verify charging voltage', 'Shakedown drive')
   have no recommission counterpart (covered by build Phase 17) — intentionally dropped.
   A verbatim copy of the old keys is kept in recomLegacy as a safety net. */
function migrateRecom() {
  if (state.recomV === 2) return;
  const MAP = { 0: ['fl-oil'], 1: ['fl-refill'], 2: ['brk-flush'], 3: ['fuel-filter', 'fuel-drain'],
    4: ['brk-lines'], 5: ['bat-load'], 6: ['st-prime'], 7: ['fl-hoses', 'ign-belt'], 8: ['tire-sidewall', 'tire-pressure'] };
  const legacy = {};
  Object.keys(state.checks).forEach(k => {
    const m = k.match(/^recom:(\d+)$/);
    if (!m) return;
    legacy[k] = true;
    (MAP[Number(m[1])] || []).forEach(id => { state.checks['recom:' + id] = true; });
    delete state.checks[k];
  });
  if (Object.keys(legacy).length) state.recomLegacy = legacy;
  state.recomV = 2;
  persist();
}

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
   GLOBAL SEARCH
   ============================================================ */
let SEARCH_INDEX = [];
function buildSearchIndex() {
  SEARCH_INDEX = [];
  const add = (e) => { e.low = (e.title + ' ' + e.text).toLowerCase(); SEARCH_INDEX.push(e); };
  PHASES.forEach(p => {
    add({ type: 'phase', title: p.n + '. ' + p.title, text: p.goal || '', view: 'build', phase: p.id });
    p.substeps.forEach(s => add({ type: 'step', title: s.text, text: (s.detail || '') + ' (Phase ' + p.n + ' — ' + p.title + ')', view: 'build', phase: p.id }));
  });
  SKILLS.forEach((s, i) => add({ type: 'skill', title: s.title, text: s.body, view: 'skills', acc: i }));
  GLOSSARY.forEach(g => add({ type: 'gloss', title: g.term, text: g.def, view: 'glossary' }));
  TROUBLE.forEach((t, i) => add({ type: 'trouble', title: t.title, text: [t.symptom, t.cause, t.fix, t.test].join(' '), view: 'trouble', acc: i }));
  CIRCUITS.forEach(c => add({ type: 'circuit', title: c.name, text: [c.hdxWire, c.aawWire, c.aawRef, c.route.join(' '), (c.warnings || []).join(' '), (c.notes || []).join(' ')].join(' '), view: 'wiring', circuit: c.id }));
  FUSES.forEach(f => add({ type: 'fuse', title: f.label + ' ' + f.amps + 'A', text: f.feed + ' ' + (f.hdx || '') + ' ' + f.detail, view: 'wiring', fuse: f.slot }));
  PARTS_MAP.forEach(z => z.parts.forEach(p => add({ type: 'part', title: p.n, text: [p.pn, p.loc, p.wiresIn, p.wiresOut, p.note].join(' '), view: 'parts' })));
  RECOM_GROUPS.forEach(g => g.items.forEach(it => add({ type: 'recom', title: it.text, text: g.g + ' (recommissioning)', view: 'recom' })));
  DASH_GAUGES.forEach(g => add({ type: 'gauge', title: g.n, text: [g.sender, g.wire, g.cal, g.note].join(' '), view: 'dash', dash: g.key }));
}
const TYPE_LABEL = { phase: 'Phase', step: 'Step', skill: 'Skill', gloss: 'Glossary', trouble: 'Trouble', circuit: 'Circuit', fuse: 'Fuse', part: 'Part', recom: 'Recom', gauge: 'Gauge' };

function updateSearchPop() {
  const pop = document.getElementById('search-pop');
  if (!pop) return;
  const q = state.search.trim().toLowerCase();
  if (q.length < 2) { pop.innerHTML = ''; pop.classList.remove('open'); return; }
  const titleHits = [], bodyHits = [];
  for (const e of SEARCH_INDEX) {
    if (e.title.toLowerCase().indexOf(q) > -1) titleHits.push(e);
    else if (e.low.indexOf(q) > -1) bodyHits.push(e);
    if (titleHits.length >= 20) break;
  }
  const results = titleHits.concat(bodyHits).slice(0, 20);
  if (!results.length) { pop.innerHTML = '<div class="sr-empty">No matches for “' + esc(state.search.trim()) + '”</div>'; pop.classList.add('open'); return; }
  pop.innerHTML = results.map(e => {
    const attrs = ['data-act="search-go"', 'data-view="' + e.view + '"'];
    if (e.phase != null) attrs.push('data-phase="' + e.phase + '"');
    if (e.acc != null) attrs.push('data-acc="' + e.acc + '"');
    if (e.circuit) attrs.push('data-circuit="' + e.circuit + '"');
    if (e.fuse != null) attrs.push('data-fuse="' + e.fuse + '"');
    if (e.dash) attrs.push('data-dash="' + e.dash + '"');
    let snippet = e.text;
    const idx = snippet.toLowerCase().indexOf(q);
    if (idx > 60) snippet = '…' + snippet.slice(idx - 40);
    return '<button class="search-result" ' + attrs.join(' ') + '>'
      + '<span class="sr-type">' + (TYPE_LABEL[e.type] || e.type) + '</span>'
      + '<span class="sr-main"><span class="sr-title">' + mark(e.title, q) + '</span>'
      + '<span class="sr-snippet">' + mark(snippet.slice(0, 110), q) + '</span></span></button>';
  }).join('');
  pop.classList.add('open');
}
function clearSearch() {
  state.search = '';
  const i = document.getElementById('tb-search-input');
  if (i) i.value = '';
  updateSearchPop();
}

/* ============================================================
   VIEW RENDERERS
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
    : (['dash', 'wiring', 'parts', 'engine', 'skills', 'glossary', 'specs', 'trouble'].indexOf(view) > -1 ? 'Reference'
      : (['recom', 'budget'].indexOf(view) > -1 ? 'Track' : 'Build'));
  const theme = resolvedTheme();
  return '<header class="topbar">'
    + '<button class="tb-collapse" data-act="collapse" title="Toggle sidebar">' + icon('panel', 20) + '</button>'
    + '<div class="tb-title"><div class="crumb">' + crumb + '</div><h1>' + esc(VIEW_TITLES[view]) + '</h1></div>'
    + '<div class="tb-spacer"></div>'
    + '<label class="tb-search">' + icon('search') + '<input id="tb-search-input" value="' + esc(state.search) + '" placeholder="Search everything…"/>'
    + '<kbd>⌘K</kbd><div class="search-pop" id="search-pop"></div></label>'
    + '<button class="barney-toggle' + (state.barneyMode ? ' on' : '') + '" data-act="barneymode" title="Expand all plain-language explainers">'
    + '<span class="bt-icon">🔰</span><span>Barney Mode</span><span class="bt-switch"></span></button>'
    + '<button class="icon-btn" data-act="theme" title="Toggle theme">' + icon(theme === 'light' ? 'moon' : 'sun', 19) + '</button>'
    + '<button class="icon-btn" data-act="settings" title="Settings">' + icon('sliders', 19) + '</button>'
    + '</header>';
}

/* shared cluster painter — single source of geometry (DASH_GAUGES) */
function clusterSVG(opts) {
  const interactive = !!opts.interactive;
  const sel = opts.sel, litCount = opts.litCount == null ? -1 : opts.litCount;
  let g = '';
  DASH_GAUGES.forEach((x, i) => {
    const on = interactive ? sel === x.key : i < litCount;
    const ang = (-50 + i * 22) * Math.PI / 180;
    const stroke = interactive ? (on ? x.color : 'var(--line-strong)') : '';
    g += '<g' + (interactive ? ' style="cursor:pointer" data-act="dash" data-key="' + x.key + '"' : '') + '>'
      + '<circle class="cg-face' + (on ? ' lit' : '') + '" cx="' + x.cx + '" cy="' + x.cy + '" r="' + x.r + '"/>'
      + (interactive
        ? '<circle cx="' + x.cx + '" cy="' + x.cy + '" r="' + x.r + '" fill="none" stroke-width="' + (on ? 3 : 2.4) + '" stroke="' + stroke + '"/>'
        : '<circle class="cg-ring' + (on ? ' lit' : '') + '" cx="' + x.cx + '" cy="' + x.cy + '" r="' + x.r + '"/>')
      + '<line ' + (interactive ? 'stroke="' + (on ? x.color : 'var(--text-3)') + '" stroke-width="' + (on ? 2 : 1.4) + '" stroke-linecap="round"' : 'class="cg-tick"')
      + ' x1="' + x.cx + '" y1="' + x.cy + '" x2="' + (x.cx + x.r * 0.6 * Math.cos(ang)) + '" y2="' + (x.cy + x.r * 0.6 * Math.sin(ang)) + '"/>'
      + '<text class="cg-lbl" x="' + x.cx + '" y="' + (x.cy + x.r + 10) + '"' + (interactive && on ? ' style="fill:' + x.color + '"' : '') + '>' + x.key.toUpperCase() + '</text>'
      + (x.tft ? '<rect class="cg-tft' + (on ? ' lit' : '') + '" x="' + x.tft.x + '" y="' + x.tft.y + '" width="' + x.tft.w + '" height="' + x.tft.h + '" rx="3"/>' : '')
      + '</g>';
  });
  return '<svg viewBox="0 0 420 190">' + g + '</svg>';
}
function clusterMiniHTML(litCount) {
  return '<div class="cluster-mini">' + clusterSVG({ litCount: litCount }) + '</div>';
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
    { id: 'wiring', icon: 'route', l: 'Wiring Diagrams', d: 'Circuits, fuses + zoom' },
    { id: 'parts', icon: 'pin', l: 'Parts Map', d: 'Where everything lives' },
    { id: 'skills', icon: 'wrench', l: 'Skills', d: '8 how-to references' },
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
    + '<div class="stat"><div class="sv mono">~' + Math.round(remainingHrs) + '<span class="unit">hr</span></div><div class="sl">Est. remaining (avg)</div></div></div>'
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
  const q = state.ui.glossLocal.trim().toLowerCase();
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
  let flow = '<div class="trace-flow">';
  g.trace.forEach((t, i) => {
    flow += '<span class="trace-node"' + (i === 0 ? ' style="border-color:' + g.color + ';color:' + g.color + '"' : '') + '>' + esc(t) + '</span>'
      + (i < g.trace.length - 1 ? icon('arrowR', 15, 'trace-arrow') : '');
  });
  flow += '</div>';
  const fuseTxt = g.fuse ? (g.fuse.label + ' ' + g.fuse.amps + 'A') : 'None — sender signal (unfused)';
  return '<div class="page"><p class="muted" style="margin-bottom:18px;max-width:64ch">HDX-70C-CVL — real arrangement: <strong style="color:var(--text)">tach left + TFT, speedo right + TFT, quad pod: oil / temp over fuel / volt.</strong> Tap a gauge to trace its actual wiring, sender, fuse, and calibration. Wire swatches show the real signal-wire color.</p>'
    + '<div class="dash-split"><div class="card pad"><div class="section-eyebrow" style="margin-bottom:10px">Instrument cluster</div>'
    + '<div class="cluster-mini dash-cluster">' + clusterSVG({ interactive: true, sel: sel }) + '</div>'
    + '<div class="dash-ref-photo" style="margin-top:14px;cursor:zoom-in" data-act="zoom" data-src="dash-reference-closeup.jpg" data-label="SS Dash — close-up">'
    + '<img src="dash-reference-closeup.jpg" alt="HDX dash closeup"/><span class="dt-zoom" style="position:absolute;right:10px;top:10px">' + icon('zoom', 15) + '</span></div></div>'
    + '<div class="card pad trace-card"><div class="trace-head"><span class="trace-swatch" style="background:' + g.color + '"></span>'
    + '<div><div class="h-md">' + esc(g.n) + '</div><div class="mono" style="color:' + g.color + ';font-size:13px">' + esc(g.range) + '</div></div></div>'
    + '<div class="trace-spec"><span class="ts-k">Sender</span><span class="ts-v">' + esc(g.sender) + '</span></div>'
    + '<div class="trace-spec"><span class="ts-k">Wire</span><span class="ts-v">' + esc(g.wire) + '</span></div>'
    + '<div class="trace-spec"><span class="ts-k">Fuse</span><span class="ts-v">' + esc(fuseTxt) + '</span></div>'
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

function circuitCardHTML(c) {
  const open = state.ui.circuitSel === c.id;
  let body = '';
  if (open) {
    body += '<div class="circ-body">'
      + '<div class="trace-spec"><span class="ts-k">HDX wire</span><span class="ts-v">' + esc(c.hdxWire) + '</span></div>'
      + '<div class="trace-spec"><span class="ts-k">AAW side</span><span class="ts-v">' + esc(c.aawWire) + '</span></div>'
      + '<div class="trace-spec"><span class="ts-k">Gauge</span><span class="ts-v">' + esc(c.awg) + '</span></div>'
      + '<div class="trace-spec"><span class="ts-k">Fuse</span><span class="ts-v">' + esc(c.fuse ? (c.fuse.label + ' ' + c.fuse.amps + 'A — ' + c.fuse.feed) : 'None') + '</span></div>'
      + '<div class="trace-spec"><span class="ts-k">Hot when</span><span class="ts-v">' + esc(c.hotWhen) + '</span></div>'
      + '<div class="trace-spec"><span class="ts-k">Reference</span><span class="ts-v">' + esc(c.aawRef) + '</span></div>'
      + '<div class="block-label" style="margin:14px 0 8px">' + icon('route', 14) + ' Route</div><div class="trace-flow">';
    c.route.forEach((t, i) => {
      body += '<span class="trace-node"' + (i === 0 ? ' style="border-color:' + c.swatch + ';color:' + c.swatch + '"' : '') + '>' + esc(t) + '</span>'
        + (i < c.route.length - 1 ? icon('arrowR', 15, 'trace-arrow') : '');
    });
    body += '</div>';
    (c.warnings || []).forEach(w => { body += callout('warn', w); });
    (c.notes || []).forEach(n => { body += callout('note', n); });
    body += '</div>';
  }
  return '<div class="circ-item' + (open ? ' open' : '') + '">'
    + '<button class="circ-head" data-act="circuit" data-id="' + c.id + '">'
    + '<span class="circ-swatch" style="background:' + c.swatch + '"></span>'
    + '<span class="circ-name">' + esc(c.name) + '</span>'
    + (c.fuse ? '<span class="pill mono" style="font-size:11.5px">' + esc(c.fuse.label) + ' ' + c.fuse.amps + 'A</span>' : '')
    + icon('chevron', 16, 'sk-x') + '</button>' + body + '</div>';
}

function wiringHTML() {
  let strip = '';
  DIAGRAMS.forEach(d => {
    strip += '<button class="diagram-thumb" data-act="zoom" data-src="' + esc(d.src) + '" data-label="' + esc(d.label) + '">'
      + '<div class="dt-img"><img src="' + esc(d.src) + '" alt="' + esc(d.label) + '"/><span class="dt-zoom">' + icon('zoom', 15) + '</span></div>'
      + '<div class="dt-cap">' + esc(d.label) + '<div class="faint" style="font-weight:400;font-size:12px">' + esc(d.d) + '</div></div></button>';
  });
  let circ = '';
  CIRCUITS.forEach(c => { circ += circuitCardHTML(c); });
  let grid = '';
  FUSES.forEach(f => {
    grid += '<button class="fuse-slot' + (f.hdx ? ' hdx' : '') + (state.ui.fuseSel === f.slot ? ' sel' : '') + '" data-act="fuse" data-slot="' + f.slot + '">'
      + '<span class="fs-l">' + esc(f.label) + '</span><span class="fs-a mono">' + f.amps + 'A</span></button>';
  });
  let fdetail = '';
  const sel = FUSES.find(f => f.slot === state.ui.fuseSel);
  if (sel) {
    fdetail = '<div class="fuse-detail card pad">'
      + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
      + '<strong style="font-size:16px">' + esc(sel.label) + '</strong><span class="pill mono">' + sel.amps + 'A</span><span class="pill">' + esc(sel.feed) + '</span></div>'
      + (sel.hdx ? '<div class="callout note" style="margin:8px 0">' + icon('bolt', 16) + '<div><strong>HDX-critical:</strong> ' + esc(sel.hdx) + '</div></div>' : '')
      + '<div class="muted" style="font-size:14px">' + esc(sel.detail) + '</div></div>';
  } else {
    fdetail = '<div class="faint" style="font-size:13px;padding:8px 2px">Tap a fuse for details. The panel legend has no numbers — find fuses by their printed label. Accent-ringed: GAUGES + CLOCK power the HDX.</div>';
  }
  return '<div class="page"><p class="muted" style="margin-bottom:16px;max-width:64ch">American Autowire diagrams — tap any to zoom. Below: the 11 real circuits with verified wire colors and fuse positions, then the AAW 500707 fuse panel (firewall bulkhead, driver side, stock hole — flasher can bottom-right).</p>'
    + '<div class="diagram-strip" style="margin-bottom:24px">' + strip + '</div>'
    + '<div class="block-label">' + icon('route', 14) + ' Circuit lookup — verified wire colors & fuses</div>'
    + '<div class="circ-list">' + circ + '</div>'
    + '<div class="block-label" style="margin-top:26px">' + icon('bolt', 14) + ' AAW 500707 fuse panel — 18 slots</div>'
    + '<div class="fuse-grid">' + grid + '</div>' + fdetail + '</div>';
}

function partsHTML() {
  let h = '<div class="page"><p class="muted" style="margin-bottom:18px;max-width:64ch">Where every part physically lives on the car — grouped by zone, with part numbers, thread sizes, and the wires in and out of each.</p>';
  PARTS_MAP.forEach(z => {
    h += '<div class="zone-head">' + icon(z.icon, 16) + ' ' + esc(z.zone) + ' <span class="faint" style="font-weight:400">· ' + z.parts.length + ' items</span></div>';
    if (z.media) {
      if (z.media.diagram) {
        h += '<button class="diagram-thumb" style="display:block;width:100%;max-width:680px;margin-bottom:14px" data-act="zoom" data-src="' + esc(z.media.src) + '" data-label="' + esc(z.media.label) + '">'
          + '<div class="dt-img" style="aspect-ratio:16/8"><img src="' + esc(z.media.src) + '" alt="' + esc(z.media.label) + '"/><span class="dt-zoom">' + icon('zoom', 15) + '</span></div>'
          + '<div class="dt-cap">' + esc(z.media.label) + '</div></button>';
      } else {
        h += '<div class="pm-photo" data-act="zoom" data-src="' + esc(z.media.src) + '" data-label="' + esc(z.media.label) + '">'
          + '<img src="' + esc(z.media.src) + '" alt="' + esc(z.media.label) + '"/>'
          + '<span class="dt-zoom" style="position:absolute;right:10px;top:10px">' + icon('zoom', 15) + '</span></div>'
          + '<div class="pm-caption">' + esc(z.media.caption) + '</div>';
      }
    }
    h += '<div class="ref-grid" style="margin-bottom:24px">';
    z.parts.forEach(p => {
      h += '<div class="gloss-item"><div class="gt">' + esc(p.n) + '</div>'
        + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 8px">'
        + (p.pn && p.pn !== '—' ? '<span class="pill mono" style="font-size:12px">' + esc(p.pn) + '</span>' : '')
        + (p.thread && p.thread !== '—' ? '<span class="pill mono" style="font-size:12px">' + esc(p.thread) + '</span>' : '') + '</div>'
        + '<div class="gd" style="margin-bottom:7px"><strong style="color:var(--text)">Location:</strong> ' + esc(p.loc) + '</div>'
        + (p.wiresIn && p.wiresIn !== '—' ? '<div class="part-wires"><span class="pw-k">In</span>' + esc(p.wiresIn) + '</div>' : '')
        + (p.wiresOut && p.wiresOut !== '—' ? '<div class="part-wires"><span class="pw-k">Out</span>' + esc(p.wiresOut) + '</div>' : '')
        + '<div class="gd" style="margin-top:7px">' + esc(p.note) + '</div></div>';
    });
    h += '</div>';
  });
  return h + '</div>';
}

function troubleItemHTML(it, i) {
  const open = state.ui.accordion === i;
  let body = '';
  if (open) {
    const sec = (tag, label, text) => '<div class="ts-sec"><span class="ts-tag ' + tag + '">' + label + '</span><p>' + esc(text) + '</p></div>';
    body = '<div class="skill-body" style="display:block;padding:0 16px 16px 16px">'
      + sec('symptom', 'Symptom', it.symptom) + sec('cause', 'Cause', it.cause) + sec('fix', 'Fix', it.fix) + sec('test', 'Test', it.test)
      + (it.fieldTest ? sec('test', 'Field test', it.fieldTest) : '');
    if (it.procedure) {
      body += '<div class="proc-box"><div class="proc-title">' + esc(it.procedure.title) + '</div><ol>';
      it.procedure.steps.forEach(s => { body += '<li>' + esc(s) + '</li>'; });
      body += '</ol></div>';
    }
    body += '</div>';
  }
  return '<div class="skill-card' + (open ? ' open' : '') + '">'
    + '<button class="skill-head" data-act="acc" data-idx="' + i + '"><span class="sk-i">' + esc(it.icon) + '</span>'
    + '<span class="sk-t">' + esc(it.title) + '</span>' + icon('chevron', 18, 'sk-x') + '</button>' + body + '</div>';
}
function troubleHTML() {
  let h = '<div class="page"><p class="muted" style="margin-bottom:18px;max-width:62ch">The most common HDX-70C-CVL install issues, ranked by frequency — each with the symptom, root cause, fix, and how to verify. Tap to expand.</p><div class="ref-grid" style="grid-template-columns:1fr;max-width:860px">';
  TROUBLE.forEach((it, i) => { h += troubleItemHTML(it, i); });
  return h + '</div></div>';
}

function specsHTML() {
  let tq = '';
  TORQUE.forEach((r, i) => {
    tq += '<div style="display:flex;align-items:center;padding:13px 16px;' + (i ? 'border-top:1px solid var(--line)' : '') + '">'
      + '<div style="flex:1;font-weight:550;font-size:14.5px">' + esc(r[0]) + '</div>'
      + '<div class="mono muted" style="width:210px;font-size:12.5px">' + esc(r[1]) + '</div>'
      + '<div class="mono" style="width:175px;text-align:right;color:var(--accent);font-weight:600;font-size:13px">' + esc(r[2]) + '</div></div>';
  });
  let parts = '';
  PARTS.forEach(p => { parts += '<div class="pill" style="padding:12px 14px;justify-content:flex-start;font-size:14px">' + esc(p) + '</div>'; });
  return '<div class="page"><div class="block-label">' + icon('bolt', 14) + ' Torque & fastener specs (verified)</div>'
    + '<div class="card" style="overflow:hidden;margin-bottom:24px">' + tq + '</div>'
    + '<div class="block-label">' + icon('layers', 14) + ' Key parts inventory</div><div class="ref-grid">' + parts + '</div></div>';
}

function recomHTML() {
  let total = 0, done = 0;
  RECOM_GROUPS.forEach(g => g.items.forEach(it => { total++; if (state.checks['recom:' + it.id]) done++; }));
  let h = '<div class="page"><p class="muted" style="margin-bottom:14px;max-width:62ch">Car sat for 3 years. Work each item before attempting first start. <strong style="color:var(--text)">' + done + '/' + total + ' done.</strong></p>';
  RECOM_GROUPS.forEach(g => {
    const gd = g.items.filter(it => state.checks['recom:' + it.id]).length;
    h += '<div class="zone-head" style="margin-top:22px">' + icon('recom', 15) + ' ' + esc(g.g) + ' <span class="faint mono" style="font-weight:400;font-size:12px">· ' + gd + '/' + g.items.length + '</span></div>';
    if (g.prime) {
      h += '<div class="proc-box" style="margin:10px 0 12px"><div class="proc-title">' + esc(g.prime.title) + '</div>'
        + '<p style="margin:0 0 8px;font-size:13.5px">' + esc(g.prime.lead) + '</p><ol>';
      g.prime.steps.forEach(s => { h += '<li>' + esc(s) + '</li>'; });
      h += '</ol></div>';
    }
    h += '<div class="substeps">';
    g.items.forEach((it, i) => {
      const checked = !!state.checks['recom:' + it.id];
      h += '<div class="substep' + (checked ? ' checked' : '') + '">'
        + '<div class="ss-row" style="cursor:pointer" data-act="check" data-pid="recom" data-idx="' + esc(it.id) + '">'
        + '<div class="ss-n mono">' + (i + 1) + '</div><div class="ss-check">' + icon('check', 15) + '</div>'
        + '<div class="ss-main"><div class="ss-text">' + esc(it.text) + '</div></div></div></div>';
    });
    h += '</div>';
    if (g.note) h += callout('note', g.note);
    if (g.warn) h += callout('warn', g.warn);
  });
  return h + '</div>';
}

function budgetHTML() {
  const planned = BUDGET.reduce((s, r) => s + r[2], 0);
  const spent = state.expenses.reduce((s, e) => s + e.cost, 0);
  const delta = spent - planned;
  let opts = '';
  EXPENSE_CATS.forEach(c => { opts += '<option value="' + esc(c) + '">' + esc(c) + '</option>'; });
  let rows = '';
  if (state.expenses.length) {
    state.expenses.slice().reverse().forEach(e => {
      rows += '<div class="exp-row">'
        + '<span class="stage-tag" style="background:var(--surface-2);color:var(--text-3);min-width:96px">' + esc(e.category) + '</span>'
        + '<div style="flex:1;font-size:14.5px;min-width:0">' + esc(e.desc) + '<div class="faint" style="font-size:11.5px">' + esc(e.date) + '</div></div>'
        + '<div class="mono" style="font-weight:600;font-size:14.5px">$' + e.cost.toLocaleString(undefined, { maximumFractionDigits: 2 }) + '</div>'
        + '<button class="exp-del" data-act="exp-del" data-id="' + e.id + '" title="Delete">' + icon('trash', 15) + '</button></div>';
    });
  } else {
    rows = '<div class="faint" style="padding:14px 16px;font-size:13.5px">No expenses logged yet — add your first purchase above.</div>';
  }
  let plannedRows = '';
  BUDGET.forEach((r, i) => {
    plannedRows += '<div style="display:flex;align-items:center;padding:13px 16px;' + (i ? 'border-top:1px solid var(--line)' : '') + '">'
      + '<span class="stage-tag" style="background:var(--surface-2);color:var(--text-3);margin-right:14px;min-width:96px">' + esc(r[0]) + '</span>'
      + '<div style="flex:1;font-size:14.5px">' + esc(r[1]) + '</div>'
      + '<div class="mono" style="font-weight:600;font-size:14.5px">$' + r[2].toLocaleString() + '</div></div>';
  });
  return '<div class="page"><div class="stat-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">'
    + '<div class="stat"><div class="sv mono">$' + planned.toLocaleString() + '</div><div class="sl">Planned</div></div>'
    + '<div class="stat"><div class="sv mono">$' + spent.toLocaleString(undefined, { maximumFractionDigits: 0 }) + '</div><div class="sl">Spent (logged)</div></div>'
    + '<div class="stat"><div class="sv mono">' + state.expenses.length + '</div><div class="sl">Logged items</div></div>'
    + '<div class="stat"><div class="sv mono" style="color:' + (delta > 0 ? 'var(--bad)' : 'var(--good)') + '">' + (delta >= 0 ? '+' : '−') + '$' + Math.abs(delta).toLocaleString(undefined, { maximumFractionDigits: 0 }) + '</div><div class="sl">vs plan</div></div></div>'
    + '<div class="block-label">' + icon('dollar', 14) + ' Log a purchase</div>'
    + '<div class="card pad exp-form"><select id="exp-cat" class="form-select">' + opts + '</select>'
    + '<input id="exp-desc" class="form-input" placeholder="What did you buy?"/>'
    + '<input id="exp-cost" class="form-input" type="number" step="0.01" min="0" inputmode="decimal" placeholder="$" style="max-width:120px"/>'
    + '<button class="solid-btn" style="height:42px" data-act="exp-add">' + icon('plus', 16) + ' Add</button></div>'
    + '<div class="block-label" style="margin-top:22px">' + icon('list', 14) + ' Logged expenses</div>'
    + '<div class="card" style="overflow:hidden">' + rows + '</div>'
    + '<div class="block-label" style="margin-top:22px">' + icon('layers', 14) + ' Planned budget (reference)</div>'
    + '<div class="card" style="overflow:hidden">' + plannedRows + '</div></div>';
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
    + '<div class="set-row" style="flex-direction:column;align-items:stretch;gap:10px"><span class="set-lbl">Backup — progress + settings</span>'
    + '<div style="display:flex;gap:8px"><button class="ghost-btn" style="flex:1" data-act="export-backup">' + icon('download', 15) + ' Export</button>'
    + '<button class="ghost-btn" style="flex:1" data-act="import-backup">' + icon('upload', 15) + ' Import</button></div>'
    + '<span class="faint" style="font-size:11.5px">Export before clearing browser data or switching devices.</span></div>'
    + '</div>';
}

function viewHTML() {
  switch (state.view) {
    case 'home': return homeHTML();
    case 'build': return buildHTML();
    case 'dash': return dashHTML();
    case 'engine': return engineHTML();
    case 'wiring': return wiringHTML();
    case 'parts': return partsHTML();
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
   RENDER ENGINE
   ============================================================ */
const appEl = document.getElementById('app');

function render() {
  const sc = appEl.querySelector('.scroll');
  const top = sc ? sc.scrollTop : 0;
  appEl.innerHTML = '<div class="app' + (state.collapsed ? ' rail-collapsed' : '') + '">'
    + railHTML() + '<div class="work">' + topbarHTML() + '<div class="scroll">' + viewHTML() + '</div></div>'
    + settingsHTML() + '</div>';
  const nsc = appEl.querySelector('.scroll'); if (nsc) nsc.scrollTop = top;
  if (state.search) updateSearchPop();
}
function renderContent() {
  const sc = appEl.querySelector('.scroll');
  const top = sc ? sc.scrollTop : 0;
  if (sc) sc.innerHTML = viewHTML();
  if (sc) sc.scrollTop = top;
  const existing = appEl.querySelector('.settings-panel');
  if (state.settingsOpen && !existing) render();
  else if (!state.settingsOpen && existing) render();
}

/* ============================================================
   BACKUP
   ============================================================ */
function exportBackup() {
  const progress = load(LS_KEY, null) || {};
  const settings = load(SET_KEY, null) || {};
  const payload = { app: 'chevelle-hdx-build-guide', format: 2, exportedAt: new Date().toISOString(), progress, settings };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'chevelle-hdx-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function importBackup() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json,application/json';
  inp.addEventListener('change', () => {
    const f = inp.files && inp.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const p = JSON.parse(String(r.result));
        if (p && p.app === 'chevelle-hdx-build-guide' && p.progress && typeof p.progress === 'object') {
          localStorage.setItem(LS_KEY, JSON.stringify(p.progress));
          localStorage.setItem(SET_KEY, JSON.stringify(p.settings || {}));
          location.reload();
        } else { alert('Not a valid Chevelle backup file.'); }
      } catch (e) { alert('Not a valid Chevelle backup file.'); }
    };
    r.readAsText(f);
  });
  inp.click();
}

/* ============================================================
   EVENT DELEGATION
   ============================================================ */
function openPhase(id) { state.activePhase = id; state.view = 'build'; state.ui.accordion = null; persist(); render(); }

appEl.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (t) {
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
      case 'circuit': { const id = t.getAttribute('data-id'); state.ui.circuitSel = state.ui.circuitSel === id ? null : id; renderContent(); break; }
      case 'fuse': { const s = Number(t.getAttribute('data-slot')); state.ui.fuseSel = state.ui.fuseSel === s ? null : s; renderContent(); break; }
      case 'zoom': openLightbox(t.getAttribute('data-src'), t.getAttribute('data-label')); break;
      case 'set-theme': state.settings.theme = t.getAttribute('data-val'); persistSettings(); applySettings(); render(); break;
      case 'set-density': state.settings.density = t.getAttribute('data-val'); persistSettings(); applySettings(); render(); break;
      case 'set-layout': state.settings.layout = t.getAttribute('data-val'); persistSettings(); render(); break;
      case 'set-accent': state.settings.accent = t.getAttribute('data-val'); persistSettings(); applySettings(); render(); break;
      case 'set-barneydefault':
        state.settings.barneyDefault = !state.settings.barneyDefault;
        state.barneyMode = state.settings.barneyDefault;
        persistSettings(); persist(); applySettings(); render(); break;
      case 'export-backup': exportBackup(); break;
      case 'import-backup': importBackup(); break;
      case 'exp-add': {
        const cat = document.getElementById('exp-cat'); const desc = document.getElementById('exp-desc'); const cost = document.getElementById('exp-cost');
        const c = cost ? parseFloat(cost.value) : NaN;
        if (desc && desc.value.trim() && isFinite(c) && c > 0) {
          state.expenses.push({ id: Date.now(), category: cat ? cat.value : 'Misc', desc: desc.value.trim(), cost: c, date: new Date().toLocaleDateString() });
          persist(); renderContent();
        } else if (desc) { desc.classList.add('invalid'); setTimeout(() => { const d = document.getElementById('exp-desc'); if (d) d.classList.remove('invalid'); }, 900); }
        break;
      }
      case 'exp-del': {
        const id = Number(t.getAttribute('data-id'));
        state.expenses = state.expenses.filter(x => x.id !== id);
        persist(); renderContent(); break;
      }
      case 'search-go': {
        const v = t.getAttribute('data-view');
        const ph = t.getAttribute('data-phase');
        const acc = t.getAttribute('data-acc');
        const circ = t.getAttribute('data-circuit');
        const fu = t.getAttribute('data-fuse');
        const da = t.getAttribute('data-dash');
        state.search = '';
        if (ph != null) { state.activePhase = Number(ph); state.view = 'build'; }
        else state.view = v;
        state.ui.accordion = acc != null ? Number(acc) : null;
        if (circ) state.ui.circuitSel = circ;
        if (fu != null) state.ui.fuseSel = Number(fu);
        if (da) state.ui.dashSel = da;
        persist(); render(); break;
      }
    }
  }
  /* close the search popover when clicking outside the search box */
  if (state.search && !e.target.closest('.tb-search')) clearSearch();
});

appEl.addEventListener('input', e => {
  if (e.target.id === 'tb-search-input') {
    state.search = e.target.value;
    updateSearchPop(); /* popover-only update — topbar is never re-rendered, focus is preserved */
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
  if (e.key === 'Escape') {
    if (document.querySelector('.lightbox')) closeLightbox();
    else if (state.search) clearSearch();
    else if (state.settingsOpen) { state.settingsOpen = false; render(); }
  }
});

/* ============================================================
   LIGHTBOX
   ============================================================ */
let lb = null;
function openLightbox(src, label) {
  closeLightbox();
  const z = { scale: 1, x: 0, y: 0, dragging: false, sx: 0, sy: 0, lastTap: 0, pointers: new Map(), pinchDist: 0, downX: 0, downY: 0, downOnImg: false, moved: 0 };
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
    z.downX = ev.clientX; z.downY = ev.clientY; z.moved = 0;
    z.downOnImg = ev.target !== stage;
    z.pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (z.pointers.size === 2) {
      const p = [...z.pointers.values()];
      z.pinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      z.dragging = false; /* kill stale single-finger drag when pinch begins */
    } else {
      z.dragging = true; z.sx = ev.clientX - z.x; z.sy = ev.clientY - z.y; stage.classList.add('grabbing');
      const now = Date.now(); if (now - z.lastTap < 300) reset(); z.lastTap = now;
    }
  });
  stage.addEventListener('pointermove', ev => {
    if (!z.pointers.has(ev.pointerId)) return;
    z.moved = Math.max(z.moved, Math.hypot(ev.clientX - z.downX, ev.clientY - z.downY));
    z.pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (z.pointers.size === 2) {
      const p = [...z.pointers.values()]; const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      if (z.pinchDist) zoom(d / z.pinchDist); z.pinchDist = d;
    } else if (z.dragging && z.scale !== 1) { z.x = ev.clientX - z.sx; z.y = ev.clientY - z.sy; apply(); }
  });
  const up = ev => {
    z.pointers.delete(ev.pointerId);
    if (z.pointers.size < 2) z.pinchDist = 0;
    if (z.pointers.size === 1) {
      /* pinch → pan handoff: re-anchor to the surviving pointer so the image doesn't jump */
      const p = [...z.pointers.values()][0];
      z.dragging = true; z.sx = p.x - z.x; z.sy = p.y - z.y;
    } else {
      z.dragging = false; stage.classList.remove('grabbing');
    }
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('click', () => {
    /* pointer capture retargets clicks to the stage — decide by gesture, not target:
       close only on a genuine tap (<8px movement) that started on the backdrop */
    if (z.moved < 8 && !z.downOnImg) closeLightbox();
  });
  lb = el;
}
function closeLightbox() { if (lb) { lb.remove(); lb = null; } }

/* ============================================================
   INIT
   ============================================================ */
applySettings();
if (state.settings.barneyDefault && persisted.barneyMode == null) state.barneyMode = true;
migrateRecom();
buildSearchIndex();
render();
if (window.matchMedia) {
  try { window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (state.settings.theme === 'auto') { applySettings(); render(); } }); } catch (e) {}
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(r => console.log('SW registered:', r.scope)).catch(err => console.log('SW failed:', err));
}
})();
