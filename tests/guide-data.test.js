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
