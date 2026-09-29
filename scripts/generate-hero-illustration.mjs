// Generates the isometric "delivery pipeline" illustration.
//   public/brand/hero-cubes.svg           static; embedded in the Universal Login page template
//   public/brand/hero-cubes-animated.svg  landing hero; a little belayer lowers the front cube from a
//                                         pulley into its slot, pulls the rope back in, and waves
//                                         (CSS animation)
// Colors are CSS variables with light-theme fallbacks so the SVGs render standalone and can be
// themed inline. Usage: node scripts/generate-hero-illustration.mjs
import { writeFileSync } from "node:fs"

const S = 76 // cube edge length
const A = S * Math.cos(Math.PI / 6) // horizontal iso offset
const B = S * 0.5 // vertical iso offset
const X0 = 330
const Y0 = 70

const bbox = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity, on: true }
const P = (i, j, k = 0) => {
  const p = [X0 + (i - j) * A, Y0 + (i + j) * B - k * S]
  if (bbox.on) {
    bbox.x0 = Math.min(bbox.x0, p[0]); bbox.y0 = Math.min(bbox.y0, p[1])
    bbox.x1 = Math.max(bbox.x1, p[0]); bbox.y1 = Math.max(bbox.y1, p[1])
  }
  return p
}
const pts = (arr) => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
const v = (name, fallback) => `var(--${name}, ${fallback})`
const cls = (name, on) => (on ? ` class="${name}"` : "")

function faces(i, j, k = 0, size = 1) {
  const q = (di, dj, dk) => P(i + di * size, j + dj * size, k + dk * size)
  return {
    top: [q(0, 0, 1), q(1, 0, 1), q(1, 1, 1), q(0, 1, 1)],
    left: [q(0, 1, 1), q(1, 1, 1), q(1, 1, 0), q(0, 1, 0)],
    right: [q(1, 0, 1), q(1, 1, 1), q(1, 1, 0), q(1, 0, 0)],
    center: q(0.5, 0.5, 0.5),
  }
}

// Evenly spaced dots on a face, given its 4 corners (a->b is u, a->d is v)
function faceDots([a, b, , d], n = 3, r = 3.2) {
  const out = []
  for (let u = 1; u <= n; u++)
    for (let w = 1; w <= n; w++) {
      const fu = u / (n + 1)
      const fw = w / (n + 1)
      const x = a[0] + (b[0] - a[0]) * fu + (d[0] - a[0]) * fw
      const y = a[1] + (b[1] - a[1]) * fu + (d[1] - a[1]) * fw
      out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"/>`)
    }
  return out.join("")
}

function cube(kind, i, j, k = 0, animated = false) {
  const f = faces(i, j, k)
  const [cx, cy] = f.center
  const parts = []
  if (kind === "wire" || kind === "wire-dots" || kind === "wire-plates") {
    parts.push(
      `<g style="fill:${v("cube-wire-fill", "rgba(255,255,255,0.55)")};stroke:${v("cube-wire", "#9aa1ac")}" stroke-width="1.2" stroke-dasharray="3 3" stroke-linejoin="round">`,
      `<polygon points="${pts(f.left)}"/><polygon points="${pts(f.right)}"/><polygon points="${pts(f.top)}"/></g>`
    )
    if (kind === "wire-dots") {
      parts.push(
        `<g style="fill:${v("cube-dot", "#b9bfc8")}">${faceDots(f.left)}${faceDots(f.right)}</g>`
      )
    }
    if (kind === "wire-plates") {
      const plates = [0.28, 0.52, 0.76].map((h) => {
        const g = faces(i + 0.18, j + 0.18, k + h - 0.64, 0.64)
        return `<polygon${cls("blay-plate", animated)} points="${pts(g.top)}"/>`
      })
      parts.push(
        `<g style="fill:${v("cube-plate-fill", "rgba(255,255,255,0.8)")};stroke:${v("cube-accent", "#1bb4e4")}" stroke-width="1.2" stroke-dasharray="3 2.5">${plates.join("")}</g>`
      )
    }
  }
  if (kind === "glass") {
    parts.push(
      `<circle${cls("blay-glow", animated)} cx="${cx.toFixed(1)}" cy="${(cy + 6).toFixed(1)}" r="${(S * 0.55).toFixed(1)}" fill="url(#cube-glow)" filter="url(#cube-blur)"/>`,
      `<g style="stroke:${v("cube-accent", "#1bb4e4")}" stroke-width="1.2" stroke-dasharray="3 2.5" stroke-linejoin="round">`,
      `<polygon points="${pts(f.left)}" style="fill:${v("cube-glass-left", "rgba(214,241,251,0.55)")}"/>`,
      `<polygon points="${pts(f.right)}" style="fill:${v("cube-glass-right", "rgba(233,248,253,0.55)")}"/>`,
      `<polygon points="${pts(f.top)}" style="fill:${v("cube-glass-top", "rgba(244,251,254,0.6)")}"/></g>`
    )
  }
  if (kind === "solid") {
    parts.push(
      `<g style="stroke:${v("cube-solid-stroke", "#16abdc")}" stroke-width="1.2" stroke-linejoin="round">`,
      `<polygon points="${pts(f.left)}" style="fill:${v("cube-solid-left", "#b7e6f7")}"/>`,
      `<polygon points="${pts(f.right)}" style="fill:${v("cube-solid-right", "#d3f0fa")}"/>`,
      `<polygon points="${pts(f.top)}" style="fill:${v("cube-solid-top", "#e8f8fd")}"/></g>`
    )
  }
  return parts.join("")
}

