# Photo Wiring Overlay + Guide Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build tap-to-trace wiring overlays on real photos in the Parts Map view (4 zones, persistent "connected" checks) after first correcting the wiring-truth errors the 2026-07-07 review confirmed, plus the Tier 2 garage/PWA fixes.

**Architecture:** Vanilla JS PWA, zero deps, no build step. A new pure-data file `chevelle-wiremap.js` (photo dims, pins, routes) renders as an inline SVG over each zone photo via a new `wireMapHTML()` component inside `chevelle-app.js`'s existing full-re-render engine and `data-act` event delegation. Wiring facts stay solely in the existing `CIRCUITS`/`FUSES`/`PARTS_MAP` data (corrected first); overlay completion rides the existing `state.checks` object under `wm:<zone>:<routeId>` keys.

**Tech Stack:** Vanilla HTML/CSS/JS, inline SVG, localStorage, service worker (GitHub Pages, offline-first iPad PWA). Tests: Node built-in test runner (`node --test`), zero new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-07-photo-wiring-overlay-design.md` (read it; the Appendix has all 55 findings, F-numbers used below).

---

## Repo primer (read before Task 1)

Everything lives at repo root `C:/Users/corey/Projects/chevelle-hdx-build-guide` (Windows box; Git Bash available).

- **`chevelle-hdx-interactive.html`** — app shell + ALL CSS in one `<style>` block (~line 16–500). Scripts at the bottom: line 504 `<script src="chevelle-data.js">`, line 505 `<script src="chevelle-app.js">`.
- **`chevelle-data.js`** — `window.CHEVELLE_DATA = {...}` with `PHASES` (17 phases, each `{id, n, stage, title, time, goal, tools, materials, substeps:[{text, detail}], ...}`). Pure JSON-ish data.
- **`chevelle-app.js`** — one IIFE. Reference data consts at top (`DASH_GAUGES` ~line 144, `CIRCUITS` ~190, `FUSES` ~264, `PARTS_MAP` ~286, `ENGINE_PARTS` ~357), then state, search, view renderers, `render()`, event delegation (single `appEl` click listener switching on `data-act`), lightbox, init.
- **State/persistence (CRITICAL INVARIANTS):**
  - Build substep checks: `state.checks[phase.id + ':' + index]` — **index-based**. Therefore in this project you may ONLY edit substep `text`/`detail` strings. NEVER insert, delete, or reorder substeps of any phase. Task 4 adds a snapshot test that locks substep counts.
  - Recommission checks: `state.checks['recom:' + stringId]`. Our overlay keys `wm:<zone>:<routeId>` follow this string-id pattern and cannot collide (`wm:` prefix).
  - `persist()` writes `{view, activePhase, checks, barneyMode, collapsed, expenses, recomV, recomLegacy}` to localStorage key `chevelle_refined_v1`. Because `checks` carries the `wm:` keys, backups (format 2, `exportBackup()`/`importBackup()` ~line 1215) round-trip overlay completion with ZERO format changes. This deliberately simplifies the spec's "additive optional wm key" — same guarantee, less code. Do not add a separate wm store.
- **Render conventions:** views return HTML strings; `render()` full re-render preserving `.scroll` scrollTop; `renderContent()` re-renders only the view. All interactivity via `data-act` attributes handled in the single click listener (~line 1253). Escape EVERY data string with `esc()`. Never call `render()` from the search input handler (focus loss — see comment at line 1341).
- **Gotchas:** Data strings contain typographic apostrophes (`’`) — copy old_string exactly from the file when editing. Working-copy line endings: let git handle them; don't convert files. After ANY edit to a `.js` file run `node --check <file>`. Content changes need a `sw.js` `CACHE` bump to reach devices — this project bumps once, to `v10`, in Task 14 (don't bump per-task).
- **Verification servers:** use the preview tools (`.claude/launch.json` config named `chevelle` if present, else create: `npx serve -l 3000 .` or `python -m http.server 3000`). When verifying in a browser, DevTools → Application → Service Workers → check "Update on reload" + Clear storage between SW tests (cache-first serves stale HTML otherwise).

## File structure (what this plan creates/modifies)

| File | Action | Responsibility |
|---|---|---|
| `tests/guide-data.test.js` | Create | Locks corrected wiring facts + forbids the disproven claims (regex over source) + substep-count snapshot |
| `tests/wiremap.test.js` | Create | WIRE_MAP schema validation, cross-refs, id stability, path-helper unit tests |
| `chevelle-wiremap.js` | Create | `window.WIRE_MAP` (4 zones: photo, pins, routes, shotList) + `window.WIRE_MAP_UTIL.pathD()` |
| `chevelle-app.js` | Modify | Tier 1 data corrections; lightbox fix + overlay support; `wireMapHTML()`; new acts `wm-pin/wm-route/wm-reset/wm-done`; Tier 2 fixes; wake lock |
| `chevelle-data.js` | Modify | Phase 4/5 substep text corrections (text-only; counts locked) |
| `chevelle-hdx-interactive.html` | Modify | `<script src="chevelle-wiremap.js">` before app; overlay + safe-area + check-row CSS |
| `sw.js` | Modify | Network-first for code files, `cache:'reload'` precache, new assets, `CACHE='chevelle-hdx-v10'`, update notification hook |
| `manifest.json` | Modify | `start_url: "chevelle-hdx-interactive.html"` |
| `engine-bay-reference.jpg`, `under-car-reference.jpg`, `rear-sender-reference.jpg` | Create | Licensed zone photos, ≤1600px wide, ≤200KB |
| `ATTRIBUTIONS.md` | Create | CC photo credits |
| `docs/qa/wire-map-smoke.md` | Create | Manual QA checklist |

Run all tests with: `node --test` (from repo root). No package.json needed.

---

### Task 1: Test harness + guardrail tests for current invariants

**Files:**
- Create: `tests/guide-data.test.js`

- [ ] **Step 1: Write the harness with two passing structural tests and one substep-count snapshot**

Create `tests/guide-data.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests — all pass, snapshot file created**

Run: `cd C:/Users/corey/Projects/chevelle-hdx-build-guide && node --test`
Expected: `# pass 3`, and `tests/substep-counts.snapshot.json` now exists.

- [ ] **Step 3: Run again to confirm the snapshot comparison path passes**

Run: `node --test`
Expected: `# pass 3`.

- [ ] **Step 4: Commit**

```bash
git add tests/
git commit -m "test: harness + substep-count lock (persistence guardrail)"
```

---

### Task 2: Rebuild the FUSES table from the shipped AAW diagram (F2, F42)

The current `FUSES` array (chevelle-app.js ~lines 264–283) contradicts `aaw-diagrams/aaw-fuse-panel-layout.png`. Verified anchor facts from the diagram (review F2, confirmed at 3–4x zoom): **GAUGES 5A (tan), CLOCK 10A (red), WIPER 10A, LIGHTER 10A, single TURN 10A, HAZARD 15A, DASH LTS 10A and IGN 1 20A exist; there is NO "SW IGN" fuse; the printed panel legend has NO slot numbers** (fuses are identified by circuit name).

**Files:**
- Modify: `chevelle-app.js` (FUSES array ~264; volt gauge entry ~180–186; PARTS_MAP fuse-panel note ~296; `wiringHTML()` fuse grid ~983–996; search index ~633)
- Test: `tests/guide-data.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `tests/guide-data.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `node --test`
Expected: FAIL — the three new tests fail against the current source (e.g. `GAUGES', amps: 10` still present).

- [ ] **Step 3: Transcribe the real 18-position layout from the diagram**

Use the Read tool on `C:/Users/corey/Projects/chevelle-hdx-build-guide/aaw-diagrams/aaw-fuse-panel-layout.png` (it renders as an image). Transcribe every fuse position: label, amps, feed type (Battery / Ignition / Accessory), reading amps from both the printed rating and the ATC fuse color (tan=5A, red=10A, blue=15A, yellow=20A, green=30A). The verified anchors in Step 1 must agree with what you see; if the diagram shows something different from an anchor, STOP and re-read at higher zoom — the anchors were verified at 3–4x zoom by the review.

- [ ] **Step 4: Rewrite the FUSES array**

In `chevelle-app.js`, replace the entire `const FUSES = [ ... ];` block (~lines 264–283) with the transcription. Keep the object shape `{ slot, label, amps, feed, hdx, detail }` — `slot` is now ONLY an internal grid-position/selection id (1–18, top-to-bottom as drawn in the diagram); it is never presented as an authoritative panel number. Set `hdx` strings on exactly three entries:

```js
  // GAUGES entry:
  hdx: 'PINK switched 12V feed — the HDX taps this fuse position. Gauges dark with key ON? Check here FIRST.',
  // CLOCK entry:
  hdx: 'RED constant 12V feed — keeps HDX memory alive. You land the HDX RED here yourself.',
  // FUEL entry:
  hdx: null,
```

and put the factory-fuel-circuit note in the FUEL entry's `detail` instead:

```js
  detail: 'Factory fuel circuit. The HDX fuel sender signal is UNFUSED — a fuel-gauge problem means checking the TAN twisted pair and rear body ground, not this fuse.',
```

- [ ] **Step 5: Update every dependent string in chevelle-app.js**

Five exact edits (copy old strings from the file exactly — they contain typographic quotes):

1. `DASH_GAUGES` volt entry (~line 182): change
   `wire: 'Via RED (constant, Fuse #8) + PINK (switched, Fuse #7) feeds',` → `wire: 'Via RED (constant — CLOCK fuse) + PINK (switched — GAUGES fuse) feeds',`
   and (~line 184) `fuse: { slot: 7, label: 'GAUGES', amps: 10 },` → `fuse: { label: 'GAUGES', amps: 5 },`
   and (~line 185) `trace: ['Fuse #7 GAUGES (PINK)', 'HDX Control Box', 'Cluster — Volts'],` → `trace: ['GAUGES fuse 5A (PINK)', 'HDX Control Box', 'Cluster — Volts'],`
