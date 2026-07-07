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
  /* Stock photo: 1970 Chevelle SS 454 bay, shot from the front looking at
     the firewall — driver side is photo RIGHT (brake booster top right). */
  'engine-bay': {
    photo: { src: 'engine-bay-reference.jpg', w: 1280, h: 960 },
    shotList: 'Stand at the driver-side fender, frame the firewall + rear half of the intake, level with the carb, landscape. Drop the file in as engine-bay-reference.jpg, update w/h, re-anchor pins (ids stay — checks survive).',
    pins: [
      { id: 'oil-sender',  part: 'Oil Pressure Sender',       x: 895,  y: 540 },
      { id: 'temp-sender', part: 'Coolant Temp Sender',       x: 605,  y: 528 },
      { id: 'tach-source', part: 'Tach Signal Source',        x: 700,  y: 200 },
      { id: 'alternator',  part: 'Alternator + Ground Strap', x: 440,  y: 620 },
      { id: 'megafuse',    part: 'Megafuse / Main Power',     x: 90,   y: 750 },
      { id: 'eb-bulkhead', part: 'Bulkhead Connector',        x: 875,  y: 250 },
    ],
    routes: [
      { id: 'oil-lead',    label: 'Oil sender W/R/B + shield → Control Box', color: '#f5f5f5', halo: true, pin: 'oil-sender', circuit: 'oil',
        path: [[895, 540], [905, 455], [890, 345], [875, 255]] },
      { id: 'temp-lead',   label: 'Temp two-wire → Control Box SIG+GND',     color: '#1a7a4a', pin: 'temp-sender', circuit: 'temp',
        path: [[605, 528], [655, 470], [745, 425], [830, 330], [872, 258]] },
      { id: 'tach-lead',   label: 'Tach WHITE from HEI TACH terminal',        color: '#f5f5f5', halo: true, pin: 'tach-source', circuit: 'tach',
        path: [[700, 195], [770, 172], [840, 200], [872, 240]] },
      { id: 'charge-wire', label: 'Alternator charge wire (Bag Z)',           color: '#e5484d', pin: 'alternator', circuit: null,
        note: 'Heavy 6-ga alternator output to the battery (AAW Bag Z), protected by the MEGAFUSE — not a dash fuse, not an HDX gauge circuit. The engine-to-chassis ground strap at the alternator bracket is what keeps gauge readings stable.',
        path: [[440, 620], [330, 655], [215, 700], [115, 745]] },
      { id: 'main-feed',   label: 'Megafuse main feed → fuse panel',          color: '#e5484d', pin: 'megafuse', circuit: null,
        note: 'Heavy 6-ga main feed from the megafuse through the bulkhead to the AAW fuse panel — powers the entire harness. Mount and wire the megafuse BEFORE routing this feed.',
        path: [[95, 735], [200, 480], [420, 200], [700, 120], [865, 225]] },
    ],
  },
  /* Stock photo: museum cutaway of a GM Turbo Hydra-Matic — input shaft at
     photo LEFT (front of trans), extension/tailhousing at photo RIGHT. */
  'under-car': {
    photo: { src: 'under-car-reference.jpg', w: 1600, h: 1070 },
    shotList: 'On ramps/jack stands, shoot the trans tailshaft from the driver side showing the speedo-cable port. Replace under-car-reference.jpg, update w/h, re-anchor (ids stay).',
    pins: [
      { id: 'vss-port',     part: 'Speed Sensor Adapter', x: 1290, y: 440 },
      { id: 'frame-ground', part: 'Frame/Body Ground',    x: 600,  y: 490 },
    ],
    routes: [
      { id: 'vss-trio',    label: 'PURPLE sig / RED 5V / BLACK gnd → Control Box', color: '#a855f7', pin: 'vss-port', circuit: 'speed',
        path: [[1290, 440], [1150, 330], [950, 280], [750, 260], [620, 255]] },
      { id: 'frame-strap', label: 'Frame-to-body ground path', color: '#222222', halo: true, pin: 'frame-ground', circuit: 'gnd',
        path: [[600, 490], [540, 580], [470, 665]] },
    ],
  },
  /* Stock photo: fuel sender flange (5-screw ring + center terminal stud)
     installed in a strapped metal tank; twisted pair exits bottom-left. */
  'rear': {
    photo: { src: 'rear-sender-reference.jpg', w: 1280, h: 960 },
    shotList: 'PRIORITY — this stock photo is a generic sender, not an A-body. Trunk open, shoot the tank/sender area, or under-rear showing tank + lines. Replace rear-sender-reference.jpg, update w/h, re-anchor (ids stay).',
    pins: [
      { id: 'tank-sender', part: 'Fuel Tank Sending Unit', x: 585, y: 285 },
      { id: 'rear-ground', part: 'Rear Body Ground',       x: 130, y: 765 },
    ],
    routes: [
      { id: 'tan-pair', label: 'TAN twisted pair → HDX FUEL INPUT (unfused)', color: '#d2b48c', halo: true, pin: 'tank-sender', circuit: 'fuel',
        path: [[585, 295], [450, 420], [310, 560], [190, 690], [105, 820]] },
      { id: 'rear-gnd', label: 'Rear ground → chassis', color: '#222222', halo: true, pin: 'rear-ground', circuit: 'gnd',
        path: [[130, 765], [95, 850], [60, 930]] },
    ],
  },
};