// Platform outline under the pipeline, with small diamond markers at corners
function platform(i0, j0, i1, j1, animated = false) {
  const c = [P(i0, j0), P(i1, j0), P(i1, j1), P(i0, j1)]
  const diamond = ([x, y]) =>
    `<polygon points="${pts([
      [x, y - 5],
      [x + 8.6, y],
      [x, y + 5],
      [x - 8.6, y],
    ])}" style="fill:${v("cube-platform-marker-fill", "#ffffff")}"/>`
  return [
    `<g style="stroke:${v("cube-accent", "#1bb4e4")};fill:none" stroke-width="1.2" stroke-dasharray="6 5" opacity="0.8">`,
    `<polygon${cls("blay-march", animated)} points="${pts(c)}"/>`,
    `</g>`,
    `<g style="stroke:${v("cube-accent", "#1bb4e4")}" stroke-width="1.2" opacity="0.9">${c.map(diamond).join("")}</g>`,
  ].join("")
}

// Background iso dot grid
function dotGrid() {
  const dots = []
  for (let i = -6; i <= 14; i++)
    for (let j = -8; j <= 9; j++) {
      const [x, y] = P(i * 0.5, j * 0.5, -0.4)
      dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.3"/>`)
    }
  return `<g style="fill:${v("cube-grid", "#cfd6de")}" mask="url(#cube-fade)">${dots.join("")}</g>`
}

// ---------------------------------------------------------------------------
// Belay animation pieces (animated variant only)
// ---------------------------------------------------------------------------

// The release being belayed: the front-right "shipped" cube
const BELAYED = { i: 4.15, j: 1.45, k: 0 }
const LIFT = 164 // how far above its slot the cube starts, in SVG units
// Top anchor: the bottom-front corner of the top "plan" cube (the release is lowered from the plan)
const ANCHOR = { i: 2.35, j: -0.45, k: 1.5 }
// Where the belayer stands: open ground to the right of the platform
const BELAYER = { i: 6.25, j: 0.55 }

// Shared rope geometry (absolute SVG coordinates)
function ropeGeometry() {
  const [ax, ay] = P(BELAYED.i + 0.5, BELAYED.j + 0.5, BELAYED.k + 1) // bolt on the cube's top face
  const [anx, any] = P(ANCHOR.i, ANCHOR.j, ANCHOR.k)
  const r = anx - ax // pulley radius, so the block-side rope hangs tangent to it
  const pulley = { x: anx, y: any + 4.4 + r, r }
  const [fx, fy] = P(BELAYER.i, BELAYER.j, 0) // belayer's feet
  const feet = { x: fx, y: fy }
  const device = { x: fx - 1, y: fy - 20 } // belay device on the harness
  // Tangent point where the rope leaves the pulley toward the belay device
  const dx = device.x - pulley.x
  const dy = device.y - pulley.y
  const phi = Math.atan2(dy, dx)
  const alpha = Math.acos(r / Math.hypot(dx, dy))
  const leave = { x: pulley.x + r * Math.cos(phi - alpha), y: pulley.y + r * Math.sin(phi - alpha) }
  const len = Math.hypot(device.x - leave.x, device.y - leave.y)
  const u = { x: (leave.x - device.x) / len, y: (leave.y - device.y) / len } // device -> pulley
  return { ax, ay, anchor: { x: anx, y: any }, pulley, feet, device, leave, u }
}

const f1 = (n) => n.toFixed(1)
const ropeStroke = (extra = "") =>
  `style="stroke:${v("belay-rope", "#0278d5")}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"${extra}`
const sheathStroke = (cls = "") =>
  `${cls ? `class="${cls}" ` : ""}style="stroke:${v("belay-rope-sheath", "#7fdcf7")}" stroke-width="3" stroke-dasharray="2 5" fill="none"`

// Where the cube will land, plus the ripple when it touches down (drawn under the cubes)
function belayTarget({ i, j }) {
  const foot = pts([P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)])
  return [
    `<polygon class="blay-target" points="${foot}" style="fill:${v("cube-glass-top", "rgba(244,251,254,0.6)")};stroke:${v("cube-accent", "#1bb4e4")}" stroke-width="1.2" stroke-dasharray="4 3"/>`,
    `<polygon class="blay-ripple" points="${foot}" style="stroke:${v("cube-accent", "#1bb4e4")}" stroke-width="1.6" fill="none"/>`,
  ].join("")
}

// The cube itself, with an anchor bolt on its top face and a landing flash
function belayedCube({ i, j, k }) {
  const f = faces(i, j, k)
  const { ax, ay } = ropeGeometry()
  return [
    `<g class="blay-load">`,
    cube("solid", i, j, k),
    `<polygon class="blay-flash" points="${pts(f.top)}" style="fill:${v("belay-flash", "#7fdcf7")}"/>`,
    `<ellipse cx="${f1(ax)}" cy="${f1(ay)}" rx="5" ry="2.9" style="fill:${v("belay-metal", "#4b5563")}"/>`,
    `</g>`,
  ].join("")
}

