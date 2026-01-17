# Drawing Object Model Specification

## Overview

The drawing object model defines the low-level geometric primitives that underlie all shapes and systems. It ensures robust operations for boolean algebra, WebGL rendering, and fabrication output.

## Core Principles

- **Closed topology**: All shapes consist of closed loops of segments
- **Winding direction**: Shapes have inside/outside determined by segment order
- **Vertex normals**: Enable offset operations and raycast construction
- **Triangulatable**: Any shape can be decomposed into triangles
- **Self-intersection allowed**: Emergent geometry is a feature, not a bug

## Primitives

### Vector2

```javascript
class Vector2 {
  x: number;
  y: number;
  
  // Operations
  add(other: Vector2): Vector2;
  subtract(other: Vector2): Vector2;
  multiply(scalar: number): Vector2;
  normalize(): Vector2;
  dot(other: Vector2): number;
  length(): number;
  angle(): number;  // radians
}
```

### Vertex

A point in 2D space with a computed normal direction.

```javascript
class Vertex {
  x: number;
  y: number;
  normal: Vector2;  // averaged from adjacent segment normals
  
  // References for traversal
  prevSegment: Segment;
  nextSegment: Segment;
  
  // Computed properties
  computeNormal(): Vector2 {
    // Average of adjacent segment normals
    // Points "outward" based on shape winding
  }
  
  position(): Vector2;
}
```

**Normal computation:**
- Average the normals of adjacent segments
- Normalize to unit vector
- Points "outward" relative to shape winding
- Used for offset operations (expand/inset)

### Segment

A directed edge between two vertices with a normal.

```javascript
class Segment {
  start: Vertex;
  end: Vertex;
  normal: Vector2;    // perpendicular, points "out"
  
  // Half-edge connectivity
  next: Segment;
  prev: Segment;
  
  // Computed properties
  length(): number;
  direction(): Vector2;   // unit vector from start to end
  midpoint(): Vector2;
  
  computeNormal(winding: 'cw' | 'ccw'): Vector2 {
    // Perpendicular to segment direction
    // Points outward based on winding (right-hand rule)
  }
}
```

**Normal direction:**
- CCW winding: normal points to the right of segment direction
- CW winding: normal points to the left of segment direction
- Always points "outward" from shape interior

### Shape

A closed loop of connected segments with consistent winding.

```javascript
class Shape {
  segments: Segment[];
  winding: 'cw' | 'ccw';
  closed: boolean;        // always true for valid shapes
  ephemeral: boolean;     // for construction geometry
  
  // Computed properties
  get vertices(): Vertex[] {
    // Unique vertices in winding order
  }
  
  get triangles(): Triangle[] {
    // Ear clipping or Delaunay triangulation
    // Respects winding order
  }
  
  // Operations
  reverse(): void {
    // Flip winding direction
    // Updates all segment normals
  }
  
  area(): number;
  centroid(): Vector2;
  boundingBox(): BoundingBox;
}
```

## Winding Rules

**Counter-clockwise (CCW)** - Standard SVG convention:
- Segments ordered counter-clockwise
- Interior on the left when traversing
- Normals point outward (to the right)
- Positive area

**Clockwise (CW)** - Holes:
- Segments ordered clockwise
- Interior on the right when traversing
- Normals point outward (to the left)
- Negative area

**Boolean operations:**
- Union: both shapes same winding
- Subtract: hole has opposite winding from subject
- Intersect: result maintains subject winding

## Invariants

All operations must maintain:

1. **Closure**: `segments[n].end === segments[0].start`
2. **Connectivity**: `segments[i].next === segments[i+1]`
3. **Winding consistency**: All segment normals point outward
4. **No zero-length segments**: Degenerate segments removed
5. **No coincident vertices**: Duplicates merged

## Vertex Normal Computation

```javascript
function computeVertexNormal(vertex: Vertex): Vector2 {
  const prev = vertex.prevSegment.normal;
  const next = vertex.nextSegment.normal;
  
  // Simple average
  const avg = prev.add(next).normalize();
  
  // Miter adjustment for sharp corners
  const angle = Math.acos(prev.dot(next));
  if (angle < MITER_THRESHOLD) {
    // Apply miter limit or bevel
  }
  
  return avg;
}
```

**Sharp corner handling (miter):**
- Threshold angle (e.g., 30°) determines when to limit
- Miter limit prevents excessive vertex displacement
- Alternative: insert bevel vertex

