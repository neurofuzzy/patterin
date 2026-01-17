# Shape API Specification

## Overview

Declarative, mutation-based API for procedural 2D vector graphics with sequence-generator integration.

## Core Principles

- **Mutation-based**: Operations modify and return contexts
- **Context switching**: `.points`, `.lines`, `.shapes` expose different operations
- **Selection-driven**: No cursor, only geometry selections
- **Sequence integration**: String parameters evaluate via `Sequence.resolve()`
- **Stamp-based output**: `.stamp(collector, x, y)` evaluates and renders

## Entry Points

```javascript
shape.circle()
shape.rect()
shape.polygon(points)
shape.line(start, end)
shape.triangle()
```

## Context Types

### ShapeContext (single shape)

**Properties:**
- `.points` → PointsContext
- `.lines` → LinesContext
- `.center` → Point (readonly)
- `.centroid` → Point (readonly)

**Methods:**
- `.clone(n)` → ShapesContext
- `.stamp(collector, x, y, style?)` → void
- `.scale(factor)` → ShapeContext
- `.rotate(degrees)` → ShapeContext
- `.moveTo(x, y)` or `.moveTo(point)` → ShapeContext
- `.offset(x, y)` → ShapeContext
- `.bbox()` → RectContext (ephemeral)
- `.centerPoint()` → PointContext (ephemeral)
- `.trace()` → ShapeContext (makes ephemeral concrete)

### ShapesContext (collection)

**Properties:**
- `.shapes` → ShapesContext (filtered)
- `.points` → PointsContext (all points)
- `.lines` → LinesContext (all lines)

**Methods:**
- `.spread(x, y)` → ShapesContext
- `.stamp(collector, x, y, style?)` → void
- `.every(n, offset?)` → ShapesContext
- `.at(...indices)` → ShapesContext
- `.slice(start, end)` → ShapesContext
- `.bbox()` → RectContext (ephemeral bounding box around all)
- `.trace()` → ShapesContext (makes all ephemeral shapes concrete)

### PointsContext

**Methods:**
- `.expand(distance)` → PointsContext
- `.inset(distance)` → PointsContext
- `.round(radius)` → PointsContext
- `.move(x, y)` → PointsContext
- `.every(n, offset?)` → PointsContext
- `.at(...indices)` → PointsContext
- `.midPoint()` → PointContext (ephemeral, midpoint of selection)
- `.bbox()` → RectContext (ephemeral bounding box)
- `.trace()` → PointsContext (makes ephemeral concrete)

### LinesContext

**Methods:**
- `.extrude(distance)` → LinesContext
- `.divide(n)` → PointsContext (returns division points)
- `.offset(distance)` → LinesContext
- `.every(n, offset?)` → LinesContext
- `.at(...indices)` → LinesContext
- `.midPoint()` → PointContext (ephemeral, midpoint of selection)
- `.intersection()` → PointContext (ephemeral, where selected lines intersect)
- `.bbox()` → RectContext (ephemeral bounding box)
- `.trace()` → LinesContext (makes ephemeral concrete)

## Shape-Specific APIs

### Circle
```javascript
circle()
  .radius(r)
  .segments(n)
  .center(x, y)
```

### Rectangle
```javascript
rect()
  .width(w)
  .height(h)
  .wh(w, h)
  .size(s)        // square
  .center(x, y)
```

### Polygon
```javascript
polygon([points])
  .close()        // close path
  .reverse()      // reverse winding
```

## Sequence Integration

All numeric parameters accept strings that evaluate via `Sequence.resolve()`:

```javascript
Sequence.fromStatement('REPEAT 5,10,15 AS radii');

circle.radius('radii()')  // advances sequence
circle.radius('radii')    // uses current value
circle.radius('radii * 2') // expression support
```

## Ephemeral vs Concrete Geometry

**Concrete shapes** render when stamped (default state)
**Ephemeral shapes** are computed references that don't render unless traced

**Construction methods return ephemeral shapes:**
```javascript
.bbox()              // bounding box as ephemeral rectangle
.centerPoint()       // ephemeral point
.midPoint()          // ephemeral point (on selections)
.intersection()      // ephemeral point (on line selections)
```

