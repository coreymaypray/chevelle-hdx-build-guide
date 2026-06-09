/* ============================================================
   Chevelle HDX Build Guide — data layer
   Real phase titles + times from the build; phase 1 substeps are
   verbatim from the guide, the rest are representative.
   ============================================================ */

const STAGE = {
  PREP:     { label: 'Prep',         hue: 38  },
  ELEC:     { label: 'Electrical',   hue: 24  },
  ENGINE:   { label: 'Engine Bay',   hue: 8   },
  TEST:     { label: 'Checkpoint',   hue: 0   },
  INT:      { label: 'Interior',     hue: 200 },
  CAL:      { label: 'Calibration',  hue: 145 },
  RECOM:    { label: 'Recommission', hue: 268 },
  FINAL:    { label: 'Final',        hue: 145 },
};

const PHASES = [
  {
    "id": 0,
    "n": 1,
    "stage": "PREP",
    "title": "Sound Deadening & Prep",
    "time": "4-6 hrs",
    "goal": "Stick rubber-asphalt mat (Dynamat) to every bare interior panel you can reach, so the floor stops rusting and the cabin stops sounding like a tin can.",
    "tools": [
      "Degreaser/brake cleaner",
      "Roller tool",
      "Utility knife",
      "Heat gun",
      "Shop towels",
      "Isopropyl alcohol"
    ],
    "materials": "Dynamat Xtreme bulk pack (36 sq ft covers floor + firewall) · Dynamat roller tool · Utility knife · Degreaser · 90% Isopropyl alcohol · Shop towels",
    "callouts": [
      {
        "type": "note",
        "text": "⚠️ No fasteners in this phase — all adhesive. Do NOT cover floor drain holes or seat bolt holes."
      }
    ],
    "barney": {
      "topic": "Why deaden before anything else?",
      "text": "The floor is the one panel you can never reach again once carpet and seats go in. Mat now is rust prevention and a heat barrier from the exhaust — skip it and you are pulling the interior back out in two years."
    },
    "substeps": [
      {
        "text": "Clean all floor pans, firewall, and trans tunnel with degreaser",
        "detail": "Spray Purple Power or brake cleaner on all bare metal surfaces. Scrub with a stiff brush. Wipe dry. Every surface that gets Dynamat must be clean bare metal or paint — no grease, no rust, no dirt."
      },
      {
        "text": "Wipe surfaces with isopropyl alcohol for final prep",
        "detail": "Use 90%+ isopropyl and clean shop towels. This removes any remaining oils. Let dry completely before applying deadener."
      },
      {
        "text": "Apply Dynamat Xtreme to floor pans (driver side first)",
        "detail": "Start with the driver side footwell. Cut Dynamat to fit using a utility knife. Peel backing, press firmly, and use the roller tool to get full adhesion. Push into every groove and contour. Overlap pieces by 1/4 inch."
      },
      {
        "text": "Apply Dynamat to passenger side floor pan",
        "detail": "Same process. Cut around seat bolt holes — mark them from underneath before covering. You will need to poke through these later."
      },
      {
        "text": "Apply Dynamat to firewall",
        "detail": "This is the most important panel for reducing engine heat and noise. Work from center outward. Cut around wiring grommets and heater hose holes. This is tight work — use smaller pieces."
      },
      {
        "text": "Apply Dynamat to transmission tunnel",
        "detail": "The trans tunnel gets very hot. Full coverage here. Roll firmly to ensure no air pockets. Use a heat gun on low to help Dynamat conform to curves."
      },
      {
        "text": "Apply Dynamat to inner door skins (both sides)",
        "detail": "Remove old door panel clips first. Apply Dynamat to the inner door skin (the metal behind where the door panel goes). Cover the large flat area — don't block drain holes at bottom of door."
      },
      {
        "text": "Apply Dynamat to trunk floor (optional but recommended)",
        "detail": "If you want a quiet ride, cover the trunk floor too. This is low priority but reduces road noise and resonance."
      },
      {
        "text": "Let adhesive cure 24 hours minimum",
        "detail": "Do not walk on Dynamat or install carpet for at least 24 hours. In cold weather, allow 48 hours. The butyl rubber needs time to fully bond to the metal."
      }
    ]
  },
  {
    "id": 1,
    "n": 2,
    "stage": "ELEC",
    "title": "Wiring Harness Routing",
    "time": "3-5 hrs",
    "goal": "Lay the AAW 510105 harness through the car bag-by-bag (G → H → J → K → L → M → N → V → Z) so every connector ends up exactly where its switch / sender / light lives. You do NOT cut anything yet. You're just routing and dry-fitting.",
    "tools": [],
    "materials": "AAW Bag G (510524 Dash Harness) • 500707 Fuse/Relay/Flasher Kit • 500332 Headlight Switch • 500042 Floor Dimmer Switch · AAW Bag H (510525 Instrument Cluster) • Terminal Kit 92965220 (if using aftermarket gauges) · AAW Bag J (510526 Engine Kit) • Bag Z components (Megafuse, 6ga wire, terminals)",
    "callouts": [
      {
        "type": "warn",
        "text": "WARNING: Do NOT connect these yet. Install Bag H next and refer to its instructions for proper hookup."
      },
      {
        "type": "warn",
        "text": "WARNING: Do NOT connect yet. Bag M is installed later during rear lighting."
      },
      {
        "type": "warn",
        "text": "WARNING: DO NOT reconnect battery yet. Continue to Bag H."
      },
      {
        "type": "warn",
        "text": "IMPORTANT: If using Dakota Digital HDX gauges, you will NOT use the stock circuit board connections. Instead, use the aftermarket gauge instructions on sheet 3. The HDX Control Box replaces the instrument cluster. See the HDX Integration section below for how to connect."
      }
    ],
    "barney": {
      "topic": "Constant vs switched 12V — why it matters",
      "text": "Constant 12V is hot all the time (clock, memory, horn). Switched 12V is only hot with the key on (gauges, radio). Wire a gauge to constant and it never turns off; wire the horn to switched and it dies with the key. Probe with a test light, key on then off, before you connect anything."
    },
    "diagrams": [
      {
        "src": "aaw-diagrams/aaw-bag-h-instrument.png",
        "label": "Bag H — Instrument cluster"
      },
      {
        "src": "aaw-diagrams/aaw-schematic-1971-72.png",
        "label": "Full 1971–72 schematic"
      }
    ],
    "substeps": [
      {
        "text": "Fuse Panel Install Mount the fuse panel at the firewall bulkhead in the stock OEM bulkhead hole on the driver side. The flasher can goes in the bottom-right corner of the panel. Secure with two mounting screws."
      },
      {
        "text": "Floor Dimmer Switch Connect the four wires to the floor-mounted dimmer switch: LIGHT GREEN (heavy)Headlight high beam feed LIGHT GREEN (thin)High beam indicator light TANHeadlight low beam feed YELLOWHeadlight power feed from headlight switch"
      },
      {
        "text": "Emergency Brake SwitchConnect the TAN wire to the emergency brake switch on the parking brake pedal bracket. Ground-trigger circuit.HDX builds: The brake warning indicator is on the HDX gauge cluster face, not a separate factory bulb. The signal still flows through this AAW wire — the HDX Control Box reads it through the 8-pin display cable to the cluster. Wire it the standard AAW way."
      },
      {
        "text": "Headlight Switch (500332) Install the headlight switch and connect: RED12V battery feed (BAT location) ORANGEPark/tail feed in BROWNPark lamp feed out GRAYDash light rheostat — feeds instrument lamp dimming"
      },
      {
        "text": "Ignition Switch Connect the ignition switch wires: RED12V battery feed PINK12V ignition feed BROWN12V accessory feed PURPLEStarter lead to neutral safety switch NOTE: Connectors are already plugged in for the stock 1970–72 ignition switch. No re-pinning required."
      },
      {
        "text": "Turn Signal Switch Connect the 7-wire connector for the 3-7/8″ 1969–74 GM steering column: WHITEBrake switch feed DARK GREENRH tail / turn YELLOWLH tail / turn PURPLETurn signal flasher BROWNHazard flasher DARK BLUERH front park lamp LIGHT BLUELH front park lamp BLACKHorn relay ground"
      },
      {
        "text": "Brake Pedal Switch Connect the WHITE wire to the brake pedal switch at the brake pedal arm."
      },
      {
        "text": "Wiper Switch Connect the wiper switch wires. There is a single connector (1972 only) and a 3-way connector: Single connector (72 only) BLACKGround for switch assembly 3-way connector BLACKGround — low speed DARK BLUEGround — washer LIGHT BLUEGround — high speed"
      },
      {
        "text": "Instrument Cluster Disconnects Locate the instrument cluster connectors (F, G, H) on this harness. These connectors mate with Bag H. WARNING: Do NOT connect these yet. Install Bag H next and refer to its instructions for proper hookup."
      },
      {
        "text": "Rear Body Connector Locate the rear body disconnect on this harness. It mates with Bag M (rear body harness). WARNING: Do NOT connect yet. Bag M is installed later during rear lighting."
      },
      {
        "text": "Remaining Dash ConnectionsRoute and connect the remaining wires behind the dash for components your car has:Horn relayConnect horn relay leadRadio PINKIgnition feed to factory radio shaft mountCigarette Lighter ORANGEFused constant 12V to lighter elementHeater ResistorConnect to blower resistor assemblyHeater Lamp GRAYDash lamp dimmer feeds heater control illuminationHeater Switch BROWNACCY feedYELLOW / LT BLUE / ORANGEHeater blower resistor taps (Low/Med/High)Console connectionMate with console harnessT400 Kickdown PINKIgnition feed to transmission kickdown solenoidCut for this build: RH courtesy lamp (no interior lights) and glove box light (no glove box lamp). Cap and label those AAW wires — do not connect."
      },
      {
        "text": "Chassis Ground Attach the BLACK ground wire to a clean, bare-metal chassis ground point. Sand paint away if needed and use a star washer for solid contact. 🔰 Why? Star washers A star (toothed) washer's teeth dig through paint/oxidation to bare metal, so the ring terminal makes true metal-to-metal contact. Stack order: bolt → star washer → ring terminal → flat washer → nut."
      },
      {
        "text": "Connector F — Main Instrument SignalsAttaches at the back of the dash where the stock gauge cluster connector lived.HDX BUILDS (per Dakota Digital MAN 650542H p.6 + MAN 650572B): The AAW gauge-cluster-disconnect interfaces with the FACTORY printed-circuit-board cluster. On HDX builds the factory PCB is discarded (per 650572B Step 2/4). The HDX gauge cluster connects to the Control Box via its own 8-pin round display cable (~3 ft), NOT via AAW Connector F. The AAW Connector F wires either get (a) abandoned and capped, or (b) repurposed as discrete signal sources to the Control Box indicator inputs (turn signals -> LEFT/RIGHT, high beam -> HIGH, brake -> BRAKE)."
      },
      {
        "text": "Connector G — Power, Lamps & GroundCarries 12V power, ground, and dash illumination feeds intended for the stock cluster.HDX BUILDS (per Dakota Digital MAN 650542H): The HDX Control Box has its own dedicated terminal block (12V CONSTANT, IGNITION PWR, GND, DIM, sensors, indicator inputs) — see HDX-2. The AAW Connector G wires that originally fed the stock cluster bulbs and lamps are not used by the HDX cluster itself — cap and label them. You separately wire the HDX's own RED/PINK/BLACK/ORANGE pigtails to AAW fuse panel positions you verify on its printed legend (typical: any battery-hot 5-20A for RED, any accessory 5-20A for PINK)."
      },
      {
        "text": "Connector H — Aftermarket Electric Speedometer This connector is ONLY for an aftermarket electric speedometer. If using a stock cable-driven speedo, do NOT use this connector. YELLOWVSS Ground PURPLEVSS Signal PURPLE/WHITEVSS 12V Power BLACK/WHITESpeedo Ground PINK/WHITESpeedo 12V Power (doubles onto same stud as Purple/White) WARNING: Twist the YELLOW and PURPLE wires together for their entire length to prevent electromagnetic interference with the VSS signal."
      },
      {
        "text": "Bulkhead Assembly Temporarily plug the main bulkhead connector from this kit into the mating connector on the dash-side bulkhead (located under the master cylinder). This connector will be unbolted later to install the front light harness (Bag L)."
      },
      {
        "text": "12V Battery — RED Route the RED wire to the Megafuse assembly (from Bag Z) and cut to length. Use the ring terminal and shrink tubing from the 510476 kit."
      },
      {
        "text": "Starter Solenoid — PURPLE Route the PURPLE wire to the starter solenoid S terminal and cut to length. Install rubber sleeve E and ring terminal D."
      },
      {
        "text": "Oil Pressure Sender — DARK BLUEHDX BUILDS: This wire is NOT USED. The HDX has its own oil pressure sender, Dakota Digital SEN-03-8 (3 wires + bare shield, 0-100 PSI solid-state per MAN 650542H p.10), connecting directly to the HDX Control Box on a separate harness — not through the AAW dash harness. Cap and label this AAW DK BLUE wire. Do not connect it.For HDX sender install: see Install → Phase 5 (Under-Hood Senders) and HDX-5."
      },
      {
        "text": "Water Temp Sender — DARK GREENHDX BUILDS: This wire is NOT USED. The HDX has its own water temperature sender (1/8\" NPT, 2-wire) connecting directly to the HDX Control Box. Cap and label this AAW DK GREEN wire. Do not connect it.For HDX sender install: see Install → Phase 5 (Under-Hood Senders) and HDX-5."
      },
      {
        "text": "Heat — ORANGE (stock heater only)Plug into bulkhead assembly Y, route to the heater blower, and terminate with terminal C and connector A.Note: this car has stock heat, no factory A/C. The AAW \"if using aftermarket A/C\" conditional has been trimmed."
      },
      {
        "text": "12V Ignition — PINK If using HEI or electronic ignition: route to the coil and trim to length. Install terminal C and connector G, then plug into the distributor cap BAT location."
      },
      {
        "text": "Starter Solenoid R — YELLOW Assembly X — this is for points ignition with a ballast resistor. If using HEI: connect the YELLOW wire with terminal C and connector G to the distributor cap BAT location instead."
      },
      {
        "text": "Coil / Tach — WHITEHDX BUILDS: The HDX uses its own dedicated tach signal wire connecting directly to the HDX Control Box TACH terminal (HEI TACH terminal OR coil negative; never positive). The AAW WHITE wire is redundant — cap and label.NEVER use solid-core spark plug wires with the HDX (MAN 650542H p.7) — EMI from solid-core wires destroys the tach signal. Use spiral-wound or carbon-core suppression wires only. Do not route the tach wire alongside any other sensor or input wires — keep it isolated to prevent EMI bleed (MAN 650542H p.7)."
      }
    ]
  },
  {
    "id": 2,
    "n": 3,
    "stage": "ELEC",
    "title": "Dash Support Structure",
    "time": "2-3 hrs",
    "goal": "Bolt the dash support steel bracket assembly to the firewall so it's rigid and provides a clean metal-to-metal ground return for every gauge, light, and radio you'll mount in the dash.",
    "tools": [
      "3/8\" socket set",
      "7/16\" socket",
      "Torque wrench",
      "Wire brush",
      "Anti-seize",
      "Lock washers"
    ],
    "materials": "Upper dash support bar · Lower L-brackets (left + right) · Center support brace · Steering column bracket assembly · All mounting hardware below",
    "substeps": [
      {
        "text": "Inspect dash support bracket for rust, bends, broken welds",
        "detail": "The dash support is a steel bar/bracket assembly that bolts to the firewall and holds the entire dash. Check for: rust-through (especially at bolt holes), bent mounting ears, cracked welds. If any of these are bad, replace the bracket before continuing."
      },
      {
        "text": "Wire-brush firewall bolt holes to bare metal (critical for ground return)",
        "detail": "Thread a bolt in and out to clean the threads. Wire-brush the firewall mounting surfaces and the contact face around each bolt hole down to bare shiny metal — paint, powder coat, or seam sealer at the contact face prevents good ground return through the dash structure, and that ground path is what your gauges, lights, and radio use back to chassis. Hidden ground problems here are extremely hard to diagnose later because everything physically connects but voltage drops under load. Apply a tiny bit of anti-seize to bolt threads only (NOT on the contact face) so the bolts come out clean in 50 years."
      },
      {
        "text": "Mount upper dash support bar to firewall",
        "detail": "This is the main horizontal bar that spans the width of the dash opening. It bolts to the firewall with 5/16\"-18 bolts. Use lock washers. Torque: snug + 1/4 turn."
      },
      {
        "text": "Mount lower dash support brackets (left and right)",
        "detail": "These L-shaped brackets bolt to the firewall lower and support the bottom of the dash. They also provide the mounting points for the steering column clamp. 5/16\"-18 bolts, lock washers."
      },
      {
        "text": "Mount center support brace",
        "detail": "The center brace connects the upper bar to the lower structure. It prevents the dash from flexing. Hand-tighten first, then torque everything together once aligned."
      },
      {
        "text": "Verify all bolts are tight and structure is rigid",
        "detail": "Push on the assembly firmly. It should not flex or move. If it does, a bolt is loose or a bracket is bent. The gauges will vibrate and rattle if this structure is not rock-solid."
      },
      {
        "text": "Test-fit SS dash face panel against support structure",
        "detail": "Hold the Hi-Tech Classics SS dash face up to the support. The 6 mounting holes in the dash face should align with the support bracket holes. If they don't, adjust the bracket before final mounting."
      }
    ]
  },
  {
    "id": 3,
    "n": 4,
    "stage": "ELEC",
    "title": "HDX Control Box + Dash Install",
    "time": "3-4 hrs",
    "goal": "Mount the HDX Control Box behind the dash, plug it into the gauge cluster with the 8-pin display cable, hook up four power/ground wires, and physically install the SS dash assembly into the support bracket. This is the phase where most people make a mistake that takes hours to find later. Go slow.",
    "tools": [
      "Phillips screwdriver",
      "#2 Phillips bit",
      "7/16\" socket",
      "Wire crimpers",
      "Butt connectors (18-22 AWG)",
      "Heat shrink",
      "Heat gun",
      "Zip ties",
      "Velcro strips"
    ],
    "materials": "Black SS dash face · HDX gauge cluster (pre-assembled) · Backing plate · 10 bulbs with twist-lock sockets (#194 indicators, #1895 gauge illumination) · HDX Control Box (brain unit) · Oil pressure sender SEN-03-8 (3-wire, 1/8\" NPT) · Water temp sender (2-wire, 1/8\" NPT) · Speed sensor (3-wire) · Wiring sub-harness for senders · Mounting bracket for Control Box · SS dash pad (vinyl, matches original contour) · Dash pad spring clips: 2 long (2-3/4\" × 5/8\") + 2 short (2-3/8\" × 5/8\") · Console (if bundled)",
    "barney": {
      "topic": "What the HDX control box actually does",
      "text": "Every gauge talks to one small box instead of running its own wire to a sender. The box reads the senders, does the math, and lights the cluster. Fewer wires through the firewall, but it means one bad ground at the box can make every gauge act strange."
    },
    "substeps": [
      {
        "text": "Choose Control Box mounting location — driver side, behind dash",
        "detail": "The HDX Control Box is approximately 6\" x 4\" x 2\". Mount it where: (1) you can reach it for future access, (2) the 8-pin display cable can reach the gauge cluster, (3) it won't interfere with steering column or pedals. Most people mount it on the dash support bar using velcro strips or a small bracket."
      },
      {
        "text": "Mount Control Box with velcro strips or bracket",
        "detail": "Industrial velcro is fine — the Control Box is lightweight. If you prefer, drill two small holes and use #8 screws. Make sure it's secure and won't rattle."
      },
      {
        "text": "Connect 8-pin display cable from Control Box to HDX gauge cluster",
        "detail": "The flat 8-pin display cable connects the Control Box to the back of the gauge cluster. Route it neatly. Don't fold or crease the 8-pin display cable — it will damage the traces inside. Leave enough slack to remove the gauge cluster if needed later."
      },
      {
        "text": "Connect CONSTANT 12V (RED wire) to battery-hot fuse",
        "detail": "This wire must have power at ALL times (even when key is off). Connect to a fused source: 5-20A inline fuse. Best practice: run a dedicated 14-16 AWG wire from the battery/starter solenoid through the firewall, fused at 15A. The red wire from the Control Box is 18 AWG."
      },
      {
        "text": "Connect SWITCHED 12V (PINK wire) to ignition-hot source",
        "detail": "This wire provides power only when the key is in the ON or RUN position. Tap into the ignition switch output or use the fuse panel's IGN circuit. Use a test light to verify: power at ON, no power at OFF."
      },
      {
        "text": "Connect GROUND (BLACK wire) to dedicated firewall ground bolt",
        "detail": "THIS IS THE MOST IMPORTANT CONNECTION. Scrape paint off the firewall where the ground bolt will go (down to bare metal). Use a star washer between the ring terminal and the metal. Tighten firmly. A bad ground will cause every gauge to read wrong or flicker."
      },
      {
        "text": "Connect DIMMER (ORANGE wire) to headlight switch rheostat",
        "detail": "This controls the backlight brightness of all gauges. Connect to the rheostat wire from the headlight switch (the wire that goes to dash lights). When you rotate the headlight switch knob, the gauges should dim/brighten."
      },
      {
        "text": "Connect each sensor input wire to Control Box",
        "detail": "Oil pressure: 3-wire (white SIG, red PWR, black GND). Water temp: 2-wire. Speed sensor: 3-wire. Tach: single wire from coil negative. Fuel: single wire from tank sender. Each one plugs into a labeled connector on the Control Box."
      },
      {
        "text": "Install SS dash face with gauge cluster into support structure",
        "detail": "With all wiring connected behind the dash, carefully position the SS dash face. Align the 6 mounting holes with the support bracket. Insert 7/16\" hex bolts. Hand-tighten all 6 first, then torque to snug + 1/4 turn in a cross pattern."
      },
      {
        "text": "Install backing plate behind dash face",
        "detail": "The Hi-Tech kit includes a backing plate that covers the rear of the gauge cluster. It prevents light leaks and protects the electronics. Secure with the clips provided."
      },
      {
        "text": "Install SS dash pad with spring clips",
        "detail": "The padded top cover snaps onto the dash face with spring clips. Align it carefully — the vinyl pad should sit flush all around. Press firmly on each clip until it snaps. Do NOT over-force — you will break the clips."
      }
    ]
  },
  {
    "id": 4,
    "n": 5,
    "stage": "ENGINE",
    "title": "Under-Hood Senders (Engine Bay)",
    "time": "2-3 hrs",
    "goal": "Install three senders (oil pressure, water temp, speed) on the engine and transmission, hook up the tach signal at the distributor, and route every sender wire through the firewall to the HDX Control Box. Do this BEFORE you button up the dash — it's much easier with the dash open.",
    "tools": [
      "1/8\" NPT tap (recommended)",
      "Teflon tape",
      "Open-end wrench set",
      "Wire loom/heat wrap",
      "Zip ties",
      "Grommet tool"
    ],
    "materials": "Oil pressure sender SEN-03-8 · Water temp sender · Speed sensor (3-wire pulse type) · Sender wiring sub-harness · Teflon tape (not included — bring your own)",
    "callouts": [
      {
        "type": "warn",
        "text": "🛑 NEVER connect tach wire to coil (+). HEI: use the TACH terminal on the cap, not the BAT terminal."
      }
    ],
    "barney": {
      "topic": "Why 3-wire senders and NPT tape",
      "text": "HDX senders are precise resistors; the threads are tapered (NPT) so they seal by wedging, not by a gasket. Two wraps of Teflon tape lubricates and seals the taper. Over-tighten and you split the aluminum intake boss — a quarter turn past snug is plenty."
    },
    "diagrams": [
      {
        "src": "aaw-diagrams/aaw-schematic-1971-72.png",
        "label": "Engine wiring schematic"
      }
    ],
    "substeps": [
      {
        "text": "Install oil pressure sender SEN-03-8 in engine block",
        "detail": "Locate the oil gallery port on the driver side of the block (where the factory idiot light sender was). Remove the old sender. Apply 2-3 wraps of Teflon tape clockwise. Thread the SEN-03-8 in hand-tight, then wrench snug + 1/4 turn. Do NOT overtighten — you will crack the housing. This is a 1/8\" NPT port."
      },
      {
        "text": "Wire the oil sender: WHITE to Control Box signal, RED to 5V power, BLACK to ground",
        "detail": "The SEN-03-8 is a 0-100 PSI solid-state sender with 3 wires + a bare shield (4 conductors). The bare shield wire connects to the Control Box DRN terminal (do not omit). It is NOT the old resistive type. (not the old resistive type). WHITE = signal to Control Box PRESSURE INPUT-SIG. RED = 5V power FROM the Control Box PRESSURE INPUT-PWR (do NOT tap for any other device). BLACK = ground to PRESSURE INPUT-GND. BARE shield = PRESSURE INPUT-DRN (shield drain — reduces EMI pickup)."
      },
      {
        "text": "Install water temperature sender in intake manifold",
        "detail": "Find the water jacket port on the intake manifold (usually rear, near the thermostat housing). You may need a reducing bushing: GM ports are often 3/8\" or 1/2\" NPT, but the HDX sender is 1/8\" NPT. Use the included bushing adapter. Teflon tape, hand-tight + 1/4 turn."
      },
      {
        "text": "Wire the temp sender: signal to Control Box, ground through block",
        "detail": "This is a 2-wire sender. One wire goes to the Control Box TEMP input. The other grounds through the engine block (the threads in the manifold complete the ground path)."
      },
      {
        "text": "Install speed sensor adapter in transmission tailshaft",
        "detail": "Unscrew the mechanical speedometer cable from the trans tailshaft housing. The HDX speed sensor adapter threads into the same hole. It replaces the cable with an electronic pulse sensor. Hand-tight + snug with a wrench."
      },
      {
        "text": "Wire speed sensor: 3 wires to Control Box (signal, power, ground)",
        "detail": "Route the 3 wires from the trans area, along the frame rail, and up through the firewall. The speed sensor needs constant rotation to work — it reads pulses from the trans output shaft."
      },
      {
        "text": "Connect tach signal wire to distributor/coil",
        "detail": "For HEI distributors: use the TACH terminal on the distributor cap. For points ignition: connect to the coil negative (-) terminal. Route the wire through the firewall. This is a single signal wire. CRITICAL: Route AWAY from spark plug wires — maintain 6\"+ clearance. If paths must cross, cross at 90 degrees only. Parallel routing causes erratic tach readings from EMI."
      },
      {
        "text": "Route all wires through firewall grommet",
        "detail": "Use the main grommet or add a secondary grommet for sensor wires. Group the wires with loom/heat wrap. Label each wire at both ends. Leave 6-8 inches of slack on the engine side."
      },
      {
        "text": "Protect all engine-side wiring with heat-resistant loom",
        "detail": "Use braided loom or high-temp silicone wrap on every wire that runs near the exhaust manifolds, engine block, or headers. The oil sender and temp sender wires are right next to hot metal — they WILL melt without protection."
      }
    ]
  },
  {
    "id": 5,
    "n": 6,
    "stage": "TEST",
    "title": "Power-On Test",
    "time": "30 min",
    "goal": "Reconnect the battery, turn the key to ON (do NOT start the engine yet), and verify every HDX gauge powers up, lights up, and reads sensible values. This is the make-or-break moment. Find every wiring problem here, before the interior gets installed.",
    "critical": true,
    "tools": [
      "Multimeter",
      "Test light"
    ],
    "callouts": [
      {
        "type": "note",
        "text": "⚡ This is a critical checkpoint. Do NOT proceed past this phase until all gauges respond correctly. It's 10x harder to troubleshoot after the interior is installed."
      }
    ],
    "barney": {
      "topic": "Why power up before trim goes in",
      "text": "If a gauge is dead or a wire is hot that should not be, you want bare access to fix it — not to be pulling carpet and a console back out. Thirty minutes now saves a weekend later."
    },
    "substeps": [
      {
        "text": "Reconnect battery NEGATIVE terminal",
        "detail": "This is the moment of truth. Make sure no tools are left on the engine, no wires are dangling near moving parts, and no bare wire ends are touching metal."
      },
      {
        "text": "Turn key to ON — watch for gauge self-test sweep",
        "detail": "When the HDX powers up, ALL needles should sweep from zero to full scale and back. Both TFT displays should light up with the Dakota Digital logo, then show their default readings. This takes about 2-3 seconds."
      },
      {
        "text": "Verify TFT message center displays light up",
        "detail": "Both the tach and speedo have small TFT screens below the needle. They should show digital readouts. If one is dark, check the 8-pin display cable connection."
      },
      {
        "text": "Check backlight illumination (turn on headlights)",
        "detail": "With headlights on, rotate the dimmer knob. All gauge backlights should brighten and dim smoothly. If they don't, check the orange dimmer wire connection."
      },
      {
        "text": "Verify voltmeter shows battery voltage (12.4V+)",
        "detail": "With the engine off and key ON, the voltmeter should read 12.4-12.8V (healthy battery). If it reads 0 or shows nothing, the constant 12V red wire is not connected properly."
      },
      {
        "text": "Enter HDX menu — set cylinder count to 8",
        "detail": "Press and hold the HDX menu button (small button on the Control Box or accessible through the gauge face). Navigate to ENGINE SETUP > CYLINDERS > 8. This is critical for accurate tach reading on the big block."
      },
      {
        "text": "If any gauge doesn't respond, troubleshoot NOW — before finishing build",
        "detail": "Check each sensor wire at the Control Box. Use the multimeter to verify continuity from the sender to the Control Box connector. 90% of gauge issues are: (1) bad ground, (2) wrong connector, (3) broken wire."
      }
    ]
  },
  {
    "id": 6,
    "n": 7,
    "stage": "INT",
    "title": "Steering Column",
    "time": "2-3 hrs",
    "goal": "Mount the steering column to the dash support and firewall, attach the steering wheel, connect the turn signal / ignition / wiper switch wiring, and verify horn and turn signals work.",
    "tools": [
      "3/8\" socket set",
      "Torque wrench",
      "Steering wheel puller (if needed)",
      "Spline alignment marks"
    ],
    "substeps": [
      {
        "text": "Verify column clamp bracket on dash support is straight and aligned",
        "detail": "The column passes through a clamp on the dash support bracket. Make sure this clamp is centered and not bent. The column must sit straight or the steering wheel will be off-center."
      },
      {
        "text": "Feed column through firewall floor hole and dash opening",
        "detail": "Slide the column up from underneath. The column passes through a rubber boot in the floor and up through the dash opening. Have a helper guide it from inside the cabin."
      },
      {
        "text": "Align column to dash opening",
        "detail": "The column should be centered in the dash opening with equal gap all around. The turn signal lever should clear the dash face. Adjust the clamp position if needed."
      },
      {
        "text": "Tighten column clamp bolts: 3/8\"-16, 20 ft-lbs",
        "detail": "Use a torque wrench. Under-torquing will let the column move. Over-torquing will crush the column tube and make the steering bind."
      },
      {
        "text": "Connect turn signal, horn, and ignition wiring connectors",
        "detail": "These are typically keyed connectors — they only go in one way. If you labeled them earlier, match the labels. Test the turn signals with a test light before the steering wheel goes on."
      },
      {
        "text": "Install steering wheel — align spline marks",
        "detail": "The steering wheel hub has a master spline that aligns with the column shaft. Look for a dot, flat, or mark on both parts. The wheel should go straight-ahead when the front wheels point straight."
      },
      {
        "text": "Torque steering wheel nut: 35 ft-lbs",
        "detail": "Use a deep socket and torque wrench. Do NOT impact-gun this — you can damage the steering column bearings."
      },
      {
        "text": "Install horn button/contact",
        "detail": "The horn contact spring and button sit in the center of the wheel. Make sure the contact touches the steering shaft center. Test: honk the horn before moving on."
      },
      {
        "text": "Test turn signals, horn, hazards, and ignition switch",
        "detail": "Turn signals should click and flash. Horn should honk. Hazards should flash all 4 corners. Ignition should have OFF-ACC-ON-START positions. Fix any issues now."
      }
    ]
  },
  {
    "id": 7,
    "n": 8,
    "stage": "INT",
    "title": "Headliner & Upper Trim",
    "time": "3-5 hrs",
    "goal": "Install the 5-6 headliner bows into roof channels, stretch and glue the headliner fabric across the bows, then install sail panels, pillar trim, and the dome light. This is a 2-person job — don't try it alone.",
    "tools": [
      "3M headliner adhesive",
      "Flat plastic trim tool",
      "Utility knife",
      "Spring clamps",
      "Masking tape"
    ],
    "substeps": [
      {
        "text": "Install headliner bows (replace if bent or rusted)",
        "detail": "The headliner bows are metal rods that run front-to-back and hold the headliner fabric taut. There are typically 3-4 bows. They sit in clips on the roof inner structure. Slide them into the clips from the side."
      },
      {
        "text": "Install dome light wiring BEFORE headliner",
        "detail": "Route the dome light wire across the roof to the dome light location (usually center, above rear seat). Tape it to the roof metal so it won't sag below the headliner."
      },
      {
        "text": "Feed headliner material from rear to front",
        "detail": "Start at the rear window. Center the material. The headliner drapes over each bow. Work from the back forward, pulling gently to keep it taut and centered."
      },
      {
        "text": "Apply adhesive at edges, starting at rear",
        "detail": "Use 3M headliner adhesive. Spray both the headliner edge and the metal lip. Wait 30-60 seconds until tacky. Press firmly. Work around the perimeter."
      },
      {
        "text": "Install sail panels and windshield trim",
        "detail": "These trim pieces cover the headliner edges at the A-pillars and C-pillars. They snap into place over the headliner edge. Use a trim tool to pop them in."
      },
      {
        "text": "Install dome light housing and lens",
        "detail": "Mount the dome light base. Connect the wire. Test: the light should come on when a door opens."
      },
      {
        "text": "Trim excess headliner material with utility knife",
        "detail": "Carefully trim any material that extends below the trim pieces. Cut slowly — you can always trim more, but you can't add material back."
      }
    ]
  },
  {
    "id": 8,
    "n": 9,
    "stage": "INT",
    "title": "Carpet & Floor",
    "time": "2-3 hrs",
    "goal": "Lay jute padding over the sound deadener, drop the molded carpet kit in, cut accurate holes for seat bolts and pedal openings, then install sill plates and kick panels to lock the carpet down.",
    "tools": [
      "Flat trim tool",
      "Utility knife",
      "Spray adhesive"
    ],
    "substeps": [
      {
        "text": "Lay jute or mass-backed padding over Dynamat",
        "detail": "This padding goes between the Dynamat and the carpet. It provides cushion and additional sound insulation. Cut it to fit the floor area. It does NOT need to be glued — the carpet holds it in place."
      },
      {
        "text": "Cut padding around pedals, seat bolts, and console area",
        "detail": "Use a utility knife. Leave 1 inch of clearance around the gas/brake/clutch pedals. Mark seat bolt holes from underneath and cut X-shaped slits."
      },
      {
        "text": "Position molded carpet kit — start from firewall, work back",
        "detail": "Molded carpet kits are shaped to fit the floor pan contours. Start at the firewall (the front edge tucked under the dash). Then work the carpet backward over the trans tunnel and into the rear footwells."
      },
      {
        "text": "Press carpet into corners with flat tool",
        "detail": "The carpet needs to conform to every floor contour. Use a flat trim tool to push it into the corners along the rocker panels, around the trans tunnel, and at the firewall base."
      },
      {
        "text": "Cut holes for seat bolts from underneath",
        "detail": "Reach under the car and feel for the seat mounting bolt holes through the carpet/padding/Dynamat. Push a sharp awl or screwdriver up through. Then cut a small hole from above to expose each bolt hole. You need 4 per seat track."
      },
      {
        "text": "Verify carpet sits flat under console and seat areas",
        "detail": "Before installing seats and console, double-check: no lumps, no bunching at the trans tunnel, carpet edges tucked under the door sills."
      }
    ]
  },
  {
    "id": 9,
    "n": 10,
    "stage": "INT",
    "title": "Door Panels",
    "time": "2-3 hrs (both doors)",
    "goal": "Install the inner watershield (vapor barrier), then attach the door panel to the door with chrome screws + perimeter clips, and reinstall window crank, door handle, lock knob, and armrest.",
    "tools": [
      "Trim clip tool",
      "Phillips screwdriver",
      "Door panel clip pliers",
      "Horseshoe clip tool"
    ],
    "callouts": [
      {
        "type": "note",
        "text": "🔧 Use a trim panel removal tool for clips — screwdrivers damage paint and bend clips."
      }
    ],
    "substeps": [
      {
        "text": "Install new panel clips in door panel holes (18 per door)",
        "detail": "The original clips are almost always broken. Buy a full set of new clips. Press them into the holes in the door shell from the outside. They should sit flush."
      },
      {
        "text": "Verify window crank mechanism works freely",
        "detail": "Roll the window up and down before the panel goes on. If the window regulator is stiff, grease it now. Also check the door lock rod — it should move smoothly."
      },
      {
        "text": "Position door panel and press into clips firmly",
        "detail": "Start at the top edge, align the panel, then press along the bottom and sides. Each clip should \"pop\" in. Use your palm, not a hammer. If a clip doesn't engage, check its alignment."
      },
      {
        "text": "Install window crank with horseshoe clip",
        "detail": "The horseshoe clip (also called a C-clip) holds the window crank handle to the regulator shaft. Use the horseshoe clip tool: press the tool behind the crank, fish out the old clip space, and push the new clip on."
      },
      {
        "text": "Install door handle bezel and lock knob",
        "detail": "The chrome bezel snaps over the door handle opening from the front. The lock knob threads onto the lock rod from the top. Tighten finger-tight — don't use pliers or you'll scratch the chrome."
      },
      {
        "text": "Install armrest: 2x 1/4\"-20 screws per armrest",
        "detail": "The armrest mounting screws go through the door panel and into metal inserts or nuts behind the door shell. Hand-start both screws, then tighten alternately to pull the armrest down evenly."
      },
      {
        "text": "Test window crank and door lock operation",
        "detail": "Crank the window all the way up and down. Lock and unlock from both inside and outside. Everything should be smooth with no binding."
      }
    ]
  },
  {
    "id": 10,
    "n": 11,
    "stage": "INT",
    "title": "Console & Shifter",
    "time": "1-2 hrs",
    "goal": "Bolt the SS console shell to the trans tunnel, install the top plate and shifter boot, and verify the shifter operates through all gears without console interference.",
    "tools": [
      "Phillips screwdriver",
      "#8 screws",
      "Fish wire/coat hanger"
    ],
    "materials": "SS console shell · Console top plate / lid · Shifter plate · Mounting hardware",
    "substeps": [
      {
        "text": "Route stereo wiring and antenna cable through console path first",
        "detail": "Before dropping the console in, fish your stereo power wire, speaker wires, and antenna cable through the console from front to back (or the routing channel under/beside the console). Use a fish wire or coat hanger to pull them through."
      },
      {
        "text": "Position console on carpet — align with dash lower edge",
        "detail": "The console mounts between the seats, with its front edge meeting the dash face. Slide it into position. Check that the shifter handle passes through the shifter boot opening."
      },
      {
        "text": "Secure with 4x #8 Phillips screws to floor brackets",
        "detail": "The console has mounting ears or brackets underneath. Line up with the floor pan mounting holes. Start all 4 screws by hand, then tighten. Don't overtighten — you'll crack the console plastic."
      },
      {
        "text": "Install shifter trim plate and boot",
        "detail": "The chrome trim plate surrounds the shifter opening. The boot (leather or vinyl) sits between the plate and the shifter lever. Make sure the boot seals around the shifter to keep trans noise and fumes out."
      },
      {
        "text": "Install any console-mounted switches, power outlet, or cup holder",
        "detail": "If you're adding aftermarket accessories (USB ports, 12V outlet, etc.), install them in the console now while you have easy access underneath."
      }
    ]
  },
  {
    "id": 11,
    "n": 12,
    "stage": "INT",
    "title": "Seats & Seat Belts",
    "time": "1-2 hrs",
    "goal": "Bolt the bucket seats to the floor pan through the carpet, install seat belt anchors with Grade 8 bolts only, and verify everything is rock-solid. This is occupant restraint hardware — treat it accordingly.",
    "tools": [
      "1/2\" socket",
      "Torque wrench (ft-lbs)",
      "Grade 8 bolts for seat belts"
    ],
    "barney": {
      "topic": "Bolt grades: 5 vs 8",
      "text": "The lines on a bolt head tell you its strength — three lines is Grade 5, six lines is Grade 8. Seats and belts must use Grade 8. A Grade-5 bolt in a belt anchor can shear in a crash."
    },
    "substeps": [
      {
        "text": "Install seat tracks to floor: 5/16\"-18 bolts, torque to 30 ft-lbs (target, all 4 equally)",
        "detail": "Each seat has 2 tracks (left and right). Each track has 2 bolts. That's 8 total bolts for both seats. These bolt through the carpet, padding, Dynamat, and into the factory-welded nuts in the floor pan. Use a torque wrench — proper torque keeps the seats from shifting in a crash."
      },
      {
        "text": "Verify all 4 bolts per track are tight — no wobble",
        "detail": "Sit in each seat and rock side to side. Zero movement is the goal. If any bolt spins freely, the nut welded to the floor pan has broken loose — you'll need to weld or use a backing plate underneath."
      },
      {
        "text": "Install seat belt anchors: Grade 8 bolts ONLY, 30 ft-lbs",
        "detail": "Seat belt anchors are literally life-safety hardware. Use ONLY Grade 8 bolts (marked with 6 radial lines on the head). Do not reuse old bolts. Do not use hardware store bolts. Torque to 30 ft-lbs."
      },
      {
        "text": "Test seat adjustment — slides and reclines",
        "detail": "Pull the adjustment lever and slide the seat forward and back. It should move smoothly on the tracks. Test recline if equipped. Nothing should catch or bind."
      },
      {
        "text": "Test seat belt retraction and latching",
        "detail": "Pull each belt all the way out and let it retract. It should wind back smoothly. Latch and unlatch the buckle. If the retractor is sluggish, it may need replacement — do NOT drive with bad belts."
      }
    ]
  },
  {
    "id": 12,
    "n": 13,
    "stage": "INT",
    "title": "Rear Trim & Package Tray",
    "time": "1-2 hrs",
    "goal": "Install the rear seat bottom and back, quarter trim panels, and package tray. Wrap up the interior cosmetically.",
    "tools": [
      "Trim clip tool",
      "Phillips screwdriver"
    ],
    "substeps": [
      {
        "text": "Install rear side panels (quarter trim)",
        "detail": "These panels cover the inner quarter panel area behind the rear seat. They typically clip in with the same style clips as the door panels. Start from the top and work down."
      },
      {
        "text": "Install rear seat back panel",
        "detail": "This panel sits behind the rear seat backrest. It clips or screws into the package tray support. Make sure it clears the rear seat hinges."
      },
      {
        "text": "Install package tray (rear deck)",
        "detail": "The package tray is the flat panel between the rear seat and the rear window. It rests on brackets. If you have rear speakers, install the speaker grilles in the package tray before dropping it in."
      },
      {
        "text": "Install rear window trim and moldings",
        "detail": "The chrome or vinyl trim around the rear window snaps into clips. Work from one corner all the way around. Use a trim tool — don't pry with screwdrivers (they scratch chrome)."
      },
      {
        "text": "Install trunk weatherstripping",
        "detail": "Run a bead of weatherstrip adhesive around the trunk opening lip. Press the new weatherstrip into the adhesive. Close the trunk and check for even compression all the way around."
      }
    ]
  },
  {
    "id": 13,
    "n": 14,
    "stage": "INT",
    "title": "Stereo & Accessories",
    "time": "2-3 hrs",
    "goal": "Wire and mount an aftermarket head unit in the radio opening, run new speaker wires to all speaker locations, and verify everything plays without picking up engine noise.",
    "tools": [
      "Wire strippers",
      "Crimpers",
      "Panel removal tools",
      "Drill (if mounting speakers)"
    ],
    "substeps": [
      {
        "text": "Mount head unit in dash or console opening",
        "detail": "The Hi-Tech Classics kit has a radio opening in the dash face. Use the mounting sleeve and brackets that came with your head unit. The radio should sit flush and straight in the opening."
      },
      {
        "text": "Connect head unit wiring: constant 12V, switched 12V, ground",
        "detail": "Constant 12V keeps the clock and presets alive. Switched 12V turns the radio on/off with the key. Ground to the dash support bracket. Use the head unit's wiring harness adapter if available."
      },
      {
        "text": "Connect speaker wires to head unit",
        "detail": "Run speaker wires to each location: front doors (left and right), rear deck or rear quarter panels. Use 16 AWG speaker wire minimum for good sound. Keep speaker wires away from power wires to prevent noise."
      },
      {
        "text": "Mount door speakers",
        "detail": "If your doors don't have speaker holes, you may need to drill or use speaker mounting brackets. 6x9 or 6.5\" speakers are common for A-body doors. Test each speaker before closing up the door panel."
      },
      {
        "text": "Mount rear speakers in package tray or quarter panels",
        "detail": "Rear 6x9s in the package tray are the classic setup. Cut the holes with a jigsaw or hole saw. Mount with screws through the grille/trim ring."
      },
      {
        "text": "Install antenna and route cable",
        "detail": "Mount the antenna in the fender (right rear is factory location). Route the coax cable along the inner fender, through a grommet, and to the head unit. Don't run the antenna cable alongside power wires."
      },
      {
        "text": "Test all speakers, balance, and fader",
        "detail": "Play music and check: all speakers working, no buzzing or distortion, balance left/right, fader front/rear. If a speaker buzzes, it may be touching the door skin — add foam gasket material."
      },
      {
        "text": "Install remaining accessories",
        "detail": "Cigarette lighter/power outlet (if not installed), rearview mirror (adhesive mount or screw mount), sun visors, coat hooks, dome light switch check, underdash courtesy lights."
      }
    ]
  },
  {
    "id": 14,
    "n": 15,
    "stage": "CAL",
    "title": "HDX Calibration & Setup",
    "time": "1-2 hrs",
    "goal": "Tell the HDX what engine you have, what tires you're running, where the fuel sender's empty and full points are, and pick a backlight color. Without calibration, the gauges read whatever the factory defaults are — which is rarely correct for a 1972 396/454.",
    "tools": [
      "Phone with Dakota Digital app (Bluetooth)",
      "Tire pressure gauge",
      "Known tire size info"
    ],
    "callouts": [
      {
        "type": "note",
        "text": "📱 You can calibrate via the capacitive touch buttons on the cluster face OR via the Dakota Digital Bluetooth app on your phone. The app is easier for first-time setup."
      },
      {
        "type": "note",
        "text": "If Bluetooth won't connect: ensure ignition is ON, forget the device in phone settings and re-pair, update the app to the latest version."
      },
      {
        "type": "note",
        "text": "If the kit is old or paperwork is missing, call tech support and give them the cluster serial number — they can look up the original spec sheet, including pulses-per-mile for the speed sensor."
      }
    ],
    "barney": {
      "topic": "Calibrating the fuel gauge",
      "text": "The HDX learns your tank by reading the sender at empty and full. If the gauge reads backwards, the sender is inverted — flip the setting in the menu instead of rewiring. Cylinder count is set the same way: tell the box it is an 8 and the tach math is correct."
    },
    "substeps": [
      {
        "text": "Initial Power-On Sequence"
      },
      {
        "text": "Speedometer Calibration"
      },
      {
        "text": "Fuel Gauge Calibration"
      },
      {
        "text": "Tachometer Setup"
      },
      {
        "text": "Backlight Color"
      },
      {
        "text": "Bluetooth App"
      },
      {
        "text": "Dakota Digital Resources"
      },
      {
        "text": "Download the Dakota Digital app on your phone",
        "detail": "Search \"Dakota Digital\" in the App Store or Google Play. The app connects to the HDX via Bluetooth. It provides easier access to all calibration menus than the physical buttons."
      },
      {
        "text": "Pair your phone with the HDX Control Box via Bluetooth",
        "detail": "In the app, select \"Connect to HDX.\" The Control Box will appear as \"HDX-70C\" or similar. Tap to pair. If it doesn't appear, cycle the ignition off and on."
      },
      {
        "text": "Set gauge color — choose from 30+ color options",
        "detail": "The HDX supports over 30 backlight colors for the gauges and TFT displays. You can set them all the same or mix colors. Orange, red, and green are popular for the SS theme."
      },
      {
        "text": "Calibrate speedometer: enter tire diameter and axle ratio",
        "detail": "Go to SPEED SETUP in the menu. Enter your tire diameter (e.g., 275/60R15 = 28.0\" diameter) and rear axle ratio (e.g., 3.73:1). The HDX calculates speed from the pulse sensor output. If you have GPS, you can also use GPS auto-calibration mode."
      },
      {
        "text": "Calibrate fuel level: set empty and full points",
        "detail": "You need to do this with the car running (or at least key-ON with a known fuel level). Go to FUEL SETUP. With the tank empty, hit \"SET EMPTY.\" Fill the tank, hit \"SET FULL.\" The HDX interpolates between these two points. If your sender is 0-90 ohm (factory GM), it should be close to default."
      },
      {
        "text": "Set tachometer: verify cylinder count = 8",
        "detail": "ENGINE SETUP > CYLINDERS > 8. If you have an aftermarket ignition (MSD, etc.), you may also need to set the spark type."
      },
      {
        "text": "Configure TFT message center displays",
        "detail": "Each TFT can show different readouts. Common setups: LEFT TFT = digital RPM, gear position, or battery voltage. RIGHT TFT = digital speed, odometer, trip, or clock. Configure in the display menu."
      },
      {
        "text": "Set warning thresholds",
        "detail": "The HDX can flash warnings when values go out of range. Set: oil pressure low warning (under 10 PSI), water temp high warning (over 230°F), voltage low warning (under 11V). These can save your engine."
      }
    ]
  },
  {
    "id": 15,
    "n": 16,
    "stage": "RECOM",
    "title": "Recommissioning (3-Year Sit Recovery)",
    "time": "4-6 hrs",
    "goal": "Bring a car that's sat for 3 years back to safe, running condition. Every fluid gets drained and replaced, every brake component gets inspected, the fuel system gets cleaned, and you do a controlled first-start with oil-pressure verification before the engine ever sees full RPM.",
    "tools": [
      "Fresh fluids (oil, coolant, brake fluid, trans fluid, power steering)",
      "Fuel stabilizer",
      "Battery charger",
      "Jack stands",
      "Brake bleeder kit"
    ],
    "callouts": [
      {
        "type": "warn",
        "text": "🛑 The car has sat for 3 years. Do NOT just turn the key. Every fluid, belt, and brake component needs inspection before starting."
      }
    ],
    "barney": {
      "topic": "Why prime the oil pump",
      "text": "After three years the oil has drained off every bearing surface. Crank it dry and metal rubs metal for several seconds — that is most of an engine’s wear in one start. Prime the pump (or spin it with a drill) until you see pressure, then start."
    },
    "substeps": [
      {
        "text": "Install new battery or charge existing battery fully",
        "detail": "If the car sat 3 years, the battery is dead. A new battery is recommended. If reusing: charge it on a slow charger (2A) for 24-48 hours. Test: it should hold 12.6V+ with no load."
      },
      {
        "text": "Drain and replace engine oil + filter",
        "detail": "Old oil has moisture and acids from condensation. Drain it completely. Replace the filter. Fill with fresh oil (10W-30 conventional or 10W-40 for the big block). Check the dipstick after filling."
      },
      {
        "text": "Drain and replace coolant",
        "detail": "Open the radiator petcock and drain the old coolant. It's probably rusty-brown. Flush with plain water. Refill with fresh 50/50 coolant mix. Check for any hose cracks — replace any that are hard, cracked, or swollen."
      },
      {
        "text": "Inspect all rubber hoses (coolant, heater, vacuum, fuel)",
        "detail": "Squeeze every rubber hose. If it cracks, is rock-hard, or feels mushy — replace it. Rubber deteriorates sitting still more than it does running. Check heater hoses, upper/lower radiator hoses, and all vacuum lines."
      },
      {
        "text": "Check brake fluid level and condition",
        "detail": "Open the master cylinder. The fluid should be clear or light amber. If it's dark brown or black, flush the entire system. Brake fluid absorbs moisture over time and loses its boiling point."
      },
      {
        "text": "Bleed brakes at all four wheels",
        "detail": "Start at the wheel farthest from the master cylinder (usually right rear) and work toward the closest (left front). Use a bleeder kit or have a helper pump the pedal. Bleed until clean fluid comes out with no bubbles."
      },
      {
        "text": "Check and replace fuel — drain old gas if possible",
        "detail": "3-year-old gas is varnished and will gum up the carburetor. Drain as much as you can from the tank. Add fresh gas with fuel stabilizer. If the car has a fuel filter (inline or in the carb), replace it."
      },
      {
        "text": "Inspect belts and replace if cracked",
        "detail": "Fan belt, alternator belt, power steering belt, AC belt (if equipped). If any belt has cracks on the inside surface, replace it. Belts are cheap; a thrown belt can overheat your engine in minutes."
      },
      {
        "text": "Check tire pressure and inspect for dry rot",
        "detail": "Inflate to spec (usually 28-32 PSI for the era). Look at the sidewalls for cracks (dry rot). If the sidewalls have deep cracks, the tires are unsafe — replace before driving."
      },
      {
        "text": "Verify ground strap from engine block to frame/body",
        "detail": "The ground strap is a braided cable that connects the engine to the frame. If it's missing, corroded, or broken, the entire electrical system will have problems. Clean the mounting points and replace if needed."
      },
      {
        "text": "Pull coil wire — crank engine 15 seconds to build oil pressure",
        "detail": "With the coil wire disconnected (so the engine cannot start), crank the starter for 15 seconds. This pumps oil through the engine before first fire. Wait 30 seconds. Crank again for 15 seconds. Watch the oil pressure gauge — it should show some pressure during cranking."
      },
      {
        "text": "Reconnect coil wire — start engine, let idle",
        "detail": "Do NOT rev it. Let it idle. Watch the gauges: oil pressure should come up within seconds (30+ PSI at idle is normal). Water temp will slowly rise. Listen for any knocking, ticking, or unusual noises."
      },
      {
        "text": "First drive: short, slow loop — check everything",
        "detail": "Drive around the block. Go slow. Test brakes (they may be soft initially). Check steering response. Listen for suspension noises. Watch all gauges. Come back, check under the car for any fluid leaks."
      },
      {
        "text": "Re-torque wheel lug nuts after first 50 miles: 85-100 ft-lbs",
        "detail": "Especially if the wheels were removed during the build. Lug nuts can settle and loosen. Use a torque wrench in a star pattern."
      }
    ]
  },
  {
    "id": 16,
    "n": 17,
    "stage": "FINAL",
    "title": "Final Walk-Through Inspection",
    "time": "1 hr",
    "goal": "Methodically walk every fastener, every connector, and every fluid one last time before you call the build done. This is the final quality gate. One missed bolt or one loose connector here can sideline you on the road.",
    "tools": [
      "Torque wrench",
      "Multimeter",
      "Inspection mirror"
    ],
    "substeps": [
      {
        "text": "Check every ground connection: firewall, dash, engine",
        "detail": "With the multimeter, measure resistance from each ground point to the battery negative. It should be under 0.5 ohms. Tighten any loose grounds."
      },
      {
        "text": "Verify all HDX gauges read correctly at key-ON",
        "detail": "Before starting the engine: voltmeter should show battery voltage. Oil and temp should read low. Fuel should match your tank level. Tach and speedo should be at zero."
      },
      {
        "text": "Test ALL lights: headlights (high/low), markers, brake, reverse, turn signals",
        "detail": "Have someone press the brake pedal while you check rear lights. Verify high and low beams, parking lights, turn signals (all 4 corners), reverse lights, and license plate light."
      },
      {
        "text": "Test horn, wipers, defroster, and heater",
        "detail": "Horn should be loud and clear. Wipers should operate on all speeds. Defroster fan should blow air against the windshield. Heater should produce warm air when the engine is at operating temperature."
      },
      {
        "text": "Check for any rattles, loose trim, or gaps",
        "detail": "Drive over a bumpy road and listen. Check all door panels, console, dash pad, rear trim for anything loose. Tighten or add foam padding behind any rattling trim pieces."
      },
      {
        "text": "Take photos of the completed build",
        "detail": "You earned this. Document everything. Future you (or the next owner) will want to see how clean the installation looks."
      }
    ]
  }
];

