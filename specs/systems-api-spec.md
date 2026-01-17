# Systems API Specification

## Overview

Systems are boundless, parametric scaffolds that provide placement coordinates for shapes. They are resolution-independent and self-contained layout units.

## Core Principles

- **Boundless**: Systems have no inherent size, only relative structure
- **Parametric**: Defined by rules, not coordinates
- **Resolution-independent**: Auto-scale to fit output dimensions
- **Self-contained**: Systems manage their own rendering and export
- **Placement targets**: Provide queryable nodes/edges/cells for shape placement

## System Types

### GridSystem

Creates orthogonal grid structure with rows and columns.

```javascript
GridSystem.create({
  rows: 5,              // or 'rowSeq()'
  cols: 5,              // or 'colSeq()'
  spacing: 20,          // or 'spacing()' or { x: 'spacingX()', y: 'spacingY()' }
  offset?: [x, y]       // grid origin offset
})
```

All numeric parameters accept sequence expressions.

**Queryable elements:**
- `.nodes` → PointsContext (grid intersections)
- `.cells` → ShapesContext (rectangular cells)
- `.rows` → LinesContext (horizontal lines)
- `.columns` → LinesContext (vertical lines)

### TreeSystem

Creates branching tree structure with recursive depth.

```javascript
TreeSystem.create({
  depth: 4,                     // or 'depth()'
  branches: 2,                  // or 'branches()'
  angle: 30,                    // or 'angle()' - branch angle in degrees
  lengthDecay: 0.7,             // or 'decay()' - length reduction per level
  origin?: [x, y]               // or ['x()', 'y()']
})
```

All numeric parameters accept sequence expressions.

**Queryable elements:**
- `.trunk` → LineContext (root line)
- `.branches` → LinesContext (all branch lines)
- `.leaves` → PointsContext (terminal endpoints)
- `.nodes` → PointsContext (branch points)
- `.levels` → array of LinesContext (branches by depth)

### VineSystem

Creates growth path with sample points along a curve.

```javascript
VineSystem.create({
  path: shape.bezier([...]),    // or any path
  segments: 20,                  // or 'segments()' - sample count
  noise?: 'noise()',             // positional variation
  twist?: 'twist()'              // rotational variation
})
```

All numeric parameters accept sequence expressions.

**Queryable elements:**
- `.path` → PathContext (main curve, ephemeral by default)
- `.points` → PointsContext (sample points)
- `.tangents` → array of angles (direction at each point)
- `.normals` → array of angles (perpendicular to tangent)

### NetworkSystem

Creates node graph with computed connections.

```javascript
NetworkSystem.create({
  points: 30,                   // or 'points()' or explicit point array
  bounds: { 
    width: 500,                 // or 'width()'
    height: 500                 // or 'height()'
  },
  type: 'delaunay',            // or 'voronoi', 'mst', 'proximity'
  maxDistance?: 100,           // or 'maxDist()' - connection threshold
  seed?: 12345                 // or 'seed()'
})
```

All numeric parameters accept sequence expressions.

**Queryable elements:**
- `.nodes` → PointsContext (graph vertices)
- `.edges` → LinesContext (connections)
- `.cells` → ShapesContext (voronoi cells if type: 'voronoi')

## Placement API

**`.place(shape)`** - Attach shape to selected system elements

```javascript
grid.nodes.place(circle.radius(5));
tree.leaves.place(circle.radius(3));
vine.points.place(leaf.rotate('tangent'));
network.edges.place(line.stroke('#ccc'));
```

**Returns:** Same context for chaining

```javascript
grid.nodes
  .every(2).place(circle.radius(3))
  .every(3).place(rect.wh(5, 5))
  .at(0).place(circle.radius(10));
```

**Placement stacks at same position:**

```javascript
grid.nodes.at(0)
  .place(circle.radius(10))
  .place(circle.radius(5).fill('#fff'))
  .place(rect.wh(2, 2));
// All three render at node 0
```

## Selection Operations

Systems expose standard selection operations on their elements:

```javascript
grid.nodes.every(2)          // every 2nd node
tree.branches.at(0, 5, 10)   // specific branches
vine.points.slice(0, 10)     // first 10 points
network.edges.filter(e => e.length < 50)
```

## Output

**`.toSVG(options)`** - Generate complete SVG document

```javascript
system.toSVG({
  width: 1000,
  height: 800,
  margin: 50,
  fit?: 'contain',      // 'contain', 'cover', 'fill', 'none'
  debug?: false         // show system structure
})
```

