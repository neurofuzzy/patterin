/**
 * Patterin Examples Collection
 * Updated for auto-render mode (no explicit SVGCollector needed for simple shapes)
 */

export interface Example {
  name: string;
  category: string;
  description: string;
  code: string;
  preview?: string; // SVG string for thumbnail
}

export const EXAMPLES: Example[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // BASICS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Circle',
    category: 'Basics',
    description: 'Simple circle',
    code: `// Just create shapes - they render automatically!
shape.circle().radius(50).numSegments(32)`,
  },
  {
    name: 'Star',
    category: 'Basics',
    description: 'Star pattern from circle',
    code: `// Create a circle and modify every other point
const star = shape.circle().radius(50).numSegments(10)
star.points.every(2).inset(25)`,
  },
  {
    name: 'Gear',
    category: 'Basics',
    description: 'Gear from extruded circle',
    code: `// Extrude every other edge to create teeth
const gear = shape.circle().radius(50).numSegments(16)
gear.lines.every(2).extrude(15)`,
  },
  {
    name: 'Hexagon',
    category: 'Basics',
    description: 'Regular hexagon',
    code: `shape.hexagon().radius(50)`,
  },
  {
    name: 'Multiple Shapes',
    category: 'Basics',
    description: 'Position shapes with xy()',
    code: `// Multiple shapes are auto-collected
shape.circle().radius(30).xy(-50, 0)
shape.square().size(50).xy(50, 0)
shape.hexagon().radius(25).xy(0, 60)`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Point Expansion',
    category: 'Operations',
    description: 'Circles at each vertex',
    code: `// Create circles at each vertex
const hex = shape.hexagon().radius(50)
hex.points.expandToCircles(10, 16)`,
  },
  {
    name: 'Offset Shape',
    category: 'Operations',
    description: 'Inset and outset outlines',
    code: `// Create concentric offset shapes
const hex = shape.hexagon().radius(30)

hex.offsetShape(20)  // outer
hex.offsetShape(10)  // middle
hex.offsetShape(-10) // inner (inset)`,
  },
  {
    name: 'Clone & Spread',
    category: 'Operations',
    description: 'Clone and distribute shapes',
    code: `// Clone a shape and spread copies
shape.circle().radius(15)
  .clone(5)
  .spread(40, 0)`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRIDS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Square Grid',
    category: 'Grids',
    description: 'Basic square grid',
    code: `// Grid system with node placement
const grid = system.grid({
  rows: 5,
  cols: 5,
  spacing: 30,
  x: -60,
  y: -60,
})

grid.trace()
grid.place(shape.circle().radius(5))`,
  },
  {
    name: 'Hex Grid',
    category: 'Grids',
    description: 'Hexagonal grid pattern',
    code: `const grid = system.grid({
  type: 'hexagonal',
  rows: 4,
  cols: 5,
  spacing: 25,
  x: -60,
  y: -50,
  orientation: 'pointy',
})

grid.trace()
grid.place(shape.circle().radius(6))`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEMS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Mandala',
    category: 'Systems',
    description: 'Radial polar spread',
    code: `// Create rings of shapes using polar spread
for (let ring = 1; ring <= 4; ring++) {
  const count = ring * 6
  shape.circle().radius(5)
    .clone(count)
    .spreadPolar(ring * 20)
}`,
  },
  {
    name: 'Penrose Tiling',
    category: 'Systems',
    description: 'Aperiodic Penrose pattern',
    code: `// Note: TessellationSystem uses explicit render
const tess = system.tessellation({
  pattern: 'penrose',
  bounds: { width: 200, height: 200 },
  iterations: 5,
})

tess.trace()`,
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // L-SYSTEMS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Koch Curve',
    category: 'L-Systems',
    description: 'Quadratic Koch Island fractal',
    code: `const koch = system.lsystem({
  axiom: 'F',
  rules: { 'F': 'F+F-F-F+F' },
  iterations: 4,
  angle: 90,
  length: 2,
  origin: [-150, 0]
})

koch.trace()`,
  },
  {
    name: 'Koch Snowflake',
    category: 'L-Systems',
    description: 'Closed Koch Snowflake',
    code: `const snowflake = system.lsystem({
  axiom: 'F++F++F',
  rules: { 'F': 'F-F++F-F' },
  iterations: 4,
  angle: 60,
  length: 2,
  origin: [-100, -50]
})

snowflake.trace()`,
  },
  {
    name: 'Dragon Curve',
    category: 'L-Systems',
    description: 'Heighway Dragon (Space-filling)',
    code: `const dragon = system.lsystem({
  axiom: 'F',
  rules: {
    'F': 'F+G',
    'G': 'F-G'
  },
  iterations: 12,
  angle: 90,
  length: 3,
  origin: [-50, 0]
})

dragon.trace()`,
  },
  {
    name: 'Hilbert Curve',
    category: 'L-Systems',
    description: 'Continuous space-filling curve',
    code: `const hilbert = system.lsystem({
  axiom: 'A',
  rules: { 
    'A': '-BF+AFA+FB-', 
    'B': '+AF-BFB-FA+' 
  },
  iterations: 5,
  angle: 90,
  length: 10,
  origin: [-100, -100]
})

hilbert.trace()`,
  },
  {
    name: 'Sierpinski Triangle',
    category: 'L-Systems',
    description: 'Sierpiński Arrowhead Curve',
    code: `const sierpinski = system.lsystem({
  axiom: 'F',
  rules: {
    'F': 'G-F-G',
    'G': 'F+G+F'
  },
  iterations: 6,
  angle: 60,
  length: 2,
  origin: [-100, 80]
})

sierpinski.trace()`,
  },
  {
    name: 'Gosper Curve',
    category: 'L-Systems',
    description: 'Peano-Gosper Flowsnake',
    code: `const gosper = system.lsystem({
  axiom: 'F',
  rules: {
    'F': 'F+G++G-F--FF-G+',
    'G': '-F+GG++G+F--F-G'
  },
  iterations: 4,
  angle: 60,
  length: 5,
  origin: [-100, -80]
})

gosper.trace()`,
  },
];