const SKILLS = [
  { icon: '✊', title: 'Crimp & Terminate a Connector', body: 'Strip ⅜ inch, insert to the stop, crimp the barrel (not the insulation window) with the ratcheting tool. Tug-test every crimp — if it slides, redo it.' },
  { icon: '🔢', title: 'Read a Multimeter (V / Continuity / Ω)', body: 'Volts for live circuits, continuity (beep) for unpowered connections, ohms for senders. Black lead to ground, red to the point you are testing.' },
  { icon: '📍', title: 'Back-Probe Without Breaking a Connector', body: 'Slide the probe in from the wire side of a seated connector so you read voltage live, without unplugging and losing the signal.' },
  { icon: '🔧', title: 'Install NPT Senders with Teflon Tape', body: 'Two wraps clockwise, hand-tight plus a quarter turn. Tapered threads seal by wedging — over-tightening cracks the boss.' },
  { icon: '🧵', title: 'Route & Bundle Wires (avoid EMI & damage)', body: 'Keep signal wires 6 inches from coil and plug wires. Loom and zip every 12 inches. Never zip a harness to a moving or hot part.' },
  { icon: '🔥', title: 'Install Heat-Shrink Properly', body: 'Slide it on before you crimp. Heat evenly until it grips and the adhesive weeps at the ends — do not scorch it.' },
  { icon: '🔩', title: 'Identify Bolt Grades (5 vs 8)', body: 'Count the head lines: three = Grade 5, six = Grade 8. Safety fasteners (seats, belts) must be Grade 8.' },
  { icon: '🎯', title: 'Use a Torque Wrench', body: 'Set the value, pull smooth and steady until it clicks once. Do not keep pulling. Back off and store at the lowest setting.' },
];

