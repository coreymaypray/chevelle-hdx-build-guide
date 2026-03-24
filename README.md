# 1972 Chevelle SS — HDX Build Guide

Interactive Progressive Web App for installing Dakota Digital HDX-70C-CVL gauges in a 1972 Chevelle SS. Built for use on an iPad in the garage — works offline, tracks progress, and keeps you from frying a wire harness.

## Features

- **SVG Dashboard** — animated gauge cluster mirrors the real HDX layout, shows build progress at a glance
- **Wire Tracing** — tap any wire to highlight its full path, see color codes, connector IDs, and routing
- **17 Build Phases** — 131 substeps with per-phase timers, notes, and checklists
- **Engine Bay Diagram** — interactive top-down view of Big Block 396/454 sensor locations
- **Fuse Panel Reference** — all 18 AAW fuse slots with amp ratings and HDX circuit callouts
- **Recommissioning Checklist** — 32-item checklist for bringing a car back from 3-year storage
- **Budget Tracker** — categorized expense logging with running totals
- **Parts Inventory** — 18-item checklist for tracking received parts
- **Troubleshooting** — top 10 gotchas ranked by frequency (bad grounds, wrong senders, EMI, etc.)
- **Full-Text Search** — Ctrl+K / tap search to find anything across all sections
- **Offline PWA** — install to your home screen, works without internet
- **State Persistence** — all progress saved to localStorage with export/import backup

## Usage

### Quick Start
Open `index.html` in any browser, or visit the [GitHub Pages site](https://coreymaypray.github.io/chevelle-hdx-build-guide/).

### Install as PWA
On iPad/iPhone: Open in Safari → Share → Add to Home Screen
On Android: Open in Chrome → Menu → Install App

### Backup Your Progress
Home screen → **Export Backup** downloads a JSON file. Use **Import Backup** to restore on any device.

## Tech Stack

- Vanilla HTML, CSS, JavaScript (zero dependencies)
- Service Worker for offline caching
- localStorage for state persistence
- SVG for all diagrams and gauge animations
- Single-file architecture (~6,500 lines) for maximum portability

## Car Details

- **Year**: 1972
- **Model**: Chevelle SS (A-body)
- **Engine**: Big Block 396/454
- **Dash Kit**: Hi-Tech Classics SS Dash Kit
- **Gauges**: Dakota Digital HDX-70C-CVL (6 analog + 2 TFT)
- **Wiring**: American Autowire Classic Update harness

## License

MIT License — see [LICENSE](LICENSE)
