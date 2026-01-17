# Phase 1.7: Tessellation System

## Overview

Phase 1.7 adds **TessellationSystem** for complex, aperiodic, and semi-regular tiling patterns. Unlike GridSystem (regular, infinite grids), TessellationSystem handles patterns that require algorithmic generation, subdivision, or randomization.

## Core Principles

- **Algorithmic generation**: Patterns built by rules, not simple repetition
- **Finite bounds**: Tessellations fill a specified area, not infinite
- **Traceable**: Like other systems, can be traced to concrete geometry
- **Deterministic**: Same seed produces same pattern (for reproducibility)

## TessellationSystem API

```javascript
TessellationSystem.create({
  pattern: 'penrose' | 'truchet' | 'girih' | 'trihexagonal' | 'custom',
  bounds: { width: number, height: number },
  seed?: number,
  // pattern-specific options...
})
```

### Common Properties

All tessellation systems share:

```typescript
{
  pattern: string,
  bounds: { width: number, height: number },
  seed?: number  // for deterministic randomness
}
```

**Queryable elements** (like other systems):
- `.nodes` → PointsContext (tile centers or vertices)
- `.tiles` → ShapesContext (individual tiles)
- `.edges` → LinesContext (tile boundaries)

**Methods:**
- `.trace()` → makes tiles concrete
- `.toSVG(options)` → exports to SVG

## Pattern Types

### 1. Penrose Tiling

Aperiodic tiling using two rhombus shapes (kite and dart).

```javascript
TessellationSystem.create({
  pattern: 'penrose',
  bounds: { width: 500, height: 500 },
  iterations: 4,    // subdivision depth (3-6 typical)
  seed: 12345
})
```

**Parameters:**
- `iterations`: Number of subdivision steps (more = smaller tiles)
- `seed`: Random seed for initial configuration

**Algorithm**: Robinson triangle decomposition
1. Start with 10 triangles in radial pattern (five-fold symmetry)
2. Subdivide each triangle according to deflation rules
3. Repeat for specified iterations
4. Convert triangles to kite/dart rhombi

**Tiles:**
- **Kite**: 72° and 144° angles
- **Dart**: 36° and 216° angles
- Golden ratio proportions

**Queryable:**
- `.nodes` → vertices of all tiles
- `.tiles` → ShapesContext with kites and darts
- `.edges` → all tile boundaries
- `.kites` → ShapesContext (only kites)
- `.darts` → ShapesContext (only darts)