const GLOSSARY = [
  { term: 'Constant 12V', def: 'Power that is hot all the time, even key-off — used for memory, clock, horn.' },
  { term: 'Switched 12V', def: 'Power that is only hot with the key in ON or ACC — used for gauges and the radio.' },
  { term: 'EMI', def: 'Electromagnetic interference — noise from coil and plug wires that can make a tach or sender read wrong.' },
  { term: 'NPT', def: 'National Pipe Taper — threads that seal by wedging tighter, used for senders. Sealed with Teflon tape.' },
  { term: '3-wire sender', def: 'A sender with power, ground, and signal wires for precise resistance readings the HDX expects.' },
  { term: 'Ground', def: 'The return path to the battery negative. A bad ground is the #1 cause of weird gauge behavior.' },
  { term: 'Star washer', def: 'A toothed washer that bites through paint to make a clean metal-to-metal ground.' },
  { term: 'Bulkhead', def: 'The firewall pass-through where the engine and interior harnesses connect.' },
  { term: 'VSS', def: 'Vehicle speed sensor — feeds the speedometer, either cable-drive or electronic pulse.' },
  { term: 'Ohms (Ω)', def: 'Unit of electrical resistance. Senders change resistance with temperature, pressure, or fuel level.' },
  { term: 'Twisted pair', def: 'Two signal wires twisted together so EMI cancels out — used for sensitive sender signals.' },
  { term: 'BIM', def: 'Bus Interface Module — Dakota Digital expansion that adds inputs to the HDX system.' },
  { term: 'Bezel', def: 'The trim ring that frames the gauge cluster in the dash.' },
  { term: 'Loom / split-loom', def: 'Plastic conduit that protects and bundles a group of wires.' },
  { term: 'Continuity', def: 'An unbroken electrical path. A multimeter beeps when continuity exists.' },
  { term: 'Grade 8 bolt', def: 'A high-strength bolt (six head lines) required for safety fasteners like seats and belts.' },
  { term: 'Recommission', def: 'Bringing a vehicle that has sat for years back to safe operating condition.' },
  { term: 'Sender', def: 'A sensor that converts a physical value (pressure, temp, level) into a resistance the gauge reads.' },
  { term: 'Pulse count', def: 'Number of electronic pulses per mile/rev the HDX uses to calibrate speed and RPM.' },
  { term: 'TFT', def: 'Thin-film transistor — the two color message screens in the HDX-70C-CVL cluster.' },
];

window.CHEVELLE_DATA = { STAGE, PHASES, SKILLS, GLOSSARY };