**`.trace()` makes ephemeral shapes concrete:**
```javascript
circle.radius(5).bbox()         // ephemeral, won't render
circle.radius(5).bbox().trace() // concrete, will render

// Use ephemeral for positioning
rect.moveTo(circle.centerPoint())  // uses ephemeral, doesn't render it

// Render construction guides
rect.lines.divide(10).trace().stamp(svg, 0, 0)
```

**Ephemeral state propagates through operations:**
```javascript
rect.bbox().clone(3)           // 3 ephemeral boxes
rect.bbox().trace().clone(3)   // 3 concrete boxes
rect.bbox().clone(3).trace()   // makes all 3 concrete

// Trace selections
rect.lines.divide(10)
  .every(2).trace()            // only even-indexed lines concrete
```

## Stamping

```javascript
const svg = new SVGCollector();

shape.stamp(svg, x, y, style?);  // evaluates sequences, renders to collector
svg.toString();                  // returns valid SVG string
```

Each `.stamp()` call:
1. Evaluates all sequence expressions
2. Computes final geometry
3. Adds paths to collector (only concrete shapes)
4. Returns void

**Style is specified at stamp time:**
```javascript
shape.stamp(svg, 0, 0, { stroke: '#ccc', dash: [5, 5] });
shape.stamp(svg, 50, 0, { fill: '#ff0000' });
```

## Selection Operators

**`.every(n, offset?)`** - Select every nth element
```javascript
circle.segments(10).points.every(2)     // 0,2,4,6,8
circle.segments(10).points.every(2, 1)  // 1,3,5,7,9
```

**`.at(...indices)`** - Select specific indices
```javascript
rect.points.at(0, 2)  // corners 0 and 2
```

**`.slice(start, end)`** - Range selection (shapes only)
```javascript
shapes.slice(0, 5)  // first 5 shapes
```

## Common Patterns

### Star
```javascript
circle.radius(5).segments(10).points.every(2).expand(2)
```

### Cross
```javascript
rect.size(5).lines.extrude(5)
```

### Gear
```javascript
circle.radius(10).segments(16).lines.every(2, 0).extrude(1)
```

### Rounded Rectangle
```javascript
rect.wh(5, 10).points.round(2.5)
```

### Construction Guides with Bounding Box
```javascript
circle.radius(5).stamp(svg, 0, 0);
circle.radius(5).bbox().trace().stamp(svg, 0, 0, { stroke: '#ccc', dash: [2,2] });
```

### Position Using Ephemeral References
```javascript
const base = rect.wh(100, 50);
const top = rect.wh(80, 30).moveTo(base.centerPoint());

base.stamp(svg, 0, 0);
top.stamp(svg, 0, 0);
// centerPoint doesn't render
```

### Selective Construction Line Rendering
```javascript
const guides = rect.wh(100, 100).lines.divide(10);
guides.every(2).trace();  // only even-indexed guides render
guides.stamp(svg, 0, 0, { stroke: '#eee' });
```

### Procedural Cityscape
```javascript
Sequence.fromStatement('RANDOM 40,40,80,80,120 AS width');
Sequence.fromStatement('RANDOM 80,120,160 AS height');

const building = rect.wh('width()', 'height()');

for (let i = 0; i < 10; i++) {
  building.stamp(svg, i * 60, 0);
}
```

### Grid with Clones
```javascript
rect.size(10)
  .clone(5)
  .spread(20, 0)
  .clone(3)           // each of 5 gets cloned 3 times
  .spread(0, 20)      // spread vertically
  .shapes.every(2)    // select alternating
  .stamp(svg, 0, 0, { fill: '#ff0000' });
```

## Collector Interface

```javascript
interface Collector {
  addPath(path: Path, style: Style): void;
  // implementation-specific rendering
}

class SVGCollector implements Collector {
  toString(): string;  // returns <svg>...</svg>
}

class CanvasCollector implements Collector {
  constructor(ctx: CanvasRenderingContext2D);
}
```

## Implementation Notes

- Contexts are mutable - operations modify in place
- Sequence expressions evaluate at `.stamp()` time only
- Global sequence state advances per evaluation
- Operations record history for step-through visualization
- All coordinates relative to shape center unless stamped