const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// Load chevelle-data.js in a sandbox to get the real CHEVELLE_DATA object
function loadData() {
  const sandbox = { window: {} };
  vm.runInNewContext(read('chevelle-data.js'), sandbox);
  return sandbox.window.CHEVELLE_DATA;
}

test('chevelle-data.js parses and has 17 phases', () => {
  const data = loadData();
  assert.ok(data && Array.isArray(data.PHASES));
  assert.strictEqual(data.PHASES.length, 17);
});

test('chevelle-app.js is valid JS', () => {
  new vm.Script(read('chevelle-app.js'));
});

// PERSISTENCE GUARANTEE (spec: "Persistence guarantees"): build-substep check keys
// are `phaseId:index`, so substep COUNTS per phase must never change in this project.
// If this test fails, you inserted/deleted a substep — revert and make text-only edits.
test('substep counts per phase are locked (index-based check keys)', () => {
  const counts = {};
  loadData().PHASES.forEach(p => { counts[p.id] = p.substeps.length; });
  const snapshotFile = path.join(__dirname, 'substep-counts.snapshot.json');
  if (!fs.existsSync(snapshotFile)) {
    fs.writeFileSync(snapshotFile, JSON.stringify(counts, null, 2));
    return; // first run writes the snapshot
  }
  assert.deepStrictEqual(counts, JSON.parse(fs.readFileSync(snapshotFile, 'utf8')));
});

const APP_SRC = () => read('chevelle-app.js');

test('fuse table matches the shipped AAW diagram (F2)', () => {
  const src = APP_SRC();
  // Corrected anchors — label + amps pairs that MUST exist in FUSES
  assert.match(src, /label:\s*'GAUGES',\s*amps:\s*5\b/);
  assert.match(src, /label:\s*'CLOCK',\s*amps:\s*10\b/);
  assert.match(src, /label:\s*'WIPER',\s*amps:\s*10\b/);
  assert.match(src, /label:\s*'LIGHTER',\s*amps:\s*10\b/);
  assert.match(src, /label:\s*'DASH LTS',\s*amps:\s*10\b/);
  assert.match(src, /label:\s*'IGN 1',\s*amps:\s*20\b/);
  // Disproven claims that must be GONE
  assert.doesNotMatch(src, /label:\s*'GAUGES',\s*amps:\s*10\b/);
  assert.doesNotMatch(src, /label:\s*'CLOCK',\s*amps:\s*5\b/);
  assert.doesNotMatch(src, /SW IGN/);
  assert.doesNotMatch(src, /label:\s*'WIPER',\s*amps:\s*20\b/);
  // Exactly one TURN fuse
  assert.strictEqual((src.match(/label:\s*'TURN'/g) || []).length, 1);
});

