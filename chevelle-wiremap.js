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