// Rope system: pulley on the anchor, a moving block-side strand (clipped at the pulley) with the
// carabiner, and the strand over the pulley down through the belay device to a pile at the feet
function rope() {
  const g = ropeGeometry()
  const { ax, ay, anchor, pulley, device, leave, feet } = g
  const clipTop = ay - 27
  const brakeHand = { x: feet.x + 10, y: feet.y - 14 }
  const pile = { x: feet.x + 24, y: feet.y }
  const overPulley = `M${f1(pulley.x - pulley.r)} ${f1(pulley.y)}A${f1(pulley.r)} ${f1(pulley.r)} 0 0 1 ${f1(leave.x)} ${f1(leave.y)}L${f1(device.x)} ${f1(device.y)}`
  // Curves through the brake hand's rest position (the quadratic's midpoint)
  const tail = `M${f1(device.x)} ${f1(device.y)}Q${f1(2 * brakeHand.x - (device.x + pile.x - 1) / 2)} ${f1(2 * brakeHand.y - (device.y + pile.y - 1.5) / 2)} ${f1(pile.x - 1)} ${f1(pile.y - 1.5)}`
  const metal = v("belay-metal", "#4b5563")
  return [
    // Block-side strand + carabiner, lowered and raised with the cube
    `<g clip-path="url(#blay-below-pulley)"><g class="blay-rope">`,
    `<line x1="${f1(ax)}" y1="${f1(ay - 1000)}" x2="${f1(ax)}" y2="${f1(clipTop + 2)}" ${ropeStroke()}/>`,
    `<line x1="${f1(ax)}" y1="${f1(ay - 1000)}" x2="${f1(ax)}" y2="${f1(clipTop + 2)}" ${sheathStroke()}/>`,
    `<rect x="${f1(ax - 6.5)}" y="${f1(clipTop)}" width="13" height="25" rx="6.5" style="stroke:${metal}" stroke-width="2.4" fill="none"/>`,
    `<line x1="${f1(ax + 6.5)}" y1="${f1(clipTop + 7)}" x2="${f1(ax + 3)}" y2="${f1(clipTop + 18)}" style="stroke:${v("belay-metal-light", "#9aa1ac")}" stroke-width="1.6" stroke-linecap="round"/>`,
    `</g></g>`,
    // Belayer-side strand; its braid "feeds" through the device while lowering
    `<path d="${overPulley}" ${ropeStroke()}/>`,
    `<path d="${overPulley}" ${sheathStroke("blay-feed")}/>`,
    `<path d="${tail}" ${ropeStroke()}/>`,
    `<g ${ropeStroke()}><ellipse cx="${f1(pile.x)}" cy="${f1(pile.y)}" rx="7.5" ry="2.4"/><ellipse cx="${f1(pile.x - 0.5)}" cy="${f1(pile.y - 2.2)}" rx="5" ry="1.8"/></g>`,
    // Pulley hanging from the anchor corner
    `<line x1="${f1(anchor.x)}" y1="${f1(anchor.y)}" x2="${f1(pulley.x)}" y2="${f1(pulley.y - pulley.r)}" style="stroke:${metal}" stroke-width="2" stroke-linecap="round"/>`,
    `<circle cx="${f1(anchor.x)}" cy="${f1(anchor.y)}" r="2.4" style="fill:${metal}"/>`,
    `<circle cx="${f1(pulley.x)}" cy="${f1(pulley.y)}" r="${f1(pulley.r)}" style="fill:${v("belay-pulley-fill", "#ffffff")};stroke:${metal}" stroke-width="2"/>`,
    `<circle cx="${f1(pulley.x)}" cy="${f1(pulley.y)}" r="1.8" style="fill:${metal}"/>`,
  ].join("")
}

// A little belayer (side view, facing the block): helmet, harness, belay device, brake hand low.
// Jointed so it can bend at the hip, turn its head, and bend both elbows (the beer break).
function belayerJoints() {
  const { feet, device, u } = ropeGeometry()
  const pt = (x, y) => ({ x: feet.x + x, y: feet.y + y })
  return {
    feet,
    device,
    hip: pt(3, -19),
    neck: pt(7.5, -38.5),
    shoulder: pt(7, -35),
    guideElbow: pt(-1.5, -32.5),
    guideHand: { x: device.x + u.x * 17, y: device.y + u.y * 17 }, // on the rope, toward the pulley
    brakeElbow: pt(13, -25),
    brakeHand: pt(10, -14),
  }
}

