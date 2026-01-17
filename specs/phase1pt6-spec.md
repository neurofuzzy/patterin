# Phase 1.6: Grid Types & System Tracing

## Overview

Phase 1.6 adds **additional grid types** to GridSystem and makes **systems traceable to geometry**. This enables hexagonal/triangular layouts and allows systems to be rendered as concrete shapes rather than just placement scaffolds.

## Enhanced GridSystem

### Grid Types

GridSystem now supports multiple tiling patterns via `type` parameter:

```javascript
GridSystem.create({
  type: 'square',      // default (existing behavior)
  rows: 5,
  cols: 5,
  spacing: 20,
  // type-specific options...
})
```

### Square Grid (default)

**Existing behavior** - orthogonal grid with rectangular cells.

```javascript
GridSystem.create({
  type: 'square',     // optional, this is default
  rows: 5,
  cols: 5,
  spacing: 20         // uniform, or { x: 20, y: 30 }
})
```

**Queryable elements:**
- `.nodes` → PointsContext (grid intersections)
- `.cells` → ShapesContext (rectangles)
- `.rows` → LinesContext (horizontal lines)
- `.columns` → LinesContext (vertical lines)

### Hexagonal Grid

Honeycomb pattern with hexagonal cells.

```javascript
GridSystem.create({
  type: 'hexagonal',
  rows: 5,
  cols: 5,
  spacing: 20,           // distance between hex centers
  orientation: 'pointy'  // 'pointy' (default) or 'flat'
})
```

**Orientation:**
- **`'pointy'`** - hexagon points up/down (⬡)
- **`'flat'`** - hexagon flat sides up/down (⬢)

**Queryable elements:**
- `.nodes` → PointsContext (hex centers)
- `.cells` → ShapesContext (hexagons)
- `.rows` → LinesContext (horizontal connections through centers)
- `.columns` → LinesContext (vertical connections through centers)

**Layout pattern:**
```
Pointy orientation:
  ⬡ ⬡ ⬡
 ⬡ ⬡ ⬡
  ⬡ ⬡ ⬡

Flat orientation:
⬢ ⬢ ⬢
 ⬢ ⬢ ⬢
⬢ ⬢ ⬢
```

### Triangular Grid

Equilateral triangles tiling the plane.

```javascript
GridSystem.create({
  type: 'triangular',
  rows: 5,
  cols: 5,
  spacing: 20  // edge length of triangles
})
```

**Queryable elements:**
- `.nodes` → PointsContext (triangle centers)
- `.cells` → ShapesContext (triangles, alternating up/down orientation)
- `.rows` → LinesContext (zigzag horizontal connections)
- `.columns` → LinesContext (zigzag vertical connections)

**Layout pattern:**
```
△ ▽ △ ▽
▽ △ ▽ △
△ ▽ △ ▽
```

### Brick Grid

Offset grid pattern like brickwork.

```javascript
GridSystem.create({
  type: 'brick',
  rows: 5,
  cols: 5,
  spacing: 20,      // or { x: 40, y: 20 } for brick proportions
  offset: 0.5       // 0-1, how much to offset alternating rows
})
```

**Offset values:**
- `0` - stack bond (aligned columns)
- `0.5` - running bond (classic brick, half offset)
- `0.33` - third bond
- `0.25` - quarter bond

**Queryable elements:**
- `.nodes` → PointsContext (brick centers)
- `.cells` → ShapesContext (rectangles, offset pattern)
- `.rows` → LinesContext (horizontal lines through centers)
- `.columns` → LinesContext (zigzag vertical connections)

**Layout pattern (offset: 0.5):**
```
┌──┬──┬──┬──┐
├──┼──┼──┼──┤
 ┌──┬──┬──┬──┐
 ├──┼──┼──┼──┤
┌──┬──┬──┬──┐
```

## System Tracing

All systems (GridSystem and ShapeSystem) can be traced to concrete geometry.

### `.trace()` → System

Makes system structure concrete (renderable).

```javascript
const grid = GridSystem.create({ 
  type: 'hexagonal', 
  rows: 5, 
  cols: 5, 
  spacing: 20 
});

// System structure is ephemeral by default
grid.cells;  // ephemeral hexagons
grid.rows;   // ephemeral lines

// Trace entire system
grid.trace();
// All structural elements become concrete:
// - grid.cells (hexagons)
// - grid.rows (horizontal lines)
// - grid.columns (vertical lines)
// - grid.nodes stay ephemeral (placement targets only)

// Now renderable
grid.stamp(svg, 0, 0);
```