**Reference:**
- [Preshing: Penrose Tiling Explained](https://preshing.com/20110831/penrose-tiling-explained/)
- [Wikipedia: Penrose Tiling](https://en.wikipedia.org/wiki/Penrose_tiling)

### 2. Truchet Tiles

Square tiles with simple patterns, rotated randomly to create emergent complexity.

```javascript
TessellationSystem.create({
  pattern: 'truchet',
  bounds: { width: 500, height: 500 },
  tileSize: 20,
  variant: 'quarter-circles',  // or 'diagonal', 'triangles', 'custom'
  seed: 12345
})
```

**Parameters:**
- `tileSize`: Size of each square tile
- `variant`: Which tile pattern to use
- `seed`: Determines rotation pattern

**Built-in variants:**

**Quarter Circles:**
```
┌─╮  ╭─┐
│ │  │ │
╰─┘  └─╯
```
Classic Truchet - quarter circles in corners

**Diagonal:**
```
╱    ╲
```
Simple diagonal lines (10 PRINT pattern)

**Triangles:**
```
╱╲   ╲╱
```
Half-square triangles

**Custom:**
```javascript
TessellationSystem.create({
  pattern: 'truchet',
  variant: 'custom',
  tilePattern: shape.rect().wh(20, 20)  // your custom tile
})
```

**Queryable:**
- `.nodes` → tile centers
- `.tiles` → ShapesContext with all rotated tiles
- `.edges` → tile boundaries (grid)

**Reference:**
- [Truchet Tiles - Wikipedia](https://en.wikipedia.org/wiki/Truchet_tiles)
- [10 PRINT](https://10print.org/)

### 3. Girih (Islamic Geometric)

Five tile shapes used in Persian/Islamic architecture.

```javascript
TessellationSystem.create({
  pattern: 'girih',
  bounds: { width: 500, height: 500 },
  spacing: 40,      // edge length (all tiles share same edge length)
  layout: 'radial', // or 'grid', 'custom'
  seed: 12345
})
```

**The five Girih tiles:**
1. **Decagon** (10 sides, 144° angles)
2. **Pentagon** (5 sides, 108° angles)
3. **Bowtie** (4 sides, 72° and 144° angles)
4. **Rhombus** (4 sides, 72° and 108° angles)
5. **Hexagon** (6 sides, 120° angles)

All tiles have the same edge length - they fit together perfectly.

**Layout strategies:**
- `radial`: Star pattern from center
- `grid`: Hexagonal base grid with tiles filling gaps
- `custom`: Manual tile placement (advanced)

**Queryable:**
- `.nodes` → tile vertices
- `.tiles` → ShapesContext with all tiles
- `.edges` → decorated edges (optional strapwork lines)
- `.decagons`, `.pentagons`, `.bowties`, `.rhombi`, `.hexagons` → by type

**Reference:**
- [Girih Tiles - Wikipedia](https://en.wikipedia.org/wiki/Girih_tiles)
- [Eric Broug - Islamic Geometric Patterns](https://www.thamesandhudson.com/islamic-geometric-patterns-9780500287699)
- [Craig Kaplan's Research](http://www.cgl.uwaterloo.ca/csk/projects/islamicgeometry/)

### 4. Trihexagonal (Semi-Regular)

Alternating triangles and hexagons (3.6.3.6 Archimedean tiling).

```javascript
TessellationSystem.create({
  pattern: 'trihexagonal',
  bounds: { width: 500, height: 500 },
  spacing: 20  // distance between tile centers
})
```

**Pattern:** Hexagons surrounded by triangles, regular repeating pattern.

**Queryable:**
- `.nodes` → tile centers
- `.tiles` → ShapesContext with triangles and hexagons
- `.triangles` → ShapesContext (only triangles)
- `.hexagons` → ShapesContext (only hexagons)

**Could also be GridSystem type?** 
Yes, this could be `GridSystem.create({ type: 'trihexagonal' })` instead. Decision: keep in TessellationSystem for now, may consolidate later.

**Reference:**
- [Trihexagonal Tiling](https://en.wikipedia.org/wiki/Trihexagonal_tiling)

### 5. Custom Tessellation

Repeat a custom shape to fill bounds.

```javascript
TessellationSystem.create({
  pattern: 'custom',
  bounds: { width: 500, height: 500 },
  unit: shape.hexagon().radius(20),  // your shape
  spacing: 40,
  arrangement: 'hexagonal'  // or 'square', 'triangular'
})
```

**Parameters:**
- `unit`: The shape to repeat
- `spacing`: Distance between repetitions
- `arrangement`: How to lay out the grid (uses GridSystem internally)

This is basically "place this shape on a grid" - syntactic sugar for GridSystem + placement.

## Tracing Tessellations

Like other systems, tessellations can be traced:

```javascript
const tess = TessellationSystem.create({
  pattern: 'penrose',
  bounds: { width: 500, height: 500 },
  iterations: 4
});

// Trace entire tessellation
tess.trace();
tess.tiles;  // now concrete ShapesContext

// Selective tracing
tess.kites.trace();   // only kites
tess.edges.trace();   // only edges

// Nodes always ephemeral
tess.nodes;  // placement targets
```

## Rendering & Export

```javascript
// Direct export
tess.toSVG({ width: 500, height: 500 });

// Or stamp after tracing
tess.trace();
tess.tiles.stamp(svg, 0, 0, { stroke: '#333', fill: 'none' });

// Style different tile types
tess.kites.stamp(svg, 0, 0, { fill: '#ffd700' });
tess.darts.stamp(svg, 0, 0, { fill: '#ff6b9d' });
```

## Implementation Notes

### Penrose Algorithm (Robinson Triangles)

**Step 1: Initial configuration**
```javascript
// Start with 10 triangles in radial pattern
const triangles = [];
for (let i = 0; i < 10; i++) {
  const angle = (i * 36) * Math.PI / 180;  // 36° increments
  // Create acute or obtuse triangle
  const type = i % 2 === 0 ? 'acute' : 'obtuse';
  triangles.push(createRobinsonTriangle(type, angle));
}
```

**Step 2: Deflation (subdivision)**
```javascript
function deflate(triangle) {
  if (triangle.type === 'acute') {
    // Split acute triangle into 2 acute + 1 obtuse
    return [acute1, acute2, obtuse1];
  } else {
    // Split obtuse triangle into 1 acute + 1 obtuse
    return [acute1, obtuse1];
  }
}

// Repeat for N iterations
for (let i = 0; i < iterations; i++) {
  triangles = triangles.flatMap(deflate);
}
```

**Step 3: Convert to kites and darts**
Each triangle pair forms a rhombus (kite or dart).

**Libraries to reference:**
- [penrose.js](https://github.com/jwiklund/penrose.js)
- Implementation can be ~200 lines

### Truchet Algorithm

```javascript
const grid = GridSystem.create({ 
  type: 'square', 
  rows: Math.ceil(height / tileSize),
  cols: Math.ceil(width / tileSize)
});

grid.cells.forEach(cell => {
  const rotation = seededRandom() * 4;  // 0, 1, 2, or 3 (90° increments)
  const tile = createTruchetTile(variant);
  tile.rotate(rotation * 90);
  // place at cell
});
```

**Simple - just randomized rotations of a base tile.**

### Girih Algorithm

**Approach 1: Template matching**
- Start with known patterns from literature
- Place tiles according to rules (e.g., decagons at intersections)

**Approach 2: Stellation from hexagonal grid**
- Use hex grid as base
- Place star polygons at hex centers
- Fill gaps with rhombi/bowties

**This is the hardest pattern - may need external library or significant research.**

**Libraries:**
- [tactile.js](https://github.com/isohedral/tactile-js) by Craig Kaplan
- Consider wrapping/adapting rather than implementing from scratch

### Trihexagonal Algorithm

```javascript
// Hexagonal grid base
const hexGrid = GridSystem.create({ type: 'hexagonal', ... });

hexGrid.cells.forEach(hex => {
  // Place hexagon
  tiles.push(hex);
  
  // Fill gaps between hexes with triangles
  // (6 triangles around each hex)
  for (let i = 0; i < 6; i++) {
    const tri = createTriangle(hex.vertex(i), hex.center, hex.vertex(i+1));
    tiles.push(tri);
  }
});
```

## Pattern Complexity

**Easy (Phase 1.7):**
- ✅ Truchet - just rotations
- ✅ Trihexagonal - geometric construction
- ✅ Custom - uses GridSystem

**Medium (Phase 1.7):**
- ✅ Penrose - well-documented algorithm, ~200 lines

**Hard (Phase 2 or external library):**
- ⚠️ Girih - complex rules, may need tactile.js integration

## Example Patterns

### Penrose Tiling with Color

```javascript
const penrose = TessellationSystem.create({
  pattern: 'penrose',
  bounds: { width: 600, height: 600 },
  iterations: 5,
  seed: 42
});

penrose.kites.trace().stamp(svg, 0, 0, { fill: '#ffd700', stroke: '#333' });
penrose.darts.trace().stamp(svg, 0, 0, { fill: '#ff6b9d', stroke: '#333' });
```

### Truchet Maze

```javascript
const truchet = TessellationSystem.create({
  pattern: 'truchet',
  bounds: { width: 400, height: 400 },
  tileSize: 20,
  variant: 'quarter-circles',
  seed: 12345
});

truchet.trace().stamp(svg, 0, 0, { stroke: '#000', strokeWidth: 2 });
```

### Girih Pattern

```javascript
const girih = TessellationSystem.create({
  pattern: 'girih',
  bounds: { width: 500, height: 500 },
  spacing: 40,
  layout: 'radial',
  seed: 99
});

girih.tiles.trace().stamp(svg, 0, 0, { 
  stroke: '#8b4513',
  fill: '#f4e4d7' 
});

// Optional: add decorative strapwork
girih.edges.trace().stamp(svg, 0, 0, { 
  stroke: '#d4af37',
  strokeWidth: 2 
});
```

### Trihexagonal Dual Colors

```javascript
const trihex = TessellationSystem.create({
  pattern: 'trihexagonal',
  bounds: { width: 500, height: 500 },
  spacing: 30
});

trihex.hexagons.trace().stamp(svg, 0, 0, { fill: '#e0e0e0' });
trihex.triangles.trace().stamp(svg, 0, 0, { fill: '#333333' });
```

### Custom Unit Cell

```javascript
const star = circle.radius(20).segments(10).points.every(2).expand(5);

const custom = TessellationSystem.create({
  pattern: 'custom',
  bounds: { width: 500, height: 500 },
  unit: star,
  spacing: 50,
  arrangement: 'hexagonal'
});

custom.trace().stamp(svg, 0, 0);
```

## Testing Requirements

- [ ] Penrose tiling generates valid kite/dart tiles
- [ ] Penrose has five-fold symmetry
- [ ] Penrose deterministic with same seed
- [ ] Truchet quarter-circles variant works
- [ ] Truchet diagonal variant works
- [ ] Truchet custom tiles work
- [ ] Truchet randomization deterministic with seed
- [ ] Girih basic radial layout works
- [ ] Girih tiles have correct edge lengths
- [ ] Trihexagonal pattern correct (3.6.3.6)
- [ ] Custom tessellation uses GridSystem correctly
- [ ] All patterns trace correctly
- [ ] All patterns export to SVG
- [ ] Selective tracing by tile type
- [ ] Visual tests for each pattern type

## Phase 1.7 Definition of Done

- ✅ TessellationSystem implemented
- ✅ Penrose tiling working (Robinson algorithm)
- ✅ Truchet tiles with variants (quarter-circles, diagonal)
- ✅ Trihexagonal pattern working
- ✅ Custom unit cell tessellation
- ✅ Girih either implemented or deferred with plan
- ✅ All patterns traceable
- ✅ Pattern-specific tile type selection works
- ✅ Deterministic with seeds
- ✅ Visual tests for all patterns
- ✅ Documentation complete with references

## Dependencies

**May need:**
- External library for Girih patterns (tactile.js)
- Or defer Girih to Phase 2
- All other patterns implementable from scratch

**Recommendation:** 
- Implement Penrose, Truchet, Trihexagonal, Custom for Phase 1.7
- Research Girih - if simple, include; if complex, defer to Phase 2 with library integration

## References

**Penrose:**
- [Preshing: Penrose Tiling Explained](https://preshing.com/20110831/penrose-tiling-explained/)
- [penrose.js implementation](https://github.com/jwiklund/penrose.js)

**Truchet:**
- [Wikipedia: Truchet Tiles](https://en.wikipedia.org/wiki/Truchet_tiles)
- [10 PRINT book](https://10print.org/)

**Girih:**
- [Wikipedia: Girih Tiles](https://en.wikipedia.org/wiki/Girih_tiles)
- [Craig Kaplan - Islamic Geometry](http://www.cgl.uwaterloo.ca/csk/projects/islamicgeometry/)
- [tactile.js library](https://github.com/isohedral/tactile-js)

**Semi-Regular Tilings:**
- [Wikipedia: Euclidean Tilings](https://en.wikipedia.org/wiki/Euclidean_tilings_by_convex_regular_polygons)
- [Tilings Encyclopedia](https://tilings.math.uni-bielefeld.de/)

**General:**
- [Red Blob Games - Grids](https://www.redblobgames.com/grids/) (techniques applicable to tessellations)
