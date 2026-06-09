# Barney Layer — Design Spec

**Date:** 2026-06-09
**Project:** `chevelle-hdx-build-guide` (1972 Chevelle SS · Dakota Digital HDX · American Autowire)
**Status:** Approved direction (Approach A), full scope. Awaiting spec review before implementation planning.

---

## 1. Goal

Make the existing build guide **easier to understand** for the owner (Corey) doing his own install, by adding an optional, plain-language teaching layer — *without* removing or diluting the technical depth the guide already has.

The guide today is strong at telling you **what** to do and **what not to do** (it is full of terse `.note`/`.warn` callouts). What it lacks is the plain-language **why** underneath. The "Barney layer" fills that gap so the owner can *adapt and diagnose*, not just follow orders.

Source of truth for the teaching techniques: the **Painless Performance #90587 manual** (for the #20130 harness on the *same* 1970–72 Chevelle/Malibu), whose beginner-friendly approach (teach-the-concept-first, good-vs-bad worked examples, teach-the-primitive-skill-once, battery-charger first power-up, read-front-to-back) was mined and mapped onto this guide.

## 2. Audience & Non-Goals

- **Audience:** the owner himself — a capable generalist, **not** an automotive-wiring expert. Single user.
- **Non-goals (YAGNI):**
  - Not a product/showcase, not a course for strangers.
  - No difficulty badges on chips.
  - No auto-collapse timers.
  - No rewrite of existing step language; the Barney layer is **additive and collapsed by default**.
  - No new runtime dependencies, no network calls (must stay 100% offline / PWA-safe).

## 3. Approach (chosen: A — inline Barney layer)

Add three kinds of optional content, all reusing existing UI patterns and collapsed by default:

1. **🔰 "Why?" explainer chips** — a collapsed expander attached *beneath the relevant existing step/`.note`/`.warn`*, giving the plain-language reasoning.
2. **🛠 Skill cards** — reusable how-to cards (crimp, multimeter, back-probe, NPT, etc.) linked from the multiple steps that need them.
3. **⚠️ Safety set-pieces** — a few high-stakes, standalone safety procedures (charger first power-up, oil-pump priming, Grade-8 belt bolts, jitter diagnosis).
4. **📖 Mini-glossary** — plain definitions, surfaced as inline `▸` links and a small searchable glossary section.

Plus a **global "Barney Mode" toggle** in the nav (expand/collapse all explainers at once).

## 4. Scope (full — "everything the audit found")

### 4.1 "Why?" explainer chips (15)

Each chip is a collapsed `🔰 Why?` expander attached under the existing callout/step at the stated location. `P#` = priority (must / nice).

