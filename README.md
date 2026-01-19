# Patterin

**Declarative procedural 2D vector graphics for the modern web.**

Generate intricate SVG patterns with a fluent, context-aware API. Perfect for generative art, data visualization, plotters, laser cutters, and creative coding.

```typescript
import { shape, system } from 'patterin';

// Create a Hilbert curve fractal with one line
const hilbert = system.lsystem({
  axiom: 'L',
  rules: { L: '+RF-LFL-FR+', R: '-LF+RFR+FL-' },
  iterations: 5,
  angle: 90,
  length: 3
});

console.log(hilbert.toSVG({ width: 800, height: 800 }));
```

[**Try it live in the Playground →**](https://neurofuzzy.github.io/patterin/playground)

## Why Patterin?

- 🎯 **System-based approach** - Parametric scaffolds (grids, tessellations, L-systems) not just primitives
- 🔄 **Context switching** - Operate on points, lines, or shapes with a unified fluent API
- 🎨 **Generative-first** - Built for procedural patterns, fractals, and algorithmic art
- 📐 **SVG-native** - Perfect for plotters, laser cutters, and web rendering
- 💻 **Live playground** - Interactive Monaco editor with auto-complete and instant preview
- 🔗 **Composable** - Chain operations, combine systems, nest transformations
- 📦 **Zero dependencies** - Lightweight and tree-shakeable

## Installation

```bash
npm install patterin
```

## Quick Start

### Basic Shapes

```typescript
import { shape, SVGCollector } from 'patterin';

const svg = new SVGCollector();

// Create a gear
const gear = shape.circle()
  .radius(50)
  .numSegments(16);

gear.lines.every(2).extrude(15);
gear.stamp(svg);

console.log(svg.toString());
```

### Auto-Render Mode (Playground)

In the playground, shapes automatically render:

```typescript
// Just create shapes - they appear automatically!
const star = shape.circle()
  .radius(50)
  .numSegments(10);

star.points.every(2).expand(20);
```

### System Scaffolds

```typescript
import { system, shape } from 'patterin';

// Create a hexagonal grid
const grid = system.grid({ 
  type: 'hexagonal', 
  count: [10, 10], 
  size: 30 
});

// Place shapes at grid points
grid.place(shape.hexagon().radius(12));

console.log(grid.toSVG({ width: 800, height: 800 }));
```

## Core Concepts

### Shapes & Contexts

Patterin uses **context switching** to expose different operations:

```typescript
const rect = shape.rect().size(20);

// Operate on the shape itself
rect.scale(2).rotate(45);

// Switch to points context
rect.points.every(2).expand(5);

// Switch to lines context  
rect.lines.at(0, 2).extrude(10);
```

### Systems

**Systems** are parametric scaffolds that provide placement coordinates:

```typescript
// Grid system
const grid = system.grid({ 
  type: 'square',
  count: [5, 5],
  size: 40
});

// Tessellation system
const tiles = system.tessellation({
  pattern: 'truchet',
  variant: 'quarter-circles',
  size: 40,
  bounds: { width: 400, height: 400 }
});

// L-System (fractals)
const dragon = system.lsystem({
  axiom: 'F',
  rules: { F: 'F+G', G: 'F-G' },
  iterations: 12,
  angle: 90,
  length: 4
});
```

### Clone & Transform

Create complex patterns by cloning and transforming:

```typescript
// Create a grid of scaled, rotated shapes
const pattern = shape.rect()
  .clone(10, 40, 0)    // 11 copies horizontally
  .clone(10, 0, 40);   // Clone each vertically (121 total)

// Transform every other shape
pattern.every(2).scale(3).rotate(45);

// Add offset rings
const rings = pattern.every(2).offset(5, 3); // 3 concentric rings
```

### Offset & Expand

Generate concentric copies:

```typescript
// Create concentric circles
const circles = shape.circle()
  .radius(20)
  .offset(10, 5); // 5 rings, each 10 units larger

// By default, offset returns only the copies (no original)
// To include the original:
const withOriginal = shape.circle()
  .radius(20)
  .offset(10, 5, 4, true); // includeOriginal = true
```

## Examples

### Mandala

```typescript
const mandala = shape.circle()
  .radius(100)
  .numSegments(12);

mandala.points.expandToCircles(20, { segments: 8 });
```

### Truchet Tiles

```typescript
const tiles = system.tessellation({
  pattern: 'truchet',
  variant: 'quarter-circles',
  size: 40,
  bounds: { width: 400, height: 400 }
});

console.log(tiles.toSVG({ width: 800, height: 800 }));
```

### Fractal Tree (L-System)

```typescript
const tree = system.lsystem({
  axiom: 'F',
  rules: { 
    F: 'FF+[+F-F-F]-[-F+F+F]'
  },
  iterations: 4,
  angle: 22.5,
  length: 3
});

console.log(tree.toSVG({ width: 600, height: 800 }));
```

### Clone Grid with Transformations

```typescript
const grid = shape.rect()
  .clone(10, 40, 0)
  .clone(10, 0, 40);

// Transform subset
grid.every(2).scale(3).rotate(45);

// Add offset copies to subset
const subset = grid.every(2);
const rings = subset.offset(5, 2); // 2 concentric rings

// Manual stamping (auto-render OFF)
const svg = new SVGCollector();
grid.stamp(svg);   // All 121 shapes
rings.stamp(svg);  // Just the offset copies
console.log(svg.toString());
```

## API Overview

### Shape Factory

```typescript
shape.circle(radius?)
shape.rect(width?, height?)
shape.square(size?)
shape.hexagon(radius?)
shape.triangle(radius?)
```

### Shape Operations

```typescript
.clone(n, offsetX?, offsetY?)  // Create n copies with spacing
.scale(factor)                  // Scale around center
.rotate(degrees)                // Rotate in degrees
.translate(x, y)                // Move by delta
.xy(x, y)                       // Move to position
.offset(distance, count?, miterLimit?, includeOriginal?) // Inset/outset
.expand(distance, count?)       // Outset (positive offset)
.inset(distance, count?)        // Inset (negative offset)
```

### Context Switching

```typescript
shape.points.expand(distance)   // Operate on vertices
shape.lines.extrude(distance)   // Operate on segments
shape.clone(5).every(2)         // Operate on shape collection
```

### Selection

```typescript
.every(n, offset?)    // Select every nth element
.at(...indices)       // Select specific indices
.slice(start, end?)   // Select range (shapes only)
```

### Systems

```typescript
system.grid(options)              // Square, hex, triangular, brick grids
system.tessellation(options)      // Truchet, Penrose, trihexagonal
system.fromShape(shape, options)  // Use shape vertices as nodes
system.lsystem(options)           // Lindenmayer systems (fractals)
```

### SVG Output

```typescript
const svg = new SVGCollector();

shape.stamp(svg, x?, y?, style?);
system.stamp(svg, style?);

// Render to string
svg.toString({ 
  width?: number,
  height?: number,
  margin?: number,
  autoScale?: boolean
});
```

## Playground

Patterin includes a **live coding playground** with:
- Monaco editor with full TypeScript support
- Auto-complete for the entire API
- Instant visual preview with pan/zoom
- Auto-render mode (shapes appear as you type!)
- Export to SVG
- Theme picker

[Try it live →](https://neurofuzzy.github.io/patterin/playground)

Or run locally:

```bash
cd playground
npm install
npm run dev
```

## Use Cases

- **Generative Art**: Procedural patterns, fractals, algorithmic compositions
- **Data Visualization**: Custom charts, diagrams, infographics
- **Fabrication**: Laser cutting, CNC machining, pen plotting
- **Creative Coding**: Interactive installations, live coding performances
- **Design Tools**: Pattern generators, texture creation, geometric exploration

## Project Structure

```
src/
├── primitives/    # Vector2, Vertex, Segment, Shape
├── contexts/      # ShapeContext, PointsContext, LinesContext, ShapesContext  
├── shapes/        # Shape factory (circle, rect, etc.)
├── systems/       # GridSystem, TessellationSystem, LSystem, CloneSystem
├── collectors/    # SVGCollector
└── index.ts       # Public API exports
```

## Development

```bash
npm install        # Install dependencies
npm test           # Run tests (204 tests)
npm run test:watch # Watch mode
npm run build      # Build TypeScript
npm run lint       # Lint code
```

## TypeScript Support

Full TypeScript support with type definitions included:

```typescript
import { shape, SVGCollector, type PathStyle } from 'patterin';

const style: PathStyle = {
  stroke: '#000',
  strokeWidth: 1.5,
  fill: 'none'
};

const svg = new SVGCollector();
shape.circle().radius(50).stamp(svg, 0, 0, style);
```

## Browser Support

Patterin works in all modern browsers and Node.js environments:
- ESM-only (no CommonJS)
- No runtime dependencies
- TypeScript 5.3+
- Node.js 18+

## Examples Gallery

Check out `test-output/` for generated SVG examples:
- Truchet tiles patterns
- L-system fractals (Dragon, Hilbert, Koch)
- Tessellations (Penrose, Trihexagonal)
- Grid systems with transformations
- Complex clone and offset patterns

## Contributing

Issues and pull requests welcome! This is an early-stage project and the API is still evolving.

## License

MIT © [Geoff Gaudreault](https://github.com/neurofuzzy)

## Links

- [Playground](https://neurofuzzy.github.io/patterin/playground)
- [GitHub](https://github.com/neurofuzzy/patterin)
- [npm](https://www.npmjs.com/package/patterin)
- [Issues](https://github.com/neurofuzzy/patterin/issues)

---

**Made with ❤️ for generative artists, creative coders, and maker enthusiasts.**
