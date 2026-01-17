/**
 * Patterin Examples Collection
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
        code: `const svg = new SVGCollector();

const circle = shape.circle().radius(50).numSegments(32);
circle.stamp(svg, 0, 0, { stroke: '#58a6ff', strokeWidth: 1.5 });

render(svg);`,
    },
    {
        name: 'Star',
        category: 'Basics',
        description: 'Star pattern from circle',
        code: `const svg = new SVGCollector();

const circle = shape.circle().radius(50).numSegments(10);
circle.points.every(2).inset(25);
circle.stamp(svg, 0, 0, { stroke: '#58a6ff', strokeWidth: 1.5 });

render(svg);`,
    },
    {
        name: 'Gear',
        category: 'Basics',
        description: 'Gear from extruded circle',
        code: `const svg = new SVGCollector();

const circle = shape.circle().radius(50).numSegments(16);
circle.lines.every(2).extrude(15);
circle.stamp(svg, 0, 0, { stroke: '#58a6ff', strokeWidth: 1.5 });

render(svg);`,
    },
    {
        name: 'Hexagon',
        category: 'Basics',
        description: 'Regular hexagon',
        code: `const svg = new SVGCollector();

const hex = shape.hexagon().radius(50);
hex.stamp(svg, 0, 0, { stroke: '#58a6ff', strokeWidth: 1.5 });

render(svg);`,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    {
        name: 'Point Expansion',
        category: 'Operations',
        description: 'Circles at each vertex',
        code: `const svg = new SVGCollector();

const hex = shape.hexagon().radius(50);
hex.stamp(svg, 0, 0, { stroke: '#58a6ff', strokeWidth: 1 });

hex.points.expandToCircles(10, 16).stamp(svg, 0, 0, { 
  stroke: '#f778ba', 
  strokeWidth: 1.5 
});

render(svg);`,
    },
    {
        name: 'Raycast',
        category: 'Operations',
        description: 'Rays from each vertex',
        code: `const svg = new SVGCollector();

const circle = shape.circle().radius(30).numSegments(8);
circle.stamp(svg, 0, 0, { stroke: '#58a6ff', strokeWidth: 1 });

// Cast rays outward
const rays = circle.points.raycast(40, 'outward');
for (let i = 0; i < rays.length; i++) {
  const v = rays.vertices[i];
  svg.addPath(\`M \${circle.vertices[i].x} \${circle.vertices[i].y} L \${v.x} \${v.y}\`, {
    stroke: '#f778ba',
    strokeWidth: 1
  });
}

render(svg);`,
    },
    {
        name: 'Offset Shape',
        category: 'Operations',
        description: 'Inset and outset outlines',
        code: `const svg = new SVGCollector();

const hex = shape.hexagon().radius(30);

// Outset
hex.offsetShape(20).stamp(svg, 0, 0, { stroke: '#30363d', strokeWidth: 1 });
hex.offsetShape(10).stamp(svg, 0, 0, { stroke: '#484f58', strokeWidth: 1 });
hex.stamp(svg, 0, 0, { stroke: '#58a6ff', strokeWidth: 1.5 });
// Inset
hex.offsetShape(-10).stamp(svg, 0, 0, { stroke: '#f778ba', strokeWidth: 1 });

render(svg);`,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // GRIDS
    // ═══════════════════════════════════════════════════════════════════════════
    {
        name: 'Square Grid',
        category: 'Grids',
        description: 'Basic square grid',
        code: `const grid = GridSystem.create({
  rows: 5,
  cols: 5,
  spacing: 30,
  x: -60,
  y: -60,
});

grid.trace();
grid.nodes().place(shape.circle().radius(3), { 
  fill: '#58a6ff' 
});

render(grid.toSVG({ width: 400, height: 400, margin: 20 }));

function render(svgString) {
  document.querySelector('.svg-container').innerHTML = svgString;
}`,
    },
    {
        name: 'Hex Grid',
        category: 'Grids',
        description: 'Hexagonal grid pattern',
        code: `const grid = GridSystem.create({
  type: 'hexagonal',
  rows: 4,
  cols: 5,
  spacing: 25,
  x: -60,
  y: -50,
  orientation: 'pointy',
});

grid.trace();
grid.nodes().place(shape.circle().radius(4), { 
  fill: '#f778ba' 
});

render(grid.toSVG({ width: 400, height: 400, margin: 20 }));

function render(svgString) {
  document.querySelector('.svg-container').innerHTML = svgString;
}`,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SYSTEMS
    // ═══════════════════════════════════════════════════════════════════════════
    {
        name: 'Mandala',
        category: 'Systems',
        description: 'Radial polar spread',
        code: `const svg = new SVGCollector();

for (let ring = 1; ring <= 4; ring++) {
  const count = ring * 6;
  const circles = shape.circle().radius(5)
    .clone(count)
    .spreadPolar(ring * 20);
  circles.stamp(svg, 0, 0, { 
    stroke: '#58a6ff', 
    strokeWidth: 1,
    fill: ring % 2 ? '#161b22' : 'none'
  });
}

render(svg);`,
    },
    {
        name: 'Penrose Tiling',
        category: 'Systems',
        description: 'Aperiodic Penrose pattern',
        code: `const tess = TessellationSystem.create({
  pattern: 'penrose',
  bounds: { width: 200, height: 200 },
  iterations: 5,
});

tess.trace();

render(tess.toSVG({ width: 400, height: 400, margin: 20 }));

function render(svgString) {
  document.querySelector('.svg-container').innerHTML = svgString;
}`,
    },
    {
        name: 'Truchet Tiles',
        category: 'Systems',
        description: 'Random Truchet pattern',
        code: `const tess = TessellationSystem.create({
  pattern: 'truchet',
  bounds: { width: 200, height: 200 },
  tileSize: 25,
  variant: 'quarter-circles',
  seed: 42,
});

tess.trace();

render(tess.toSVG({ width: 400, height: 400, margin: 20 }));

function render(svgString) {
  document.querySelector('.svg-container').innerHTML = svgString;
}`,
    },
];