| id | Location | Topic | Draft content (plain language) | P |
|---|---|---|---|---|
| `barney-const-vs-switched` | Phase 3 Dash Assembly, HDX power; Phase 6 Power-On | Constant vs switched 12V | Constant 12V (red) stays live with the key off — it powers the HDX clock/memory so settings persist. Switched 12V (pink) only powers with the key ON. The HDX needs **both**: red keeps the clock alive, pink controls when gauges power up. | must |
| `barney-ground-quality` | Phase 2 Dash, chassis ground; Phase 6 | Why ground quality > wire quality | Paint, rust, and corrosion are insulators — they block current and cause voltage drops. Bad grounds cause gauge jitter, dim lights, and gremlins. Sand each ground bolt to **shiny bare metal**, use a star washer to bite through paint. | must |
| `barney-emi-tach` | Phase 4 Senders, tach signal; Phase 6 | EMI & wire spacing | Spark-plug wires emit radio-like noise (EMI) that leaks into signal wires like the tach line and makes it jitter. EMI is invisible but travels through air and metal. Keep tach wires ≥6″ from plug wires; use suppression (not solid-core) plug wires. | must |
| `barney-sender-types` | Phase 4 Senders, oil & temp | 3-wire vs 2-wire senders | A 3-wire sender (SEN-03-8) has separate power (5V), signal, and ground — isolated and clean. A 2-wire sender returns through the block (old GM style), noisier. The HDX **requires** 3-wire; a 2-wire won't read right. | must |
| `barney-npt-threads` | Phase 4 Senders, oil & temp install | NPT threads / ¼-turn | NPT threads are **tapered** — they seal by compression as you tighten, so senders are **not** torqued hard. "Hand-tight + ¼ turn" = sealed but won't crack the aluminum block. Over-tightening is permanent damage. | must |
| `barney-fuse-amperage` | Phase 3 Dash, fuse panel; Phase 6 | Fuse amperage | A fuse is a circuit breaker in a wrapper — it melts at a set current to protect wires from overheating/fire. Fuse #7 (GAUGES) is 10A because the cluster/HDX/radio draw ~8–9A peak. A 15A fuse lets too much through → melted insulation/fire. | must |
| `barney-signal-ground-isolation` | Phase 5 Recommission, grounds; Phase 6 | Dedicated signal ground | Analog gauges read tiny voltage changes. Share the ground with high-current devices (engine, radio, blower) and their return currents inject noise → jitter. Run a **dedicated 18 AWG** ground from the Control Box to a clean dash bolt; never share it. | must |
| `barney-bulkhead-connector` | Phase 1 Wiring, bulkhead; Phase 5 | Bulkhead connectors | A bulkhead connector is a sealed multi-pin plug through the firewall. It carries engine-bay circuits into the cabin through one sealed point, keeping water/oil/heat/rodents out of the cabin harness. | nice |
| `barney-ohms-resistance` | Phase 5 grounds; Phase 6; troubleshooting | Ohms / thresholds | An ohm measures resistance. A good ground reads **< 0.5Ω** (near zero); over 0.5Ω means corrosion/loose contact. A fuel sender reads ~0Ω empty, ~90Ω full. The multimeter's Ω mode tells you good vs bad in seconds. | nice |
| `barney-twisted-pair` | Phase 4 Senders, fuel level; Phase 5 | Twisted pair | Twisting the signal and ground wires together cancels EMI that tries to leak in. Run them straight and parallel instead and they act like an antenna. Twisted pair is an invisible shield for analog sensor signals. | nice |
| `barney-star-washer` | Phase 2 grounds; throughout grounding | Star washers | A star (toothed) washer's teeth dig through paint/oxidation to bare metal, so the ring terminal makes true metal-to-metal contact. Stack order: bolt → star washer → ring terminal → flat washer → nut. | nice |
| `barney-cable-drive-speed-sensor` | Phase 4 Senders, speed sensor (guide ~line 851, 1594) | Cable-drive VSS adapter | The HDX speedo is electronic, but the '72 trans has a mechanical cable output. A cable-drive adapter threads into the tailshaft where the old cable went and converts shaft rotation into electronic pulses (signal/power/ground) for the HDX. Must be calibrated (GPS method most accurate) or speed reads wrong. | nice |
| `barney-cylinder-count-tach` | Phase 4 tach (guide ~line 1405) | Cylinder count setting | A tach counts ignition pulses to compute RPM, so it must know cylinders-per-rev. Set HDX cylinder count to **8** for the 396/454. Wrong count → tach reads exactly **double** (set to 4) or **half** (set to 16). | nice |
| `barney-heat-shrinking-senders` | Phase 4 sender splices | Why heat-shrink under hood | Sender joints live in heat, oil, vibration, and road spray — a bare crimp corrodes and fails there. Slide adhesive-lined heat-shrink over each under-hood splice and shrink it to seal out moisture and lock the wire. | nice |
| `barney-fuel-sender-inversion` | Phase 4 fuel sender (guide ~line 1648) | Fuel sender range / calibration | The HDX reads fuel as resistance (ohms) from the tank sender. GM senders run ~0Ω empty → ~90Ω full, but some are **inverted**. The HDX empty/full calibration (drive to empty, mark; fill, mark) handles either; if the gauge reads backwards, the range is inverted. | nice |

### 4.2 Skill cards (8 reusable how-tos)

Linked from the multiple steps that need them (a step shows a `🛠 How to …` link that opens the card).