## Degenerate Cases

**Coincident vertices:**
- Remove duplicate consecutive vertices
- Merge segments

**Zero-length segments:**
- Remove from shape
- Update connectivity

**Self-intersection:**
- Allowed - preserve topology
- Boolean operations resolve if needed
- Can create emergent patterns

## Triangulation

Shapes must be triangulatable for:
- WebGL rendering
- Area computation
- Point-in-polygon tests

```javascript
class Triangle {
  a: Vertex;
  b: Vertex;
  c: Vertex;
  
  area(): number;
  contains(point: Vector2): boolean;
}

function triangulate(shape: Shape): Triangle[] {
  // Ear clipping algorithm
  // Respects winding order
  // Handles holes (opposite winding)
}
```

## Raycast Construction

Vertices can cast rays along their normals for generative networks.

```javascript
class Ray {
  origin: Vertex;
  direction: Vector2;
  distance: number;
  
  endpoint(): Vector2 {
    return origin.position()
      .add(direction.multiply(distance));
  }
  
  intersect(other: Ray | Segment): Vector2 | null;
}

// On PointsContext
.raycast(options): PointsContext {
  // Cast rays from each vertex along normal
  // Returns ephemeral endpoints
}
```

**Raycast options:**
```javascript
{
  distance: number | string,        // cast length
  direction: 'inward' | 'outward' | number,  // angle offset from normal
  directions?: number,              // multiple rays per vertex
  stopOnIntersect?: boolean         // stop at first intersection
}
```

**Use cases:**
- Spider web patterns (outward rays from circle)
- Star voids (inward rays creating inner structure)
- Network generation (ray intersections)
- Voronoi-like structures (multi-directional rays)

## Storage & References

**Shared vertex references:**
- Multiple segments reference same Vertex instance
- Modifications propagate automatically
- Efficient for connectivity queries

**Alternative (inline coords):**
- Each segment stores start/end coordinates
- Simpler but requires duplicate updates
- Consider based on performance profiling

**Current recommendation**: Shared references for traversal efficiency

## Operations Maintaining Invariants

### Expand/Inset
```javascript
shape.points.expand(distance);
// 1. Move each vertex along its normal
// 2. Recompute segment normals
// 3. Recompute vertex normals
// 4. Maintain closure
```

### Extrude
```javascript
shape.lines.extrude(distance);
// 1. Create parallel segments at offset
// 2. Connect endpoints with perpendiculars
// 3. Maintain winding direction
// 4. Close the loop
```

### Boolean Operations
```javascript
shapeA.union(shapeB);
// 1. Ensure consistent winding
// 2. Find intersections
// 3. Trace result boundary
// 4. Remove internal segments
// 5. Return new closed shape(s)
```

## WebGL Representation

For GPU rendering, shapes convert to:

```javascript
{
  positions: Float32Array,   // vertex positions [x,y,x,y,...]
  indices: Uint16Array,      // triangle indices
  normals: Float32Array,     // vertex normals [x,y,x,y,...]
  winding: number            // 1 for CCW, -1 for CW
}
```

## Integration with Higher-Level API

The object model is the foundation for:

**ShapeContext operations:**
- `.points` → exposes Vertex array
- `.lines` → exposes Segment array
- `.clone()` → deep copy with new instances
- `.reverse()` → flips winding

**Ephemeral geometry:**
- Same structure, `ephemeral` flag set
- Excluded from final render
- Used for construction/alignment

**Systems:**
- Generate shapes conforming to model
- Place shapes at computed positions
- All placed shapes maintain invariants

## Example: Circle Construction

```javascript
function createCircle(radius: number, segments: number): Shape {
  const vertices: Vertex[] = [];
  const segs: Segment[] = [];
  
  // Create vertices
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    vertices.push(new Vertex(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    ));
  }
  
  // Create segments (CCW winding)
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const seg = new Segment(vertices[i], vertices[next]);
    segs.push(seg);
  }
  
  // Connect segments
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const prev = (i - 1 + segments) % segments;
    segs[i].next = segs[next];
    segs[i].prev = segs[prev];
  }
  
  // Compute normals
  segs.forEach(seg => seg.computeNormal('ccw'));
  vertices.forEach(v => v.computeNormal());
  
  return new Shape(segs, 'ccw', true);
}
```
