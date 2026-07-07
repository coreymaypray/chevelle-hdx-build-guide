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
