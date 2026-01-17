# Phase 1.5 API Additions

## Overview

Phase 1.5 adds **topology mutation operations** and **advanced layout methods** to the core API. These operations enable more complex generative patterns and destructive workflows.

## Core Principles

- **Ephemeral for destruction**: Operations that "destroy" shapes mark them ephemeral instead of deleting
- **`.trace()` restores**: Any ephemeral shape can be made concrete again
- **Independent results**: Expansion/explosion creates new independent geometry
- **Simple algorithms**: Avoid complex boolean operations, use vertex normal methods

## New Operations

### Shape Operations

#### `.explode()` → LinesContext

Breaks a shape into independent segments, marks original as ephemeral.

```javascript
const rect = shape.rect().wh(100, 100);
const segments = rect.explode();

// rect is now ephemeral (won't render)
// segments = LinesContext with 4 orphan line segments
// Each segment has unique vertex instances
// No connectivity between segments

segments.stamp(svg, 0, 0);  // renders 4 disconnected lines
rect.trace().stamp(svg, 0, 0);  // restores and renders original rect
```

**Use cases:**
- Decompose shapes for individual manipulation
- Create disconnected line art
- Extract segments for analysis

#### `.collapse()` → PointContext

Reduces shape to its centroid, marks original as ephemeral.

```javascript
const circle = shape.circle().radius(50);
const center = circle.collapse();

// circle is now ephemeral
// center = PointContext at circle's centroid

center.expand(5, 8).stamp(svg, 0, 0);  // new circle at center
circle.trace().stamp(svg, 0, 0);  // restores original
```

**Use cases:**
- Replace complex shapes with points
- Extract centers for layout
- Simplify compositions

#### `.offset(distance, miterLimit?)` → ShapeContext

Offsets shape outline inward (negative) or outward (positive).

```javascript
const rect = shape.rect().wh(100, 100);

// Outset - expand shape
const larger = rect.offset(10);  // 110×110 rect

// Inset - shrink shape
const smaller = rect.offset(-10);  // 90×90 rect

// With miter limit
const beveled = rect.offset(20, 2);  // miter limit = 2
```

**Algorithm:**
1. Move each vertex along its normal by offset distance
2. Extend/trim adjacent segments to their intersection point
3. Apply miter limit:
   - If miter length > distance × miterLimit, insert bevel
   - Bevel = two vertices at segment endpoints instead of sharp corner
4. Self-intersection on extreme insets is allowed (matches design program behavior)

**Default miter limit:** 4 (same as SVG default)

**Use cases:**
- Create concentric shapes
- Padding/margin effects
- Stroke-like outlines

### Point Operations

#### `.expand(radius, segments)` → ShapeContext

Expands a point into a circle with specified radius and segment count.

```javascript
const points = shape.circle().radius(50).segments(8).points;

// Expand each point into a small circle
points.forEach(p => {
  p.expand(5, 8).stamp(svg, 0, 0);
});

// Or on selection
points.at(0, 4).expand(10, 6);  // hexagons at two points
```

**Returns:** Independent ShapeContext (circle) at point location
**Original shape:** Unchanged

**Use cases:**
- Create compound patterns (circles on circle vertices)
- Node visualization
- Decorative elements

#### `.raycast(options)` → PointsContext (enhanced)

Cast rays from points. Enhanced to handle orphan points without normals.

```javascript
// On shape vertices - uses vertex normal
circle.points.raycast({ 
  distance: 10, 
  direction: 'outward' 
});

// On orphan points - explicit angle required
orphanPoint.raycast({ 
  distance: 10, 
  direction: 45  // degrees from horizontal
});

// On point selection - uses selection center
points.at(0, 2, 4).raycast({ 
  distance: 10, 
  direction: 'outward'  // away from selection center
});
```

**Options:**
```typescript
{
  distance: number,
  direction: 'inward' | 'outward' | number,  // angle in degrees
  directions?: number,        // multiple rays per point
  stopOnIntersect?: boolean  // stop at first intersection
}
```