### Selective Tracing

Trace only specific elements:

```javascript
// Trace only cells
grid.cells.trace();

// Trace only structural lines
grid.rows.trace();
grid.columns.trace();

// Nodes never trace (always ephemeral)
grid.nodes;  // always placement targets, never render
```

### What Gets Traced

**GridSystem:**
- `.cells` → ShapesContext (becomes concrete)
- `.rows` → LinesContext (becomes concrete)
- `.columns` → LinesContext (becomes concrete)
- `.nodes` → PointsContext (stays ephemeral always)

**ShapeSystem:**
- `.edges` → LinesContext (becomes concrete)
- `.center` → PointContext (becomes concrete if traced)
- `.bbox` → RectContext (becomes concrete if traced)
- `.nodes` → PointsContext (stays ephemeral always)

### Rendering Traced Systems

Once traced, systems behave like any shape collection:

```javascript
const grid = GridSystem.create({ type: 'hexagonal', rows: 5, cols: 5 });

// Trace and style
grid.trace();
grid.cells.stamp(svg, 0, 0, { stroke: '#333', fill: 'none' });

// Or export directly
grid.trace().toSVG({ width: 500, height: 500 });
```

### Nodes as Shapes

To visualize nodes, place or clone shapes:

```javascript
// Place shapes at nodes
grid.nodes.place(circle.radius(2));

// Clone to create shape instances
const nodeShapes = grid.nodes.clone();  // ShapesContext
nodeShapes.stamp(svg, 0, 0);

// Expand nodes to circles
grid.nodes.forEach(node => {
  node.expand(3, 8).stamp(svg, 0, 0);
});
```

## Grid Type Implementation Notes

### Hexagonal Grid Math

**Pointy-top hex layout:**
```javascript
const hexWidth = spacing * Math.sqrt(3);
const hexHeight = spacing * 2;

// Offset rows
for (let row = 0; row < rows; row++) {
  const yOffset = row * hexHeight * 0.75;
  const xOffset = (row % 2) * hexWidth / 2;
  
  for (let col = 0; col < cols; col++) {
    const x = col * hexWidth + xOffset;
    const y = yOffset;
    // create hex at (x, y)
  }
}
```

**Flat-top hex layout:**
```javascript
const hexWidth = spacing * 2;
const hexHeight = spacing * Math.sqrt(3);

// Offset columns
for (let row = 0; row < rows; row++) {
  const yOffset = row * hexHeight;
  
  for (let col = 0; col < cols; col++) {
    const xOffset = col * hexWidth * 0.75;
    const yOffset2 = (col % 2) * hexHeight / 2;
    const x = xOffset;
    const y = yOffset + yOffset2;
    // create hex at (x, y)
  }
}
```

**References:**
- [Red Blob Games - Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/) (definitive guide)

### Triangular Grid Math

```javascript
const height = spacing * Math.sqrt(3) / 2;

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const x = col * spacing / 2;
    const y = row * height;
    
    // Alternate up/down triangles
    const pointsUp = (row + col) % 2 === 0;
    
    if (pointsUp) {
      // △ vertices: bottom-left, bottom-right, top
    } else {
      // ▽ vertices: top-left, top-right, bottom
    }
  }
}
```

### Brick Grid Math

```javascript
const cellWidth = typeof spacing === 'number' ? spacing : spacing.x;
const cellHeight = typeof spacing === 'number' ? spacing : spacing.y;

for (let row = 0; row < rows; row++) {
  const xOffset = (row % 2) * cellWidth * offset;
  
  for (let col = 0; col < cols; col++) {
    const x = col * cellWidth + xOffset;
    const y = row * cellHeight;
    // create cell at (x, y)
  }
}
```

## API Updates

### GridSystem.create() Parameters

```typescript
{
  type?: 'square' | 'hexagonal' | 'triangular' | 'brick',
  rows: number,
  cols: number,
  spacing: number | { x: number, y: number },
  
  // Hexagonal-specific
  orientation?: 'pointy' | 'flat',
  
  // Brick-specific
  offset?: number  // 0-1
}
```

### System Methods

All systems (GridSystem, ShapeSystem) gain:

```typescript
.trace() → System  // makes structure concrete
```

