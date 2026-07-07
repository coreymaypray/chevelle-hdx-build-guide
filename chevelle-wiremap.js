/* ============================================================
   chevelle-wiremap.js — photo wiring overlay data (pure data).
   Coordinates are INTRINSIC PHOTO PIXELS (viewBox = photo w/h),
   so routes stay anchored at any zoom ("to scale").
   Route ids are PERMANENT — completion checks persist under
   state.checks['wm:<zone>:<routeId>']; renaming a label is fine,
   changing an id loses the user's checked state. The ZONE KEY is
   likewise permanent (first segment of the check key). When a photo
   is replaced with Corey's own shot, keep ids, re-anchor coords only.
   circuit: null = route has no CIRCUITS entry (its card renders from
   the route's own label + note instead).
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
      { id: 'fuse-panel',   part: 'AAW Fuse Panel',            x: 310,  y: 625 },
      { id: 'column',       part: 'Steering Column (clamp area)', x: 650, y: 500 },
      { id: 'hdx-box',      part: 'HDX Control Box',           x: 1170, y: 385 },
      { id: 'heater-box',   part: 'Heater Box',                x: 1380, y: 420 },
      { id: 'ground-bolt',  part: 'Dedicated Ground Bolt',     x: 975,  y: 355 },
      { id: 'bulkhead',     part: 'Bulkhead Connector',        x: 450,  y: 355 },
      { id: 'flasher',      part: 'Turn-Signal Flasher',       x: 400,  y: 710 },
      { id: 'headlight-sw', part: 'Headlight Switch + Dim Kit', x: 300, y: 280 },
    ],
    routes: [
      { id: 'red-const',    label: 'RED constant 12V → CLOCK fuse',   color: '#e5484d', pin: 'hdx-box',  circuit: 'const12v',
        path: [[1140, 405], [914, 481], [658, 533], [421, 574], [345, 600]] },
      { id: 'pink-sw',      label: 'PINK switched 12V → GAUGES fuse', color: '#ff9ec6', pin: 'hdx-box',  circuit: 'sw12v', halo: true,
        path: [[1140, 415], [919, 496], [663, 548], [426, 589], [343, 615]] },
      { id: 'black-gnd',    label: 'BLACK dedicated ground',          color: '#222222', pin: 'hdx-box',  circuit: 'gnd', halo: true,
        path: [[1145, 395], [1070, 380], [1030, 345]] },
      { id: 'orange-dim',   label: 'ORANGE dimmer feed',              color: '#ff8c00', pin: 'headlight-sw', circuit: 'dimmer',
        path: [[330, 300], [410, 396], [590, 478], [900, 469], [1140, 400]] },
      { id: 'display-cable', label: '8-pin display cable → cluster',  color: '#9aa3ad', pin: 'hdx-box', circuit: null, dash: true,
        note: 'Flat 8-pin ribbon, Control Box → cluster (~3 ft). Don’t fold or crease it — creased traces are the #1 display-cable failure. Route with slack, clips every 4-6", away from HEI/coil EMI.',
        path: [[1160, 410], [1087, 527], [963, 603], [880, 620]] },
      { id: 'tan-fuel',     label: 'TAN fuel sender twisted pair (from rear)', color: '#d2b48c', pin: 'hdx-box', circuit: 'fuel', halo: true,
        path: [[1420, 700], [1253, 563], [1187, 437], [1170, 410]] },
      { id: 'sender-leads', label: 'Sender leads via firewall grommet', color: '#f5f5f5', pin: 'bulkhead', circuit: 'oil', halo: true,
        path: [[460, 370], [657, 420], [913, 435], [1140, 395]] },
    ],
  },
};
