# Patterin

**Declarative procedural 2D vector graphics for the modern web.**

Patterin helps you create intricate geometric patterns with code. Whether you're designing for a plotter, generating art for a gallery wall, or exploring algorithmic beauty—Patterin gives you the tools to think in systems, not just shapes.

```typescript
import { shape } from 'patterin';

// Start with a circle, turn it into a gear
const gear = shape.circle()
  .radius(50)
  .numSegments(16);

// Extrude every other edge outward
gear.lines.every(2).extrude(15);
```

Simple, right? But Patterin goes deeper. Create grids, tessellations, fractals. Operate on points, lines, or entire collections of shapes. Transform patterns with a few method calls. Export clean SVG for fabrication or the web.

**[Try it live in the Playground →](https://neurofuzzy.github.io/patterin/playground)** | **[Read the API Docs →](API.md)**

## Why Patterin?

- 🎯 **System-based approach** - Work with grids, tessellations, and parametric scaffolds, not just primitives
- 🔄 **Context switching** - Seamlessly operate on points, lines, or entire shape collections
- 🎨 **Generative-first** - Built for procedural patterns, algorithmic art, and creative exploration
- 📐 **SVG-native** - Perfect for plotters, laser cutters, CNC machines, and web rendering
- 💻 **Live playground** - Interactive Monaco editor with full auto-complete and instant visual feedback
- 🔗 **Composable** - Chain operations, combine systems, nest transformations naturally
- 📦 **Zero dependencies** - Lightweight, tree-shakeable, and ready for any modern JavaScript environment

## Installation

### npm (recommended)

```bash
npm install patterin
```

This gives you the compiled library ready to use in any JavaScript or TypeScript project.

### GitHub

```bash
npm install github:neurofuzzy/patterin
```

Install directly from GitHub to get the latest version between releases.

### Or Just Use the Playground

**Don't want to install anything?** Try the **[live playground](https://neurofuzzy.github.io/patterin/playground/)** with full TypeScript autocomplete, built-in examples, and instant SVG preview. Perfect for learning, prototyping, or creating one-off designs.

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
  pattern: 'penrose',
  size: 40,
  bounds: { width: 400, height: 400 },
  iterations: 4
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

### Quilt Patterns

```typescript
// Create a 4x4 quilt with alternating blocks
const quilt = system.quilt({
  gridSize: [4, 4],
  blockSize: 100
});

// Alternate between Broken Dishes and Friendship Star
quilt.every(2).placeBlock('BD');
quilt.every(2, 1).placeBlock('FS');

// Access shapes by fabric group (light/dark)
const shapes = quilt.shapes;
shapes.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#3498db' : '#ecf0f1';
  svg.addShape(shape, { fill: color, stroke: '#000' });
});
```

## Documentation

- **[Complete API Reference](API.md)** - Detailed documentation for every method and option
- **[Examples Directory](examples/)** - 25+ runnable examples from basic to advanced
- **[Playground](https://neurofuzzy.github.io/patterin/playground)** - Interactive live coding environment

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
system.grid(options)              // Square, hex, triangular grids
system.tessellation(options)      // Penrose, trihexagonal
system.fromShape(shape, options)  // Use shape vertices as nodes
system.lsystem(options)           // Lindenmayer systems (fractals)
system.quilt(options)             // Traditional quilt block patterns
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

For complete details, parameter descriptions, and more examples, see the **[API Reference](API.md)**.

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

The **[examples/ directory](examples/)** contains 30+ runnable examples organized by concept:
- **Basics**: Circles, stars, gears, multiple shapes
- **Transformations**: Cloning, scaling, rotating, offsetting
- **Contexts**: Point expansion, line extrusion, polar spreads
- **Grids**: Square, hexagonal, triangular grids
- **Tessellations**: Penrose, trihexagonal
- **Fractals**: Koch curves, dragon, Hilbert, Sierpiński, plants
- **Quilting**: Traditional quilt block patterns with selection
- **Advanced**: Complex mandalas, geometric patterns, plotter art

Run any example:
```bash
npx tsx examples/01-basics/star.ts
# ✓ Generated: examples/output/star.svg
```

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