function belayer() {
  const { feet, device, hip, neck, shoulder, guideElbow, guideHand, brakeElbow, brakeHand } =
    belayerJoints()
  const pt = (x, y) => ({ x: feet.x + x, y: feet.y + y })
  const xy = (p) => `${f1(p.x)} ${f1(p.y)}`
  const at = (x, y) => xy(pt(x, y))
  const origin = (p) => `transform-origin:${f1(p.x)}px ${f1(p.y)}px`
  const legs = v("belayer-legs", "#4b5563")
  const jacket = v("belayer-jacket", "#14120b")
  const skin = v("belayer-skin", "#f0c6a4")
  const limb = (color, w) => `style="stroke:${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"`
  const shadow = `style="fill:${v("belayer-shadow", "rgba(20,18,11,0.1)")}"`
  const g = guideHand
  return [
    `<ellipse cx="${f1(feet.x)}" cy="${f1(feet.y + 1)}" rx="17" ry="3.6" ${shadow}/>`,
    `<ellipse cx="${f1(feet.x - 22)}" cy="${f1(feet.y + 0.9)}" rx="9" ry="2.2" ${shadow}/>`,
    `<g class="blay-lean" style="${origin(feet)}">`,
    // legs (wide stance) and shoes
    `<path d="M${at(9, 0)}L${at(7, -9)}L${at(3, -19)}" ${limb(legs, 4.6)}/>`,
    `<path d="M${at(-10, 0)}L${at(-4, -9)}L${at(3, -19)}" ${limb(legs, 4.6)}/>`,
    `<g style="fill:${jacket}"><ellipse cx="${f1(feet.x - 11)}" cy="${f1(feet.y - 0.6)}" rx="3.6" ry="1.9"/><ellipse cx="${f1(feet.x + 9)}" cy="${f1(feet.y - 0.6)}" rx="3.6" ry="1.9"/></g>`,
    `<g class="blay-bend" style="${origin(hip)}">`,
    // brake arm (behind the body): feeds rope while lowering, later cracks the can
    `<g class="blay-brake" style="${origin(shoulder)}">`,
    `<path d="M${xy(shoulder)}L${xy(brakeElbow)}" ${limb(jacket, 4)}/>`,
    `<g class="blay-brake-fore" style="${origin(brakeElbow)}">`,
    `<path d="M${xy(brakeElbow)}L${xy(brakeHand)}" ${limb(jacket, 4)}/>`,
    `<circle cx="${f1(brakeHand.x)}" cy="${f1(brakeHand.y)}" r="2.3" style="fill:${skin}"/>`,
    `</g></g>`,
    // torso
    `<path d="M${xy(hip)}L${xy(shoulder)}" ${limb(jacket, 9)}/>`,
    // head and helmet (tilts back to drink)
    `<g class="blay-head" style="${origin(neck)}">`,
    `<circle cx="${f1(feet.x + 9)}" cy="${f1(feet.y - 43)}" r="5.6" style="fill:${skin}"/>`,
    `<path d="M${at(3.1, -43.6)}A5.9 5.9 0 0 1 ${at(14.9, -43.6)}Z" style="fill:${v("belayer-helmet", "#00ade4")}"/>`,
    `<path d="M${at(2, -43.6)}L${at(9, -43.6)}" ${limb(v("belayer-helmet", "#00ade4"), 1.6)}/>`,
    `</g>`,
    // guide arm (in front): on the rope, hauls hand over hand, then holds and drinks the beer
    `<g class="blay-guide" style="${origin(shoulder)}">`,
    `<path d="M${xy(shoulder)}L${xy(guideElbow)}" ${limb(jacket, 4)}/>`,
    `<g class="blay-fore" style="${origin(guideElbow)}">`,
    `<path d="M${xy(guideElbow)}L${xy(g)}" ${limb(jacket, 4)}/>`,
    // beer can, upright in the hand; a little foam spray when it's cracked
    `<g class="blay-can">`,
    `<rect x="${f1(g.x - 2.5)}" y="${f1(g.y - 4.2)}" width="5" height="8.4" rx="1.2" style="fill:${v("belayer-can", "#e8b93b")}"/>`,
    `<rect x="${f1(g.x - 2.5)}" y="${f1(g.y - 1.2)}" width="5" height="2.2" style="fill:${v("belayer-can-band", "#ffffff")}"/>`,
    `<rect x="${f1(g.x - 2.2)}" y="${f1(g.y - 4.6)}" width="4.4" height="1.2" rx="0.5" style="fill:${v("belayer-can-rim", "#c9cfd6")}"/>`,
    `<g class="blay-spray" style="fill:${v("belayer-foam", "#f7e7b0")};stroke:${v("belayer-foam-edge", "#d9b44a")}" stroke-width="0.5">`,
    `<circle cx="${f1(g.x - 1.8)}" cy="${f1(g.y - 7)}" r="1"/><circle cx="${f1(g.x + 0.4)}" cy="${f1(g.y - 8.6)}" r="1.2"/><circle cx="${f1(g.x + 2.4)}" cy="${f1(g.y - 6.8)}" r="0.9"/>`,
    `</g></g>`,
    `<circle cx="${f1(g.x)}" cy="${f1(g.y)}" r="2.3" style="fill:${skin}"/>`,
    `</g></g>`,
    `</g>`,
    // harness and belay device (stay on the rope while the upper body moves)
    `<path d="M${at(-1.5, -20.5)}L${at(7.5, -18.5)}" ${limb(v("belayer-harness", "#f59e0b"), 2.6)}/>`,
    `<rect x="${f1(device.x - 2.5)}" y="${f1(device.y - 2)}" width="5" height="4.5" rx="1" style="fill:${v("belay-metal", "#4b5563")}"/>`,
    `</g>`,
  ].join("")
}

// Cooler by the belayer's front foot; drawn after the belayer so the reaching hand dips into it
function cooler() {
  const { feet } = ropeGeometry()
  const x = (n) => f1(feet.x + n)
  const y = (n) => f1(feet.y + n)
  return [
    `<rect x="${x(-29)}" y="${y(-10)}" width="14" height="10" rx="1.6" style="fill:${v("belayer-cooler", "#e5484d")}"/>`,
    `<rect x="${x(-24.5)}" y="${y(-6.8)}" width="5" height="1.8" rx="0.9" style="fill:rgba(0,0,0,0.22)"/>`,
    `<g class="blay-lid" style="transform-origin:${x(-29.4)}px ${y(-11)}px">`,
    `<rect x="${x(-29.8)}" y="${y(-12.6)}" width="15.6" height="3.2" rx="1.2" style="fill:${v("belayer-cooler-lid", "#f7f7f4")};stroke:${v("belayer-cooler-edge", "#c9ccd4")}" stroke-width="0.8"/>`,
    `</g>`,
  ].join("")
}

// "Shipped" tag that appears above the landed cube once the rope has cleared
function shippedChip() {
  const { ax } = ropeGeometry()
  const [, topY] = P(BELAYED.i, BELAYED.j, BELAYED.k + 1) // back corner of the top face
  const w = 128
  const h = 24
  const x = ax - w / 2
  const y = topY - h - 8
  return [
    `<g class="blay-chip">`,
    `<rect x="${f1(x)}" y="${f1(y)}" width="${w}" height="${h}" rx="12" style="fill:${v("belay-chip-bg", "#ffffff")};stroke:${v("belay-chip-border", "rgba(45,138,94,0.35)")}" stroke-width="1"/>`,
    `<circle cx="${f1(x + 13)}" cy="${f1(y + 12)}" r="6.5" style="fill:${v("belay-chip-text", "#2d8a5e")}"/>`,
    `<path d="M${f1(x + 10)} ${f1(y + 12)}l2 2.2 4-4.4" style="stroke:${v("belay-chip-bg", "#ffffff")}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<text x="${f1(x + 25)}" y="${f1(y + 16)}" style="fill:${v("belay-chip-text", "#2d8a5e")};font-family:var(--font-geist-mono, ui-monospace), ui-monospace, SFMono-Regular, Menlo, monospace;font-size:11px;letter-spacing:0.02em">v2.4.0 shipped</text>`,
    `</g>`,
  ].join("")
}