Returns: Complete SVG string with viewBox

**System auto-scales to fit dimensions:**
- Computes system bounds
- Scales to fit width/height with margin
- Maintains aspect ratio (unless fit: 'fill')
- Evaluates all sequence expressions
- Renders all placed shapes

## Sequence Integration

All system parameters accept sequence expressions:

```javascript
Sequence.fromStatement('REPEAT 3,4,5,6,7 AS rows');
Sequence.fromStatement('REPEAT 20,25,30 AS spacing');

const grid = GridSystem.create({ 
  rows: 'rows()',       // evaluates to 3 on first call
  cols: 'rows()',       // evaluates to 4 (advances)
  spacing: 'spacing()'  // evaluates to 20
});

grid.cells.place(circle.radius('size()'));

grid.toSVG({ width: 500, height: 500 });
```

**System creation vs placement:**
- System parameters evaluate once at `.create()` time
- Placed shape parameters evaluate once per placement position

```javascript
Sequence.fromStatement('REPEAT 1,2,3 AS size');

// System evaluates 'size()' once
const grid = GridSystem.create({ rows: 'size()' });  // rows = 1

// Shape evaluates 'size()' per cell
grid.cells.place(circle.radius('size()'));  // each cell advances sequence
```

## System Data Access

Systems can pass contextual data to placed shapes:

```javascript
// Tree passes depth info
tree.branches.place(line.width('depth'));

// Network passes connection weight
network.edges.place(line.opacity('weight / maxWeight'));

// Vine passes tangent angle
vine.points.place(leaf.rotate('tangent'));
```

## Common Patterns

### Grid with Variable Dimensions

```javascript
Sequence.fromStatement('REPEAT 3,5,7,9 AS gridSize');
Sequence.fromStatement('RANDOM 15,20,25,30 AS spacing');

const grid = GridSystem.create({ 
  rows: 'gridSize()', 
  cols: 'gridSize()', 
  spacing: 'spacing()' 
});

grid.nodes.place(circle.radius(2));
grid.toSVG({ width: 500, height: 500, margin: 20 });
```

### Fractal Tree with Leaves

```javascript
Sequence.fromStatement('BINARY 25,-25 AS angle', 0, 4);

const tree = TreeSystem.create({
  depth: 5,
  branches: 2,
  angle: 'angle()',
  lengthDecay: 0.7
});

tree.branches.place(line.stroke('#654321'));
tree.leaves.place(circle.radius(3).fill('#90EE90'));
tree.nodes.trace().place(circle.radius(1));

tree.toSVG({ width: 800, height: 600, margin: 50 });
```

### Vine with Varied Leaves

```javascript
Sequence.fromStatement('RANDOM 3,5,7 AS leafSize');
Sequence.fromStatement('RANDOM -15,15 AS rotation');

const vine = VineSystem.create({
  path: shape.bezier([[0,0], [100,50], [200,100]]),
  segments: 30
});

vine.points.place(
  ellipse.wh('leafSize()', 'leafSize() * 1.5')
    .rotate('tangent + rotation()')
);

vine.toSVG({ width: 1000, height: 400 });
```

### Delaunay Network

```javascript
const network = NetworkSystem.create({
  points: 50,
  bounds: { width: 500, height: 500 },
  type: 'delaunay',
  maxDistance: 100
});

network.nodes.place(circle.radius(2).fill('#333'));
network.edges.place(line.stroke('#ccc').opacity(0.5));

network.toSVG({ width: 600, height: 600, margin: 50 });
```

### Grid of Trees

```javascript
const grid = GridSystem.create({ rows: 3, cols: 3, spacing: 200 });

grid.nodes.forEach(node => {
  const tree = TreeSystem.create({ 
    depth: 4, 
    origin: [node.x, node.y] 
  });
  tree.leaves.place(circle.radius(2));
  // Each tree is independent
});
```

## Debug Visualization

Systems can render their structure for debugging:

```javascript
system.toSVG({ 
  width: 800, 
  height: 600,
  debug: true 
});
```

Debug mode shows:
- System structure (grid lines, branches, paths) in gray/dashed
- Nodes as small circles
- Placed shapes in full color
- Annotations for indices/labels

## Implementation Notes

- Systems are boundless - no intrinsic width/height
- All coordinates are relative to system origin
- Scaling happens at export time
- Systems track placements internally
- Sequence evaluation happens once per placement position
- Multiple `.toSVG()` calls with same system may produce different results if sequences aren't reset
- Systems can be composed via iteration but not nested (systems can't be placed in systems)