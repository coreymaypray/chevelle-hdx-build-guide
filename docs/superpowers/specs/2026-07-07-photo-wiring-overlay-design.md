# Photo Wiring Overlay + Guide Improvements — Design Spec

**Date:** 2026-07-07
**Status:** Approved pending user review
**Repo:** chevelle-hdx-build-guide (vanilla HTML/CSS/JS PWA, GitHub Pages, no build step)

## Goal

Two deliverables in one project:

1. **Photo wiring overlay** — an interactive "tap-to-trace" wiring diagram drawn *over real photographs* in the Parts Map view, to scale, for all four zones (behind-dash, engine bay, under-car, rear). Tapping a part pin highlights only that part's wires; tapping a wire opens its circuit card.
2. **Guide improvements** — fixes from the 2026-07-07 full review (55 confirmed findings, see Appendix), tiered so the wiring-truth corrections land *before* the overlay is built on top of them.

**Non-goals:** no new nav view (lives inside Parts Map), no canvas rendering, no pre-baked annotated images, no animated effects, no dependencies.

## Part 1 — Photo wiring overlay

### Architecture

- **New file `chevelle-wiremap.js`** exporting `window.WIRE_MAP` — pure data (photo dims, pin coords, route waypoints). Loaded via script tag before `chevelle-app.js`, same pattern as `chevelle-data.js`.
- **New render component `wireMapHTML(zoneId)`** in `chevelle-app.js`, called by the Parts Map view in place of the current static photo block for zones that have a `WIRE_MAP` entry.
- **Overlay = inline SVG over the photo.** Container div wraps `<img>` + absolutely-positioned `<svg>` whose `viewBox` equals the photo's intrinsic pixel dimensions. Routes are `<path>` elements, pins are `<g><circle><text>` groups. Because the SVG scales with the image, coordinates stay pixel-anchored at any display size — including inside the pinch-zoom lightbox. This is what "to scale" means here.
- **Circuit facts stay in one place.** Routes carry only geometry plus references (`circuit` id into `CIRCUITS`, `pin` id into zone pins / `PARTS_MAP` parts). The tap card is rendered from the existing (Tier-1-corrected) data — never duplicated into `WIRE_MAP`.

### Data model

```js
window.WIRE_MAP = {
  'behind-dash': {
    photo: { src: 'dash-reference.jpg', w: 1551, h: 872 },   // intrinsic px (actual)
    pins: [
      { id: 'hdx-box',    part: 'HDX Control Box', x: 1130, y: 380 },
      { id: 'fuse-panel', part: 'AAW Fuse Panel',  x: 300,  y: 590 },
      // ...
    ],
    routes: [
      { id: 'red-12v', label: 'RED constant 12V', color: '#e5484d',
        pin: 'hdx-box', circuit: 'const12v',
        path: [[318,560],[520,470],[880,420],[1108,392]], dash: false },
      // ...
    ],
  },
  'engine-bay': { /* same shape */ },
  'under-car':  { /* same shape */ },
  'rear':       { /* same shape */ },
}
```

- `path` waypoints are rendered as a smoothed SVG path via one shared Catmull-Rom → cubic Bézier helper (no per-route hand-authored curves).
- `dash: true` renders dashed (used for the 8-pin display cable and any "planned, not yet routed" run).
- Route `color` is the **physical wire color**: RED `#e5484d`, PINK `#ff9ec6`, ORANGE `#ff8c00`, TAN `#d2b48c`, PURPLE `#a855f7`, DK GREEN `#1a7a4a`, WHITE `#f5f5f5`, BLACK `#222`, GREY `#9aa3ad`. Light colors (WHITE, TAN, PINK) get a dark halo (wider dark stroke underneath); BLACK gets a light halo. Pins and cards use theme CSS variables so both themes work.

### Interaction (approved option C — hybrid tap-to-trace)

| State | Behavior |
|---|---|
| Default | All routes at subtle opacity (~0.45, 2px); pins prominent |
| Tap pin | That part's routes full opacity 3px; all others dim to ~0.2; pins except tapped dim; scroll to the matching part card below the photo |
| Tap route | Same highlight for that single route + circuit card (fuse-detail card pattern from the Wiring view) rendered under the photo: swatch, from → to, fuse label + amps, gauge, notes |
| Tap empty photo | Reset to default |

- Tap handling via existing `data-act` delegation: new acts `wm-pin`, `wm-route`, `wm-reset`. Selection state in `state.ui.wm = { zone, type, id }` (not persisted).
- Pin hit targets ≥44px at typical render width (SVG circle r sized against photo width; invisible larger hit circle if needed).
- **Lightbox integration:** the lightbox gains overlay support — when opened from a wire-map zone it renders the same img+svg structure (selection preserved) instead of a bare `<img>`. Requires the Tier 1 lightbox tap-close fix (F12) so pan/zoom doesn't dismiss it.

### Zones, photos, and licensing