// Timeline, in seconds: the belayer lowers the cube (dynamic-rope bounce on the catch), it lands,
// the rope unclips and is hauled back up to the pulley, then the belayer grabs a beer from the
// cooler, cracks it, and drinks while the "shipped" tag shows.
// Change FADE_IN or LOWER to retime the descent; everything after the landing keeps its pace.
const FADE_IN = 0.4 // cube appears clipped under the pulley
const LOWER = 4.0 // the slow, controlled lower
const T = { lower: FADE_IN, bottom: FADE_IN + LOWER } // rope stretches just past the slot...
T.rebound = T.bottom + 0.4 // ...springs back...
T.landed = T.bottom + 0.8 // ...and settles
T.unclip = T.landed + 0.4
T.lifted = T.landed + 0.64
T.hauled = T.landed + 1.6
T.fadeOut = T.landed + 5.6
T.gone = T.landed + 6.1
T.total = T.landed + 6.4
const pct = (...times) => times.map((t) => `${+((t / T.total) * 100).toFixed(2)}%`).join(",")
const L = T.landed

// Beer break (seconds after landing)
const BEER = {
  reach: 1.6, // bend down to the cooler (lid opens 1.85-2.1)
  grab: 2.2, // can appears in the hand
  stand: 2.35, // straighten up with the can (lid closes 2.6-2.85)
  hold: 2.85, // can in front of the chest; other hand reaches over
  crack: 3.05, // pssht
  raise: 3.45, // bring it up...
  drink: 3.8, // ...and drink, a few sips
  lower: 5.6, // lower the can
  away: 6.0, // drop the empty and go back to the rope
}
// Poses (degrees), solved from the figure's joint positions
const POSE = {
  reach: { bend: -76, guide: 22, brake: 70 }, // back arm hangs toward the ground
  hold: { guide: -43.6, fore: 55.1 },
  drink: { guide: -13.6, fore: 111.8, head: 12 },
  crack: { brake: 62.5, brakeFore: 68.1 },
}
const sips = [4.2, 4.6, 5.0, 5.4]

// Brake-hand pulls every 0.64s for as long as the lower lasts
const pulls = []
for (let t = T.lower + 0.32; t + 0.32 < T.bottom; t += 0.64) pulls.push(t)
const releases = pulls.map((t) => t + 0.32)