2. `dashHTML()` fuse text (~line 912): `const fuseTxt = g.fuse ? ('#' + g.fuse.slot + ' ' + g.fuse.label + ' ' + g.fuse.amps + 'A') : 'None — sender signal (unfused)';` → `const fuseTxt = g.fuse ? (g.fuse.label + ' ' + g.fuse.amps + 'A') : 'None — sender signal (unfused)';`
3. `PARTS_MAP` AAW Fuse Panel entry (~line 296): `wiresOut: '18 fused circuits — HDX on #7 / #8 / #9',` → `wiresOut: '18 fused circuits — HDX taps GAUGES (PINK) + CLOCK (RED); fuel sender is unfused',`
4. `wiringHTML()` fuse grid button (~line 984–985): drop the number display — `'<span class="fs-n mono">#' + f.slot + '</span>'` → `''` (keep the button and `data-slot` for selection), and the empty-state hint (~line 996): `'Tap a slot for details. Accent-ringed slots (#7 / #8 / #9) power the HDX.'` → `'Tap a fuse for details. The panel legend has no numbers — find fuses by their printed label. Accent-ringed: GAUGES + CLOCK power the HDX.'`
5. Search index (~line 633): `add({ type: 'fuse', title: '#' + f.slot + ' ' + f.label + ...` → `add({ type: 'fuse', title: f.label + ' ' + f.amps + 'A', ...` (keep the rest).

Also update `circuitCardHTML()` (~lines 952 and 969) which renders `'#' + c.fuse.slot + ' ' + c.fuse.label`: change both to render `c.fuse.label + ' ' + c.fuse.amps + 'A'` only (Task 3 removes `slot` from circuit fuse refs).

- [ ] **Step 6: Syntax check + run tests**

Run: `node --check chevelle-app.js && node --test`
Expected: `--check` silent; the Task 2 tests PASS. (The Task 1 tests still pass.)

- [ ] **Step 7: Commit**

```bash
git add chevelle-app.js tests/guide-data.test.js
git commit -m "fix(wiring): rebuild FUSES from shipped AAW diagram — GAUGES 5A / CLOCK 10A, label-keyed HDX callouts (F2, F42)"
```

---

### Task 3: Correct sender routing + temp-sender wiring in all reference views (F1, F3, F7, F13, F15, F41)

The reference views wrongly route HDX senders through AAW connectors F/G/H (they're capped on HDX builds — senders run DIRECT to the Control Box on the Dakota sub-harness), claim the temp sender grounds through the block (it's two-wire: both to the Control Box), and cite a phantom turn fuse.

**Files:**
- Modify: `chevelle-app.js` (`DASH_GAUGES` ~144–187, `CIRCUITS` ~190–260, `PARTS_MAP` Engine Bay zone ~318–325, `ENGINE_PARTS` ~357–362, `TROUBLE` #10 ~436)
- Test: `tests/guide-data.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `tests/guide-data.test.js`:

```js
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
});