| Zone | Base photo | License | Notes |
|---|---|---|---|
| Behind-dash | `dash-reference.jpg` (Corey's car, already in repo) | own | Traces: RED → CLOCK fuse, PINK → GAUGES fuse, ORANGE dimmer, BLACK → dedicated ground bolt, 8-pin display cable (dashed), sender leads at bulkhead, TAN fuel from rear plug. Pins: HDX box, fuse panel, bulkhead, ground bolt, flasher can, column, headlight switch, heater box. Several traces follow wires actually visible in the photo. |
| Engine bay | Wikimedia Commons `2014_Rolling_Sculpture_Car_Show_47_(1970_Chevrolet_Chevelle_SS_454_engine).jpg` (Michael Barera) | CC BY-SA 4.0 | 3072×2304, actual 1970 Chevelle SS 454 bay. Backup: Turbo-Jet 454 in 1970 Monte Carlo SS (Mr.choppers, CC BY-SA 4.0, 5212×3618). Traces: oil sender W/R/B+shield, temp two-wire, tach WHITE from HEI/coil, alternator charge, megafuse feed — all to bulkhead/firewall grommet. |
| Under-car | Wikimedia Commons `3-speed_GM_Turbo_Hydra-Matic_automatic_transmission_(2015-08-29).jpg` (OSX / National Holden Motor Museum) | Public domain | 4272×2856 bench shot; speedo-cable entry called out on the tailhousing with an inset. Alternative: 3L80/TH400 museum shot (Michael Barera, CC BY-SA 4.0, 6000×4000). Traces: PURPLE VSS trio, frame/body ground. |
| Rear | Wikimedia Commons `Fuel_sender_installed_(1910727837).jpg` (dave_7) | CC BY-SA 2.0 | Sender close-up (not A-body — clearly captioned as representative). Traces: TAN twisted pair, rear ground. Weakest zone; carries the most prominent shot-list card. |

- **Image prep:** downscale each new photo to ~1600px wide, JPEG quality tuned to ≤200KB. `WIRE_MAP.photo.w/h` must match the shipped file's intrinsic size exactly.
- **`ATTRIBUTIONS.md`** (new, repo root): author, source URL, license, and modifications (crop/resize) for every third-party photo. In-app caption credits author + license short-name. CC BY-SA note: the overlay is runtime SVG over the unmodified-except-resize photo; the resized photo is distributed under its original license.
- **Shot-list cards (user requirement):** each stock-photo zone renders a small "Replace with your car" card listing exact shot instructions (e.g., engine bay: stand at driver-side fender, frame firewall + rear half of intake, level with the carb, landscape). When Corey supplies a photo: drop the file in, update `photo.src/w/h`, re-anchor pin/route coordinates — data-only edit, no logic changes.
- **Fallback:** any zone whose image can't ship (license doubt, quality) falls back to a clean SVG illustration in the guide's design language rather than a questionable photo.

### Offline / PWA

- Add `chevelle-wiremap.js` + the three new photos to the `sw.js` precache list; bump `CACHE` to `v10` (single bump shared with all Tier 1/2 code changes in this project).
- Combined with Tier 2 SW fixes: cache-busting precache fetches (`cache: 'reload'`, F29) and the update-ready toast (F31), so this and future updates actually reach the iPad.
- Weight budget: ~+600KB images + ~10KB JS. Acceptable next to the existing ~5–6MB precache (and Tier 3 F53 later reduces the PNG decode cost).

### Error handling

- Photo `onerror` → swap in the zone's previous media (AAW diagram or nothing) + plain parts list; never a dead view.
- `window.WIRE_MAP` missing (script failed) → Parts Map renders exactly as today (guard every access).
- Route with unknown `circuit`/`pin` id → still draws, card shows route label only, `console.warn` for dev.
- Coordinates outside the viewBox clip harmlessly.

### Testing

Manual QA checklist added at `docs/qa/wire-map-smoke.md` — per zone: pins land on the right parts; pin tap highlights only its routes and scrolls to the part card; route tap opens the correct circuit card (label + amps match the corrected FUSES table); empty-photo tap resets; lightbox keeps anchors under pinch-zoom and does not close on pan; airplane-mode reload renders all four zones; both themes; iPad landscape + portrait. Pre-commit: `node --check chevelle-app.js chevelle-wiremap.js`, SW bump verified, spot-check total precache size.

## Part 2 — Guide improvements (from the 2026-07-07 review)

Review method: six parallel review dimensions, every finding adversarially verified (67 raw → 12 refuted → 55 confirmed). Full findings in the Appendix, numbered F1–F55 in severity order.

### Tier 1 — must fix before/with the overlay (blocks correctness)

The overlay's circuit cards render from `CIRCUITS`/`PARTS_MAP`/`FUSES`, so this data gets corrected first:

- **F1/F7 — Sender routing:** rewrite all reference-view traces so oil/temp/tach read *sender → firewall grommet → HDX Control Box input*; AAW connectors F/G/H mentioned only as "AAW equivalent — capped on HDX builds"; Connector H reserved for the optional VSS pass-through note.
- **F2 — Fuse table:** rebuild `FUSES` from the shipped AAW diagram (`aaw-fuse-panel-layout.png`): GAUGES 5A, CLOCK 10A, WIPER 10A, LIGHTER 10A, single TURN 10A, HAZARD 15A, add DASH LTS 10A + IGN 1 20A, drop SW IGN and the duplicate TURN. Key every HDX callout by **label** (GAUGES/CLOCK/FUEL), not slot number; add "confirm against the printed legend on your panel" note.
- **F3/F40 — Temp sender:** SEN-04-5 is two-wire, both wires to Control Box TEMP SIG + GND (MAN 650542H); remove all "grounds through block" text (Teflon tape stays — it's fine once the ground doesn't rely on threads); align the port location wording (front of intake, passenger side, near thermostat housing).
- **F13/F34 — Turn-signal fuse:** reconcile `CIRCUITS.turn` with the corrected fuse table (TURN 10A, by label).
- **F14/F15/F18 — Phase 4 hookup text:** one canonical story for RED (CLOCK fuse position; dedicated battery run demoted to a labeled alternative with 10A max), PINK (GAUGES), tach (HEI TACH terminal; points = coil negative), fuel (TAN twisted pair to FUEL SIG+GND, unfused), temp (both wires to TEMP SIG+GND).
- **F41/F42 — small accuracy echoes:** voltmeter has no signal wire (reads through its power feeds); drop "HDX-critical" from the factory FUEL fuse and point fuel-gauge troubleshooting at the tan pair + rear ground.
- **F12 — Lightbox tap-close bug:** fix before the overlay ships inside it (hit-test the click or track pointer movement; only a genuine tap on the backdrop closes).

### Tier 2 — ships alongside (same release, high garage value)

- **F9/F38 — check-toggle tap safety:** checkbox becomes its own wide left tap column; tapping step text expands detail (reading is the safe default).
- **F10/F33 — scroll correctness:** search jumps scroll to the hit; view changes reset scroll; in-view re-renders keep offset.
- **F23 — screen wake lock:** `navigator.wakeLock` on first interaction, re-acquire on visibilitychange, Settings toggle (default on).
- **F24/F30 — safe-area insets** for standalone mode (topbar/rail/page).
- **F11/F29/F31 — SW reliability:** network-first-with-cache-fallback for the three code files (cache-first stays for images/fonts), `cache:'reload'` precache fetches, update-ready toast + `registration.update()` on visibilitychange.
- **F47 — `start_url`** points straight at `chevelle-hdx-interactive.html`.

### Tier 3 — backlog (recorded, later sessions)

Everything else, notably: missing Bag L/Bag M phases (F5) and steering-column rag joint/floor seal substeps (F6), power-on-test and calibration sequencing (F4/F8), bulkhead sealing step (F20), engine-turns-freely + brake-hose recommission items (F21), Phase 15 empty stubs (F17), speaker-wire ordering (F19), stereo/glossary/dead-reference cleanups (F43/F44), remaining UX (F22, F25–F28, F45, F46), PWA hardening (F35, F48), code fixes (F32, F36, F49–F52), a11y/perf (F37, F53–F55), lug-nut torque split (F16), bulb-list correction (F39).

### Implementation order

1. Tier 1 data corrections (+ regression pass over Build/Wiring/Parts/Dash/Engine views for consistency)
2. Overlay: `chevelle-wiremap.js` schema + behind-dash zone → render component + interactions → lightbox integration
3. Photo prep + remaining three zones + `ATTRIBUTIONS.md` + shot-list cards
4. Tier 2 fixes
5. SW precache update, `CACHE` → v10, QA checklist, commit(s)

### Memory/documentation corrections

The v9 "verified facts" recorded in project memory are partially wrong (fuse amps swapped, temp grounding, slot-number keying) — update the project memory and `HANDOFF.md` when Tier 1 lands so future sessions don't re-propagate them. The chevelle-restoration skill's HDX tables have the same temp-sender error (flagged to Corey; skill edit is his call).

## Appendix — All 55 confirmed review findings

Produced 2026-07-07 by a 6-dimension multi-agent review (accuracy, completeness, UX, PWA, code, a11y/perf); 67 raw findings, 12 refuted under adversarial verification, 55 confirmed. Ordered by severity. Tier assignments are in the Improvements section above.

### F1 — Reference views route HDX sender signals through AAW connectors F/G/H — contradicting the build phases, the Dakota manuals, and the AAW Bag H sheet shipped in this repo

- **Severity:** high · **Dimension:** accuracy · **Area:** Dash trace / Wiring circuits / Parts Map / Engine view (chevelle-app.js)
- **File:** `chevelle-app.js`
- **Evidence:** DASH_GAUGES traces and CIRCUITS cards claim the HDX sender leads pass through AAW cluster connectors: tach 'WHITE 18 AWG — AAW Connector H' (lines 150, 211-213), oil 'AAW Connector F' (164, 217-218), temp 'AAW Connector G (DK GREEN)' (168-171, 222-224), speed 'AAW VSS connector' (157, 228-230); ENGINE_PARTS (358-361) repeats all four. This is triple-wrong: (1) Build Phase 2 (chevelle-data.js lines 163-196, quoting MAN 650542H/650572B) says on HDX builds the AAW DK BLUE oil, DK GREEN temp, and WHITE tach wires are NOT USED — cap and label — and the DD senders run on their own sub-harness DIRECT to the Control Box; Connector G is capped and Connector F is at most repurposed for indicator inputs. (2) The repo's own aaw-bag-h-instrument.png sheet says Connector H is ONLY for an aftermarket electric speedometer (yellow/purple VSS pair) and that the AAW WHITE tach loose wire belongs to Connector F — so 'tach via Connector H' matches no document at all. (3) Connector G carries only PINK 12V/GREY lamps/BLACK ground per that same sheet — the temp DK GREEN was a Connector F wire even on stock clusters. In the garage, a first-timer following the tap-to-trace Dash view will try to land SEN-03-8/SEN-04-5/tach leads into capped AAW connectors → dead gauges and hours of tracing, exactly what the Phase 6 checkpoint warns about.
- **Fix:** Rewrite the trace arrays and aawWire/aawRef fields so every HDX sender path reads sender → firewall grommet → HDX Control Box input (SIG/GND/PWR terminals), matching Phase 2/5 text. Mention AAW connectors only as 'AAW equivalent wire — capped on HDX builds'. Reserve Connector H for the optional VSS pass-through and label it as such.

### F2 — Fuse panel table contradicts the AAW fuse diagram shipped in the app: GAUGES is 5A (not 10A), CLOCK is 10A (not 5A), WIPER and LIGHTER are 10A (not 20A)

- **Severity:** high · **Dimension:** accuracy · **Area:** Wiring view — FUSES table (AAW 500707)
- **File:** `chevelle-app.js`
- **Evidence:** FUSES (lines 264-283) claims slot 7 GAUGES 10A, slot 8 CLOCK 5A, slot 10 WIPER 20A, slot 12 LIGHTER 20A, plus a 'SW IGN 10A' slot and TWO TURN fuses (10A + 15A). The repo's own aaw-diagrams/aaw-fuse-panel-layout.png (AAW Bag G 510524 sheet 1, 1970-72 Chevelle Classic Update — same 500707 panel) shows, with standard ATC fuse colors confirming each rating: GAUGES 5A (tan), CLOCK 10A (red), WIPER 10A, LIGHTER 10A, one TURN 10A, HAZARD 15A, and slots the app omits entirely — DASH LTS 10A and IGN 1 20A. There is no SW IGN fuse. The GAUGES/CLOCK amps are effectively swapped, and these two are the HDX power feeds (PINK switched, RED constant) repeated in DASH_GAUGES.volt (line 184), CIRCUITS const12v/sw12v (193-202), Parts Map ('HDX on #7/#8/#9'), and Trouble #5. Practical risk: the user stocks or replaces the HDX switched-feed fuse at 2x its rating (10A in a 5A GAUGES position), halving short-circuit protection on the wire feeding the Control Box, and the wiper warning text ('High-current circuit (20A)') reinforces a wrong rating. The circuits also cite slot numbers (#7/#8/#9) that don't exist on the AAW panel legend — the panel is labeled by circuit name, not number.
- **Fix:** Rebuild the FUSES array from the shipped diagram: GAUGES 5A, CLOCK 10A, WIPER 10A, LIGHTER 10A, single TURN 10A, add DASH LTS 10A and IGN 1 20A, drop SW IGN and the second TURN. Key HDX callouts by label ('GAUGES', 'CLOCK', 'FUEL'), not slot number, and add a note to confirm against the printed legend on the physical 500707 panel.

### F3 — Water temp sender ground is wrong: SEN-04-5 is a two-wire sender wired to TEMP INPUT SIG + GND on the Control Box — it does not ground through the block, and the app's Teflon-tape advice would defeat a thread ground anyway

- **Severity:** high · **Dimension:** accuracy · **Area:** Temp sender (SEN-04-5) — all views
- **File:** `chevelle-app.js`
- **Evidence:** DASH_GAUGES.temp note (line 172): 'Grounds through the engine block — no separate ground wire.' CIRCUITS.temp (223-226): 'Signal only — grounds through block… 2-wire system… no separate ground wire' (self-contradictory on its face). PARTS_MAP/ENGINE_PARTS repeat it, and chevelle-data.js line 364 says 'the threads in the manifold complete the ground path.' Dakota Digital's HDX manual MAN 650542H says the opposite — TEMP INPUT-GND: 'This is the ground reference used for two-wire water temp sensors. This will connect to one of the wires from the Dakota Digital SEN-04-5,' i.e., both sender wires run to the Control Box (SIG + GND). Failure scenario in the garage: the installer connects one wire, caps the 'extra' one per the guide, and has already wrapped the 1/8" NPT threads (plus a reducing bushing) in Teflon tape per the same guide — leaving no ground reference at all → temp gauge dead, erratic, or pegged. Also, 'DARK GREEN signal 18 AWG' describes the capped AAW wire color, not the DD sender harness, compounding the confusion.
- **Fix:** Correct every temp entry to: SEN-04-5, two wires, both to Control Box TEMP INPUT SIG and GND terminals (per MAN 650542H); remove all 'grounds through block / no separate ground wire' text; describe the wire by the DD harness, not AAW DK GREEN. Keep the Teflon-tape instruction — it is fine once the ground wire is connected.

### F4 — Power-On Test is sequenced before the steering column and battery recovery it depends on

- **Severity:** high · **Dimension:** completeness · **Area:** phase-order
- **File:** `chevelle-data.js`
- **Evidence:** Phase 6 (Power-On Test, id 5) says 'Reconnect battery... Turn key to ON' and expects 12.4V+. But on a 1969-72 GM A-body the ignition switch and lock cylinder are on the steering column, which this guide installs in Phase 7 ('Feed column through firewall floor hole' confirms the column is out of the car). There is no key to turn at Phase 6. Worse, battery recovery ('Install new battery or charge existing battery fully' — a battery that sat 3 years is dead) doesn't appear until Phase 16 (Recommissioning). A first-timer hits Phase 6 in the garage with no working ignition switch and a dead battery, and the guide's own 'critical checkpoint' becomes impossible to run as written.
- **Fix:** Move Steering Column (Phase 7) before Power-On Test, or add an explicit substep to Phase 6: 'Temporarily install/connect the column ignition switch' plus 'Charge or replace the battery FIRST — see Recommission > Battery.' Pull the battery charge/load-test items forward into Phase 6 prerequisites.

### F5 — Bag L (front lights) and Bag M (rear body) harness installation phases don't exist

- **Severity:** high · **Dimension:** completeness · **Area:** missing-steps
- **File:** `chevelle-data.js`
- **Evidence:** Phase 2 promises twice: 'Bag M is installed later during rear lighting' (lines 100, 154) and 'This connector will be unbolted later to install the front light harness (Bag L)' (line 172). No phase in the 17 ever installs Bag L, Bag M, or rear lighting. Yet the fuel gauge depends on the Bag M run to the tank sender (the app's own wiring reference traces fuel through 'Bag M rear harness run'), and Phase 17 Final Inspection tests headlights, brake, reverse, turn, and license lights — all of which are never wired in any build phase. In the garage the user finishes Phase 2 with dangling disconnects and 'later' never arrives.
- **Fix:** Add two phases (or one combined 'Exterior Lighting & Rear Harness' phase) covering Bag L bulkhead install, headlight/park/marker hookup, and Bag M routing under carpet along the rockers (must happen BEFORE the Carpet phase), tail/reverse/license lights, rear ground, and the TAN twisted-pair fuel sender run to the HDX FUEL INPUT.

### F6 — Steering column phase omits the lower shaft coupler (rag joint) and floor seal plate

- **Severity:** high · **Dimension:** completeness · **Area:** missing-steps
- **File:** `chevelle-data.js`
- **Evidence:** Phase 7 feeds the column through the firewall from inside the car, clamps it to the dash, and torques the wheel nut — but never reconnects the column's lower shaft to the steering box coupler (rag joint) or torques its pinch bolt, and never installs/torques the column-to-firewall seal plate. If the column was fully removed (which 'feed column through firewall floor hole' implies), a first-timer can finish this phase with a column that is clamped at the dash but not positively coupled to the steering gear — a car that steers until the coupling walks off. This is the single most safety-critical omission in the build order.
- **Fix:** Add substeps: inspect the rag joint fabric disc for cracks; align and seat the lower shaft on the steering box stub (master spline/flat); torque the coupler pinch bolt to spec (~30 ft-lb) with the safety strap intact; install the 2-piece floor seal plate and boot before clamping at the dash. Add 'rag joint' to the Glossary and the coupler bolt to the Specs & Torque table.

### F7 — Reference views route oil/temp/tach through AAW Connectors F/G/H that the build phases say to cap

- **Severity:** high · **Dimension:** completeness · **Area:** consistency
- **File:** `chevelle-app.js`
- **Evidence:** chevelle-data.js Phase 2 is explicit: the SEN-03-8 oil and temp senders connect 'directly to the HDX Control Box... not through the AAW dash harness — cap and label' the AAW DK BLUE/DK GREEN wires, AAW Connector F wires are 'abandoned and capped,' and the AAW WHITE tach wire is 'redundant — cap and label.' But the Dash tap-to-trace (DASH_GAUGES, app.js ~lines 150-225) shows oil routing through 'AAW Connector F,' temp through 'AAW Connector G (DK GREEN),' and tach as 'WHITE 18 AWG — AAW Connector H' — and Connector H per the data file is ONLY the electric-speedo VSS connector, which has no WHITE tach wire. In the garage the user gets opposite instructions depending on which screen they open: run direct to the Control Box, or land on AAW connectors.
- **Fix:** Reconcile the reference data to the v9 verified facts: oil/temp/tach traces should read 'sender → firewall grommet → HDX Control Box input (dedicated sender harness)' with a note that the corresponding AAW wires are capped; reserve the AAW Connector H mention for the speed sensor VSS path only.

### F8 — HDX calibration (Phase 15) is scheduled before recommissioning (Phase 16), which it depends on

- **Severity:** high · **Dimension:** completeness · **Area:** phase-order
- **File:** `chevelle-data.js`
- **Evidence:** Phase 15 fuel calibration says 'With the tank empty, hit SET EMPTY. Fill the tank, hit SET FULL' and 'do this with the car running' — but the tank still holds 3-year-old varnished gas that Phase 16 drains, and the engine hasn't yet had its controlled first start with oil-pump priming (also Phase 16). Following the guide in order, the user fills a tank of bad gas to calibrate FULL, then is told to drain it, and runs an unprimed engine that sat 3 years to calibrate gauges. Speedometer road calibration (GPS/measured drive) also can't happen before the first-drive shakedown in Phase 16.
- **Fix:** Swap Phases 15 and 16, or split calibration: static items (cylinder count, colors, TFT layout, warning thresholds, Bluetooth pairing) stay pre-recommission; move fuel empty/full and speedometer drive calibration to after the fuel system is refreshed and the first-start procedure passes.

### F9 — 'More detail' button is nested inside the check-toggle row — a missed tap silently flips step completion

- **Severity:** high · **Dimension:** ux · **Area:** touch targets / progress integrity
- **File:** `chevelle-app.js`
- **Evidence:** In `substepHTML()` (lines 796-807) the entire `.ss-row` carries `data-act='check'`, and the `.ss-detailbtn` (`data-act='expand'`) sits inside it. The detail button renders at `font-size:12.5px` with a 13px chevron and no padding/min-height (CSS line 314) — an effective hit area of roughly 18-20px tall. The click handler resolves via `e.target.closest('[data-act]')` (line 1254), so missing the tiny button by a few pixels hits the parent row and toggles the checkbox instead. With nitrile gloves and an iPad propped at arm's length, the most common intent mid-job — 'show me the detail for this step' — has a high chance of instead corrupting build progress, and the user may not notice the checkmark flipped.
- **Fix:** Invert the targets: make the checkbox its own 48px-wide left tap column (data-act='check' on the check cell only, visual box grown from 26px to ~34px), and make tapping anywhere on the step text expand/collapse the detail. Reading becomes the safe default; checking requires a deliberate tap on a big checkbox.

### F10 — Search jump never scrolls to the result, and scroll position is inherited across views — search looks broken mid-page

- **Severity:** high · **Dimension:** ux · **Area:** search reachability
- **File:** `chevelle-app.js`
- **Evidence:** The `search-go` handler (lines 1316-1331) sets `state.view`, `circuitSel`/`fuseSel`/`accordion`/`dashSel` and calls `render()`, but there is no `scrollIntoView` anywhere in the file. Worse, `render()` (lines 1193-1201) captures `scrollTop` of the OUTGOING view and restores it on the incoming one — a deliberate feature for checkbox taps that also applies to every view switch. Concrete failure: standing at the car, search 'tach', tap the Circuit result — you land on the Wiring page at whatever scroll offset the previous view had, with the expanded tach circuit somewhere off-screen below 7 diagram thumbnails. The result of the search is simply not on screen; it reads as 'search doesn't work'. Same for fuse, trouble, skill, and step results.
- **Fix:** After a `search-go` render, `document.querySelector('.circ-item.open, .fuse-slot.sel, .skill-card.open, .substep …')?.scrollIntoView({block:'start'})`; and only restore scrollTop in `render()` when `state.view` did not change (track previous view).

### F11 — Content edits never reach the iPad unless CACHE version is manually bumped

- **Severity:** high · **Dimension:** pwa · **Area:** stale-cache trap
- **File:** `sw.js`
- **Evidence:** The fetch handler (sw.js lines 51-66) is strictly cache-first: `caches.match(e.request)` returns the cached copy unconditionally, with no revalidation. The ONLY update path is editing the `CACHE` constant on line 1 ('chevelle-hdx-v9'), which triggers a byte-diff reinstall. If chevelle-data.js is edited (e.g., a wiring correction like the tach-lead color) and pushed without bumping sw.js, every installed iPad serves the old v9 copy forever — silently. For a build guide whose whole value is verified wiring facts, a stale data file in the garage can mean wiring to the wrong fuse slot. Your own memory notes already flag this exact 'SW cache gotcha' as having bitten before, and there is no guard against forgetting.
- **Fix:** Either (a) switch the three code files (chevelle-hdx-interactive.html, chevelle-app.js, chevelle-data.js) to network-first-with-cache-fallback while keeping cache-first for images/fonts, or (b) keep cache-first but add a pre-push git hook / CI check that fails when chevelle-*.js|html changed and sw.js CACHE did not. Option (a) removes the human-discipline dependency entirely and still works fully offline.

### F12 — Lightbox closes itself when you tap or pan the diagram image (confirmed live)

- **Severity:** high · **Dimension:** code · **Area:** lightbox / pointer events
- **File:** `chevelle-app.js`
- **Evidence:** openLightbox calls `stage.setPointerCapture(ev.pointerId)` on pointerdown (line 1389), and per Pointer Events L3 (Chrome 90+, and modern WebKit) the subsequent `click` event is retargeted to the CAPTURING element. So the guard `stage.addEventListener('click', ev => { if (ev.target === stage) closeLightbox(); })` (line 1421) is true even when the finger was on the image. Confirmed in a live Chromium test: opening a wiring diagram and clicking the image itself instantly closed the lightbox. This also fires after a pan release (click follows any down/up pair on the same element), so drag-to-pan a zoomed AAW diagram can dismiss the viewer the moment the finger lifts — the worst possible behavior for tracing a wiring diagram one-handed in the garage. Note: only a synthetic JS .click() (no pointer events) kept it open, which is why it can pass casual testing.
- **Fix:** Don't rely on click target with capture active. Either (a) hit-test in the click handler: `if (document.elementFromPoint(ev.clientX, ev.clientY) === stage) closeLightbox()`, or (b) track movement distance since pointerdown and only close when it was a genuine tap (<6px) that started on the stage background (record ev.target at pointerdown time, before capture kicks in).

### F13 — Turn-signal circuit card shows 'Fuse #5 TURN 15A' — the app's own fuse table says #5 is HAZARD and TURN is #2 at 10A; the shipped diagram says TURN is 10A

- **Severity:** medium · **Dimension:** accuracy · **Area:** Wiring view — CIRCUITS.turn
- **File:** `chevelle-app.js`
- **Evidence:** CIRCUITS.turn (line 251) hard-codes fuse {slot 5, 'TURN', 15A}, rendered both in the collapsed header pill and the expanded card. The FUSES grid rendered on the same page lists slot 5 as HAZARD 15A and TURN at slot 2 (10A). The AAW Bag G diagram shows one TURN fuse at 10A. A code comment (lines 248-249) admits the discrepancy but the user still sees two conflicting answers in one screen. When a turn-signal fuse blows on a test drive, the user pulls the wrong fuse and/or replaces a 10A circuit wi…
- **Fix:** Change CIRCUITS.turn to reference the TURN 10A fuse by label, matching the corrected FUSES table (finding 2), and delete the stale in-code comment once reconciled.

### F14 — Phase 4 sensor-hookup summary contradicts the rest of the guide: 'Tach: single wire from coil negative' (no HEI exception) and 'Fuel: single wire from tank sender' (vs unfused twisted pair)

- **Severity:** medium · **Dimension:** accuracy · **Area:** Build Phase 4 — HDX Control Box install
- **File:** `chevelle-data.js`
- **Evidence:** Phase 4 substep detail (line 301): 'Tach: single wire from coil negative. Fuel: single wire from tank sender.' Everywhere else the guide is emphatic that (a) on HEI you must use the cap's TACH terminal — Phase 5 callout even says 'NEVER connect tach wire to coil (+). HEI: use the TACH terminal' — and an HEI has no accessible coil negative, so a user working from this summary at the Control Box is one terminal away from the BAT post; and (b) the fuel sender runs as a TWISTED PAIR to FUEL INPUT-SI…
- **Fix:** Rewrite line 301: 'Tach: HEI TACH terminal (points: coil negative) — see Phase 5. Fuel: twisted pair from tank sender to FUEL INPUT SIG + GND. Temp: both wires to TEMP INPUT SIG + GND.'

### F15 — Three conflicting instructions for the same HDX RED constant-12V wire across Build and Wiring views

- **Severity:** medium · **Dimension:** accuracy · **Area:** HDX power feeds — Build phases vs Wiring view
- **File:** `chevelle-data.js`
- **Evidence:** Wiring view (chevelle-app.js 193-196) and the fuse table say: land RED on the CLOCK fuse position. Build Phase 4 (chevelle-data.js line 285) says: 'Best practice: run a dedicated 14-16 AWG wire from the battery/starter solenoid through the firewall, fused at 15A.' Build Phase 2 (line 166) says: 'any battery-hot 5-20A for RED.' All three fit Dakota's spec (manual says constant power 'fused 5-20 AMP max'), but a first-time installer gets three different answers for one wire, and the troubleshootin…
- **Fix:** Pick the CLOCK-fuse-position method as canonical in all three places (it matches the fuse table, troubleshooting, and the v9 facts), and demote the dedicated-battery-run to a clearly-labeled alternative with a 10A max fuse for the 18 AWG pigtail.

### F16 — Lug nut torque of 85-100 ft-lb overshoots the factory spec (~65-75 ft-lb) for the Chevelle's 7/16"-20 studs

- **Severity:** medium · **Dimension:** accuracy · **Area:** Specs & Torque / Recommission checklist
- **File:** `chevelle-app.js`
- **Evidence:** TORQUE table (line 448) and two recommission items (chevelle-app.js line 513 'Re-torque lug nuts after 25-50 miles (85-100 ft-lbs…)' and chevelle-data.js line 948) all say 85-100 ft-lb for '7/16"-20 / 1/2"-20'. The 1971-72 Chevelle factory manuals specify roughly 65-75 ft-lb (commonly cited as 70) for the stock 7/16"-20 studs; 85-100 is a 1/2"-20 / modern-wheel figure. Torquing 50-year-old 7/16 studs to 100 ft-lb risks stretched or snapped studs — on a car that just came off a 3-year sit and is …
- **Fix:** Split the spec: 7/16"-20 → 65-75 ft-lb; 1/2"-20 (if converted) → 75-90 ft-lb. Update all three occurrences and keep the star-pattern note.

### F17 — Phase 15 contains seven empty header substeps that render as contentless checklist items

- **Severity:** medium · **Dimension:** completeness · **Area:** content-quality
- **File:** `chevelle-data.js`
- **Evidence:** Phase 15's first seven substeps (lines ~815-835) are bare labels with no detail: 'Initial Power-On Sequence', 'Speedometer Calibration', 'Fuel Gauge Calibration', 'Tachometer Setup', 'Backlight Color', 'Bluetooth App', 'Dakota Digital Resources'. They look like section headers from the source document imported as steps. In the app they render as checkable steps 1-7 with no 'More detail' button and duplicate the real steps 8-15 that follow, inflating the phase count and confusing progress trackin…
- **Fix:** Delete the seven header stubs or merge them into the detailed steps, and add substeps for the odometer preset (do it early — it's one-time-limited) and setting the clock.

### F18 — Phase 4 HDX power and fuel hookup instructions contradict the verified fuse plan

- **Severity:** medium · **Dimension:** completeness · **Area:** consistency
- **File:** `chevelle-data.js`
- **Evidence:** The v9-verified wiring reference (app.js CIRCUITS/FUSES) lands the HDX RED constant 12V on Fuse #8 CLOCK 5A and PINK switched on Fuse #7 GAUGES 10A, with 'Verify: 12.4V+' checks. But Phase 4's build substep says 'Best practice: run a dedicated 14-16 AWG wire from the battery/starter solenoid through the firewall, fused at 15A' — a completely different scheme — and the sensor-hookup substep calls fuel a 'single wire from tank sender,' contradicting the verified TAN twisted-pair (SIG+GND, unfused)…
- **Fix:** Rewrite Phase 4 substeps to match the reference: RED to Fuse #8 CLOCK, PINK to Fuse #7 GAUGES (mention the dedicated-fused-wire route only as a fallback), and fuel as TAN twisted pair direct to FUEL INPUT-SIG + GND, unfused.

### F19 — Stereo phase comes after door panels, but tells you to test speakers 'before closing up the door panel'

- **Severity:** medium · **Dimension:** completeness · **Area:** phase-order
- **File:** `chevelle-data.js`
- **Evidence:** Phase 14 (Stereo, n 14) mounts door speakers and says 'Test each speaker before closing up the door panel' — but door panels were installed and buttoned up in Phase 10, four phases earlier, and carpet (Phase 9) already covers the floor where front-to-rear speaker wire must run. Package-tray 6x9 cutting is likewise instructed after the package tray was installed in Phase 13. As ordered, the user re-removes door panels, package tray, and lifts carpet edges to do work the guide could have sequenced…
- **Fix:** Add speaker-wire routing and door-speaker mounting substeps to the harness routing and door panel phases (or move speaker prep before Phase 9/10/13), leaving Phase 14 as head-unit install and testing only.

### F20 — Bulkhead and firewall grommet sealing never appears as a build step

- **Severity:** medium · **Dimension:** completeness · **Area:** missing-steps
- **File:** `chevelle-data.js`
- **Evidence:** The Parts Map (app.js line ~310) knows the answer — 'Seal with dielectric grease on terminals + RTV on the cavities — it's the weather barrier' — but no build phase ever instructs it. Phase 2 bolts the bulkhead connector 'temporarily', Phase 5 routes sender wires 'through firewall grommet' with no sealing, and after Phase 5 the firewall is buried behind the dash forever. Unsealed pass-throughs on a big-block car leak exhaust fumes, water, and engine heat into a freshly finished interior, and it'…
- **Fix:** Add a substep at the end of Phase 5: torque the bulkhead center bolt, dielectric grease the terminals, RTV the cavity edges, and seal added grommets with RTV/seam sealer — with a callout that this is the last chance before the dash closes it off.

### F21 — Recommissioning never verifies the engine turns freely by hand before cranking

- **Severity:** medium · **Dimension:** completeness · **Area:** missing-steps
- **File:** `chevelle-data.js`
- **Evidence:** Both Phase 16 and the 48-item Recommission checklist go straight from fluids to 'crank the engine with the starter' for oil priming. For an engine that sat 3 years, the standard first check is rotating it by hand with a breaker bar on the crank bolt (2 full revolutions) to catch rust-seized rings or a stuck valve before the starter applies torque — and optionally fogging the cylinders with oil through the plug holes first. Cranking a seized big block with the starter can bend pushrods or break r…
- **Fix:** Add to the First Start group: 'Pull all 8 plugs, squirt oil in each cylinder, rotate engine 2 full turns clockwise by hand with a breaker bar — stop if it binds' before the coil-wire-pulled cranking step. Add 'Inspect/replace the 3 rubber brake flex hoses (front x2, rear axle x1) — they swell shut internally with age' to the Brakes group.

### F22 — All navigation disappears below 760px with no fallback — app becomes single-view

- **Severity:** medium · **Dimension:** ux · **Area:** landscape/portrait handling
- **File:** `chevelle-hdx-interactive.html`
- **Evidence:** At `@media (max-width:760px)` (lines 393-397) the CSS sets `.rail { display:none }` and `.app { grid-template-columns:1fr }` with no hamburger, bottom tab bar, or drawer replacement. The topbar collapse button (`data-act='collapse'`) only toggles the `.rail-collapsed` 76px grid column, which the media query overrides — so it does nothing visible. This width is hit by an iPad Mini in portrait (744pt logical), and by ANY iPad the moment the user pulls up Split View or Slide Over (e.g., propping th…
- **Fix:** Below 760px, replace the rail with a fixed bottom tab bar (Build / Reference / Track, 48px+ targets) or make the topbar collapse button open the rail as an overlay drawer (position:fixed, z-index above content) instead of relying on the grid column.

### F23 — No screen wake lock — iPad sleeps and locks mid-job with greasy hands

- **Severity:** medium · **Dimension:** ux · **Area:** garage workflow
- **File:** `chevelle-app.js`
- **Evidence:** The init block (lines 1429-1439) registers the service worker but never requests `navigator.wakeLock`. During a torque sequence or the first-start oil-prime procedure (where the on-screen checklist is safety-critical and hands are occupied for 10+ minutes), the iPad dims, sleeps, and locks on its normal timer. Unlocking with greasy/gloved hands means wiping hands or smearing the screen every few minutes — the single most annoying failure mode for a propped garage tablet. Safari has supported the…
- **Fix:** Request `navigator.wakeLock.request('screen')` on first user interaction, re-acquire on `visibilitychange`, and surface it as a 'Keep screen awake' toggle in Settings (default on) with a small topbar indicator.

### F24 — Installed-PWA status bar overlays the topbar — no safe-area insets anywhere

- **Severity:** medium · **Dimension:** ux · **Area:** landscape/portrait handling
- **File:** `chevelle-hdx-interactive.html`
- **Evidence:** The page declares `apple-mobile-web-app-status-bar-style: black-translucent` (line 7) and `viewport-fit=cover` (line 5), which extends content under the iOS status bar when launched from the Home Screen — but no CSS uses `env(safe-area-inset-*)`. The fixed 64px `.topbar` (line 142, `--topbar-h` line 37) starts at y=0, so the iOS clock/battery text sits on top of the collapse button, page title, and the top of the search field. In landscape there is also no bottom inset for the home indicator (mi…
- **Fix:** Add `padding-top: env(safe-area-inset-top)` to `.topbar` (and include it in the height calc), plus `padding-left/right: env(safe-area-inset-left/right)` on `.rail` and `.page` for landscape. Test in actual standalone mode, since Safari-tab testing hides this.

### F25 — The exact data needed mid-job — wire colors, fuse slots, step details — is set at 10.5-13.5px

- **Severity:** medium · **Dimension:** ux · **Area:** text size at arm's length
- **File:** `chevelle-hdx-interactive.html`
- **Evidence:** Body text is a reasonable 16px, but the reference data a user reads from 60-80cm with the iPad propped is the smallest text in the app: `.part-wires` (wires in/out of every part, mono) 12.5px (line 455); fuse grid slot number 10.5px, label 11.5px, amps 11px (lines 442-444); `.ss-detail` step detail 13.5px (line 317); `.barney-body` 13.5px (line 205); `.trace-spec .ts-k` 13px (line 363); glossary definitions 13.5px (line 350). Compact density mode drops `--fs-base` to 15px and shrinks everything …
- **Fix:** Add a third density option, 'Garage' (`--fs-base:18px`), and give the wire/fuse data classes floor sizes of ~15-16px. Wire color words could also render as color-swatched chips (the swatch pattern already exists in `.circ-swatch`) so they are identifiable without reading.

### F26 — Lightbox fights gloved hands: double-tap resets zoom instead of zooming, and tapping beside the image closes it

- **Severity:** medium · **Dimension:** ux · **Area:** lightbox / gloves
- **File:** `chevelle-app.js`
- **Evidence:** In `openLightbox()` (lines 1364-1424): double-tap calls `reset()` (line 1397) — the inverse of the universal convention, and pinch is the one gesture that barely works with mechanic's gloves, so the glove-friendly path to magnify a dense AAW schematic is repeated taps on the 42px `+` button (`.lb-btn`, CSS line 374 — under the 44px minimum). Zoom is also centered on the image midpoint, not the tap/cursor point, so finding one circuit on the full 1971-72 schematic means zoom-then-hunt-by-pan ever…
- **Fix:** Make double-tap zoom to ~2.5x centered on the tap point (second double-tap resets); zoom toward the pinch/tap origin; grow `.lb-btn` to 48px; and only close via the X button and Esc (or a stage tap when scale===1).

### F27 — Wire-color lookup is buried below a 7-thumbnail diagram grid on the Wiring page

- **Severity:** medium · **Dimension:** ux · **Area:** taps to reach a wire color
- **File:** `chevelle-app.js`
- **Evidence:** `wiringHTML()` (lines 973-1004) renders the page as: intro paragraph → diagram strip (7 thumbnails, ~2 rows, roughly a full viewport at iPad portrait widths) → 11 circuit cards → fuse grid. The most frequent mid-job question ('what color is the temp sender wire?') therefore costs: tap Wiring → scroll past the diagram wall → tap the circuit — every time, since `ui.circuitSel` is ephemeral. The fuse detail card also renders BELOW the 18-slot grid (line 1003) with no scroll-into-view, so on smaller…
- **Fix:** Reorder Wiring to circuits → fuse panel → diagrams, or add a sticky chip row (Circuits · Fuses · Diagrams) that scrolls to each section; scroll the fuse detail into view on selection; consider persisting the last-open circuit.

### F28 — Portrait/stacked Build view: ~900px phase list sits above the phase detail; no 'jump to next unchecked step'

- **Severity:** medium · **Dimension:** ux · **Area:** long-phase scrolling
- **File:** `chevelle-hdx-interactive.html`
- **Evidence:** Below 1080px (all iPads in portrait) `.build-split` collapses to one column and `.phase-list-card` loses its sticky/max-height behavior (lines 387-392), so 17 phase rows (~52px each ≈ 900px) render above the phase content. Every phase switch dumps the user at an inherited scroll offset (see the render() scroll-preservation issue) with the actual steps far below. Within a phase, the step list also sits below header, goal, progress bar, Barney chip, callouts, tools, materials, and diagram thumbnai…
- **Fix:** In stacked mode, collapse the phase list into a horizontal scrolling chip strip (numbers + rings) pinned under the topbar; add a 'Next unchecked step' button beside 'Check all' that scrolls the first `.substep:not(.checked)` into view.

### F29 — Precache fetches go through the HTTP cache — a version bump can precache stale files into the new cache

- **Severity:** medium · **Dimension:** pwa · **Area:** stale-cache trap
- **File:** `sw.js`
- **Evidence:** Line 36 uses `c.add(u)`, which issues requests with default cache mode, so they can be satisfied from the browser's HTTP cache. GitHub Pages serves all assets with `Cache-Control: max-age=600`. Failure scenario: Corey fixes chevelle-data.js, bumps CACHE to v10, pushes; the iPad checked the site 5 minutes ago, so its HTTP cache still holds the v9 chevelle-data.js. The new v10 SW installs and happily precaches the OLD data file into the NEW cache — where it now lives until the NEXT version bump, d…
- **Fix:** Precache with cache-busting requests: `Promise.all(ASSETS.map(u => c.add(new Request(u, { cache: 'reload' })).catch(...)))`. `cache: 'reload'` forces a network fetch and bypasses the HTTP cache, guaranteeing a version bump always ships fresh bytes.

### F30 — iOS standalone status bar overlaps the 64px topbar — no safe-area insets anywhere

- **Severity:** medium · **Dimension:** pwa · **Area:** iOS standalone
- **File:** `chevelle-hdx-interactive.html`
- **Evidence:** The head sets `viewport-fit=cover` (line 5) and `apple-mobile-web-app-status-bar-style: black-translucent` (line 7), which makes iOS lay out the page UNDER the status bar in standalone mode. But a grep of the entire repo shows zero uses of `env(safe-area-inset-*)`. The `.topbar` (height 64px, line 142) and `.rail-head` start at y=0, so on the garage iPad launched from the home screen, the clock/Wi-Fi/battery indicators sit on top of the page title and crowd the search field. In landscape (likely…
- **Fix:** Add `padding-top: env(safe-area-inset-top)` to `.topbar` and `.rail` (or to the `.app` grid container), and `padding-left/right: env(safe-area-inset-left/right)` for landscape. Alternatively change the status-bar meta to `default`/`black` if you don't want translucent overlay behavior — that removes the overlap without CSS changes but loses the edge-to-edge look.

### F31 — Silent updates: no updatefound notification, so fixes take two app launches and the user never knows

- **Severity:** medium · **Dimension:** pwa · **Area:** update flow
- **File:** `chevelle-app.js`
- **Evidence:** Registration at chevelle-app.js lines 1437-1439 only logs to console. sw.js calls skipWaiting() (line 39) and clients.claim() (line 48), so a new SW activates immediately — but the currently loaded v9 page keeps running v9 JS/data until the next launch. On the iPad in standalone mode there is no reload button; 'reload' means swiping the app away and relaunching, and iOS only checks for a new sw.js at navigation time. Net effect: after pushing a fix, the garage iPad needs launch #1 (old content, …
- **Fix:** Listen for `registration.onupdatefound` -> `newWorker.onstatechange === 'installed' && navigator.serviceWorker.controller`, then render a small in-app toast ('Update ready — tap to reload') that calls `location.reload()`. Also call `registration.update()` on visibilitychange so a long-running standalone session picks up pushes without relaunch.

### F32 — Import accepts malformed backups: stored XSS + silently bricked checkboxes (confirmed live)

- **Severity:** medium · **Dimension:** code · **Area:** export/import validation & esc() gaps
- **File:** `chevelle-app.js`
- **Evidence:** importBackup (line ~1236) only checks `p.app === 'chevelle-hdx-build-guide' && typeof p.progress === 'object'` — it never checks `p.format === 2` and never validates nested types before writing straight to localStorage and reloading. Confirmed two live failures in a browser test: (1) XSS — budgetHTML renders `e.cost.toLocaleString(...)` (line 1118) and `data-id="' + e.id + '"` (line 1119) UNescaped; a backup with `cost: '<img src=x onerror=...>'` executed arbitrary JS (String.prototype.toLocaleS…
- **Fix:** Deep-validate on import: require `p.format === 2`; rebuild a sanitized progress object field-by-field (checks: object with boolean values and known key shape, expenses: array of {id:Number, category/desc/date:String, cost:finite Number>0}, activePhase: known phase id, recomV: number). esc() every interpolation in budgetHTML including data-id, and render cost via `Number(e.cost)` before toLocaleString. Before overwriting, auto-export the current state (or stash it under chevelle_refined_v1_backup) and show a confirm dialog.

### F33 — Switching views inherits the previous view's scroll position (confirmed live)

- **Severity:** medium · **Dimension:** code · **Area:** render engine / scroll preservation
- **File:** `chevelle-app.js`
- **Evidence:** render() (lines 1193-1201) unconditionally saves and restores `.scroll` scrollTop. That is correct for in-place updates (checking a box), but the 'view' and 'phase' handlers call the same render(), so the offset leaks across views. Confirmed live: scrolled Wiring to 1032px, tapped Glossary in the rail — Glossary opened pre-scrolled to 1032px, mid-list, with the filter input off-screen above. Every rail navigation from a long view (Build, Wiring, Recommission) lands the user in the middle of the …
- **Fix:** Give render an option, e.g. `render({ resetScroll: true })`, and pass it from the 'view', 'phase', and 'search-go' handlers so navigation starts at the top while check/expand/theme re-renders keep the current offset.

### F34 — Wiring view contradicts itself about the turn-signal fuse (#5 vs #2/#4)

- **Severity:** medium · **Dimension:** code · **Area:** reference data integrity
- **File:** `chevelle-app.js`
- **Evidence:** On the same Wiring page, the 'Turn Signals' circuit card (CIRCUITS, lines 247-254) says `Fuse #5 TURN 15A`, while the AAW 500707 fuse panel table directly below it (FUSES, lines 266-269) lists slot #5 as HAZARD 15A, with TURN at slot #2 (10A, Ignition) and slot #4 (15A, Battery/Hazard). A source comment admits 'verify against the physical AAW 500707 sheet' — but the shipped UI presents both values as verified fact. In the garage this sends the user to the wrong fuse first when diagnosing dead tu…
- **Fix:** Verify against the physical AAW 500707 instruction sheet, then make CIRCUITS['turn'].fuse agree with the FUSES table (likely slot #2 TURN 10A ignition-fed for normal turn operation). If it genuinely can't be verified yet, render an explicit 'unverified — check your panel sheet' badge on the circuit card instead of leaving the caveat in a source comment.

### F35 — Offline can silently degrade to a permanent blank screen (SW tolerates missing core assets, app has no error path)

- **Severity:** medium · **Dimension:** code · **Area:** service worker / silent failure paths
- **File:** `sw.js`
- **Evidence:** The install handler deliberately caches per-asset with `.catch(console.warn)` (sw.js line 36) so 'one missing asset can't abort the whole precache' — but that also means install SUCCEEDS when chevelle-data.js or chevelle-app.js itself fails to cache (flaky garage Wi-Fi during the v9 upgrade), and the activate handler then DELETES the previous working cache (lines 42-49). Offline, the fetch fallback `.catch(() => cached)` (line 63) returns `cached`, which is always undefined on that branch — a pl…
- **Fix:** Two-tier precache: `c.addAll()` (fail install) for the critical shell — the HTML, both JS files, manifest — and tolerant per-asset caching only for images/fonts. In the HTML shell add a tiny window.onerror fallback that injects a visible 'App failed to load — reconnect once and reload' message into #app.

### F36 — Backup export may be a no-op on the iPad standalone PWA — the one device that needs it

- **Severity:** medium · **Dimension:** code · **Area:** export/import backup
- **File:** `chevelle-app.js`
- **Evidence:** exportBackup (lines 1215-1225) uses the desktop pattern: create an <a download> pointing at a blob URL and click it. In iOS/iPadOS HOME-SCREEN (standalone display mode) web apps, programmatic blob downloads have a long history of failing silently or behaving inconsistently — there is no download manager UI in standalone mode on many iPadOS versions. Since the app manifest sets `display: standalone` and the stated primary device is an iPad in the garage, the data-safety feature most likely to be …
- **Fix:** Test Export from the home-screen app on the iPad. Add a fallback chain: try navigator.share({ files: [new File(...)] }) (share sheet works great in standalone iPadOS), else copy the JSON to the clipboard with a 'copied — paste into Notes' toast, keeping the anchor download for desktop.

### F37 — Muted text color --text-3 (#727988) fails WCAG AA contrast on every dark-theme surface at the small sizes it is used for

- **Severity:** medium · **Dimension:** a11yperf · **Area:** accessibility
- **File:** `chevelle-hdx-interactive.html`
- **Evidence:** Computed ratios: #727988 on --surface #181b22 = 3.94:1, on --surface-2 #1f232c = 3.60:1, on --bg #0f1115 = 4.32:1 — all below the 4.5:1 AA requirement for normal-size text, and this token is used almost exclusively at 10.5–13px: rail group labels (10.5px), nav meta counts (11px), timeline labels (11px), stat labels (12px), phase-list meta (11.5px), fuse slot numbers (10.5px), search snippets (12px), photo captions (12.5px), the lightbox hint, .faint, and step numbers. In a bright garage on a glo…
- **Fix:** Lighten --text-3 in the dark theme to around #8b93a4 (≈5.6:1 on surface) — it stays visibly muted but passes AA. Audit the accent swatch list so accent-as-text (fuse labels, barney titles, detail buttons) keeps ≥4.5:1; #e23b3b needs to lighten toward #ef5a50 when used as text.

### F38 — 'More detail' expander is a ~20px target nested inside the check row — glove mis-taps toggle step completion

- **Severity:** medium · **Dimension:** a11yperf · **Area:** accessibility
- **File:** `chevelle-app.js`
- **Evidence:** In substepHTML (line 803), the .ss-detailbtn (12.5px text + 13px icon, ~20px effective hit height) sits inside the 56px .ss-row that carries data-act="check". Because the click handler resolves closest('[data-act]'), a tap that lands a few pixels off the tiny button silently checks/unchecks the step instead of expanding the detail — the worst possible failure mode for a build checklist being operated with greasy or gloved fingers on an iPad. Apple HIG / WCAG 2.5.8 both call for ≥44px / ≥24px tar…
- **Fix:** Give .ss-detailbtn min-height:44px with negative-margin padding compensation (padding:12px 8px; margin:-8px), or restructure the row: make only the 26px checkbox + step number zone the 'check' target (widened to 44px) and let tapping the text expand the detail — that also matches how most checklist apps behave.

### F39 — Phase 4 materials list '10 bulbs with twist-lock sockets (#194 indicators, #1895 gauge illumination)' — the HDX cluster has no serviceable bulbs

- **Severity:** low · **Dimension:** accuracy · **Area:** Build Phase 4 — materials
- **File:** `chevelle-data.js`
- **Evidence:** Line 265 lists incandescent bulbs and twist-lock sockets among the HDX Control Box + dash install materials. The HDX-70C-CVL is fully LED-lit — indicators are on the gauge faces and backlighting is dimmed electronically via the ORANGE wire; there is nowhere to install #194/#1895 bulbs on this build. This is stock-cluster leftover text that sends the user shopping for parts with no home, and could make them hunt for missing bulb sockets in the Hi-Tech dash kit.
- **Fix:** Delete the bulb/socket line from Phase 4 materials (or replace it with 'no bulbs needed — HDX is fully LED; dimming comes from the ORANGE wire').

### F40 — Temp sender port location self-contradicts: Phase 5 says 'usually rear, near the thermostat housing' — the thermostat housing is at the FRONT of a big-block intake; reference views say passenger-side front

- **Severity:** low · **Dimension:** accuracy · **Area:** Build Phase 5 vs reference views
- **File:** `chevelle-data.js`
- **Evidence:** Line 360: 'Find the water jacket port on the intake manifold (usually rear, near the thermostat housing).' On a 396/454 the thermostat housing is at the front of the intake, so the sentence contradicts itself, and it contradicts DASH_GAUGES/CIRCUITS/PARTS_MAP which all say 'passenger-side front'. The same step hedges the bushing as '3/8" or 1/2" NPT' while the reference views assert 3/8"→1/8" specifically. The user drains coolant and pulls a plug based on this — pointing them to the wrong end of…
- **Fix:** Align Phase 5 with the reference views: 'water jacket port at the front of the intake, passenger side, near the thermostat housing.' Keep the bushing hedge ('measure the port — commonly 3/8" NPT; use the reducing bushing to 1/8" NPT') in both places.

### F41 — Troubleshooting #10 tells the user the HDX voltmeter 'needs only its signal wire on the battery/charging circuit' — the HDX voltmeter is internal and has no signal wire

- **Severity:** low · **Dimension:** accuracy · **Area:** Troubleshooting — Ammeter vs Voltmeter
- **File:** `chevelle-app.js`
- **Evidence:** Line 436 (TROUBLE #10 fix): 'The HDX voltmeter needs only its signal wire on the battery/charging circuit.' The Dash view correctly says the voltmeter is 'Internal — reads system voltage at the Control Box' via the RED/PINK feeds (lines 180-186). A user chasing a low volt reading may go looking for a dedicated voltmeter wire that does not exist, or add an unnecessary tap to the charging circuit. The ammeter-bypass advice in the same card is good and should stay.
- **Fix:** Reword the fix: 'The HDX reads voltage internally through its RED/PINK power feeds — there is no separate voltmeter wire. Just disconnect and insulate the old ammeter loop.'

### F42 — Fuse #9 FUEL labeled 'HDX-critical' / 'powers the HDX' while the same entry says the HDX fuel sender is unfused — contradictory guidance for fuel-gauge troubleshooting

- **Severity:** low · **Dimension:** accuracy · **Area:** Wiring view — fuse panel HDX callouts
- **File:** `chevelle-app.js`
- **Evidence:** FUSES slot 9 (line 273) says both 'Factory fuel circuit — the HDX sender signal itself is unfused twisted pair' and 'Third of the three HDX-critical slots', and the fuse-grid hint (line 996) says slots '#7 / #8 / #9… power the HDX'. Per the HDX manual the fuel sender path is an unfused resistance pair straight to FUEL INPUT — no HDX current flows through the FUEL fuse (it fed the factory gauge circuit). When the fuel gauge misbehaves, this wording sends the user to check a fuse that cannot affec…
- **Fix:** Drop 'HDX-critical' from slot 9 and change the grid hint to '#GAUGES / #CLOCK power the HDX; the fuel sender is unfused — check the tan pair and rear ground instead.' Keep slot 9 documented as the factory fuel circuit.

### F43 — Dead-end cross-references: 'HDX Integration section below', 'HDX-2', 'HDX-5', 'sheet 3'

- **Severity:** low · **Dimension:** completeness · **Area:** dead-references
- **File:** `chevelle-data.js`
- **Evidence:** Phase 2 callout (line 108) says 'See the HDX Integration section below for how to connect' — no such section exists anywhere in the app. Substeps at lines 166, 181, 184 reference 'HDX-2' and 'HDX-5' (section labels from the old guide document) which appear nowhere else in data or app, and line 108 also cites 'the aftermarket gauge instructions on sheet 3' with no sheet 3 in the app or aaw-diagrams/. In the garage these send the user hunting for content that isn't there.
- **Fix:** Replace 'HDX-2'/'HDX-5' with in-app targets that exist ('Reference > Wiring > Constant/Switched 12V circuits', 'Build > Phase 5'), drop or rewrite the 'HDX Integration section below' callout to point at Phase 4, and either add the AAW sheet-3 scan to aaw-diagrams/ or cite the existing Bag H diagrams instead.

### F44 — Steps rely on terms and skills the Skills/Glossary sections never teach, plus small internal contradictions

- **Severity:** low · **Dimension:** completeness · **Area:** assumed-knowledge
- **File:** `chevelle-data.js`
- **Evidence:** HEI appears ~8 times in build steps (with decisions hinging on it: 'If using HEI... instead'), and rheostat, ballast resistor, neutral safety switch, dwell (28-32°), and BTDC timing are all used — none are in the 20-term Glossary, and there's no Skill card for brake bleeding or setting timing even though recommissioning requires a full 4-wheel bleed and 'set initial timing 6-8° BTDC' (a timing light isn't in any tools list). Small contradictions also confuse: Phase 2's goal says 'You do NOT cut …
- **Fix:** Add Glossary entries for HEI, rheostat, ballast resistor, neutral safety switch, dwell, and BTDC; add a 'Bleed Brakes (2-person + one-man kit)' skill card; add a timing light to Phase 16 tools. Fix the Phase 2 goal wording ('route and dry-fit interior runs; engine-bay power leads do get cut to length'), pick one bow count, and resolve the turn-signal fuse number against the AAW sheet.

### F45 — Cluster of sub-44px touch targets throughout chrome and forms

- **Severity:** low · **Dimension:** ux · **Area:** touch targets
- **File:** `chevelle-hdx-interactive.html`
- **Evidence:** Against the 44px minimum: `.tb-collapse` 38px (line 144), `.icon-btn` 40px (line 157) — these are the theme/settings buttons used with gloves; `.ghost-btn` 40px height (line 214) — used for phase prev/next nav at the bottom of every phase; `.exp-del` expense delete 32px (line 476) — destructive, no confirm; settings `.seg-btn` ~29px tall (line 419) and `.acc-sw` accent swatches 26px (line 422); home timeline `.tl-dot` 34px (line 258); `.lb-btn` 42px (line 374). Main content rows (nav items 44px,…
- **Fix:** Raise `.icon-btn`/`.tb-collapse`/`.ghost-btn` to 44-48px, make `.exp-del` 44px with a confirm, and give settings segments/swatches 44px hit areas (padding can exceed the visual size).

### F46 — Low-contrast small meta text (--text-3 ≈ 4:1) is hard to read under bright garage light and glare

- **Severity:** low · **Dimension:** ux · **Area:** contrast in bright garage
- **File:** `chevelle-hdx-interactive.html`
- **Evidence:** Dark theme `--text-3: #727988` (line 55) computes to roughly 3.9-4.2:1 against `--surface` #181b22 — below the WCAG 4.5:1 threshold for normal text — and it is used almost exclusively at the smallest sizes: timeline labels 11px (line 261), fuse slot numbers 10.5px (line 442), `.pl-meta` phase times 11.5px (line 279), captions 12.5px (line 454), search snippets 12px (line 491). A dark UI in a bright garage additionally suffers reflections/fingerprint glare that dark pixels amplify. A manual light…
- **Fix:** Lighten dark-theme `--text-3` to ~#8a93a5 (≥5.5:1), avoid text-3 below 12px, and consider defaulting the suggested 'Garage' density/mode to the light theme, which reads far better under shop lights.

### F47 — start_url lands on a meta-refresh redirect page, adding a blank flash to every standalone launch

- **Severity:** low · **Dimension:** pwa · **Area:** manifest
- **File:** `manifest.json`
- **Evidence:** `"start_url": "."` (manifest.json line 4) resolves to the directory root, which GitHub Pages serves as index.html — a bare `<meta http-equiv=refresh>` hop to chevelle-hdx-interactive.html (index.html line 3). Every home-screen launch therefore renders an unstyled white/blank document for a beat before the real app loads. Offline it still works (both './' and the target are precached), but it is an unnecessary extra navigation on every single launch, and meta-refresh is the most fragile redirect …
- **Fix:** Set `"start_url": "chevelle-hdx-interactive.html"` so standalone launches go straight to the app shell. Keep index.html for people typing the bare URL in a browser. If keeping the redirect page, give it the dark background color inline so the flash is at least not white.

### F48 — Precache failures are swallowed with only a console.warn — incomplete installs look successful

- **Severity:** low · **Dimension:** pwa · **Area:** service worker install
- **File:** `sw.js`
- **Evidence:** Line 36 individually catches every failed `c.add(u)` and just logs 'SW precache skip'. The deliberate upside is that one bad asset can't abort install, but the downside is the inverse guarantee is gone: the SW reports itself installed even if, say, all 8 AAW diagram PNGs failed on flaky garage Wi-Fi. The user walks to the car believing the guide is fully offline, then taps Wiring and gets broken images with no network to recover. Nobody reads the console on an iPad.
- **Fix:** Count failures in install; if any critical asset (the two JS files, the HTML, the diagrams) failed, either reject install for those, or persist a flag the app reads to show a one-line banner: 'Some diagrams did not download — open once on Wi-Fi to finish caching.' The runtime-cache layer will heal misses opportunistically, but only if the user happens to view them while online.

### F49 — persist() is unguarded — a storage exception makes taps look dead and silently stops saving progress

- **Severity:** low · **Dimension:** code · **Area:** localStorage state handling
- **File:** `chevelle-app.js`
- **Evidence:** persist()/persistSettings() (lines 571-578) call localStorage.setItem with no try/catch, and every mutation site follows the pattern `mutate state; persist(); render();` (e.g. 'check' at line 1269). If setItem throws (quota exceeded, Safari lockdown/private contexts, iPadOS storage pressure), the exception aborts the click handler AFTER the state mutation but BEFORE render(): the checkbox visually does nothing, yet internal state changed — the next unrelated interaction suddenly shows the earlie…
- **Fix:** Wrap the two setItem calls in try/catch; on first failure set a flag and render a one-time dismissible banner ('Progress can't be saved — storage is full or restricted; export a backup'). Keep render() running regardless by moving persist() after render() or catching inside persist().

### F50 — Expense form flags the wrong field when the cost is invalid

- **Severity:** low · **Dimension:** code · **Area:** expense tracker input handling
- **File:** `chevelle-app.js`
- **Evidence:** In 'exp-add' (lines 1302-1309), when validation fails the code always adds the 'invalid' class to the DESCRIPTION input (`desc.classList.add('invalid')`) — even when the description is perfectly fine and it's the cost that is empty, zero, or non-numeric (`parseFloat` NaN). With work gloves on an iPad it's easy to fat-finger the cost field; the app then flashes the description red, telling the user to fix the field that isn't broken. Also parseFloat accepts trailing garbage ('12abc' → 12), silent…
- **Fix:** Flag the actual offending field: if desc empty → flag desc; if cost invalid → flag cost. Consider `cost.value !== '' && Number(cost.value) > 0` (Number() rejects trailing garbage where parseFloat doesn't).

### F51 — Glossary filter caret jumps to the end on every keystroke

- **Severity:** low · **Dimension:** code · **Area:** re-render focus preservation
- **File:** `chevelle-app.js`
- **Evidence:** The gloss-input handler (lines 1342-1346) rebuilds the entire `.scroll` innerHTML on each keystroke, then refocuses the recreated input and forces `setSelectionRange(len, len)`. Any mid-string correction (tap back into 'blkhead' to fix the typo, type one char) throws the caret to the end, making mid-word edits impossible. The topbar search solves this exact problem correctly by never re-rendering the input (updateSearchPop only touches the popover) — the glossary view regressed to the naive patt…
- **Fix:** Mirror the topbar approach: give the glossary results grid its own container id and re-render only that container on input, leaving the input element untouched (no refocus/selection juggling needed).

### F52 — Barney chips: invisible toggles while Barney Mode is on, and handler resolves phase differently than the renderer

- **Severity:** low · **Dimension:** code · **Area:** event delegation / UI state
- **File:** `chevelle-app.js`
- **Evidence:** Two related quirks. (1) A chip renders open when `state.barneyMode || state.ui.barneyOpen[phase.id]` (line 824), but tapping it still toggles `barneyOpen` (line 1284). While Barney Mode is ON the tap appears to do nothing (chip stays open), yet it silently flips barneyOpen — so after turning Barney Mode OFF, chips the user happened to tap stay expanded while others collapse, which looks random. (2) barneyChip is rendered for the phase phaseDetailHTML resolved (with a `|| PHASES[0]` fallback, lin…
- **Fix:** In the 'barney' handler, no-op when state.barneyMode is true (the chip is pinned open anyway), and carry the phase id on the chip itself (`data-pid` on the barney div) so the handler toggles the phase actually rendered.

### F53 — ~4.6 MB of AAW diagram PNGs are decoded at thumbnail size with no lazy-loading — heavy decode/memory hit on iPad Safari

- **Severity:** low · **Dimension:** a11yperf · **Area:** performance
- **File:** `chevelle-app.js`
- **Evidence:** The Wiring view (wiringHTML, lines 975–978) renders all 8 AAW diagrams as <img> thumbnails ~220px wide, but the sources are full-resolution scans: aaw-fuse-panel-install.png is 2550x1650 / 1,047 KB, aaw-schematic-1971-72.png 2550x1650 / 729 KB, aaw-bag-j-engine-diagram.png 1650x1275 / 823 KB — 4.6 MB total. No loading="lazy" or decoding="async" anywhere (grep: zero matches). A 2550x1650 image decodes to ~16.8 MB of RGBA; opening the Wiring tab forces roughly 60–70 MB of synchronous image decode,…
- **Fix:** Generate small thumbnail variants (~440px wide, would be ~20–40 KB each as JPEG/WebP) for the diagram strip and keep the full-res PNGs only for the lightbox (data-src already separates the zoom source from the thumb src). Add loading="lazy" decoding="async" to all <img> tags in the render functions. Cache both variants in sw.js.

### F54 — White-on-orange primary CTA is 2.86:1 and white-on-green done-states are 2.54:1 — the app's main button fails contrast

- **Severity:** low · **Dimension:** a11yperf · **Area:** accessibility
- **File:** `chevelle-hdx-interactive.html`
- **Evidence:** --accent-ink #ffffff on --accent #ff6a2b = 2.86:1, used on .solid-btn (15px/650 weight — not 'large text', needs 4.5:1) for the 'Continue/Start' resume button and 'Add' expense button, and on the current timeline dot (12px/700). White on --good #3fb950 = 2.54:1 for done phase numbers and check icons (graphical objects need 3:1). These are the highest-value tap targets in the interface.
- **Fix:** Switch --accent-ink to a dark ink (e.g. #2a1206, which measures 6.19:1 on #ff6a2b) — dark-on-orange is also the more 'premium' look and survives the accent swatch swap to red/blue/green if you derive ink per-accent. For the green done-states, darken --good backgrounds slightly or use dark check glyphs.

### F55 — Lightbox controls and settings-close have no accessible name; search input's computed name is '⌘K'

- **Severity:** low · **Dimension:** a11yperf · **Area:** accessibility
- **File:** `chevelle-app.js`
- **Evidence:** The four lightbox buttons (zoom out / zoom in / reset / close, lines 1370–1373) are icon-only <button>s with no title, aria-label, or text — VoiceOver announces each as just 'button'. Same for the settings panel close button (line 1157). Topbar icon buttons rely on title= only, which is fragile on iOS VoiceOver. Worse, the search input (line 712) is wrapped in <label class="tb-search"> whose only text content is the <kbd>⌘K</kbd> hint — the label-wrapping algorithm makes the field's accessible n…
- **Fix:** Add aria-label to every icon-only button ('Zoom in', 'Close image', 'Close settings', 'Toggle sidebar', 'Toggle theme', 'Settings'). Give the search and glossary inputs aria-label="Search everything" / "Filter glossary terms", and add aria-hidden="true" to the shared icon() helper's <svg> output in one line.