const DESCENT = "cubic-bezier(.45,0,.55,1)"
const ANIMATED_PARTS = "blay-load,blay-rope,blay-ripple,blay-flash,blay-chip,blay-target,blay-feed,blay-lean,blay-bend,blay-brake,blay-brake-fore,blay-guide,blay-fore,blay-head,blay-lid,blay-can,blay-spray".split(",")
const ANIMATION_CSS = `
${ANIMATED_PARTS.map((c) => `.${c}`).join(",")}{animation-duration:${+T.total.toFixed(2)}s;animation-iteration-count:infinite;animation-fill-mode:both;animation-timing-function:ease-in-out}
${ANIMATED_PARTS.map((c) => `.${c}{animation-name:${c.replace("blay-", "blay-k-")}}`).join("\n")}
.blay-ripple,.blay-glow{transform-box:fill-box;transform-origin:center}
.blay-ripple,.blay-flash,.blay-chip,.blay-can,.blay-spray{opacity:0}
.blay-march{animation:blay-march 1.6s linear infinite}
.blay-glow{animation:blay-glow 3.2s ease-in-out infinite alternate}
.blay-plate{animation:blay-bob 2.6s ease-in-out infinite alternate}
.blay-plate:nth-child(2){animation-delay:-0.9s}
.blay-plate:nth-child(3){animation-delay:-1.8s}
@keyframes blay-k-load{
  ${pct(0)}{transform:translateY(-${LIFT}px);opacity:0}
  ${pct(T.lower)}{transform:translateY(-${LIFT}px);opacity:1;animation-timing-function:${DESCENT}}
  ${pct(T.bottom)}{transform:translateY(7px);animation-timing-function:ease-out}
  ${pct(T.rebound)}{transform:translateY(-4px);animation-timing-function:ease-in-out}
  ${pct(L, T.fadeOut)}{transform:translateY(0);opacity:1}
  ${pct(T.gone, T.total)}{transform:translateY(0);opacity:0}
}
@keyframes blay-k-rope{
  ${pct(0, T.lower)}{transform:translateY(-${LIFT}px);animation-timing-function:${DESCENT}}
  ${pct(T.bottom)}{transform:translateY(7px);animation-timing-function:ease-out}
  ${pct(T.rebound)}{transform:translateY(-4px);animation-timing-function:ease-in-out}
  ${pct(L, T.unclip)}{transform:translateY(0);animation-timing-function:ease-in}
  ${pct(T.lifted)}{transform:translateY(-8px);animation-timing-function:cubic-bezier(.3,0,.4,1)}
  ${pct(T.hauled, T.total)}{transform:translateY(-${LIFT}px)}
}
@keyframes blay-k-feed{
  ${pct(0, T.lower)}{stroke-dashoffset:0;animation-timing-function:${DESCENT}}
  ${pct(L, T.lifted)}{stroke-dashoffset:${LIFT};animation-timing-function:cubic-bezier(.3,0,.4,1)}
  ${pct(T.hauled, T.total)}{stroke-dashoffset:0}
}
@keyframes blay-k-lean{
  ${pct(0, T.lower)}{transform:rotate(1deg)}
  ${pct(T.lower + LOWER * 0.58)}{transform:rotate(3deg)}
  ${pct(T.bottom)}{transform:rotate(6deg)}
  ${pct(T.rebound)}{transform:rotate(2deg)}
  ${pct(L, T.lifted)}{transform:rotate(1deg)}
  ${pct(L + 1.12)}{transform:rotate(3deg)}
  ${pct(T.hauled, L + BEER.away)}{transform:rotate(0deg)}
  ${pct(T.total)}{transform:rotate(1deg)}
}
@keyframes blay-k-bend{
  ${pct(0, L + BEER.reach)}{transform:rotate(0)}
  ${pct(L + 2.1, L + BEER.stand)}{transform:rotate(${POSE.reach.bend}deg)}
  ${pct(L + BEER.hold, T.total)}{transform:rotate(0)}
}
@keyframes blay-k-brake{
  ${pct(0, T.lower)}{transform:rotate(0)}
  ${pct(...pulls)}{transform:rotate(-12deg)}
  ${pct(...releases, L + BEER.reach, L + BEER.hold)}{transform:rotate(0)}
  ${pct(L + 2.1, L + BEER.stand)}{transform:rotate(${POSE.reach.brake}deg)}
  ${pct(L + BEER.crack, L + 3.2)}{transform:rotate(${POSE.crack.brake}deg)}
  ${pct(L + BEER.raise, T.total)}{transform:rotate(0)}
}
@keyframes blay-k-brake-fore{
  ${pct(0, L + BEER.hold)}{transform:rotate(0)}
  ${pct(L + BEER.crack, L + 3.2)}{transform:rotate(${POSE.crack.brakeFore}deg)}
  ${pct(L + BEER.raise, T.total)}{transform:rotate(0)}
}
@keyframes blay-k-guide{
  ${pct(0, T.lifted)}{transform:rotate(0)}
  ${pct(L + 0.8, L + 1.12, L + 1.44)}{transform:rotate(-18deg)}
  ${pct(L + 0.96, L + 1.28, L + BEER.reach)}{transform:rotate(0)}
  ${pct(L + 2.1, L + BEER.stand)}{transform:rotate(${POSE.reach.guide}deg)}
  ${pct(L + BEER.hold, L + BEER.raise, L + BEER.away)}{transform:rotate(${POSE.hold.guide}deg)}
  ${pct(L + BEER.drink, L + BEER.lower)}{transform:rotate(${POSE.drink.guide}deg)}
  ${pct(T.total)}{transform:rotate(0)}
}
@keyframes blay-k-fore{
  ${pct(0, L + BEER.stand)}{transform:rotate(0)}
  ${pct(L + BEER.hold, L + BEER.raise, L + BEER.away)}{transform:rotate(${POSE.hold.fore}deg)}
  ${pct(L + BEER.drink, ...sips.filter((_, i) => i % 2).map((t) => L + t), L + BEER.lower)}{transform:rotate(${POSE.drink.fore}deg)}
  ${pct(...sips.filter((_, i) => i % 2 === 0).map((t) => L + t))}{transform:rotate(${POSE.drink.fore + 6}deg)}
  ${pct(T.total)}{transform:rotate(0)}
}
@keyframes blay-k-head{
  ${pct(0, L + 3.6)}{transform:rotate(0)}
  ${pct(L + BEER.drink, ...sips.filter((_, i) => i % 2).map((t) => L + t), L + BEER.lower)}{transform:rotate(${POSE.drink.head}deg)}
  ${pct(...sips.filter((_, i) => i % 2 === 0).map((t) => L + t))}{transform:rotate(${POSE.drink.head + 4}deg)}
  ${pct(L + 5.9, T.total)}{transform:rotate(0)}
}
@keyframes blay-k-lid{
  ${pct(0, L + 1.85)}{transform:rotate(0)}
  ${pct(L + 2.1, L + 2.6)}{transform:rotate(-55deg)}
  ${pct(L + BEER.hold, T.total)}{transform:rotate(0)}
}
@keyframes blay-k-can{
  ${pct(0, L + BEER.grab)}{opacity:0}
  ${pct(L + BEER.grab + 0.05, L + BEER.away)}{opacity:1}
  ${pct(L + BEER.away + 0.01, T.total)}{opacity:0}
}
@keyframes blay-k-spray{
  ${pct(0, L + BEER.crack)}{opacity:0;transform:translateY(1px)}
  ${pct(L + BEER.crack + 0.05)}{opacity:1;transform:translateY(0)}
  ${pct(L + BEER.raise, T.total)}{opacity:0;transform:translateY(-4px)}
}
@keyframes blay-k-ripple{
  ${pct(0, L - 0.16)}{opacity:0;transform:scale(.95)}
  ${pct(L)}{opacity:.9;transform:scale(1)}
  ${pct(L + 1.28, T.total)}{opacity:0;transform:scale(1.45)}
}
@keyframes blay-k-flash{${pct(0, L - 0.16)}{opacity:0}${pct(L + 0.08)}{opacity:.75}${pct(L + 1.12, T.total)}{opacity:0}}
@keyframes blay-k-chip{
  ${pct(0, L + 1.44)}{opacity:0;transform:translateY(6px)}
  ${pct(L + 1.84, L + 5.2)}{opacity:1;transform:translateY(0)}
  ${pct(L + 5.7, T.total)}{opacity:0;transform:translateY(0)}
}
@keyframes blay-k-target{${pct(0, T.bottom - 0.16)}{opacity:1}${pct(L, L + 5.9)}{opacity:0}${pct(T.total)}{opacity:1}}
@keyframes blay-march{to{stroke-dashoffset:-22}}
@keyframes blay-glow{from{opacity:.55;transform:scale(.9)}to{opacity:1;transform:scale(1.08)}}
@keyframes blay-bob{from{transform:translateY(0)}to{transform:translateY(-4px)}}
@media (prefers-reduced-motion:reduce){
  .blay-anim *{animation:none!important}
  .blay-ripple,.blay-flash,.blay-target{display:none}
  .blay-rope{transform:translateY(-${LIFT}px)}
  .blay-chip{opacity:1}
}`

