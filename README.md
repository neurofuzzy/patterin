# Patterin

Procedural 2D geometry engine with fluent shape API, context-based operations, and parametric systems.

## Features

- **Core Primitives**: Vector2, Vertex, Segment, Shape with proper winding and normals
- **Shape Factory**: Circle, Rectangle, Square, Hexagon, Triangle with fluent chaining
- **Context Operations**: Points, Lines, Shapes with selection and transformation
- **Systems**: GridSystem, ShapeSystem for placement scaffolds
- **SVG Output**: Automatic viewBox computation and rendering

## Installation

```bash
npm install
```

## Usage

```typescript
import { shape, SVGCollector } from 'patterin';

const svg = new SVGCollector();

// Create a star pattern
shape.circle()
  .radius(50)
  .segments(10)
  .points.every(2).expand(20)
  .stamp(svg, 0, 0, { stroke: '#000' });

console.log(svg.toString());
```

## Development

```bash
npm test           # Run tests
npm run test:watch # Watch mode
npm run build      # Build TypeScript
```

## Project Structure

```
src/
├── primitives/    # Vector2, Vertex, Segment, Shape
├── contexts/      # ShapeContext, PointsContext, LinesContext, ShapesContext
├── shapes/        # circle, rect, square, hexagon, triangle
├── systems/       # GridSystem, ShapeSystem
├── collectors/    # SVGCollector
└── utils/         # geometry helpers
```

## License

ISC