Elements gain selective tracing:

```typescript
.cells.trace() → ShapesContext
.rows.trace() → LinesContext
.columns.trace() → LinesContext
.edges.trace() → LinesContext
```

## Example Patterns

### Hexagonal Honeycomb

```javascript
const hex = GridSystem.create({
  type: 'hexagonal',
  rows: 6,
  cols: 6,
  spacing: 20,
  orientation: 'pointy'
});

hex.cells.trace().stamp(svg, 0, 0, { stroke: '#333' });
hex.nodes.place(circle.radius(2));
hex.toSVG({ width: 500, height: 500 });
```

### Triangular Mesh

```javascript
const tri = GridSystem.create({
  type: 'triangular',
  rows: 8,
  cols: 8,
  spacing: 30
});

tri.trace();  // trace entire structure
tri.cells.every(2).stamp(svg, 0, 0, { fill: '#eee' });
tri.cells.every(2, 1).stamp(svg, 0, 0, { fill: '#ddd' });
```

### Brick Wall Pattern

```javascript
const wall = GridSystem.create({
  type: 'brick',
  rows: 10,
  cols: 10,
  spacing: { x: 40, y: 20 },
  offset: 0.5
});

wall.cells.trace().stamp(svg, 0, 0, { 
  stroke: '#8b4513',
  fill: '#cd853f'
});
```

### Hexagonal with Radial Centers

```javascript
const hex = GridSystem.create({
  type: 'hexagonal',
  rows: 5,
  cols: 5,
  spacing: 40
});

// Trace hex outlines
hex.cells.trace().stamp(svg, 0, 0, { stroke: '#ccc' });

// Place radial patterns at each hex center
hex.nodes.forEach(node => {
  const radial = ShapeSystem.create(
    circle.radius(15).segments(6)
  );
  radial.nodes.place(circle.radius(2));
  // Each hex gets a small radial
});
```

### Mixed Grid Layers

```javascript
const square = GridSystem.create({
  type: 'square',
  rows: 5,
  cols: 5,
  spacing: 40
});

const hex = GridSystem.create({
  type: 'hexagonal',
  rows: 5,
  cols: 5,
  spacing: 40
});

// Layer traced grids
square.trace().stamp(svg, 0, 0, { stroke: '#333' });
hex.trace().stamp(svg, 0, 0, { stroke: '#999', opacity: 0.5 });
```

### Traced System as Shape

```javascript
const grid = GridSystem.create({ type: 'triangular', rows: 5, cols: 5 });

// Trace and manipulate as shapes
grid.trace();
grid.cells.offset(2);  // offset all triangles
grid.cells.every(3).explode();  // explode some cells

grid.toSVG({ width: 500, height: 500 });
```

## Testing Requirements

- [ ] Square grid unchanged from Phase 1
- [ ] Hexagonal grid pointy orientation correct
- [ ] Hexagonal grid flat orientation correct
- [ ] Hexagonal cells are regular hexagons
- [ ] Triangular grid alternates up/down triangles
- [ ] Triangular cells are equilateral
- [ ] Brick grid offset values work (0, 0.25, 0.5, 0.75)
- [ ] System.trace() makes all elements concrete
- [ ] Selective tracing (cells only, rows only, etc.)
- [ ] Nodes always stay ephemeral
- [ ] Traced systems render correctly
- [ ] Grid types scale correctly in toSVG()
- [ ] Visual tests for each grid type in test-output/

## Phase 1.6 Definition of Done

- ✅ GridSystem supports 4 types: square, hexagonal, triangular, brick
- ✅ Hexagonal grid supports pointy/flat orientations
- ✅ All grid types generate correct geometry
- ✅ Systems support .trace() method
- ✅ Selective tracing works (cells, rows, columns)
- ✅ Nodes always ephemeral, never trace
- ✅ Traced systems render and export correctly
- ✅ All tests passing with visual output
- ✅ Documentation updated
- ✅ Examples showing each grid type

## References

- [Red Blob Games - Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/) - Math and algorithms
- [Wolfram MathWorld - Regular Tessellations](https://mathworld.wolfram.com/RegularTessellation.html)
- [Wikipedia - Euclidean Tilings](https://en.wikipedia.org/wiki/Euclidean_tilings_by_convex_regular_polygons)
- [Tiling Encyclopedia](https://tilings.math.uni-bielefeld.de/)