// ---------------------------------------------------------------------------
// Dropped empties: each loop the belayer drops his can, and it stays. Can k is its own element
// with a one-shot drop animation delayed by k loops, so the pile grows while the page is open.
// After DROP_COUNT cans, extra cans tumble off the pile and roll away.
// ---------------------------------------------------------------------------
const DROP_COUNT = 24
const DROP_TIME = 0.8 // seconds from letting go to settled

function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Where the held can is when he lets go: forward kinematics of the "hold" pose
function heldCanAtDrop() {
  const { shoulder, guideElbow, guideHand } = belayerJoints()
  const rot = (p, o, deg) => {
    const a = (deg * Math.PI) / 180
    const dx = p.x - o.x
    const dy = p.y - o.y
    return { x: o.x + dx * Math.cos(a) - dy * Math.sin(a), y: o.y + dx * Math.sin(a) + dy * Math.cos(a) }
  }
  const elbow = rot(guideElbow, shoulder, POSE.hold.guide)
  const handAtRestAngle = rot(guideHand, shoulder, POSE.hold.guide)
  const hand = rot(handAtRestAngle, elbow, POSE.hold.fore)
  return { x: hand.x, y: hand.y, tilt: POSE.hold.guide + POSE.hold.fore }
}

// Resting spots, spreading out from the feet; avoids the cooler, rope pile, and shoes
function canSpots() {
  const { feet } = belayerJoints()
  const rand = mulberry32(20260928)
  const avoid = [
    { x0: -33, x1: -11, y0: -14, y1: 3 }, // cooler
    { x0: 13, x1: 35, y0: -6, y1: 3 }, // rope pile
    { x0: -17, x1: 15, y0: -4, y1: 2 }, // shoes
  ]
  const blocked = (x, y) => avoid.some((b) => x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1)
  const spots = []
  for (let k = 0; k < DROP_COUNT; k++) {
    const reach = 16 + 2.2 * k
    const minGap = k < 14 ? 7.5 : 5
    let pick = null
    for (let tries = 0; tries < 600 && !pick; tries++) {
      const x = -3 + reach * (rand() * 2 - 1)
      const y = 2 + rand() * Math.min(20, 5 + reach * 0.3)
      if (x < -72 || x > 70 || blocked(x, y)) continue
      if (spots.some((p) => Math.hypot(p.x - x, (p.y - y) * 2) < minGap)) continue
      pick = { x, y }
    }
    pick ??= { x: -3 + (k % 2 ? 1 : -1) * reach * 0.8, y: 4 + (k % 5) * 3 }
    const upright = rand() < 0.22
    const r = upright ? (rand() - 0.5) * 10 : (rand() < 0.5 ? -1 : 1) * (82 + rand() * 16)
    spots.push({ ...pick, upright, r })
  }
  return spots.map((p) => ({ ...p, x: feet.x + p.x, y: feet.y + p.y }))
}

// The empty can, drawn centered on the origin; positioned with CSS transforms
function emptyCan() {
  return [
    `<rect x="-2.5" y="-4.2" width="5" height="8.4" rx="1.2" style="fill:${v("belayer-can", "#e8b93b")}"/>`,
    `<rect x="-2.5" y="-1.2" width="5" height="2.2" style="fill:${v("belayer-can-band", "#ffffff")}"/>`,
    `<rect x="-2.2" y="-4.6" width="4.4" height="1.2" rx="0.5" style="fill:${v("belayer-can-rim", "#c9cfd6")}"/>`,
  ].join("")
}