**Direction resolution:**
- **With parent shape:** `'outward'` = along vertex normal, `'inward'` = opposite
- **Orphan point:** `'outward'`/`'inward'` = relative to selection center
- **Explicit angle:** Always uses provided degrees (0° = right, 90° = up)

### Segment Operations

#### `.collapse()` → PointContext

Collapses segment to its midpoint, modifies parent shape.

```javascript
const rect = shape.rect().wh(100, 100);

// Collapse one segment
const midpoint = rect.lines.at(0).collapse();

// rect now has 3 segments (vertices merged at midpoint)
// Still a closed shape
// midpoint = PointContext at collapsed location
```

**Effect on parent shape:**
- Removes segment
- Merges start/end vertices to midpoint
- Reconnects adjacent segments
- Reduces total vertex count by 1

**Use cases:**
- Simplify polygons
- Create irregular shapes from regular ones
- Vertex reduction

#### `.expand(distance)` → ShapeContext

Expands segment to a rectangle with square ends.

```javascript
const line = shape.rect().wh(100, 50).lines.at(0);

// Expand to rectangle
const rect = line.expand(5);

// Creates rectangle:
// - Width = segment length (100)
// - Height = distance * 2 (10 total: 5 above, 5 below)
// - Square end caps (perpendicular to segment)
```

**Returns:** Independent ShapeContext (rectangle)
**Original shape:** Unchanged

**Use cases:**
- Convert strokes to fills
- Create beams/bars
- Building block for shape offset algorithm

### Layout Operations

#### `.spreadPolar(radius, arc?)` → ShapesContext

Distributes shapes radially around a circle.

```javascript
// Full circle (360°)
circle.radius(5)
  .clone(8)
  .spreadPolar(50);  // 8 circles evenly around 50px radius

// Partial arc - two numbers [start, end] in degrees
circle.radius(5)
  .clone(6)
  .spreadPolar(50, [0, 180]);  // semi-circle, top half

// Single number = end angle, start = 0
circle.radius(5)
  .clone(12)
  .spreadPolar(50, 270);  // 3/4 circle
```

**Parameters:**
- `radius`: Distance from origin
- `arc`: Optional angle range
  - `undefined`: Full circle (0-360°)
  - `number`: Arc from 0° to specified angle
  - `[start, end]`: Arc from start to end angle
  - Angles in degrees: 0° = right, 90° = up, 180° = left, 270° = down

**Use cases:**
- Radial menus
- Sunburst patterns
- Polar grids
- Flower/mandala patterns

## Updated Context APIs

### ShapeContext additions

```typescript
.explode() → LinesContext
.collapse() → PointContext
.offset(distance, miterLimit?) → ShapeContext
```

### PointsContext additions

```typescript
.expand(radius, segments) → ShapeContext
.raycast(options) → PointsContext  // enhanced for orphans
```

### LinesContext additions

```typescript
.collapse() → PointContext
.expand(distance) → ShapeContext
```

### ShapesContext additions

```typescript
.spreadPolar(radius, arc?) → ShapesContext
```

## Ephemeral Flag Behavior

All destruction operations use the same `ephemeral` flag:

```typescript
class Shape {
  ephemeral: boolean = false;
  
  // Construction methods create ephemeral shapes
  bbox() { 
    const box = new Rect(); 
    box.ephemeral = true; 
    return box; 
  }
  
  // Destruction methods mark as ephemeral
  collapse() { 
    this.ephemeral = true; 
    return this.centroid; 
  }
  
  explode() { 
    this.ephemeral = true; 
    return this.segments; 
  }
  
  // Trace makes concrete
  trace() { 
    this.ephemeral = false; 
    return this; 
  }
}
```

**No "destroyed" or "renderable" flags needed** - ephemeral handles everything.

## Example Patterns

### Exploded Grid