test('voltmeter has no signal wire claim (F41)', () => {
  assert.doesNotMatch(APP_SRC(), /voltmeter needs only its signal wire/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL — all four new tests fail against current source.

- [ ] **Step 3: Fix DASH_GAUGES (four entries)**

In `chevelle-app.js`, exact edits (old strings verbatim from file):

1. **tach** (~147, 150): `wire: 'WHITE 18 AWG — AAW Connector H',` → `wire: 'WHITE 18 AWG — Dakota sender sub-harness, direct to Control Box',` and `trace: ['Coil (–) / HEI TACH', 'Firewall grommet', 'AAW Connector H (WHITE)', 'HDX Control Box TACH', 'Cluster — RPM'],` → `trace: ['Coil (–) / HEI TACH', 'Firewall grommet', 'Dakota sender sub-harness', 'HDX Control Box TACH', 'Cluster — RPM'],`
2. **speed** (~157): `trace: ['Trans tailshaft adapter', 'Floor grommet', 'AAW VSS connector', 'HDX Control Box SPEED', 'Cluster — MPH'],` → `trace: ['Trans tailshaft adapter', 'Floor grommet', 'Dakota sender sub-harness', 'HDX Control Box SPEED', 'Cluster — MPH'],` (AAW Connector H exists for aftermarket speedos, but this build runs the Dakota harness — Phase 2 caps the AAW path.)
3. **oil** (~164): `trace: ['SEN-03-8 at block port', 'Firewall grommet', 'AAW Connector F', 'HDX Control Box OIL', 'Cluster — PSI'],` → `trace: ['SEN-03-8 at block port', 'Firewall grommet', 'Dakota sender sub-harness', 'HDX Control Box OIL', 'Cluster — PSI'],`
4. **temp** (~168, 171–172): `wire: 'DARK GREEN signal 18 AWG — AAW Connector G',` → `wire: 'Two-wire Dakota lead — both wires to Control Box (TEMP INPUT-SIG + TEMP INPUT-GND)',` ; `trace: ['SEN-04-5 at intake port', 'Firewall grommet', 'AAW Connector G (DK GREEN)', 'HDX Control Box TEMP', 'Cluster — °F'],` → `trace: ['SEN-04-5 at intake port', 'Firewall grommet', 'Dakota sender sub-harness', 'HDX Control Box TEMP (SIG + GND)', 'Cluster — °F'],` ; and in `note:` replace `'Grounds through the engine block — no separate ground wire. Missing the 3/8"-to-1/8" NPT reducer bushing...'` with `'Both sender wires land on the Control Box — TEMP INPUT-SIG and TEMP INPUT-GND (MAN 650542H). Teflon tape on the threads is fine; the ground does NOT rely on them. Missing the 3/8"-to-1/8" NPT reducer bushing = no seal = coolant leak. Drain coolant below the port before pulling the plug.'`

- [ ] **Step 4: Fix CIRCUITS (tach, oil, temp, speed, turn)**

1. **tach** (~210–212): `aawWire: 'WHITE via Connector H',` → `aawWire: 'AAW WHITE — capped on HDX builds (see Phase 2)',` ; `aawRef: 'AAW Connector H'` → `aawRef: 'Dakota dedicated tach lead'` ; in `route`, `'AAW Connector H',` → `'Dakota sender sub-harness',`
2. **oil** (~216–218): `aawWire: 'via Connector F',` → `aawWire: 'AAW DK BLUE — capped on HDX builds',` ; `aawRef: 'AAW Connector F · Dakota SEN-03-8'` → `aawRef: 'Dakota SEN-03-8 sub-harness'` ; in `route`, `'AAW Connector F',` → `'Dakota sender sub-harness',`
3. **temp** (~222–226): `aawWire: 'via Connector G',` → `aawWire: 'AAW DK GREEN — capped on HDX builds',` ; `hotWhen: 'Signal only — grounds through block',` → `hotWhen: 'Sender signal (SIG + GND pair)',` ; `aawRef: 'AAW Connector G · Dakota SEN-04-5'` → `aawRef: 'Dakota SEN-04-5 sub-harness'` ; in `route`, `'AAW Connector G',` → `'Dakota sender sub-harness',` and `'HDX Control Box TEMP'` → `'HDX Control Box TEMP INPUT-SIG + TEMP INPUT-GND'` ; in `notes`, replace `'2-wire system: grounds through the engine block, no separate ground wire. If reading is wrong, check sender metal-to-metal contact.'` with `'2-wire sender: BOTH wires go to the Control Box (TEMP INPUT-SIG + TEMP INPUT-GND per MAN 650542H). If the reading is wrong, check both wires at the box — not the threads.'`
4. **speed** (~228–230): `aawWire: 'AAW VSS connector',` → `aawWire: 'AAW Connector H (VSS) — unused; Dakota harness runs direct',` ; in `route`, `'AAW VSS connector',` → `'Dakota sender sub-harness',`
5. **turn** (~247–252): delete the stale comment lines `/* Fuse # per old circuit card; ... */` and change `fuse: { slot: 5, label: 'TURN', amps: 15, feed: 'Ignition' },` → `fuse: { label: 'TURN', amps: 10, feed: 'Ignition' },` and in `route`, `'Fuse #5 TURN 15A',` → `'TURN fuse 10A',`
6. **const12v/sw12v** (~193–202): remove remaining slot-number references — `fuse: { slot: 8, label: 'CLOCK', amps: 5, feed: 'Battery — always hot' },` → `fuse: { label: 'CLOCK', amps: 10, feed: 'Battery — always hot' },` ; `aawRef: 'AAW 500707 Fuse #8',` → `aawRef: 'AAW 500707 — CLOCK position (find by printed label)',` ; in route `'Fuse #8 CLOCK 5A',` → `'CLOCK fuse 10A',` ; same pattern for sw12v: `fuse: { slot: 7, label: 'GAUGES', amps: 10, feed: 'Ignition' },` → `fuse: { label: 'GAUGES', amps: 5, feed: 'Ignition' },` ; `aawRef: 'AAW 500707 Fuse #7',` → `aawRef: 'AAW 500707 — GAUGES position (find by printed label)',` ; route `'Fuse #7 GAUGES 10A',` → `'GAUGES fuse 5A',` ; and in sw12v warnings `'...check Fuse #7 FIRST — most common cause.'` → `'...check the GAUGES fuse FIRST — most common cause.'`

Note: `search-go` passes `data-fuse` from the search index (`fuse: f.slot`) into `state.ui.fuseSel` — FUSES entries keep `slot`, so this still works. Only CIRCUIT fuse refs and display strings lose their numbers.

- [ ] **Step 5: Fix PARTS_MAP + ENGINE_PARTS + TROUBLE #10**

1. `PARTS_MAP` HDX Control Box entry (~292): `wiresIn: 'RED const 12V (Fuse #8) · PINK sw 12V (Fuse #7) · ORANGE dimmer · all sender leads',` → `wiresIn: 'RED const 12V (CLOCK fuse) · PINK sw 12V (GAUGES fuse) · ORANGE dimmer · all sender leads',`
2. `PARTS_MAP` Oil Pressure Sender (~319): `wiresOut: 'WHITE sig / RED 5V / BLACK gnd + bare shield (22 AWG) → Connector F',` → `wiresOut: 'WHITE sig / RED 5V / BLACK gnd + bare shield (22 AWG) — Dakota sub-harness direct to Control Box',`
3. `PARTS_MAP` Coolant Temp Sender (~322): `wiresOut: 'DARK GREEN signal (18 AWG) → Connector G; grounds through block',` → `wiresOut: 'Two wires — Dakota lead direct to Control Box TEMP INPUT-SIG + TEMP INPUT-GND',`
4. `PARTS_MAP` Tach Signal Source (~325): `wiresOut: 'WHITE 18 AWG → Connector H',` → `wiresOut: 'WHITE 18 AWG — Dakota lead direct to Control Box TACH',`
5. `PARTS_MAP` Speed Sensor Adapter (Transmission & Under Car zone, ~338): `wiresOut: 'PURPLE sig / RED 5V / BLACK gnd (22 AWG) → AAW VSS connector',` → `wiresOut: 'PURPLE sig / RED 5V / BLACK gnd (22 AWG) — Dakota sub-harness direct to Control Box',`
6. `ENGINE_PARTS` (~358–361): `wire: 'WHITE/RED/BLACK + shield → Conn F',` → `wire: 'WHITE/RED/BLACK + shield — direct to Control Box',` ; `wire: 'DK GREEN → Conn G (grounds through block)',` → `wire: 'Two-wire lead — Control Box TEMP INPUT-SIG + TEMP INPUT-GND',` ; `wire: 'PURPLE/RED/BLACK → AAW VSS conn',` → `wire: 'PURPLE/RED/BLACK — direct to Control Box',` ; `wire: 'WHITE → Conn H',` → `wire: 'WHITE — direct to Control Box TACH',`
7. `TROUBLE` #10 fix text (~436): `fix: 'Disconnect and insulate the old ammeter bypass wire (heavy-gauge wire through the firewall). The HDX voltmeter needs only its signal wire on the battery/charging circuit.',` → `fix: 'Disconnect and insulate the old ammeter bypass wire (heavy-gauge wire through the firewall). The HDX reads voltage internally through its RED/PINK power feeds — there is no separate voltmeter wire.',`

- [ ] **Step 6: Syntax check + run tests**

Run: `node --check chevelle-app.js && node --test`
Expected: all tests PASS, including Task 2's (no slot-number regressions).

- [ ] **Step 7: Commit**

```bash
git add chevelle-app.js tests/guide-data.test.js
git commit -m "fix(wiring): senders run direct to Control Box, temp is two-wire SIG+GND, TURN 10A by label (F1,F3,F7,F13,F41)"
```

---

### Task 4: Correct Phase 4/5 build text in chevelle-data.js (F14, F15, F18, F40, F3)

TEXT-ONLY edits — the substep-count snapshot test guards this. Copy old strings exactly from the file.

**Files:**
- Modify: `chevelle-data.js` (Phase 4 substeps ~284–301; Phase 5 substeps ~360–364)
- Test: `tests/guide-data.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `tests/guide-data.test.js`:

```js
const DATA_SRC = () => read('chevelle-data.js');

test('Phase 4 hookup text matches the verified plan (F14/F15/F18)', () => {
  const src = DATA_SRC();
  assert.doesNotMatch(src, /Tach: single wire from coil negative\. Fuel: single wire from tank sender/);
  assert.doesNotMatch(src, /run a dedicated 14-16 AWG wire from the battery\/starter solenoid through the firewall, fused at 15A/);
  assert.match(src, /CLOCK fuse position/);
  assert.match(src, /GAUGES fuse position/);
  assert.match(src, /FUEL INPUT-SIG \+ FUEL INPUT-GND/);
});

test('Phase 5 temp sender text is corrected (F3/F40)', () => {
  const src = DATA_SRC();
  assert.doesNotMatch(src, /the threads in the manifold complete the ground path/);
  assert.doesNotMatch(src, /usually rear, near the thermostat housing/);
  assert.match(src, /front of the intake, passenger side/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL — both new tests fail.

- [ ] **Step 3: Apply the five text edits**

1. **Phase 4 RED substep detail** (~line 285). Old: `"This wire must have power at ALL times (even when key is off). Connect to a fused source: 5-20A inline fuse. Best practice: run a dedicated 14-16 AWG wire from the battery/starter solenoid through the firewall, fused at 15A. The red wire from the Control Box is 18 AWG."` New: `"This wire must have power at ALL times (even when key is off) — it keeps the HDX memory alive. CANONICAL METHOD: land it on the AAW fuse panel's CLOCK fuse position (battery-hot, 10A — find it by the printed label on the panel legend). Alternative only if the CLOCK position is already taken: a dedicated wire from the battery/starter stud through the firewall with an inline fuse of 10A MAX — the Control Box RED pigtail is 18 AWG and must not be fused above 10A."`
2. **Phase 4 PINK substep detail** (~line 289). Old: `"This wire provides power only when the key is in the ON or RUN position. Tap into the ignition switch output or use the fuse panel's IGN circuit. Use a test light to verify: power at ON, no power at OFF."` New: `"This wire provides power only when the key is in the ON or RUN position. Land it on the AAW fuse panel's GAUGES fuse position (ignition-hot, 5A — find it by the printed label). Use a test light to verify: power at ON, no power at OFF."`
3. **Phase 4 sensor summary detail** (~line 301). Old: `"Oil pressure: 3-wire (white SIG, red PWR, black GND). Water temp: 2-wire. Speed sensor: 3-wire. Tach: single wire from coil negative. Fuel: single wire from tank sender. Each one plugs into a labeled connector on the Control Box."` New: `"Oil pressure: 3-wire + shield (WHITE sig, RED 5V, BLACK gnd, bare shield to DRN). Water temp: 2-wire — BOTH to the box (TEMP INPUT-SIG + TEMP INPUT-GND). Speed sensor: 3-wire. Tach: HEI TACH terminal (points ignition: coil negative) — see Phase 5. Fuel: TAN twisted pair from the tank sender to FUEL INPUT-SIG + FUEL INPUT-GND, unfused. Each one lands on a labeled terminal on the Control Box."`
4. **Phase 5 temp install detail** (~line 360). Old: `"Find the water jacket port on the intake manifold (usually rear, near the thermostat housing). You may need a reducing bushing: GM ports are often 3/8\" or 1/2\" NPT, but the HDX sender is 1/8\" NPT. Use the included bushing adapter. Teflon tape, hand-tight + 1/4 turn."` New: `"Find the water jacket port at the front of the intake, passenger side, near the thermostat housing. You may need a reducing bushing: GM ports are often 3/8\" or 1/2\" NPT, but the HDX sender is 1/8\" NPT. Use the included bushing adapter. Teflon tape, hand-tight + 1/4 turn."`
5. **Phase 5 temp wiring substep** (~lines 362–364). Old text: `"Wire the temp sender: signal to Control Box, ground through block"` → New: `"Wire the temp sender: both wires to the Control Box (SIG + GND)"`. Old detail: `"This is a 2-wire sender. One wire goes to the Control Box TEMP input. The other grounds through the engine block (the threads in the manifold complete the ground path)."` → New: `"This is a 2-wire sender and BOTH wires go to the Control Box: one to TEMP INPUT-SIG, one to TEMP INPUT-GND (MAN 650542H). The ground does NOT run through the engine block — Teflon tape on the threads is fine and does not affect the reading."`

- [ ] **Step 4: Syntax check + run tests (including the substep-count lock)**

Run: `node --check chevelle-data.js && node --test`
Expected: ALL tests pass — the snapshot test proves no substep was added/removed.

- [ ] **Step 5: Commit**

```bash
git add chevelle-data.js tests/guide-data.test.js
git commit -m "fix(build-text): canonical RED/PINK fuse landings, sensor hookup summary, temp two-wire truth (F14,F15,F18,F40,F3)"
```

---

### Task 5: Fix the lightbox tap/pan self-close bug (F12)

Root cause (confirmed): `stage.setPointerCapture()` retargets the synthesized click to `.lb-stage`, so `ev.target === stage` is true after ANY tap or pan on the image — the lightbox closes itself.

**Files:**
- Modify: `chevelle-app.js` (`openLightbox()` ~1364–1423)

- [ ] **Step 1: Reproduce the bug**

Start the preview server, open the app, Reference → Wiring → tap any diagram thumbnail, then tap once ON the image.
Expected (bug): the lightbox closes.

- [ ] **Step 2: Implement the fix**

In `openLightbox()`:

1. Extend the gesture state (line ~1366): `const z = { scale: 1, x: 0, y: 0, dragging: false, sx: 0, sy: 0, lastTap: 0, pointers: new Map(), pinchDist: 0, downX: 0, downY: 0, downOnImg: false, moved: 0 };`
2. In the `pointerdown` handler, after `stage.setPointerCapture(ev.pointerId);` add:

```js
    z.downX = ev.clientX; z.downY = ev.clientY; z.moved = 0;
    z.downOnImg = ev.target !== stage;
```

3. In the `pointermove` handler, first line inside (after the `has` guard): `z.moved = Math.max(z.moved, Math.hypot(ev.clientX - z.downX, ev.clientY - z.downY));`
4. Replace the close-on-click line `stage.addEventListener('click', ev => { if (ev.target === stage) closeLightbox(); });` with:

```js
  stage.addEventListener('click', () => {
    /* pointer capture retargets clicks to the stage — decide by gesture, not target:
       close only on a genuine tap (<8px movement) that started on the backdrop */
    if (z.moved < 8 && !z.downOnImg) closeLightbox();
  });
```

- [ ] **Step 3: Syntax check + verify by hand**

Run: `node --check chevelle-app.js`
Then in the preview: (a) tap ON the image → stays open; (b) pinch/drag the image → stays open; (c) tap the dark area beside the image → closes; (d) X button and Esc → close.

- [ ] **Step 4: Commit**

```bash
git add chevelle-app.js
git commit -m "fix(lightbox): don't self-close on image tap/pan — pointer capture retargets clicks (F12)"
```

---

### Task 6: Create `chevelle-wiremap.js` — data schema, path helper, behind-dash zone

**Files:**
- Create: `chevelle-wiremap.js`
- Modify: `chevelle-hdx-interactive.html` (script tag)
- Test: `tests/wiremap.test.js`

- [ ] **Step 1: Write the failing schema tests**

Create `tests/wiremap.test.js`:

```js
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
    const pinIds = new Set();
    z.pins.forEach(p => {
      assert.match(p.id, /^[a-z0-9-]+$/, zone + ': pin id ' + p.id);
      assert.ok(!pinIds.has(p.id), zone + ': duplicate pin id ' + p.id); pinIds.add(p.id);
      assert.ok(p.part && typeof p.part === 'string', zone + ':' + p.id + ': part name');
      assert.ok(p.x >= 0 && p.x <= z.photo.w && p.y >= 0 && p.y <= z.photo.h, zone + ':' + p.id + ': pin inside photo');
    });
    const routeIds = new Set();
    z.routes.forEach(r => {
      assert.match(r.id, /^[a-z0-9-]+$/, zone + ': route id ' + r.id);
      assert.ok(!routeIds.has(r.id), zone + ': duplicate route id ' + r.id); routeIds.add(r.id);
      assert.ok(pinIds.has(r.pin), zone + ':' + r.id + ': route.pin "' + r.pin + '" exists');
      assert.ok(validCircuits.includes(r.circuit), zone + ':' + r.id + ': circuit "' + r.circuit + '" exists in CIRCUITS');
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/wiremap.test.js`
Expected: FAIL — `chevelle-wiremap.js` doesn't exist (ENOENT).

- [ ] **Step 3: Create `chevelle-wiremap.js`**

Pin/route coordinates below were estimated off `dash-reference.jpg` (1551×872) — fuse panel lower-left, steering column tube center, HDX Control Box + grey display cable upper-right, heater box far right. They are verified visually in Step 5 (expect to nudge a few by 10–40px; that is part of the task, not a failure).

```js
/* ============================================================
   chevelle-wiremap.js — photo wiring overlay data (pure data).
   Coordinates are INTRINSIC PHOTO PIXELS (viewBox = photo w/h),
   so routes stay anchored at any zoom ("to scale").
   Route ids are PERMANENT — completion checks persist under
   state.checks['wm:<zone>:<routeId>']; renaming a label is fine,
   changing an id loses the user's checked state. When a photo is
   replaced with Corey's own shot, keep ids, re-anchor coords only.
   Physical wire colors (not theme colors):
   RED #e5484d · PINK #ff9ec6 · ORANGE #ff8c00 · TAN #d2b48c ·
   PURPLE #a855f7 · DK GREEN #1a7a4a · WHITE #f5f5f5 · BLACK #222 ·
   GREY #9aa3ad. halo:true = draw a dark under-stroke (light colors).
   ============================================================ */
window.WIRE_MAP_UTIL = {
  /* Catmull-Rom -> cubic Bezier; shared by app render + lightbox */
  pathD: function (pts) {
    if (!pts || pts.length < 2) return '';
    if (pts.length === 2) return 'M' + pts[0][0] + ',' + pts[0][1] + ' L' + pts[1][0] + ',' + pts[1][1];
    let d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6) + ',' + (p1[1] + (p2[1] - p0[1]) / 6)
        + ' ' + (p2[0] - (p3[0] - p1[0]) / 6) + ',' + (p2[1] - (p3[1] - p1[1]) / 6)
        + ' ' + p2[0] + ',' + p2[1];
    }
    return d;
  }
};

window.WIRE_MAP = {
  'behind-dash': {
    photo: { src: 'dash-reference.jpg', w: 1551, h: 872 },
    shotList: '',
    pins: [
      { id: 'fuse-panel',   part: 'AAW Fuse Panel',            x: 285,  y: 600 },
      { id: 'column',       part: 'Steering Column (clamp area)', x: 610, y: 470 },
      { id: 'hdx-box',      part: 'HDX Control Box',           x: 1160, y: 375 },
      { id: 'heater-box',   part: 'Heater Box',                x: 1300, y: 440 },
      { id: 'ground-bolt',  part: 'Dedicated Ground Bolt',     x: 760,  y: 395 },
      { id: 'bulkhead',     part: 'Bulkhead Connector',        x: 430,  y: 330 },
      { id: 'flasher',      part: 'Turn-Signal Flasher',       x: 370,  y: 690 },
      { id: 'headlight-sw', part: 'Headlight Switch + Dim Kit', x: 330, y: 195 },
    ],
    routes: [
      { id: 'red-const',    label: 'RED constant 12V → CLOCK fuse',   color: '#e5484d', pin: 'hdx-box',  circuit: 'const12v',
        path: [[1130, 395], [900, 470], [640, 520], [400, 560], [320, 585]] },
      { id: 'pink-sw',      label: 'PINK switched 12V → GAUGES fuse', color: '#ff9ec6', pin: 'hdx-box',  circuit: 'sw12v', halo: true,
        path: [[1130, 405], [905, 485], [645, 535], [405, 575], [318, 600]] },
      { id: 'black-gnd',    label: 'BLACK dedicated ground',          color: '#222222', pin: 'hdx-box',  circuit: 'gnd', halo: true,
        path: [[1135, 385], [950, 400], [800, 395]] },
      { id: 'orange-dim',   label: 'ORANGE dimmer feed',              color: '#ff8c00', pin: 'headlight-sw', circuit: 'dimmer',
        path: [[360, 215], [430, 330], [600, 430], [900, 440], [1130, 390]] },
      { id: 'display-cable', label: '8-pin display cable → cluster',  color: '#9aa3ad', pin: 'hdx-box', circuit: 'sw12v', dash: true,
        path: [[1150, 400], [1080, 520], [960, 600], [880, 620]] },
      { id: 'tan-fuel',     label: 'TAN fuel sender twisted pair (from rear)', color: '#d2b48c', pin: 'hdx-box', circuit: 'fuel', halo: true,
        path: [[1420, 700], [1250, 560], [1180, 430], [1160, 400]] },
      { id: 'sender-leads', label: 'Sender leads via firewall grommet', color: '#f5f5f5', pin: 'bulkhead', circuit: 'oil', halo: true,
        path: [[440, 345], [640, 400], [900, 420], [1130, 385]] },
    ],
  },
};
```

Note: `display-cable` reuses circuit `sw12v` only as its info card fallback; its own `label` is what renders. (The schema requires a valid circuit ref; the display cable has no CIRCUITS entry and this is the closest power-path card. The card header shows the route label, so this is not user-visible confusion.)

- [ ] **Step 4: Load it in the HTML shell**

In `chevelle-hdx-interactive.html` line 504, before the data script, insert:

```html
<script src="chevelle-wiremap.js"></script>
```

(Resulting order: chevelle-wiremap.js → chevelle-data.js → chevelle-app.js.)

- [ ] **Step 5: Verify: syntax, tests**

Run: `node --check chevelle-wiremap.js && node --test`
Expected: all pass (visual coordinate verification happens in Task 7 Step 5 once the overlay renders).

- [ ] **Step 6: Commit**

```bash
git add chevelle-wiremap.js chevelle-hdx-interactive.html tests/wiremap.test.js
git commit -m "feat(wiremap): WIRE_MAP data schema + path helper + behind-dash zone"
```

---

### Task 7: Render the overlay in Parts Map — `wireMapHTML()` + interactions

**Files:**
- Modify: `chevelle-app.js` (new component before `partsHTML()` ~line 1006; `partsHTML()` media block ~1010–1021; `PARTS_MAP` zone 1; state.ui init ~568; delegation switch ~1290)
- Modify: `chevelle-hdx-interactive.html` (CSS)

- [ ] **Step 1: Add `wm` selection state and zone binding**

1. In the `state` initializer (~line 568), extend `ui`: `ui: { expanded: {}, accordion: null, dashSel: 'tach', glossLocal: '', barneyOpen: {}, circuitSel: null, fuseSel: null, wm: null },`
2. In `PARTS_MAP`, add to the `'Behind Dash'` zone object (same line as `zone:`): `wm: 'behind-dash',`

- [ ] **Step 2: Add the render component**

Insert immediately above `function partsHTML()` in `chevelle-app.js`:

```js
/* ---------- photo wiring overlay (WIRE_MAP) ---------- */
function wmRouteDone(zone, id) { return !!state.checks['wm:' + zone + ':' + id]; }
function wmZoneCounts(zone) {
  const z = (window.WIRE_MAP || {})[zone];
  if (!z) return { done: 0, total: 0 };
  return { done: z.routes.filter(r => wmRouteDone(zone, r.id)).length, total: z.routes.length };
}
/* markup for photo+svg — shared by Parts Map view and the lightbox.
   interactive=false emits no data-act attributes (lightbox is display-only). */
function wireMapInnerHTML(zone, interactive) {
  const z = (window.WIRE_MAP || {})[zone];
  if (!z) return '';
  const sel = state.ui.wm && state.ui.wm.zone === zone ? state.ui.wm : null;
  const selPin = sel && sel.type === 'pin' ? sel.id : null;
  const selRoute = sel && sel.type === 'route' ? sel.id : null;
  let svg = '<rect x="0" y="0" width="' + z.photo.w + '" height="' + z.photo.h + '" fill="transparent"'
    + (interactive ? ' data-act="wm-reset" data-zone="' + zone + '"' : '') + '/>';
  z.routes.forEach(r => {
    const d = window.WIRE_MAP_UTIL.pathD(r.path);
    const hot = (selPin && r.pin === selPin) || (selRoute && r.id === selRoute);
    const dimmed = sel && !hot;
    const done = wmRouteDone(zone, r.id);
    const cls = 'wm-route' + (hot ? ' on' : '') + (dimmed ? ' dim' : '') + (done ? ' done' : '');
    if (r.halo) svg += '<path d="' + d + '" class="wm-halo' + (dimmed ? ' dim' : '') + '" fill="none"/>';
    svg += '<path d="' + d + '" class="' + cls + '" fill="none" stroke="' + r.color + '"'
      + (r.dash ? ' stroke-dasharray="10 7"' : '') + '/>';
    if (interactive) svg += '<path d="' + d + '" class="wm-hitpath" fill="none"'
      + ' data-act="wm-route" data-zone="' + zone + '" data-id="' + r.id + '"/>';
    if (done) {
      const end = r.path[r.path.length - 1];
      svg += '<circle cx="' + end[0] + '" cy="' + end[1] + '" r="16" class="wm-donedot"/>'
        + '<path d="M' + (end[0] - 7) + ',' + end[1] + ' l5,6 l9,-12" class="wm-donetick" fill="none"/>';
    }
  });
  z.pins.forEach((p, i) => {
    const routes = z.routes.filter(r => r.pin === p.id);
    const allDone = routes.length > 0 && routes.every(r => wmRouteDone(zone, r.id));
    const active = selPin === p.id;
    svg += '<g class="wm-pin' + (active ? ' on' : '') + (sel && !active ? ' dim' : '') + (allDone ? ' alldone' : '') + '"'
      + (interactive ? ' data-act="wm-pin" data-zone="' + zone + '" data-id="' + p.id + '"' : '') + '>'
      + '<circle cx="' + p.x + '" cy="' + p.y + '" r="52" class="wm-pinhit"/>'
      + '<circle cx="' + p.x + '" cy="' + p.y + '" r="26" class="wm-pindot"/>'
      + '<text x="' + p.x + '" y="' + (p.y + 9) + '" class="wm-pinnum">' + (i + 1) + '</text></g>';
  });
  return '<div class="wm-wrap"><img src="' + esc(z.photo.src) + '" alt="' + esc(zone) + ' wiring photo"'
    + ' onerror="this.closest(\'.wm-wrap\').classList.add(\'wm-imgfail\')"/>'
    + '<svg viewBox="0 0 ' + z.photo.w + ' ' + z.photo.h + '" preserveAspectRatio="xMidYMid meet">' + svg + '</svg>'
    + '<div class="wm-fallback">Photo unavailable — reconnect once on Wi-Fi to cache it. The parts list below still works.</div></div>';
}
function wmDetailHTML(zone) {
  const z = (window.WIRE_MAP || {})[zone];
  const sel = state.ui.wm && state.ui.wm.zone === zone ? state.ui.wm : null;
  if (!z || !sel) return '<div class="faint" style="font-size:13px;padding:8px 2px">Tap a numbered pin to light up its wires, or tap a wire for its circuit card. Tap the photo background to reset.</div>';
  const doneBtn = (rid, label) => {
    const k = 'wm:' + zone + ':' + rid;
    const on = !!state.checks[k];
    return '<button class="ghost-btn wm-donebtn' + (on ? ' on' : '') + '" data-act="wm-done" data-key="' + k + '">'
      + icon('check', 15) + ' ' + (on ? 'Connected ✓' : 'Mark connected') + (label ? ' — ' + esc(label) : '') + '</button>';
  };
  if (sel.type === 'route') {
    const r = z.routes.find(x => x.id === sel.id);
    if (!r) return '';
    const c = CIRCUITS.find(x => x.id === r.circuit);
    let h = '<div class="fuse-detail card pad"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
      + '<span class="circ-swatch" style="background:' + r.color + '"></span><strong style="font-size:16px">' + esc(r.label) + '</strong>'
      + (c && c.fuse ? '<span class="pill mono">' + esc(c.fuse.label) + ' ' + c.fuse.amps + 'A</span>' : '<span class="pill">Unfused</span>') + '</div>';
    if (c) {
      h += '<div class="trace-spec"><span class="ts-k">Wire</span><span class="ts-v">' + esc(c.hdxWire) + '</span></div>'
        + '<div class="trace-spec"><span class="ts-k">Gauge</span><span class="ts-v">' + esc(c.awg) + '</span></div>'
        + '<div class="trace-spec"><span class="ts-k">Route</span><span class="ts-v">' + esc(c.route.join(' → ')) + '</span></div>';
      if (c.warnings && c.warnings.length) h += callout('warn', c.warnings[0]);
    }
    return h + '<div style="margin-top:10px">' + doneBtn(r.id, '') + '</div></div>';
  }
  const p = z.pins.find(x => x.id === sel.id);
  if (!p) return '';
  const routes = z.routes.filter(r => r.pin === p.id);
  let h = '<div class="fuse-detail card pad"><strong style="font-size:16px">' + esc(p.part) + '</strong>'
    + '<div class="faint" style="font-size:13px;margin:4px 0 10px">' + routes.length + ' wire' + (routes.length === 1 ? '' : 's') + ' at this part — full details in the card below.</div>';
  routes.forEach(r => {
    h += '<div style="display:flex;align-items:center;gap:8px;margin:6px 0"><span class="circ-swatch" style="background:' + r.color + '"></span>'
      + '<span style="flex:1;font-size:13.5px">' + esc(r.label) + '</span>' + doneBtn(r.id, '') + '</div>';
  });
  return h + '</div>';
}
```

- [ ] **Step 3: Swap the Parts Map media block + add zone counts**

In `partsHTML()`:

1. Replace the zone-head line (~1009) with a version that appends the connected count for wm zones:

```js
    const wmc = z.wm ? wmZoneCounts(z.wm) : null;
    h += '<div class="zone-head">' + icon(z.icon, 16) + ' ' + esc(z.zone)
      + ' <span class="faint" style="font-weight:400">· ' + z.parts.length + ' items'
      + (wmc && wmc.total ? ' · <span class="mono">' + wmc.done + '/' + wmc.total + '</span> connected' : '') + '</span></div>';
```

2. At the top of the `if (z.media)` block, make wm zones take priority — replace `if (z.media) {` with:

```js
    if (z.wm && (window.WIRE_MAP || {})[z.wm]) {
      h += wireMapInnerHTML(z.wm, true)
        + '<button class="ghost-btn" style="height:34px;margin:8px 0 2px" data-act="zoom" data-wm="' + esc(z.wm) + '" data-src="" data-label="' + esc(z.zone) + ' — wiring overlay">' + icon('zoom', 15) + ' Zoom overlay</button>'
        + wmDetailHTML(z.wm);
      const wz = (window.WIRE_MAP || {})[z.wm];
      if (wz.shotList) h += callout('note', '📷 Replace with your car: ' + wz.shotList);
    } else if (z.media) {
```

3. Give the part cards a scroll anchor — in the `z.parts.forEach(p => {` loop change the opening `'<div class="gloss-item">...'` to `'<div class="gloss-item" data-partname="' + esc(p.n) + '">...'`.

- [ ] **Step 4: Wire the three new acts + scroll-to-card**

In the delegation switch (after `case 'fuse':` ~line 1290) add:

```js
      case 'wm-pin': {
        const zone = t.getAttribute('data-zone'), id = t.getAttribute('data-id');
        const cur = state.ui.wm;
        state.ui.wm = (cur && cur.zone === zone && cur.type === 'pin' && cur.id === id) ? null : { zone, type: 'pin', id };
        renderContent();
        if (state.ui.wm) {
          const z = (window.WIRE_MAP || {})[zone];
          const pin = z && z.pins.find(p => p.id === id);
          if (pin) requestAnimationFrame(() => {
            const card = appEl.querySelector('[data-partname="' + CSS.escape(pin.part) + '"]');
            if (card) card.scrollIntoView({ block: 'center', behavior: 'smooth' });
          });
        }
        break;
      }
      case 'wm-route': {
        const zone = t.getAttribute('data-zone'), id = t.getAttribute('data-id');
        const cur = state.ui.wm;
        state.ui.wm = (cur && cur.zone === zone && cur.type === 'route' && cur.id === id) ? null : { zone, type: 'route', id };
        renderContent(); break;
      }
      case 'wm-reset': state.ui.wm = null; renderContent(); break;
      case 'wm-done': {
        const k = t.getAttribute('data-key');
        if (state.checks[k]) delete state.checks[k]; else state.checks[k] = true;
        persist(); renderContent(); break;
      }
```

Note the exact-name match: `pin.part` strings must equal the `n` of a `PARTS_MAP` part in that zone for scroll-to-card (they do for behind-dash except `Steering Column (clamp area)` and `Heater Box`, which have no part card — the scroll silently no-ops, which is fine).

- [ ] **Step 5: Add the CSS**

In `chevelle-hdx-interactive.html`, after the `.pm-photo img` rule (~line 453) add:

```css
/* ---- photo wiring overlay ---- */
.wm-wrap { position:relative; border-radius:var(--r-lg); overflow:hidden; border:1px solid var(--line); max-width:680px; background:var(--photo-tint); }
.wm-wrap img { width:100%; display:block; }
.wm-wrap svg { position:absolute; inset:0; width:100%; height:100%; }
.wm-route { stroke-width:2.6; vector-effect:non-scaling-stroke; opacity:.6; transition:opacity .15s; }
.wm-route.on { stroke-width:4.5; opacity:1; }
.wm-route.dim { opacity:.14; }
.wm-route.done { opacity:.92; }
.wm-halo { stroke:#14161a; stroke-width:5; vector-effect:non-scaling-stroke; opacity:.55; }
.wm-halo.dim { opacity:.1; }
.wm-hitpath { stroke:transparent; stroke-width:26; vector-effect:non-scaling-stroke; pointer-events:stroke; cursor:pointer; }
.wm-pin { cursor:pointer; }
.wm-pin.dim { opacity:.35; }
.wm-pinhit { fill:transparent; }
.wm-pindot { fill:var(--accent); stroke:#fff; stroke-width:3; }
.wm-pin.on .wm-pindot { fill:#fff; stroke:var(--accent); stroke-width:5; }
.wm-pin.alldone .wm-pindot { fill:var(--good); }
.wm-pinnum { fill:#fff; font:700 26px 'Geist Mono', monospace; text-anchor:middle; pointer-events:none; }
.wm-pin.on .wm-pinnum { fill:var(--accent); }
.wm-donedot { fill:var(--good); }
.wm-donetick { stroke:#fff; stroke-width:3.5; vector-effect:non-scaling-stroke; }
.wm-fallback { display:none; padding:14px 16px; font-size:13.5px; color:var(--text-3); }
.wm-imgfail img, .wm-imgfail svg { display:none; }
.wm-imgfail .wm-fallback { display:block; }
.wm-donebtn { height:34px; font-size:12.5px; }
.wm-donebtn.on { color:var(--good); border-color:color-mix(in oklab, var(--good) 45%, transparent); }
```

- [ ] **Step 6: Syntax check + visual verification (this is where coordinates get nudged)**

Run: `node --check chevelle-app.js && node --test`
Then preview: Reference → Parts Map. (The "Zoom overlay" button becomes functional in Task 8 — ignore it for now.) Verify: photo renders with 8 numbered pins + 7 routes; tap pin 3 (HDX box) → its routes stay bright, others dim, page scrolls to the HDX Control Box card; tap a wire → circuit card appears under the photo with fuse label + amps from the corrected data; tap photo background → reset. Compare every pin against the actual photo content and nudge x/y values in `chevelle-wiremap.js` until each pin sits ON its part (fuse panel block, column tube, HDX box, heater box, etc.). Re-run `node --test` after nudging (bounds checks).

- [ ] **Step 7: Commit**

```bash
git add chevelle-app.js chevelle-hdx-interactive.html chevelle-wiremap.js
git commit -m "feat(wiremap): tap-to-trace overlay in Parts Map — pins, routes, circuit cards, persistent connected checks"
```

---

### Task 8: Lightbox overlay support (zoomable wire map)

**Files:**
- Modify: `chevelle-app.js` (`openLightbox()` ~1364; `zoom` case ~1291)
- Modify: `chevelle-hdx-interactive.html` (CSS)

- [ ] **Step 1: Make the zoom target generic and accept a wm zone**

1. Change the `zoom` case to pass the wm attribute: `case 'zoom': openLightbox(t.getAttribute('data-src'), t.getAttribute('data-label'), t.getAttribute('data-wm')); break;`
2. Change the signature: `function openLightbox(src, label, wmZone) {`
3. Replace the stage line in the innerHTML template:
   `'<div class="lb-stage"><img src="' + esc(src) + '" alt="' + esc(label) + '" draggable="false"/></div>'`
   with:
   `'<div class="lb-stage">' + (wmZone ? '<div class="lb-zoom-target lb-wm">' + wireMapInnerHTML(wmZone, false) + '</div>' : '<img class="lb-zoom-target" src="' + esc(src) + '" alt="' + esc(label) + '" draggable="false"/>') + '</div>'`
4. Change `const img = el.querySelector('img');` to `const img = el.querySelector('.lb-zoom-target');` (the variable keeps its name; the transform code is unchanged).

- [ ] **Step 2: CSS for the wm lightbox container**

Add after the `.lb-btn svg` rule (~line 376):

```css
.lb-wm { position:relative; max-width:92vw; max-height:82vh; }
.lb-wm .wm-wrap { max-width:none; border:none; }
.lb-wm .wm-wrap img { max-height:82vh; width:auto; max-width:92vw; }
```

- [ ] **Step 3: Verify**

`node --check chevelle-app.js`, then preview: Parts Map → tap a pin (highlight something) → "Zoom overlay" → lightbox shows photo WITH routes/pins at the same highlight state; pinch/scroll zoom keeps routes glued to photo features (this is the "to scale" acceptance test); taps inside do nothing (display-only); pan does not close it (Task 5 fix); X closes.

- [ ] **Step 4: Commit**

```bash
git add chevelle-app.js chevelle-hdx-interactive.html
git commit -m "feat(wiremap): zoomable overlay in lightbox — routes stay anchored under pinch-zoom"
```

---

### Task 9: Zone photos — download, compress, attribute; author the three remaining zones

**Files:**
- Create: `engine-bay-reference.jpg`, `under-car-reference.jpg`, `rear-sender-reference.jpg`, `ATTRIBUTIONS.md`
- Modify: `chevelle-wiremap.js` (3 new zones), `chevelle-app.js` (PARTS_MAP `wm:` bindings)

- [ ] **Step 1: Download the photos (Wikimedia serves resized derivatives via Special:FilePath)**

PowerShell, from repo root:

```powershell
$dl = @(
  @{u='https://commons.wikimedia.org/wiki/Special:FilePath/2014%20Rolling%20Sculpture%20Car%20Show%2047%20(1970%20Chevrolet%20Chevelle%20SS%20454%20engine).jpg?width=1600'; f='engine-bay-reference.jpg'},
  @{u='https://commons.wikimedia.org/wiki/Special:FilePath/3-speed%20GM%20Turbo%20Hydra-Matic%20automatic%20transmission%20(2015-08-29).jpg?width=1600'; f='under-car-reference.jpg'},
  @{u='https://commons.wikimedia.org/wiki/Special:FilePath/Fuel%20sender%20installed%20(1910727837).jpg?width=1600'; f='rear-sender-reference.jpg'}
)
foreach ($d in $dl) { Invoke-WebRequest -Uri $d.u -OutFile $d.f -UserAgent 'chevelle-hdx-build-guide/1.0 (github.com/coreymaypray/chevelle-hdx-build-guide)' }
Add-Type -AssemblyName System.Drawing
foreach ($d in $dl) { $i=[System.Drawing.Image]::FromFile((Resolve-Path $d.f)); "{0} -> {1}x{2}, {3:N0} bytes" -f $d.f,$i.Width,$i.Height,(Get-Item $d.f).Length; $i.Dispose() }
```

Expected: three files, each ≤1600px wide. If any file exceeds 200KB, recompress:

```powershell
Add-Type -AssemblyName System.Drawing
function Compress-Jpeg($path, $quality) {
  $img = [System.Drawing.Image]::FromFile((Resolve-Path $path))
  $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
  $p = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
  $tmp = "$path.tmp.jpg"; $img.Save($tmp, $enc, $p); $img.Dispose()
  Move-Item -Force $tmp $path; "{0}: {1:N0} bytes" -f $path, (Get-Item $path).Length
}
Compress-Jpeg 'engine-bay-reference.jpg' 72   # repeat per oversized file; drop quality to 65 if still >200KB
```

- [ ] **Step 2: LOOK at each downloaded photo and verify it's the right image**

Use the Read tool on each of the three jpgs (renders as image). Confirm: engine bay = big-block V8 bay with firewall visible; under-car = complete TH-family transmission with tailhousing visible; rear = fuel sender installed in a tank. Record each photo's exact intrinsic `Width x Height` from Step 1 output — the WIRE_MAP `photo.w/h` in Step 4 MUST be these real numbers, not the spec's estimates.

- [ ] **Step 3: Write ATTRIBUTIONS.md**

```markdown
# Photo Attributions

Base photos for the wiring-overlay feature. Overlays are drawn at runtime (SVG);
the photos themselves are unmodified except for downscaling/recompression.

| File | Source | Author | License |
|---|---|---|---|
| engine-bay-reference.jpg | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:2014_Rolling_Sculpture_Car_Show_47_(1970_Chevrolet_Chevelle_SS_454_engine).jpg) — 1970 Chevrolet Chevelle SS 454 engine | Michael Barera | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| under-car-reference.jpg | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:3-speed_GM_Turbo_Hydra-Matic_automatic_transmission_(2015-08-29).jpg) — GM Turbo Hydra-Matic 3-speed, National Holden Motor Museum | OSX | Public domain |
| rear-sender-reference.jpg | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Fuel_sender_installed_(1910727837).jpg) — fuel sender installed | dave_7 | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |

Photos of the actual 1972 Chevelle SS (`dash-reference*.jpg`, `behind-dash-reference.jpg`)
are the repo owner's own. CC BY-SA images remain under their original licenses.
```

- [ ] **Step 4: Author the three zones in `chevelle-wiremap.js`**

For each photo: Read it again, identify the landmark positions listed below, and write pins/routes with coordinates you measure off the rendered image (proportional estimate × intrinsic size; nudge in the preview after). Use the REAL `w`/`h` from Step 2. Required content per spec:

```js
  'engine-bay': {
    photo: { src: 'engine-bay-reference.jpg', w: /* real */, h: /* real */ },
    shotList: 'Your car: stand at the driver-side fender, frame the firewall + rear half of the intake, level with the carb, landscape. Drop the file in as engine-bay-reference.jpg, update w/h, re-anchor pins (ids stay — checks survive).',
    pins: [
      { id: 'oil-sender',   part: 'Oil Pressure Sender', x: ..., y: ... },   // driver side of block, mid-height
      { id: 'temp-sender',  part: 'Coolant Temp Sender', x: ..., y: ... },   // intake water jacket, passenger front
      { id: 'tach-source',  part: 'Tach Signal Source',  x: ..., y: ... },   // distributor / coil area
      { id: 'alternator',   part: 'Alternator + Ground Strap', x: ..., y: ... },
      { id: 'megafuse',     part: 'Megafuse / Main Power', x: ..., y: ... }, // near battery area
      { id: 'eb-bulkhead',  part: 'Bulkhead Connector',  x: ..., y: ... },   // firewall, driver side
    ],
    routes: [
      { id: 'oil-lead',   label: 'Oil sender W/R/B + shield → Control Box', color: '#f5f5f5', halo: true, pin: 'oil-sender',  circuit: 'oil',   path: [...to eb-bulkhead...] },
      { id: 'temp-lead',  label: 'Temp two-wire → Control Box SIG+GND',     color: '#1a7a4a',             pin: 'temp-sender', circuit: 'temp',  path: [...] },
      { id: 'tach-lead',  label: 'Tach WHITE from HEI TACH terminal',        color: '#f5f5f5', halo: true, pin: 'tach-source', circuit: 'tach',  path: [...] },
      { id: 'charge-wire', label: 'Alternator charge wire (Bag Z)',          color: '#e5484d',             pin: 'alternator',  circuit: 'const12v', path: [...] },
      { id: 'main-feed',  label: 'Megafuse main feed → fuse panel',          color: '#e5484d',             pin: 'megafuse',    circuit: 'const12v', path: [...to eb-bulkhead...] },
    ],
  },
  'under-car': {
    photo: { src: 'under-car-reference.jpg', w: ..., h: ... },
    shotList: 'Your car: on ramps/jack stands, shoot the trans tailshaft from the driver side showing the speedo-cable port. Replace under-car-reference.jpg, update w/h, re-anchor (ids stay).',
    pins: [
      { id: 'vss-port',     part: 'Speed Sensor Adapter', x: ..., y: ... },  // speedo driven-gear port on the tailhousing
      { id: 'frame-ground', part: 'Frame/Body Ground',    x: ..., y: ... },
    ],
    routes: [
      { id: 'vss-trio',     label: 'PURPLE sig / RED 5V / BLACK gnd → Control Box', color: '#a855f7', pin: 'vss-port', circuit: 'speed', path: [...] },
      { id: 'frame-strap',  label: 'Frame-to-body ground path',                      color: '#222222', halo: true, pin: 'frame-ground', circuit: 'gnd', path: [...] },
    ],
  },
  'rear': {
    photo: { src: 'rear-sender-reference.jpg', w: ..., h: ... },
    shotList: 'Your car (PRIORITY — this stock photo is a generic sender, not an A-body): trunk open, shoot the tank/sender area, or under-rear showing tank + lines. Replace rear-sender-reference.jpg, update w/h, re-anchor (ids stay).',
    pins: [
      { id: 'tank-sender', part: 'Fuel Tank Sending Unit', x: ..., y: ... },
      { id: 'rear-ground', part: 'Rear Body Ground',       x: ..., y: ... },
    ],
    routes: [
      { id: 'tan-pair',    label: 'TAN twisted pair → HDX FUEL INPUT (unfused)', color: '#d2b48c', halo: true, pin: 'tank-sender', circuit: 'fuel', path: [...] },
      { id: 'rear-gnd',    label: 'Rear ground → chassis',                        color: '#222222', halo: true, pin: 'rear-ground', circuit: 'gnd', path: [...] },
    ],
  },
```

Then bind the zones in `chevelle-app.js` `PARTS_MAP`: add `wm: 'engine-bay',` to the Engine Bay zone, `wm: 'under-car',` to Transmission & Under Car, `wm: 'rear',` to Rear. Keep each zone's existing `media` object — it's unused while the wm zone renders, but remains the F-fallback data.

- [ ] **Step 5: Verify: tests + visual pass on all four zones**

Run: `node --check chevelle-wiremap.js && node --test`
Expected: schema test validates all 4 zones (file-exists, bounds, cross-refs).
Preview: Parts Map now shows four interactive photos; per zone check pins sit on the right features (nudge coordinates as needed); each zone shows its shot-list callout except behind-dash; zone heads show `0/n connected`.

- [ ] **Step 6: Commit**

```bash
git add chevelle-wiremap.js chevelle-app.js engine-bay-reference.jpg under-car-reference.jpg rear-sender-reference.jpg ATTRIBUTIONS.md
git commit -m "feat(wiremap): engine-bay, under-car, rear zones from licensed photos + ATTRIBUTIONS + shot lists"
```

---

### Task 10: Check-toggle tap safety (F9/F38)

Today the whole `.ss-row` toggles the checkbox and the tiny "More detail" button sits inside it — a missed tap silently flips step completion. Invert it: checking requires a deliberate tap on a wide left column; tapping the text opens the detail.

**Files:**
- Modify: `chevelle-app.js` (`substepHTML()` ~796–807; recom rows ~1092–1098)
- Modify: `chevelle-hdx-interactive.html` (CSS ~306–316)

- [ ] **Step 1: Restructure `substepHTML()`**

Replace the function body with:

```js
function substepHTML(phase, i, s) {
  const checked = !!state.checks[phase.id + ':' + i];
  const exp = !!state.ui.expanded[phase.id + ':' + i];
  /* Steps WITH detail: text tap expands (reading is the safe default), check needs
     a deliberate tap on the wide left column. Steps WITHOUT detail: whole row checks. */
  const mainAct = s.detail
    ? 'data-act="expand" data-pid="' + phase.id + '" data-idx="' + i + '"'
    : 'data-act="check" data-pid="' + phase.id + '" data-idx="' + i + '"';
  return '<div class="substep' + (checked ? ' checked' : '') + (exp ? ' exp' : '') + '">'
    + '<div class="ss-row">'
    + '<button class="ss-checkcol" data-act="check" data-pid="' + phase.id + '" data-idx="' + i + '" aria-pressed="' + checked + '" aria-label="Mark step ' + (i + 1) + (checked ? ' not done' : ' done') + '">'
    + '<span class="ss-n mono">' + (i + 1) + '</span><span class="ss-check">' + icon('check', 17) + '</span></button>'
    + '<div class="ss-main" ' + mainAct + ' style="cursor:pointer">'
    + '<div class="ss-text">' + esc(s.text) + '</div>'
    + (s.detail ? '<span class="ss-detailbtn">' + icon('chevron', 13) + ' ' + (exp ? 'Hide detail' : 'More detail') + '</span>' : '')
    + '</div></div>'
    + (s.detail ? '<div class="ss-detail">' + esc(s.detail) + '</div>' : '')
    + '</div>';
}
```

(The old nested `<button class="ss-detailbtn" data-act="expand">` becomes a passive `<span>` inside the text tap zone.)

- [ ] **Step 2: Same structure for recommission rows**

In `recomHTML()` (~1094–1097), replace the row markup with:

```js
      h += '<div class="substep' + (checked ? ' checked' : '') + '">'
        + '<div class="ss-row">'
        + '<button class="ss-checkcol" data-act="check" data-pid="recom" data-idx="' + esc(it.id) + '" aria-pressed="' + checked + '">'
        + '<span class="ss-n mono">' + (i + 1) + '</span><span class="ss-check">' + icon('check', 17) + '</span></button>'
        + '<div class="ss-main" data-act="check" data-pid="recom" data-idx="' + esc(it.id) + '" style="cursor:pointer"><div class="ss-text">' + esc(it.text) + '</div></div>'
        + '</div></div>';
```

(Recom items have no detail, so their text still checks — same behavior as no-detail build steps.)

- [ ] **Step 3: CSS — wide check column, bigger box**

Replace the `.ss-row`/`.ss-check` rules (~lines 306–316) — keep `.ss-check svg` and `.substep.checked` rules, change/add:

```css
.ss-row { display:flex; align-items:stretch; width:100%; text-align:left; min-height:56px; }
.ss-checkcol { display:flex; align-items:flex-start; gap:10px; padding:14px 6px 14px 16px; min-width:78px; flex-shrink:0; cursor:pointer; background:none; border:none; }
.ss-check { width:34px; height:34px; border-radius:10px; flex-shrink:0; border:2px solid var(--line-strong); display:grid; place-items:center; transition:.18s; }
.ss-check svg { width:17px; height:17px; color:#fff; opacity:0; transform:scale(.5); transition:.18s; stroke-width:3; }
.ss-n { padding-top:8px; }
.ss-main { flex:1; padding:14px 16px 14px 0; min-width:0; }
```

- [ ] **Step 4: Verify**

`node --check chevelle-app.js`, then preview → Build Steps: tapping step TEXT on a step with detail expands/collapses it and does NOT toggle the check; tapping the number/box column toggles the check; steps without detail check from anywhere on the row; Recommission rows behave the same; existing checked steps still render checked (keys unchanged).

- [ ] **Step 5: Commit**

```bash
git add chevelle-app.js chevelle-hdx-interactive.html
git commit -m "fix(ux): deliberate check column — text tap reads, never silently toggles completion (F9/F38)"
```

---

### Task 11: Scroll correctness on navigation and search (F10/F33)

**Files:**
- Modify: `chevelle-app.js` (`render()` ~1193; delegation cases `view`/`phase`/`search-go`)

- [ ] **Step 1: Give `render()` a resetScroll option**

```js
function render(opts) {
  const sc = appEl.querySelector('.scroll');
  const top = (opts && opts.resetScroll) ? 0 : (sc ? sc.scrollTop : 0);
  ...
```

(only the first two lines change — the restore line already uses `top`).

- [ ] **Step 2: Use it in navigation**

1. `case 'view':` → `... persist(); render({ resetScroll: true }); break;`
2. `openPhase()` (~1251) → `... persist(); render({ resetScroll: true }); }`
3. `case 'search-go':` → end with:

```js
        persist(); render({ resetScroll: true });
        requestAnimationFrame(() => {
          const hit = appEl.querySelector('.circ-item.open, .fuse-slot.sel, .skill-card.open');
          if (hit) hit.scrollIntoView({ block: 'center' });
        });
        break;
```

- [ ] **Step 3: Verify**

`node --check chevelle-app.js`, then preview: scroll halfway down Build Steps → switch to Glossary → page starts at top; search "flasher" → pick the circuit hit → Wiring opens scrolled to the open circuit card; checking a step does NOT move the page (renderContent path untouched).

- [ ] **Step 4: Commit**

```bash
git add chevelle-app.js
git commit -m "fix(nav): reset scroll on view change, scroll search hits into view (F10/F33)"
```

---

### Task 12: Screen wake lock + safe-area insets + start_url (F23, F24/F30, F47)

**Files:**
- Modify: `chevelle-app.js` (settings + init), `chevelle-hdx-interactive.html` (CSS), `manifest.json`

- [ ] **Step 1: Wake lock with settings toggle**

1. `SETTING_DEFAULTS` (~551): add `wakeLock: true` → `{ theme: 'dark', accent: '#ff6a2b', density: 'comfortable', layout: 'split', barneyDefault: false, wakeLock: true }`
2. Add below `persistSettings()` (~579):

```js
/* Screen wake lock — garage iPads sleep mid-job otherwise (F23) */
let wakeLockSentinel = null;
function syncWakeLock() {
  if (!('wakeLock' in navigator)) return;
  if (state.settings.wakeLock === false) {
    if (wakeLockSentinel) { wakeLockSentinel.release().catch(() => {}); wakeLockSentinel = null; }
    return;
  }
  navigator.wakeLock.request('screen')
    .then(s => { wakeLockSentinel = s; })
    .catch(() => {}); /* denied (e.g. low battery) — not an error */
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncWakeLock(); });
```

3. In `settingsHTML()` add a row after the Barney row (~1162):

```js
    + '<div class="set-row"><span class="set-lbl">Keep screen awake</span><button class="barney-toggle' + (s.wakeLock !== false ? ' on' : '') + '" data-act="set-wakelock" style="height:34px"><span class="bt-switch"></span></button></div>'
```

4. New delegation case: `case 'set-wakelock': state.settings.wakeLock = state.settings.wakeLock === false; persistSettings(); syncWakeLock(); render(); break;`
5. In INIT (after `render();` ~1433): `appEl.addEventListener('pointerdown', () => syncWakeLock(), { once: true });` (browsers require a user gesture for the first request).

- [ ] **Step 2: Safe-area insets (standalone iPad)**

In the HTML CSS: `.topbar` rule (~142) add `padding-top:env(safe-area-inset-top);height:calc(var(--topbar-h) + env(safe-area-inset-top));` — and `.rail` rule (~103) add `padding-top:env(safe-area-inset-top);padding-left:env(safe-area-inset-left);` — and to the `.scroll` rule add `padding-right:env(safe-area-inset-right);`.

- [ ] **Step 3: start_url**

`manifest.json`: `"start_url": "."` → `"start_url": "chevelle-hdx-interactive.html"`.

- [ ] **Step 4: Verify + commit**

`node --check chevelle-app.js`; preview: Settings shows "Keep screen awake" toggle defaulting on; toggling persists across reload. Safe-area/standalone behavior is fully testable only on the iPad — note it in the QA checklist (Task 14).

```bash
git add chevelle-app.js chevelle-hdx-interactive.html manifest.json
git commit -m "feat(garage): screen wake lock + standalone safe-area insets + direct start_url (F23,F24,F30,F47)"
```

---

### Task 13: Service worker reliability + v10 + update toast (F11, F29, F31) + precache the new assets

**Files:**
- Modify: `sw.js` (full rewrite below), `chevelle-app.js` (registration + toast)

- [ ] **Step 1: Rewrite `sw.js`**

```js
const CACHE = 'chevelle-hdx-v10';
/* Code files are network-first (edits reach the iPad without a version bump);
   everything else stays cache-first. */
const CODE = [
  './', './index.html', './chevelle-hdx-interactive.html',
  './chevelle-wiremap.js', './chevelle-data.js', './chevelle-app.js', './manifest.json'
];
const STATIC = [
  './icon-180.png', './icon-192.png', './icon-512.png',
  './dash-reference.jpg', './dash-reference-closeup.jpg', './behind-dash-reference.jpg',
  './engine-bay-reference.jpg', './under-car-reference.jpg', './rear-sender-reference.jpg',
  './fonts/geist-400.woff2', './fonts/geist-500.woff2', './fonts/geist-600.woff2', './fonts/geist-700.woff2',
  './fonts/geist-mono-400.woff2', './fonts/geist-mono-500.woff2', './fonts/geist-mono-600.woff2',
  './aaw-diagrams/aaw-schematic-1971-72.png', './aaw-diagrams/aaw-fuse-panel-install.png',
  './aaw-diagrams/aaw-fuse-panel-layout.png', './aaw-diagrams/aaw-bag-h-instrument.png',
  './aaw-diagrams/aaw-bag-h-circuit-board.png', './aaw-diagrams/aaw-bag-j-engine-wiring.png',
  './aaw-diagrams/aaw-bag-j-engine-diagram.png', './aaw-diagrams/aaw-bag-m-rear-body.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      /* cache:'reload' bypasses the HTTP cache so a version bump always ships fresh bytes (F29);
         individual catch so one missing asset can't abort the whole precache */
      Promise.all(CODE.concat(STATIC).map(u =>
        c.add(new Request(u, { cache: 'reload' })).catch(err => console.warn('SW precache skip', u, err))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

function isCodeRequest(request) {
  if (request.mode === 'navigate') return true;
  const p = new URL(request.url).pathname;
  return /\/(chevelle-app\.js|chevelle-data\.js|chevelle-wiremap\.js|chevelle-hdx-interactive\.html|manifest\.json|index\.html)$/.test(p);
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (isCodeRequest(e.request)) {
    /* network-first: latest content when online, cache when offline (F11) */
    e.respondWith(
      fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  /* cache-first for images/fonts/diagrams, with runtime caching */
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
```

- [ ] **Step 2: Update-ready toast in the app (F31)**

Replace the SW registration block at the end of `chevelle-app.js` (~1437–1439) with:

```js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(reg => {
    console.log('SW registered:', reg.scope);
    /* check for a new SW whenever the app comes back to the foreground */
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (!nw) return;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          if (document.getElementById('sw-toast')) return;
          const t = document.createElement('button');
          t.id = 'sw-toast'; t.className = 'sw-toast';
          t.textContent = 'Update ready — tap to reload';
          t.addEventListener('click', () => location.reload());
          document.body.appendChild(t);
        }
      });
    });
  }).catch(err => console.log('SW failed:', err));
}
```

And add the toast CSS in the HTML (next to the lightbox rules):

```css
.sw-toast { position:fixed; left:50%; transform:translateX(-50%); bottom:calc(18px + env(safe-area-inset-bottom)); z-index:90;
  background:var(--accent); color:var(--accent-ink); border:none; border-radius:999px; padding:12px 22px;
  font:600 14px 'Geist', sans-serif; box-shadow:var(--shadow); cursor:pointer; }
```

- [ ] **Step 3: Verify**

`node --check sw.js && node --check chevelle-app.js && node --test`
Preview with DevTools → Application: new SW installs, old `chevelle-hdx-v9` cache is deleted, `chevelle-hdx-v10` contains the three new jpgs + chevelle-wiremap.js. Offline check: DevTools Network → Offline → reload → app loads, Parts Map shows ALL FOUR photos. Then edit any string in chevelle-data.js temporarily, reload twice online WITHOUT bumping CACHE → change appears (network-first proof); revert the temp edit.

- [ ] **Step 4: Commit**

```bash
git add sw.js chevelle-app.js chevelle-hdx-interactive.html
git commit -m "feat(pwa): network-first code, reload-precache, update toast, v10 + wiremap assets (F11,F29,F31)"
```

---

### Task 14: QA checklist + full verification pass + README note

**Files:**
- Create: `docs/qa/wire-map-smoke.md`
- Modify: `README.md` (one feature line + attributions pointer)

- [ ] **Step 1: Write `docs/qa/wire-map-smoke.md`**

```markdown
# Wire Map + v10 smoke checklist

Run on the iPad (standalone home-screen app) after deploy. Desktop preview first.

## Per zone (behind-dash, engine-bay, under-car, rear)
- [ ] Pins sit ON their parts (fuse panel, column, HDX box… / senders / tailshaft / tank sender)
- [ ] Tap a pin → only its wires stay bright, others dim; page scrolls to the matching part card
- [ ] Tap a wire → circuit card under the photo shows the RIGHT fuse label + amps (GAUGES 5A / CLOCK 10A)
- [ ] Tap photo background → resets
- [ ] "Zoom overlay" → lightbox: pinch-zoom keeps wires glued to photo features; pan does NOT close it
- [ ] Shot-list callout renders on the three stock-photo zones

## Persistence (the sacred checks)
- [ ] Mark 2 wires connected → hard reload → still connected; zone header count updates
- [ ] Pre-update progress intact after this release (build substeps, recommission, expenses)
- [ ] Settings → Export → Import round-trips wm checks (inspect JSON: "wm:behind-dash:red-const": true)

## Wiring truth spot-checks
- [ ] Dash view → Temp: says two-wire to Control Box SIG+GND, no "grounds through block"
- [ ] Wiring view → fuse grid: GAUGES 5A, CLOCK 10A, no slot numbers displayed, single TURN 10A
- [ ] Build Phase 4: RED lands on CLOCK position, PINK on GAUGES position

## Garage / PWA
- [ ] Step text tap expands detail; only the left column checks; recom rows same
- [ ] View switch starts at top; search hit scrolls into view
- [ ] Settings shows "Keep screen awake" (iPad: screen stays on ≥5 min with app open)
- [ ] Standalone: status bar does not overlap the topbar (safe-area)
- [ ] Airplane mode: full app + all four zone photos render offline
- [ ] Deploy a trivial text change WITHOUT cache bump → appears after two foregrounds or update toast
```

- [ ] **Step 2: README note**

Add under the feature list (or intro paragraph) of `README.md`:

```markdown
- **Wire Map** — tap-to-trace wiring overlays on real photos (Parts Map view); wire-by-wire
  "connected" tracking persists offline. Third-party photo credits: see [ATTRIBUTIONS.md](ATTRIBUTIONS.md).
```

- [ ] **Step 3: Full verification pass**

1. Syntax-check every JS file (one file per invocation): `for f in chevelle-app.js chevelle-data.js chevelle-wiremap.js sw.js; do node --check "$f"; done`
2. `node --test` → all pass.
3. Desktop preview: walk the entire QA checklist top to bottom (everything except the three iPad-only items).
4. Screenshot the behind-dash overlay with a highlighted circuit for the final report.

- [ ] **Step 4: Final commit**

```bash
git add docs/qa/wire-map-smoke.md README.md
git commit -m "docs: wire-map smoke checklist + README feature note"
```

**Deploy note:** pushing to `main` auto-deploys GitHub Pages (~2 min). Push only when Corey says go; then run the iPad items of the QA checklist on the live URL.

---

## Deferred (explicitly NOT in this plan — Tier 3 backlog)

Everything in the spec's Tier 3 list (F4–F8 phase restructuring, F16/F17/F19–F22, F25–F28, F32, F35–F37, F39, F43–F46, F48–F55). Phase restructuring (adding Bag L/M phases, reordering calibration) changes substep counts and REQUIRES a keyed migration like `migrateRecom()` — that's its own project with its own spec. Do not slip it into this one.

## Plan self-review notes (already applied)

- Spec coverage: Part 1 (overlay: Tasks 6–9), persistence guarantees (Task 1 snapshot + wm-on-checks design + QA), Tier 1 (Tasks 2–5), Tier 2 (Tasks 10–13), QA/testing (Task 14). Spec's "additive wm key in backups" implemented as wm-keys-inside-`checks` — same round-trip guarantee, zero format change (documented in the primer).
- Type consistency: `wireMapInnerHTML(zone, interactive)` used by Task 7 + Task 8; `wmZoneCounts/wmRouteDone/wmDetailHTML` defined and used only in Task 7; `pathD` defined Task 6, consumed Task 7; `render(opts)` change (Task 11) is backward-compatible with all existing `render()` call sites.
- Ordering: fuse/sender data corrected (2–4) before the overlay consumes it (6–9); lightbox fixed (5) before overlay rides it (8); SW learns the new assets last (13).
