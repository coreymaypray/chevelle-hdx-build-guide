# Wire Map + v10 smoke checklist

Run on the iPad (standalone home-screen app) after deploy. Desktop preview first.

## Per zone (behind-dash, engine-bay, under-car, rear)
- [ ] Pins sit ON their parts (fuse panel, column, HDX box… / senders / tailshaft / tank sender)
- [ ] Tap a pin → only its wires stay bright, others dim; page scrolls to the matching part card
- [ ] Tap a wire → circuit card under the photo shows the RIGHT fuse label + amps (GAUGES 5A / CLOCK 10A)
- [ ] Null-circuit wires (display cable, charge wire, main feed) show their note, never circuit facts
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
- [ ] View switch starts at top; search hit scrolls into view (circuits/fuses/skills/trouble center; phase/step/glossary results land at top — known limitation for steps)
- [ ] Settings shows "Keep screen awake" (iPad: screen stays on ≥5 min with app open)
- [ ] Standalone: status bar does not overlap the topbar (safe-area)
- [ ] Airplane mode: full app + all four zone photos render offline
- [ ] Weak-wifi: app loads from cache within ~3s when the network stalls (SW timeout)
- [ ] Deploy a trivial text change WITHOUT cache bump → update toast appears after a foreground cycle (or content refreshes via network-first)