| id | Title | Teaches | Linked from |
|---|---|---|---|
| `skill-crimping-terminals` | Crimp & terminate a connector | strip → jaw size → crimp copper + insulation straps → pull-test → heat-shrink | Phase 3 power, Phase 4 senders, all connector work |
| `skill-multimeter-basics` | Read a multimeter (V / continuity / Ω) | DC volts (12.4V rest, 13.5–14.5V running), continuity beep <50Ω, ohms (<0.5Ω good ground; 0/90Ω fuel) | Phase 5 & 6 testing throughout |
| `skill-back-probing` | Back-probe without breaking a connector | probe from the rear of the pin (don't pierce the front), read at the inserted tool, withdraw carefully | Phase 6 sensor diagnostics, Phase 14 calibration |
| `skill-npt-thread-installation` | Install NPT senders with Teflon tape | 3–4 wraps clockwise, hand-tight, mark, exactly ¼ turn, check for weeping | Phase 4 oil & temp senders |
| `skill-wire-routing-emicancel` | Route/bundle wires to avoid EMI & damage | ≥6″ from plug wires, cross at 90°, twisted/bundled signal+ground, loose ties until verified, away from heat/edges | Phase 1 routing, Phase 4 tach/speed |
| `skill-heat-shrink-application` | Install heat-shrink properly | size to wire OD, slide on **before** shrinking, cover crimp + ¼″ onto insulation, even heat | all connector work, Phase 4 |
| `skill-bolt-grade-inspection` | Identify bolt grades (5 vs 8) | wipe head, count radial lines (3=Grade5 unsuitable, 6=Grade8 required), mark verified bolts | Phase 11 seats/belts |
| `skill-torque-wrench-use` | Use a torque wrench | set value, smooth pull to click, star pattern, re-torque after 10–50 mi | Phase 11 seat tracks, Phase 15 lug re-torque |

### 4.3 Safety set-pieces (4)

Standalone, prominent (use `.warn` styling, not collapsed):

| id | Title | Placement | Essence |
|---|---|---|---|
| `safety-first-power-up` | First Power-Up the Safe Way (10A charger) | After Phase 6 Power-On, before any "start" instruction | Power up the first time on a ≤10A charger (low amperage + breaker = a wiring mistake trips the charger instead of frying the HDX or starting a fire). Battery negative left **off**; charger neg → frame, pos → battery +. Key OFF: gauges/backlight on, watch for smoke. Key ON (no crank): test **one** circuit at a time. Pass → reconnect battery. Trip/fail → STOP and diagnose. |
| `safety-oil-pump-priming` | Prime the oil pump before first start | Phase 15 Recommission, first-start procedure | Disable ignition (ground the coil wire), crank in 15s bursts watching the oil-pressure gauge move, confirm pressure before reconnecting the coil and starting. **Zero oil pressure after 10s of running → shut off immediately** (bearings die in seconds). |
| `safety-grade-8-bolts` | Grade-8 seat-belt anchor verification | Phase 11 Seats & Belts, before any anchor install | Belt anchors **must** be Grade-8 (6 radial lines). Wipe, inspect, count lines; discard Grade-5/unmarked. Torque anchors to 30 ft-lb, then pull-test the webbing (50+ lb) — must not move. |
| `safety-jitter-diagnosis` | Gauge jitter → dedicated ground test | Phase 6 troubleshooting + Phase 5 preventive | If gauges jitter: measure Control-Box ground to battery negative (must be <0.5Ω); if high, scrape to bare metal + dielectric grease + retighten. As a **diagnostic only**, temporarily jump 18 AWG Control-Box-ground → battery negative; if jitter stops, the permanent ground is the fault. Never leave the jumper in place. |

### 4.4 Mini-glossary (~20 terms)

Plain one-line definitions for: Bulkhead connector · Constant 12V (always-hot) · Switched 12V (ignition-hot) · EMI · Sending unit/sender · Three-wire sender · Two-wire sender · NPT · Ohms (Ω) · Twisted pair · Star washer · Dielectric grease · Rheostat · Continuity · Back-probe · VSS · Cable-drive speed-sensor adapter · Teflon (PTFE) tape · ATO blade fuse · Suppression (resistance) plug wires.

(Definitions per the audit output; stored once in a `GlossaryTerms` JS object and referenced everywhere to avoid duplication.)

## 5. Component & UX design (verified against current code)

### 5.1 Reused patterns (confirmed present)
- **Collapse:** `.vstep` / `.vstep-body` (`display:none` until `.vstep.open`) — CSS at lines 153–154; print override at 349 (`.vstep-body { display:block !important }` so explainers print expanded). Toggle the same way the guide's existing collapsibles do — generic `toggleCollapsible(id)` exists at line 1927; mirror that mechanism (add/remove `open` class). **Note:** the audit's `toggleVstep()` name does **not** exist — use the real toggler.
- **Callouts:** `.note` (neutral) and `.warn` (red) — used throughout; "Why?" chips attach beneath these; safety set-pieces use `.warn`.
- **State:** `ChevelleState` object (line 7801), `ChevelleState.load()` (7867), persisted to localStorage key `chevelle-hdx-state`. Add a `barney` namespace (chip-id → open boolean) and a `barneyMode` flag.
- **Search:** `buildSearchIndex()` (line 8290) already crawls section/step text.

### 5.2 "Why?" chip markup/behavior
- Markup: a `.vstep.barney` block (class `vstep barney`, so the §5.3 Barney-Mode selector can target it) with header `🔰 Why?` + `.vstep-body` holding the explainer; placed immediately after the target `.note`/`.warn`.
- Each chip has a stable `id` (the ids in §4.1). Open/closed persists via `ChevelleState` under `barney[id]`.
- On load, after `ChevelleState.load()`, apply `open` class to chips whose persisted state (or global Barney Mode) says open.
- Stateless-friendly: a chip with no persisted entry defaults to **closed**.

### 5.3 Global "Barney Mode" toggle
- A nav control (button/switch) labeled e.g. `🔰 Barney Mode`.
- ON → add a container class (e.g. `body.barney-on`) that forces all `🔰 Why?` chips open (CSS: `body.barney-on .vstep.barney .vstep-body { display:block }`) **and**/or iterate chips adding `open`. OFF → collapse all.
- Persist `barneyMode` in `ChevelleState`; restore on load.
- Per-chip manual toggles still work; Barney Mode is a bulk override for a learning pass vs a pro pass.

### 5.4 Skill cards
- A small set of reusable cards (could live in a `sec-skills` section or a shared block). Steps link via `🛠 How to crimp` etc. (in-page anchors using the existing `showSection`/scroll pattern, or an inline expandable). Each card is itself a `.vstep`-style collapsible so it's quiet by default.

### 5.5 Glossary
- `GlossaryTerms` JS object (term → definition), rendered into a small glossary section (reuses existing section pattern so search indexes it) **and** referenced inline: a `▸ term` link opens a small `.detail-content` definition (existing CSS lines 188–190) without leaving the step.

### 5.6 Search integration
- Extend `buildSearchIndex()` to also index `.vstep-body` explainer text and the glossary definitions (e.g. group label `Barney Explainers` / `Glossary`).
- When a search result targets a chip, show its section and auto-open that chip.

### 5.7 Offline / PWA
- All content is hardcoded HTML/CSS/JS strings + Unicode icons; **no images, no network**. Works in airplane mode.
- **Service worker:** because the single HTML file changes, bump `CACHE` in `sw.js` (`chevelle-hdx-v6` → `v7`). No new assets to precache.

## 6. Build order (logical, even though scope = everything)

1. Foundation: `barney` state namespace + global Barney Mode toggle + the `🔰 Why?` chip pattern (CSS reuse, toggler, persistence).
2. Must-have explainers (§4.1 first 7) attached to their existing callouts.
3. Skill cards (§4.2) + link them from steps.
4. Safety set-pieces (§4.3).
5. Nice-to-have explainers (§4.1 remaining 8).
6. Glossary object + section + inline `▸` links.
7. Search index extension.
8. SW cache bump to v7; verify online + offline.

## 7. Verification plan

- Serve locally; confirm zero console errors (as in prior session).
- Toggle a chip → persists across reload (localStorage).
- Global Barney Mode → expands/collapses all; persists.
- Ctrl+K finds explainer + glossary text; clicking a result opens the chip.
- Print preview: explainers render expanded (via existing `@media print` override).
- Offline test: clear caches, reload, go offline → all Barney content still renders (no network).
- SW: live `sw.js` serves `v7`.

## 8. Open questions (resolved) & remaining

**Resolved (owner decisions, 2026-06-09):**
- Scope = **everything the audit found** (all must + nice-to-have items above).
- Global Barney Mode toggle = **include**.
- Cross-domain safety set-pieces (oil-pump priming, Grade-8 belt bolts) = **include**.
- Placement = inline-attached under existing steps (not a separate per-phase block).
- Skipped: difficulty badges, auto-collapse timers.

**Remaining (can be decided at implementation):**
- Do skill cards live in one shared `sec-skills` section (linked from steps) or inline-expand at each step? (Lean: shared section + links, to avoid duplication.)
- Glossary as its own nav section vs. only inline `▸` links + search. (Lean: small section **and** inline links, since search already indexes sections.)

## 9. Out of scope / future

- Turning this into a polished public/showcase guide.
- Per-chip difficulty ratings.
- Any change to the wiring diagrams themselves (covered in the prior offline-caching/lightbox work).