test('HDX callouts are keyed by fuse label, not slot number (F2)', () => {
  const src = APP_SRC();
  assert.doesNotMatch(src, /HDX on #7 \/ #8 \/ #9/);
  assert.doesNotMatch(src, /#7 \/ #8 \/ #9\) power the HDX/);
  assert.doesNotMatch(src, /Fuse #8 CLOCK/);
  assert.doesNotMatch(src, /Fuse #7 GAUGES/);
});

test('FUEL fuse is not called HDX-critical (F42)', () => {
  const src = APP_SRC();
  const fuelSlot = src.match(/label:\s*'FUEL'[^}]*/);
  assert.ok(fuelSlot, 'FUEL fuse entry exists');
  assert.doesNotMatch(fuelSlot[0], /HDX-critical|powers the HDX/i);
});

// Referential integrity: fuseByLabel() fails silently on a typo'd label, and amp
// values are restated in prose ('CLOCK fuse 10A') and inline structured duplicates
// (DASH_GAUGES volt). This test keeps every reference in agreement with FUSES.
function parsedFuses() {
  const src = APP_SRC();
  const m = src.match(/const FUSES = \[[\s\S]*?\n\];/);
  assert.ok(m, 'FUSES block found in chevelle-app.js');
  return vm.runInNewContext(m[0] + '; FUSES');
}

test('fuse references resolve and quoted amps match the FUSES table (integrity)', () => {
  const byLabel = Object.fromEntries(parsedFuses().map(f => [f.label, f]));
  const src = APP_SRC();
  let refs = 0;
  for (const m of src.matchAll(/fuseByLabel\('([^']+)'\)/g)) {
    refs++;
    assert.ok(byLabel[m[1]], 'fuseByLabel ref resolves: ' + m[1]);
  }
  assert.ok(refs >= 4, 'found the fuseByLabel call sites');
  let prose = 0;
  for (const m of src.matchAll(/([A-Z][A-Z 0-9/]*?) fuse (\d+)A/g)) {
    const f = byLabel[m[1].trim()];
    if (!f) continue;
    prose++;
    assert.strictEqual(f.amps, Number(m[2]), 'prose amp for ' + m[1]);
  }
  assert.ok(prose >= 4, 'found the prose amp mentions');
  for (const m of src.matchAll(/\{ label: '([A-Z 0-9/]+)', amps: (\d+) \}/g)) {
    const f = byLabel[m[1]];
    if (f) assert.strictEqual(f.amps, Number(m[2]), 'inline fuse amp for ' + m[1]);
  }
});

test('HDX senders route direct to Control Box, not AAW connectors F/G/H (F1/F7)', () => {
  const src = APP_SRC();
  assert.doesNotMatch(src, /AAW Connector H \(WHITE\)/);
  assert.doesNotMatch(src, /AAW Connector G \(DK GREEN\)/);
  assert.doesNotMatch(src, /WHITE 18 AWG — AAW Connector H/);
  assert.doesNotMatch(src, /DARK GREEN signal 18 AWG — AAW Connector G/);
  assert.doesNotMatch(src, /→ Conn [FGH]\b/);
  assert.doesNotMatch(src, /→ AAW VSS connector/);
  // The dedicated-sub-harness truth must be present in the traces
  assert.match(src, /Dakota sender sub-harness/);
});

test('temp sender is two-wire to Control Box TEMP SIG+GND (F3)', () => {
  const src = APP_SRC();
  assert.doesNotMatch(src, /[Gg]rounds through the engine block/);
  assert.doesNotMatch(src, /grounds through block/);
  assert.match(src, /TEMP INPUT-SIG \+ TEMP INPUT-GND/);
});

test('turn-signal circuit cites TURN 10A by label (F13/F34)', () => {
  const src = APP_SRC();
  assert.doesNotMatch(src, /Fuse #5 TURN 15A/);
  assert.doesNotMatch(src, /label:\s*'TURN',\s*amps:\s*15/);
  assert.match(src, /'TURN fuse 10A'/);
});

test('voltmeter has no signal wire claim (F41)', () => {
  assert.doesNotMatch(APP_SRC(), /voltmeter needs only its signal wire/);
});

const DATA_SRC = () => read('chevelle-data.js');

test('Phase 4 hookup text matches the verified plan (F14/F15/F18)', () => {
  const src = DATA_SRC();
  assert.doesNotMatch(src, /Tach: single wire from coil negative\. Fuel: single wire from tank sender/);
  assert.doesNotMatch(src, /run a dedicated 14-16 AWG wire from the battery\/starter solenoid through the firewall, fused at 15A/);
  assert.match(src, /CLOCK fuse position/);
  assert.match(src, /GAUGES fuse position/);
  assert.match(src, /FUEL INPUT-SIG \+ FUEL INPUT-GND/);
  assert.match(src, /must not be fused above 10A/);
  assert.match(src, /HEI TACH terminal/);
});

test('Phase 5 temp sender text is corrected in the data file (F3/F40)', () => {
  const src = DATA_SRC();
  assert.doesNotMatch(src, /the threads in the manifold complete the ground path/);
  assert.doesNotMatch(src, /ground through block/);
  assert.doesNotMatch(src, /[Gg]rounds through the engine block/);
  assert.doesNotMatch(src, /usually rear, near the thermostat housing/);
  assert.match(src, /front of the intake, passenger side/);
});

test('Power-Up checklist: pwr ids unique, view registered, YELLOW/HEI fix applied', () => {
  const src = APP_SRC();
  // Extract the PWRUP_GROUPS block first — RECOM_GROUPS shares the bat-/fuel- prefixes,
  // so a whole-file id scan would pick up recommissioning ids too.
  const block = src.match(/const PWRUP_GROUPS = \[[\s\S]*?\n\];/);
  assert.ok(block, 'PWRUP_GROUPS block found in chevelle-app.js');
  const ids = [...block[0].matchAll(/\{ id: '([a-z0-9-]+)'/g)].map(m => m[1]);
  assert.ok(ids.length >= 50, 'found the PWRUP items (' + ids.length + ')');
  assert.strictEqual(new Set(ids).size, ids.length, 'pwr ids unique');
  ids.forEach(id => assert.match(id, /^(bat|str|alt|hei|hdx|gnd|chs|fuel|pre|seq)-/, 'group-prefixed id: ' + id));
  assert.match(src, /case 'pwrup': return pwrupHTML\(\);/);
  assert.match(src, /pid === 'recom' \|\| pid === 'pwr'/);
  assert.doesNotMatch(DATA_SRC(), /connect the YELLOW wire with terminal C and connector G to the distributor cap BAT location/);
  assert.match(DATA_SRC(), /ON HEI: this wire is NOT USED/);
  assert.doesNotMatch(src, /PURPLE low \/ BROWN high \/ YELLOW park/);
});
