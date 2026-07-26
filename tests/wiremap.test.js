const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

function loadWireMap() {
  const sandbox = { window: {} };
  vm.runInNewContext(read('chevelle-wiremap.js'), sandbox);
  return sandbox.window;
}

// Circuit ids that exist in chevelle-app.js CIRCUITS — extracted from source so they can't drift
function circuitIds() {
  const ids = [];
  const re = /\{ id: '([a-z0-9]+)', name: '/g;
  let m; const src = read('chevelle-app.js');
  while ((m = re.exec(src))) ids.push(m[1]);
  return ids;
}

test('WIRE_MAP zones are structurally valid', () => {
  const { WIRE_MAP } = loadWireMap();
  assert.ok(WIRE_MAP && typeof WIRE_MAP === 'object');
  const validCircuits = circuitIds();
  assert.ok(validCircuits.length >= 10, 'extracted circuit ids from app source');
  Object.entries(WIRE_MAP).forEach(([zone, z]) => {
    assert.match(zone, /^[a-z-]+$/, zone + ': kebab-case zone key');
    assert.ok(z.photo && z.photo.src && z.photo.w > 0 && z.photo.h > 0, zone + ': photo');
    assert.ok(fs.existsSync(path.join(ROOT, z.photo.src)), zone + ': photo file exists');
    assert.ok(Array.isArray(z.pins) && Array.isArray(z.routes), zone + ': pins and routes arrays present');
    const pinIds = new Set();
    z.pins.forEach(p => {
      assert.match(p.id, /^[a-z0-9-]+$/, zone + ': pin id ' + p.id);
      assert.ok(!pinIds.has(p.id), zone + ': duplicate pin id ' + p.id); pinIds.add(p.id);
      assert.ok(p.part && typeof p.part === 'string', zone + ':' + p.id + ': part name');
      assert.ok(p.x >= 0 && p.x <= z.photo.w && p.y >= 0 && p.y <= z.photo.h, zone + ':' + p.id + ': pin inside photo');
      if (p.verdict !== undefined) assert.ok(['connect', 'cap', 'harvest'].includes(p.verdict), zone + ':' + p.id + ': valid verdict');
      if (p.verdict !== undefined) assert.ok(typeof p.info === 'string' && p.info.length > 0, zone + ':' + p.id + ': verdict pins need info');
    });
    const routeIds = new Set();
    z.routes.forEach(r => {
      assert.match(r.id, /^[a-z0-9-]+$/, zone + ': route id ' + r.id);
      assert.ok(!routeIds.has(r.id), zone + ': duplicate route id ' + r.id); routeIds.add(r.id);
      assert.ok(pinIds.has(r.pin), zone + ':' + r.id + ': route.pin "' + r.pin + '" exists');
      // circuit: null = no CIRCUITS entry (card renders from route label + note)
      assert.ok(r.circuit === null || validCircuits.includes(r.circuit), zone + ':' + r.id + ': circuit "' + r.circuit + '" exists in CIRCUITS or is null');
      if (r.circuit === null) assert.ok(typeof r.note === 'string' && r.note.length > 0, zone + ':' + r.id + ': null-circuit route needs a note');
      assert.ok(Array.isArray(r.path) && r.path.length >= 2, zone + ':' + r.id + ': >=2 waypoints');
      r.path.forEach(([x, y]) => assert.ok(x >= 0 && x <= z.photo.w && y >= 0 && y <= z.photo.h, zone + ':' + r.id + ': waypoint inside photo'));
      assert.match(r.color, /^#[0-9a-f]{3,6}$/i, zone + ':' + r.id + ': color');
    });
    assert.ok(typeof z.shotList === 'string', zone + ': shotList string (may be empty for own-car photos)');
  });
});

test('pathD produces a smooth cubic path', () => {
  const { WIRE_MAP_UTIL } = loadWireMap();
  const d = WIRE_MAP_UTIL.pathD([[0, 0], [100, 50], [200, 0]]);
  assert.match(d, /^M0,0C/);
  assert.strictEqual((d.match(/C/g) || []).length, 2);
  assert.strictEqual(WIRE_MAP_UTIL.pathD([[10, 10], [90, 90]]), 'M10,10 L90,90');
  assert.strictEqual(WIRE_MAP_UTIL.pathD([]), '');
});

test('behind-dash zone covers the spec route list', () => {
  const z = loadWireMap().WIRE_MAP['behind-dash'];
  assert.ok(z, 'behind-dash zone exists');
  const rc = z.routes.map(r => r.circuit);
  ['const12v', 'sw12v', 'gnd', 'dimmer', 'fuel'].forEach(c => assert.ok(rc.includes(c), 'route for ' + c));
  assert.ok(z.routes.some(r => r.dash === true), 'display cable is dashed');
});