```javascript
const grid = GridSystem.create({ rows: 5, cols: 5, spacing: 20 });

grid.cells.forEach(cell => {
  const lines = cell.explode();
  lines.at(0, 2).trace();  // only render top and bottom
});

grid.toSVG({ width: 500, height: 500 });
```

### Concentric Offset Rings

```javascript
const base = circle.radius(100);

for (let i = 0; i < 5; i++) {
  base.offset(-15 * i).stamp(svg, 0, 0);
}
```

### Point Expansion Network

```javascript
const points = circle.radius(50).segments(8).points;

points.forEach(p => {
  p.expand(5, 6).stamp(svg, 0, 0);  // hexagon at each point
});

// Connect expanded shapes
const rays = points.raycast({ distance: 20, direction: 'outward' });
rays.connectTo(points).trace().stamp(svg, 0, 0);
```

### Polar Mandala

```javascript
const petal = circle.radius(10);

for (let ring = 1; ring <= 3; ring++) {
  petal.clone(ring * 8)
    .spreadPolar(ring * 30)
    .stamp(svg, 0, 0);
}
```

### Collapsed Star to Center

```javascript
const star = circle.radius(50).segments(10).points.every(2).expand(20);
const shapes = ShapeSystem.create(star);

// Animate collapse (conceptually - sequences in Phase 2)
const center = star.collapse();
center.expand(5, 8).stamp(svg, 0, 0);
```

### Segment Rectangle Strokes

```javascript
const rect = shape.rect().wh(100, 100);

rect.lines.forEach(line => {
  line.expand(3).stamp(svg, 0, 0);  // 6px wide strokes
});
```

## Implementation Notes

### Offset Algorithm

**Simple vertex normal approach:**
1. For each vertex, compute normal (average of adjacent segment normals)
2. Move vertex along normal by offset distance
3. Find intersection of offset adjacent segments
4. Check miter length: `distance(originalVertex, intersection)`
5. If `miterLength > distance × miterLimit`:
   - Insert bevel: two vertices at offset segment endpoints
6. Otherwise: use intersection point

**Self-intersection handling:**
- Allow self-intersection on extreme insets (matches Illustrator/Figma)
- Users can run through Watertight SVG for cleanup if needed
- Keeps algorithm simple and performant

### Raycast for Orphans

**Decision tree:**
```
if (point has parent shape):
  use vertex normal
else if (direction is number):
  use explicit angle
else if (selection has multiple points):
  use selection center as reference
  'outward' = away from center
  'inward' = toward center
else:
  error: orphan point needs explicit direction
```

### Polar Spread Math

```javascript
function spreadPolar(shapes, radius, arc) {
  const [startAngle, endAngle] = parseArc(arc);  // defaults to [0, 360]
  const angleRange = endAngle - startAngle;
  const angleStep = angleRange / shapes.length;
  
  shapes.forEach((shape, i) => {
    const angle = (startAngle + angleStep * i) * Math.PI / 180;
    shape.moveTo(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
  });
}
```

## Testing Requirements

- [ ] Shape explode creates disconnected segments
- [ ] Shape collapse creates point at centroid
- [ ] Trace restores exploded/collapsed shapes
- [ ] Offset outward expands shape correctly
- [ ] Offset inward shrinks shape correctly
- [ ] Miter limit creates bevels at sharp corners
- [ ] Point expand creates independent circles
- [ ] Raycast on orphan points requires explicit angle
- [ ] Raycast on selection uses center as reference
- [ ] Segment collapse reduces vertex count
- [ ] Segment expand creates rectangles with square ends
- [ ] Polar spread distributes evenly around circle
- [ ] Partial arc spreads correctly
- [ ] All operations maintain winding direction
- [ ] Visual tests for each operation in test-output/

## Phase 1.5 Definition of Done

- ✅ All operations implemented with tests
- ✅ Offset algorithm handles miter limit
- ✅ Raycast enhanced for orphan points
- ✅ Polar spread supports partial arcs
- ✅ Visual examples generate correctly
- ✅ Documentation updated
- ✅ Ephemeral flag used consistently
- ✅ No new dependencies required