let dropCache
function droppedCans() {
  if (dropCache) return dropCache
  const hold = heldCanAtDrop()
  const release = L + BEER.away // seconds into each loop when he lets go
  const spots = canSpots()
  const fallIn = "cubic-bezier(.55,0,1,.45)"
  const bounceOut = "cubic-bezier(0,.55,.45,1)"
  const kf = (name, frames) => `@keyframes ${name}{${frames.join("")}}`

  // Drop keyframes (percent of the drop): x moves linearly while y accelerates, so the can falls
  // in an arc, tumbling, then bounces once and settles. `at` maps drop-percent to keyframe offset.
  const drop = (to, at = (f) => `${f}%`) => {
    const roll = to.upright ? 0 : Math.sign(to.r) * 3
    const restY = to.y - (to.upright ? 4.2 : 2.5)
    const rest = { x: to.x + roll, y: restY, r: to.r }
    const ty = (y, r) => `transform:translateY(${f1(y)}px) rotate(${f1(r)}deg)`
    return {
      rest,
      x: [
        `${at(0)}{opacity:1;transform:translateX(${f1(hold.x)}px)}`,
        `${at(55)}{opacity:1;transform:translateX(${f1(to.x)}px);animation-timing-function:ease-out}`,
        `${at(100)}{opacity:1;transform:translateX(${f1(rest.x)}px)}`,
      ],
      y: [
        `${at(0)}{${ty(hold.y, hold.tilt)};animation-timing-function:${fallIn}}`,
        `${at(55)}{${ty(restY, hold.tilt + (to.r - hold.tilt) * 0.85)};animation-timing-function:${bounceOut}}`,
        `${at(72)}{${ty(restY - 4, to.r + 10)};animation-timing-function:${fallIn}}`,
        `${at(86)}{${ty(restY, to.r - 4)}}`,
        `${at(100)}{${ty(restY, to.r)}}`,
      ],
    }
  }

  const markup = []
  // Hidden until its drop starts (no backwards fill), then held where it lands (forwards)
  const css = [`.blay-drop{opacity:0}`]
  const reduced = []
  spots.forEach((spot, k) => {
    const d = drop(spot)
    const delay = f1(k * T.total + release)
    markup.push(`<g class="blay-drop blay-drop-${k}"><g>${emptyCan()}</g></g>`)
    css.push(
      kf(`blay-drop-${k}-x`, d.x),
      kf(`blay-drop-${k}-y`, d.y),
      `.blay-drop-${k}{animation:blay-drop-${k}-x ${DROP_TIME}s linear ${delay}s forwards}`,
      `.blay-drop-${k}>g{animation:blay-drop-${k}-y ${DROP_TIME}s linear ${delay}s forwards}`
    )
    if (k < 3) {
      reduced.push(
        `.blay-drop-${k}{opacity:1;transform:translateX(${f1(d.rest.x)}px)}`,
        `.blay-drop-${k}>g{transform:translateY(${f1(d.rest.y)}px) rotate(${f1(d.rest.r)}deg)}`
      )
    }
  })

  // Overflow: once the pile is full, each new can lands on the front of the pile and rolls out
  // of sight. One loop-long cycle that starts at the moment he lets go.
  const front = spots.reduce((a, b) => (b.y > a.y ? b : a))
  const over = { x: front.x + 3, y: front.y, upright: false, r: 95 }
  const dropShare = DROP_TIME / T.total
  const atLoop = (f) => `${+((f / 100) * dropShare * 100).toFixed(2)}%`
  const gone = `${+(((DROP_TIME + 0.9) / T.total) * 100).toFixed(2)}%`
  const d = drop(over, atLoop)
  const loop = `${+T.total.toFixed(2)}s`
  const overDelay = f1(DROP_COUNT * T.total + release)
  markup.push(`<g class="blay-drop blay-drop-over"><g>${emptyCan()}</g></g>`)
  css.push(
    kf("blay-drop-over-x", [
      ...d.x,
      `${gone},100%{opacity:0;transform:translateX(${f1(d.rest.x + 26)}px)}`,
    ]),
    kf("blay-drop-over-y", [
      ...d.y,
      `100%{transform:translateY(${f1(d.rest.y)}px) rotate(${f1(d.rest.r + 180)}deg)}`,
    ]),
    `.blay-drop-over{animation:blay-drop-over-x ${loop} linear ${overDelay}s infinite}`,
    `.blay-drop-over>g{animation:blay-drop-over-y ${loop} linear ${overDelay}s infinite}`
  )

  dropCache = { markup: markup.join(""), css: css.join("\n"), reduced: reduced.join("\n") }
  return dropCache
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

// Two diagonal rows moving from "wireframe" (plan) to "solid" (shipped)
const scene = [
  ["wire", 0, -1.45, 1.9],
  ["wire-plates", 1.35, -1.45, 1.5],
  ["wire-dots", 2.7, -1.45, 1.1],
  ["glass", 4.05, -1.45, 0.7],
  ["wire-dots", 0.15, 0, 1.0],
  ["glass", 1.5, 0, 0.6],
  ["wire-plates", 2.85, 0, 0.3],
  ["solid", 1.45, 1.45, 0],
  ["solid", 2.8, 1.45, 0],
  ["solid", BELAYED.i, BELAYED.j, BELAYED.k],
]
// Paint back-to-front: nearer the viewer means a larger i + j + k
scene.sort((a, b) => a[1] + a[2] + a[3] - (b[1] + b[2] + b[3]))

function render(animated) {
  const isBelayed = (i, j) => animated && i === BELAYED.i && j === BELAYED.j
  return [
    platform(1.1, 1.1, 5.55, 3.05, animated),
    ...(animated ? [belayTarget(BELAYED)] : []),
    ...scene.map(([kind, i, j, k]) =>
      isBelayed(i, j) ? belayedCube(BELAYED) : cube(kind, i, j, k, animated)
    ),
    ...(animated ? [rope(), belayer(), cooler(), droppedCans().markup, shippedChip()] : []),
  ]
}

// The viewBox fits the static scene; the animated extras don't grow it
const staticShapes = render(false)
bbox.on = false
const PAD = 28
const vb = {
  x: Math.floor(bbox.x0 - PAD),
  y: Math.floor(bbox.y0 - PAD),
  w: Math.ceil(bbox.x1 - bbox.x0 + PAD * 2),
  h: Math.ceil(bbox.y1 - bbox.y0 + PAD * 2),
}
const animatedShapes = render(true)

function svg(shapes, animated) {
  const { pulley } = ropeGeometry()
  const extraDefs = animated
    ? `
    <clipPath id="blay-below-pulley"><rect x="${vb.x}" y="${f1(pulley.y)}" width="${vb.w}" height="${f1(vb.y + vb.h - pulley.y)}"/></clipPath>`
    : ""
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" fill="none" role="img"${animated ? ` class="blay-anim"` : ""} aria-label="Isometric illustration of a software delivery pipeline">
  <defs>
    <radialGradient id="cube-glow">
      <stop offset="0" stop-color="#3cc6f0" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#3cc6f0" stop-opacity="0"/>
    </radialGradient>
    <filter id="cube-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <radialGradient id="cube-fade-g" cx="0.55" cy="0.5" r="0.6">
      <stop offset="0.35" stop-color="#fff"/>
      <stop offset="1" stop-color="#000"/>
    </radialGradient>
    <mask id="cube-fade"><rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="url(#cube-fade-g)"/></mask>${extraDefs}
  </defs>${animated ? `\n  <style>${ANIMATION_CSS}\n${droppedCans().css}\n@media (prefers-reduced-motion:reduce){\n${droppedCans().reduced}\n}\n  </style>` : ""}
  ${[dotGrid(), ...shapes].join("\n  ")}
</svg>
`
}

const outputs = {
  "public/brand/hero-cubes.svg": svg(staticShapes, false),
  "public/brand/hero-cubes-animated.svg": svg(animatedShapes, true),
}
for (const [file, content] of Object.entries(outputs)) {
  writeFileSync(file, content)
  console.log(`wrote ${file} (${content.length} bytes)`)
}
console.log(`viewBox=${vb.x} ${vb.y} ${vb.w} ${vb.h}`)
