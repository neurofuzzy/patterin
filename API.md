# Patterin API Reference

Complete reference for the Patterin API. For conceptual guides and tutorials, see the [README](README.md).

## Table of Contents

- [Shape Factory](#shape-factory)
- [Shape Operations](#shape-operations)
- [Context Switching](#context-switching)
- [Points Context](#points-context)
- [Lines Context](#lines-context)
- [Shapes Context](#shapes-context)
- [Selection Methods](#selection-methods)
- [Systems](#systems)
- [SVG Output](#svg-output)

---

## Shape Factory

The `shape` factory provides methods to create basic geometric shapes.

### `shape.circle(radius?: number)`

Creates a circular shape.

**Parameters:**
- `radius` (optional): Circle radius in units (default: 10)

**Returns:** `ShapeContext` - A fluent shape interface

**Example:**
```typescript
import { shape } from 'patterin';

const circle = shape.circle();           // radius 10
const largeCircle = shape.circle(50);    // radius 50
```

**Methods:**
- `.radius(r: number)` - Set radius (default: 10)
- `.numSegments(n: number)` - Set number of vertices (default: 32)

### `shape.rect(width?: number, height?: number)`

Creates a rectangular shape.

**Parameters:**
- `width` (optional): Rectangle width (default: 20)
- `height` (optional): Rectangle height (default: 20)

**Returns:** `ShapeContext`

**Example:**
```typescript
const rect = shape.rect();              // 20x20 square
const rect2 = shape.rect(40, 20);       // 40x20 rectangle
```

**Methods:**
- `.size(w: number, h?: number)` - Set dimensions (h defaults to w)
- `.width(w: number)` - Set width
- `.height(h: number)` - Set height

### `shape.square(size?: number)`

Creates a square shape. Convenience method for `shape.rect()`.

**Parameters:**
- `size` (optional): Side length (default: 20)

**Returns:** `ShapeContext`

**Example:**
```typescript
const square = shape.square();          // 20x20
const largeSquare = shape.square(50);   // 50x50
```

### `shape.hexagon(radius?: number)`

Creates a regular hexagon.

**Parameters:**
- `radius` (optional): Distance from center to vertex (default: 20)

**Returns:** `ShapeContext`

**Example:**
```typescript
const hex = shape.hexagon();            // radius 20
const largeHex = shape.hexagon(40);     // radius 40
```

### `shape.triangle(radius?: number)`

Creates an equilateral triangle.

**Parameters:**
- `radius` (optional): Distance from center to vertex (default: 20)

**Returns:** `ShapeContext`

**Example:**
```typescript
const tri = shape.triangle();           // radius 20
const largeTri = shape.triangle(40);    // radius 40
```

---

## Shape Operations

All shape contexts support these transformation and generation operations.

### `.clone(count: number, offsetX?: number, offsetY?: number)`

Creates copies of the shape with optional spacing.

**Parameters:**
- `count`: Number of additional copies to create
- `offsetX` (optional): Horizontal spacing between copies (default: 0)
- `offsetY` (optional): Vertical spacing between copies (default: 0)

**Returns:** `ShapesContext` - Context for operating on multiple shapes

**Example:**
```typescript
// Create 5 circles spaced 40 units apart horizontally
const circles = shape.circle()
  .clone(4, 40, 0);

// Create a 2D grid with nested cloning
const grid = shape.square()
  .clone(9, 30, 0)     // 10 shapes horizontally
  .clone(9, 0, 30);    // Clone each 10 times vertically (100 total)
```

### `.scale(factor: number)`

Scales the shape around its center point.

**Parameters:**
- `factor`: Scale multiplier (1.0 = unchanged, 2.0 = double, 0.5 = half)

**Returns:** `ShapeContext` (for single shapes) or `ShapesContext` (for collections)

**Example:**
```typescript
const large = shape.circle().scale(2);        // 2x size
const small = shape.square().scale(0.5);      // Half size
```

### `.rotate(degrees: number)`

Rotates the shape around its center point.

**Parameters:**
- `degrees`: Rotation angle in degrees (positive = counter-clockwise)

**Returns:** `ShapeContext` or `ShapesContext`

**Example:**
```typescript
const rotated = shape.square().rotate(45);    // 45° rotation
const diamond = shape.rect(40, 20).rotate(30);
```

### `.translate(dx: number, dy: number)`

Moves the shape by a relative offset.

**Parameters:**
- `dx`: Horizontal displacement
- `dy`: Vertical displacement

**Returns:** `ShapeContext` or `ShapesContext`

**Example:**
```typescript
const moved = shape.circle().translate(100, 50);
```

### `.xy(x: number, y: number)`

Moves the shape's center to an absolute position.

**Parameters:**
- `x`: Target x-coordinate
- `y`: Target y-coordinate

**Returns:** `ShapeContext` or `ShapesContext`

**Example:**
```typescript
const positioned = shape.square().xy(200, 150);
```

### `.offset(distance: number, count?: number, miterLimit?: number, includeOriginal?: boolean)`

Creates inset or outset copies of the shape (concentric scaling).

**Parameters:**
- `distance`: Offset distance (positive = outset, negative = inset)
- `count` (optional): Number of offset copies (default: 1)
- `miterLimit` (optional): Maximum miter length for sharp corners (default: 4)
- `includeOriginal` (optional): Include the original shape (default: false)

**Returns:** `ShapesContext` - Collection containing offset copies (and optionally original)

**Example:**
```typescript
// Create 3 concentric rings outside a circle
const rings = shape.circle()
  .radius(20)
  .offset(10, 3);

// Include the original center circle
const withCenter = shape.circle()
  .radius(20)
  .offset(10, 3, 4, true);

// Inset (shrink inward)
const nested = shape.square()
  .size(100)
  .offset(-10, 3);  // Negative distance = inset
```

### `.expand(distance: number, count?: number, miterLimit?: number)`

Convenience method for outset (positive offset).

**Parameters:**
- `distance`: Expansion distance (always treated as positive)
- `count` (optional): Number of expanded copies (default: 1)
- `miterLimit` (optional): Maximum miter length for sharp corners (default: 4)

**Returns:** `ShapesContext`

**Example:**
```typescript
const expanded = shape.hexagon()
  .expand(10, 4);  // 4 larger copies
```

### `.inset(distance: number, count?: number, miterLimit?: number)`

Convenience method for inset (negative offset).

**Parameters:**
- `distance`: Inset distance (converted to negative internally)
- `count` (optional): Number of inset copies (default: 1)
- `miterLimit` (optional): Maximum miter length for sharp corners (default: 4)

**Returns:** `ShapesContext`

**Example:**
```typescript
const nested = shape.square()
  .size(100)
  .inset(10, 3);  // 3 smaller squares inside
```

---

## Context Switching

Patterin uses context switching to expose different operations depending on what you want to manipulate: the entire shape, individual points, individual lines, or collections of shapes.

### Shape Context

Default context when you create a shape. Operates on the entire shape.

```typescript
const shape = shape.circle()
  .radius(50)
  .scale(2)
  .rotate(45);
```

### Points Context

Access with `.points` property. Operates on individual vertices.

```typescript
const starShape = shape.circle()
  .numSegments(10);

// Move every other point outward
starShape.points.every(2).expand(20);
```

See [Points Context](#points-context) for detailed API.

### Lines Context

Access with `.lines` property. Operates on individual edges (segments).

```typescript
const gear = shape.circle()
  .numSegments(16);

// Extrude every other edge
gear.lines.every(2).extrude(15);
```

See [Lines Context](#lines-context) for detailed API.

### Shapes Context

Returned by operations that create multiple shapes (`.clone()`, `.offset()`).

```typescript
const grid = shape.square()
  .clone(9, 30, 0);

// Now in ShapesContext - can transform subset
grid.every(2).scale(1.5);
```

See [Shapes Context](#shapes-context) for detailed API.

---

## Points Context

Accessed via `shape.points`. Operates on vertices (points) of a shape.

### `.expand(distance: number)`

Moves selected points radially outward from the shape's center.

**Parameters:**
- `distance`: Distance to move points (positive = outward, negative = inward)

**Returns:** `PointsContext`

**Example:**
```typescript
// Create a star by expanding alternating points
const star = shape.circle()
  .numSegments(10);

star.points.every(2).expand(20);
```

### `.expandToCircles(radius: number, options?: { segments?: number })`

Replaces selected points with circles.

**Parameters:**
- `radius`: Radius of circles to create
- `options.segments` (optional): Number of segments for each circle (default: 32)

**Returns:** `ShapesContext` - Collection of circles at point positions

**Example:**
```typescript
// Create a mandala: circles at each vertex of a polygon
const mandala = shape.circle()
  .radius(100)
  .numSegments(12);

mandala.points.expandToCircles(20, { segments: 8 });
```

### Selection Methods

Points context supports selection via `every()`, `at()`:

```typescript
shape.points.every(2)        // Every other point
shape.points.at(0, 2, 4)     // Points at indices 0, 2, 4
```

---

## Lines Context

Accessed via `shape.lines`. Operates on edges (segments) of a shape.

### `.extrude(distance: number)`

Moves selected edges perpendicular to their direction (outward from shape center).

**Parameters:**
- `distance`: Extrusion distance (positive = outward, negative = inward)

**Returns:** `LinesContext`

**Example:**
```typescript
// Create a gear: extrude every other edge
const gear = shape.circle()
  .radius(50)
  .numSegments(16);

gear.lines.every(2).extrude(15);
```

### Selection Methods

Lines context supports selection via `every()`, `at()`:

```typescript
shape.lines.every(2)         // Every other edge
shape.lines.at(0, 1)         // Edges at indices 0, 1
```

---

## Shapes Context

Returned by operations that create multiple shapes (`.clone()`, `.offset()`, `.expandToCircles()`).

### All Shape Operations

ShapesContext supports all shape operations, applying them to each shape:

```typescript
shapes.scale(1.5)
shapes.rotate(45)
shapes.translate(10, 10)
shapes.offset(5, 2)
```

### Selection Methods

```typescript
shapes.every(n, offset?)     // Every nth shape (with optional offset)
shapes.at(...indices)        // Specific shapes by index
shapes.slice(start, end?)    // Range of shapes
```

**Example:**
```typescript
const grid = shape.circle()
  .clone(99, 30, 0);

// Transform every 3rd circle starting at index 1
grid.every(3, 1).scale(2).rotate(45);

// Select first 10 circles
grid.slice(0, 10).scale(1.5);

// Select specific circles
grid.at(0, 10, 20, 30).expand(5, 2);
```

### `.stamp(collector: SVGCollector, style?: PathStyle)`

Renders all shapes to an SVG collector.

**Parameters:**
- `collector`: SVGCollector instance
- `style` (optional): SVG path style object

**Example:**
```typescript
import { SVGCollector } from 'patterin';

const svg = new SVGCollector();
const shapes = shape.circle().clone(10, 30, 0);

shapes.stamp(svg, { 
  stroke: '#000', 
  fill: 'none',
  strokeWidth: 1.5 
});

console.log(svg.toString());
```

---

## Selection Methods

Selection methods are available across contexts to filter which elements operations apply to.

### `.every(n: number, offset?: number)`

Selects every nth element, optionally starting at an offset.

**Parameters:**
- `n`: Interval (every nth element)
- `offset` (optional): Starting index offset (default: 0)

**Returns:** Same context type with filtered selection

**Example:**
```typescript
// Every other point, starting at index 0
shape.points.every(2)

// Every 3rd shape, starting at index 1
shapes.every(3, 1)

// Every other line
shape.lines.every(2)
```

### `.at(...indices: number[])`

Selects specific elements by index.

**Parameters:**
- `indices`: Variable number of index arguments

**Returns:** Same context type with filtered selection

**Example:**
```typescript
shape.points.at(0, 2, 4)      // Points 0, 2, 4
shapes.at(10, 20, 30)         // Shapes 10, 20, 30
shape.lines.at(1, 3)          // Lines 1, 3
```

### `.slice(start: number, end?: number)` *(Shapes only)*

Selects a range of shapes.

**Parameters:**
- `start`: Starting index (inclusive)
- `end` (optional): Ending index (exclusive). If omitted, selects to end.

**Returns:** `ShapesContext` with filtered selection

**Example:**
```typescript
shapes.slice(0, 10)           // First 10 shapes
shapes.slice(10)              // All shapes from index 10 onward
```

---

## Systems

Systems are parametric scaffolds that generate coordinates or paths for pattern creation.

### `system.grid(options)`

Creates a grid system (square, hexagonal, or triangular).

**Options:**
```typescript
{
  type: 'square' | 'hexagonal' | 'triangular',
  count: [number, number],      // [columns, rows]
  size: number,                 // Cell size/spacing
  center?: [number, number]     // Grid center (default: [0, 0])
}
```

**Returns:** `GridSystem`

**Methods:**
- `.place(shape: ShapeContext)` - Place a shape at each grid point
- `.toSVG(options?)` - Render grid directly to SVG
- `.stamp(collector, style?)` - Render to SVG collector

**Example:**
```typescript
import { system, shape } from 'patterin';

// Square grid
const squareGrid = system.grid({
  type: 'square',
  count: [10, 10],
  size: 40
});

// Place hexagons at each point
squareGrid.place(shape.hexagon().radius(15));

// Hexagonal grid
const hexGrid = system.grid({
  type: 'hexagonal',
  count: [8, 8],
  size: 30,
  center: [200, 200]
});
```

### `system.tessellation(options)`

Creates a tessellation (tiling pattern) system.

**Options:**
```typescript
{
  pattern: 'penrose' | 'trihexagonal' | 'custom',
  size: number,                  // Tile size
  bounds: {                      // Bounding area
    width: number,
    height: number
  },
  seed?: number,                 // Random seed for patterns
  iterations?: number,           // Penrose iterations
  spacing?: number               // Trihexagonal spacing
}
```

**Returns:** `TessellationSystem`

**Methods:**
- `.toSVG(options?)` - Render to SVG
- `.stamp(collector, style?)` - Render to SVG collector

**Example:**
```typescript
// Penrose tiling
const penrose = system.tessellation({
  pattern: 'penrose',
  size: 30,
  bounds: { width: 400, height: 400 },
  iterations: 4
});

console.log(penrose.toSVG({ width: 500, height: 500 }));

// Trihexagonal tiling
const trihex = system.tessellation({
  pattern: 'trihexagonal',
  spacing: 40,
  bounds: { width: 400, height: 400 }
});
```

### `system.lsystem(options)`

Creates an L-system (Lindenmayer system) for generating fractals and organic patterns.

**Options:**
```typescript
{
  axiom: string,                         // Starting string
  rules: { [key: string]: string },     // Production rules
  iterations: number,                    // Number of generations
  angle: number,                         // Turn angle in degrees
  length: number,                        // Step length
  initialAngle?: number                  // Starting direction (default: 0)
}
```

**Command Symbols:**
- `F`, `G`: Move forward and draw
- `+`: Turn left by angle
- `-`: Turn right by angle
- `[`: Push state (position + angle) onto stack
- `]`: Pop state from stack

**Returns:** `LSystem`

**Methods:**
- `.toSVG(options?)` - Render to SVG
- `.stamp(collector, style?)` - Render to SVG collector

**Example:**
```typescript
// Dragon curve
const dragon = system.lsystem({
  axiom: 'F',
  rules: {
    F: 'F+G',
    G: 'F-G'
  },
  iterations: 12,
  angle: 90,
  length: 4
});

// Fractal tree
const tree = system.lsystem({
  axiom: 'F',
  rules: {
    F: 'FF+[+F-F-F]-[-F+F+F]'
  },
  iterations: 4,
  angle: 22.5,
  length: 3,
  initialAngle: 90  // Point upward
});

// Hilbert curve
const hilbert = system.lsystem({
  axiom: 'L',
  rules: {
    L: '+RF-LFL-FR+',
    R: '-LF+RFR+FL-'
  },
  iterations: 5,
  angle: 90,
  length: 3
});
```

### `system.quilt(options)`

Creates a quilt block system with grid-based placement and block selection.

**Options:**
```typescript
{
  gridSize: [number, number],    // [columns, rows]
  blockSize: number,             // Size of each block in units
  defaultBlock?: string          // Default block template (default: 'pinwheel')
}
```

**Block Templates:**

Available blocks with two-character shortcuts:
- `pinwheel` or `PW` - Four HSTs in spinning pattern
- `brokenDishes` or `BD` - Four HSTs with dark at corners
- `friendshipStar` or `FS` - Nine-patch star with HST points
- `shooFly` or `SF` - Nine-patch with corner HSTs
- `bowTie` or `BT` - Four-patch with opposing HSTs
- `dutchmansPuzzle` or `DP` - Flying geese pinwheel
- `sawtoothStar` or `SS` - Nine-patch star with flying geese

**Returns:** `QuiltSystem`

**Methods:**
- `.pattern` - Get QuiltPatternContext for block selection and placement
- `.trace()` - Make quilt concrete for rendering
- `.stamp(collector, style?)` - Render to SVG collector
- `.toSVG(options?)` - Render to SVG

**QuiltPatternContext Methods:**
- `.every(n, offset?)` - Select every nth placement
- `.slice(start, end?)` - Select range of placements
- `.at(...indices)` - Select specific placements
- `.all()` - Clear selection (select all)
- `.placeBlock(blockName)` - Assign block template to selected placements

**Example:**
```typescript
// Create a 4x4 quilt with alternating blocks
const quilt = system.quilt({
  gridSize: [4, 4],
  blockSize: 100
});

// Alternate between two patterns using .pattern context
quilt.pattern.every(2).placeBlock('BD');        // Broken Dishes on even positions
quilt.pattern.every(2, 1).placeBlock('FS');     // Friendship Star on odd positions

// Access generated shapes by group
const shapes = quilt.shapes;
shapes.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#333' : '#999';
  svg.addShape(shape, { fill: color, stroke: '#000' });
});

// Simple 3x3 pinwheel quilt
const simple = system.quilt({
  gridSize: [3, 3],
  blockSize: 80
});
simple.pattern.placeBlock('PW');  // All pinwheels

// Mix multiple blocks
const sampler = system.quilt({
  gridSize: [3, 3],
  blockSize: 80
});
sampler.pattern.at(0, 2, 6, 8).placeBlock('FS');      // Corners
sampler.pattern.at(1, 3, 5, 7).placeBlock('BD');      // Sides
sampler.pattern.at(4).placeBlock('SS');               // Center
```

### `system.fromShape(shape: ShapeContext, options?)`

Creates a system using shape vertices as placement points.

**Options:**
```typescript
{
  // Currently minimal options
}
```

**Returns:** `ShapeSystem`

**Methods:**
- `.place(shape)` - Place a shape at each vertex
- `.toSVG(options?)` - Render to SVG
- `.stamp(collector, style?)` - Render to SVG collector

**Example:**
```typescript
// Use hexagon vertices as grid points
const hexPoints = system.fromShape(
  shape.hexagon().radius(100)
);

hexPoints.place(shape.circle().radius(10));
```

---

## SVG Output

### `SVGCollector`

Collects shapes and renders them to SVG markup.

**Constructor:**
```typescript
import { SVGCollector } from 'patterin';

const svg = new SVGCollector();
```

**Methods:**

#### `.add(path: string, style?: PathStyle)`

Adds a raw SVG path.

**Parameters:**
- `path`: SVG path data string
- `style` (optional): Path style object

#### `.toString(options?)`

Renders collected paths to SVG string.

**Options:**
```typescript
{
  width?: number,          // SVG width (default: auto from bounds)
  height?: number,         // SVG height (default: auto from bounds)
  margin?: number,         // Margin around content (default: 10)
  autoScale?: boolean      // Auto-fit to width/height (default: true)
}
```

**Returns:** `string` - Complete SVG markup

**Example:**
```typescript
const svg = new SVGCollector();

// Add shapes
shape.circle().radius(50).stamp(svg);
shape.rect().translate(100, 0).stamp(svg);

// Render with specific dimensions
const markup = svg.toString({
  width: 800,
  height: 600,
  margin: 20
});

console.log(markup);
// Or write to file
import { writeFileSync } from 'fs';
writeFileSync('output.svg', markup);
```

### `PathStyle`

Style object for SVG paths.

**Type:**
```typescript
interface PathStyle {
  stroke?: string;          // Stroke color (default: '#000')
  strokeWidth?: number;     // Stroke width (default: 1)
  fill?: string;            // Fill color (default: 'none')
  opacity?: number;         // Opacity 0-1 (default: 1)
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
}
```

**Example:**
```typescript
const style = {
  stroke: '#ff0000',
  strokeWidth: 2,
  fill: 'none',
  opacity: 0.8
};

shape.circle().stamp(svg, 0, 0, style);
```

### `.stamp()` Method

All shape contexts and systems have a `.stamp()` method to render to an SVG collector.

**Shape Signature:**
```typescript
shape.stamp(
  collector: SVGCollector,
  x?: number,
  y?: number,
  style?: PathStyle
)
```

**System Signature:**
```typescript
system.stamp(
  collector: SVGCollector,
  style?: PathStyle
)
```

**Example:**
```typescript
import { shape, system, SVGCollector } from 'patterin';

const svg = new SVGCollector();

// Stamp with position and style
shape.circle()
  .radius(50)
  .stamp(svg, 100, 100, { stroke: 'blue', strokeWidth: 2 });

// Stamp system
system.grid({ type: 'hexagonal', count: [5, 5], size: 30 })
  .place(shape.hexagon().radius(10))
  .stamp(svg);

console.log(svg.toString());
```

---

## Complete Example

Putting it all together:

```typescript
import { shape, system, SVGCollector } from 'patterin';

const svg = new SVGCollector();

// Create a hexagonal grid
const grid = system.grid({
  type: 'hexagonal',
  count: [8, 8],
  size: 40,
  center: [200, 200]
});

// Place a modified hexagon at each grid point
const hex = shape.hexagon()
  .radius(15);

// Turn every other edge into a gear
hex.lines.every(2).extrude(5);

grid.place(hex).stamp(svg);

// Add a fractal tree in the corner
const tree = system.lsystem({
  axiom: 'F',
  rules: { F: 'FF+[+F-F-F]-[-F+F+F]' },
  iterations: 4,
  angle: 22.5,
  length: 3,
  initialAngle: 90
});

tree.stamp(svg, { stroke: '#666' });

// Render to SVG
const output = svg.toString({
  width: 800,
  height: 800,
  margin: 20
});

console.log(output);
```

---

## Type Exports

Patterin exports TypeScript types for better development experience:

```typescript
import type {
  PathStyle,
  SVGOptions,
  GridOptions,
  TessellationOptions,
  LSystemOptions,
  QuiltOptions,
  QuiltBlockTemplate
} from 'patterin';
```

## Quilt Block Details

### Block Structure

Each quilt block is composed of:
- **Grid size**: 2×2 (four-patch) or 3×3 (nine-patch)
- **Cell types**: 
  - Square (solid light or dark)
  - HST (Half-Square Triangle) - rotatable in 90° increments
  - Flying Geese - rotatable in 90° increments

### Four-Patch Blocks (2×2)

**Pinwheel (`PW`)** - Four HSTs with dark triangles meeting at center

**Broken Dishes (`BD`)** - Four HSTs with dark at outer corners

**Bow Tie (`BT`)** - Opposing corner HSTs creating bow tie shape

**Dutchman's Puzzle (`DP`)** - Flying geese units in pinwheel formation

### Nine-Patch Blocks (3×3)

**Friendship Star (`FS`)** - Center square with HST points forming star

**Shoo Fly (`SF`)** - Corner HSTs with center square and edge squares

**Sawtooth Star (`SS`)** - Center square with flying geese star points

### Shape Groups

All quilt shapes are tagged with a `group` property:
- `'light'` - Light fabric pieces
- `'dark'` - Dark fabric pieces

Use these groups to apply colors:

```typescript
const quilt = system.quilt({ gridSize: [3, 3], blockSize: 80 });
quilt.placeBlock('FS');

quilt.shapes.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#333' : '#999';
  svg.addShape(shape, { fill: color, stroke: '#000' });
});
```

For more examples and interactive exploration, check out the [Playground](https://neurofuzzy.github.io/patterin/playground).
