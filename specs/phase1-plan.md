# Patterin Phase 1: Core Geometry Engine

## Overview

Build the foundational geometry system with no UI, no sequence integration. Focus on rock-solid primitives, shape operations, and system scaffolds with automated tests and visual validation output.

## Goals

- ✅ Implement core drawing object model (Vector2, Vertex, Segment, Shape)
- ✅ Build shape API with fluent chaining (circle, rect, polygon)
- ✅ Implement all context types (ShapeContext, PointsContext, LinesContext, ShapesContext)
- ✅ Build system scaffolds (GridSystem, TreeSystem, VineSystem, NetworkSystem)
- ✅ Create SVG output collector
- ✅ Comprehensive test suite with visual output
- ✅ LLM-friendly documentation

## Non-Goals (Deferred to Phase 2+)

- ❌ Sequence integration (use hardcoded numbers for now)
- ❌ UI/editor/playground
- ❌ Interactive debugger
- ❌ Advanced boolean operations (basic only)
- ❌ WebGL rendering
- ❌ Performance optimization

## Project Structure

```
patterin/
├── src/
│   ├── primitives/
│   │   ├── Vector2.ts
│   │   ├── Vertex.ts
│   │   ├── Segment.ts
│   │   └── Shape.ts
│   ├── contexts/
│   │   ├── ShapeContext.ts
│   │   ├── ShapesContext.ts
│   │   ├── PointsContext.ts
│   │   └── LinesContext.ts
│   ├── shapes/
│   │   ├── circle.ts
│   │   ├── rect.ts
│   │   ├── square.ts
│   │   ├── hexagon.ts
│   │   ├── triangle.ts
│   │   └── index.ts (shape factory)
│   ├── systems/
│   │   ├── GridSystem.ts
│   │   └── ShapeSystem.ts
│   ├── collectors/
│   │   └── SVGCollector.ts
│   ├── utils/
│   │   ├── geometry.ts (triangulation, etc.)
│   │   └── helpers.ts
│   └── index.ts
├── tests/
│   ├── primitives/
│   │   ├── Vector2.test.ts
│   │   ├── Vertex.test.ts
│   │   ├── Segment.test.ts
│   │   └── Shape.test.ts
│   ├── shapes/
│   │   ├── circle.test.ts
│   │   ├── rect.test.ts
│   │   ├── square.test.ts
│   │   ├── hexagon.test.ts
│   │   └── triangle.test.ts
│   ├── systems/
│   │   ├── GridSystem.test.ts
│   │   └── ShapeSystem.test.ts
│   ├── integration/
│   │   ├── shape-operations.test.ts
│   │   ├── system-placement.test.ts
│   │   └── visual-examples.test.ts
│   └── setup.ts
├── test-output/          # .gitignored
├── docs/
│   ├── api.md
│   ├── llm-context.md
│   ├── object-model.md
│   ├── shape-api.md
│   └── systems-api.md
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Implementation Checklist

### 1. Project Setup

- [ ] Initialize npm project
- [ ] Configure TypeScript (strict mode, ES2020+, ESM output)
- [ ] Set up Vitest for testing
- [ ] Create .gitignore (node_modules, test-output, dist)
- [ ] Create initial README with project goals

**Files to create:**
```json
// package.json
{
  "name": "patterin",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 2. Core Primitives

**Priority: HIGH - Foundation for everything**

- [ ] Implement `Vector2` class
  - [ ] Constructor, add, subtract, multiply, normalize
  - [ ] dot, length, angle methods
  - [ ] Unit tests with edge cases (zero vectors, normalization)

- [ ] Implement `Vertex` class
  - [ ] Position storage (x, y)
  - [ ] References to prev/next segments
  - [ ] Normal computation (average of adjacent segment normals)
  - [ ] Unit tests for normal computation at various angles

- [ ] Implement `Segment` class
  - [ ] Start/end vertex references
  - [ ] Prev/next segment references (half-edge structure)
  - [ ] Normal computation based on winding
  - [ ] Length, direction, midpoint computed properties
  - [ ] Unit tests for normal direction (CCW vs CW)

- [ ] Implement `Shape` class
  - [ ] Segments array with winding direction
  - [ ] Closed loop validation
  - [ ] Ephemeral flag
  - [ ] Computed: vertices, area, centroid, boundingBox
  - [ ] reverse() method (flip winding)
  - [ ] Unit tests for invariants (closure, connectivity)

**Tests should verify:**
- Normal directions point outward
- Winding order maintained
- Degenerate cases handled (zero-length segments removed)
- Coincident vertices merged

### 3. Shape Factory & Contexts

**Priority: HIGH - Core API surface**

- [ ] Create `shape` factory entry point
  - [ ] `shape.circle()` → CircleContext
  - [ ] `shape.rect()` → RectContext  
  - [ ] `shape.square()` → SquareContext
  - [ ] `shape.hexagon()` → HexagonContext (6 segments, rotated 30°)
  - [ ] `shape.triangle()` → TriangleContext (3 segments, rotated 60°)

- [ ] Implement `ShapeContext` base class
  - [ ] Properties: points, lines, center, centroid, winding
  - [ ] Methods: clone, stamp, scale, rotate, moveTo, offset, reverse
  - [ ] Construction: bbox(), centerPoint()
  - [ ] trace() to toggle ephemeral flag
  - [ ] Unit tests for each operation

- [ ] Implement `PointsContext`
  - [ ] Selection: every, at, slice
  - [ ] Operations: expand, inset, round, move
  - [ ] Construction: midPoint, bbox, raycast
  - [ ] Connection: connectTo, connectToNext, connectToNearest
  - [ ] Unit tests for raycast and connections

- [ ] Implement `LinesContext`
  - [ ] Selection: every, at, slice
  - [ ] Operations: extrude, divide, offset
  - [ ] Construction: midPoint, intersection, bbox
  - [ ] Unit tests for extrude and divide

- [ ] Implement `ShapesContext` (collection)
  - [ ] Selection: shapes, every, at, slice
  - [ ] Operations: spread
  - [ ] Aggregation: points (all points), lines (all lines)
  - [ ] Unit tests for collection operations

**Circle-specific:**
- [ ] `.radius(r)` → CircleContext
- [ ] `.segments(n)` → CircleContext
- [ ] Generates CCW winding by default

**Rectangle-specific:**
- [ ] `.width(w)`, `.height(h)`, `.wh(w, h)`
- [ ] Generates CCW winding by default

**Square-specific:**
- [ ] `.size(s)` → sets width and height
- [ ] Generates CCW winding by default

**Hexagon-specific:**
- [ ] `.radius(r)` → 6 segments, rotated 30°
- [ ] Generates CCW winding by default

**Triangle-specific:**
- [ ] `.radius(r)` → 3 segments, rotated 60°
- [ ] Generates CCW winding by default

**Tests should verify:**
- Chaining returns correct context types
- Operations maintain shape invariants
- Ephemeral flag propagates correctly

### 4. SVG Collector

**Priority: HIGH - Needed for test output**

- [ ] Implement `SVGCollector` class
  - [ ] `addPath(path, style?)` method
  - [ ] `toString()` generates valid SVG with viewBox
  - [ ] Handles both fill and stroke styles
  - [ ] Auto-computes viewBox from added paths
  - [ ] Unit tests for SVG output validity

- [ ] Implement `.stamp()` on contexts
  - [ ] Evaluates geometry
  - [ ] Skips ephemeral shapes
  - [ ] Calls collector.addPath() with style
  - [ ] Integration tests with SVGCollector

**SVG output format:**
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 10,10 L 90,10 L 90,90 L 10,90 Z" fill="none" stroke="#000"/>
</svg>
```

### 5. Systems

**Priority: MEDIUM - Can build incrementally**

- [ ] Implement `GridSystem`
  - [ ] create({ rows, cols, spacing, offset? })
  - [ ] Queryable: nodes, cells, rows, columns
  - [ ] .place() tracking
  - [ ] .toSVG({ width, height, margin, fit?, debug? })
  - [ ] Auto-scaling to fit dimensions
  - [ ] Unit tests for grid generation
  - [ ] Visual tests (output to test-output/)

- [ ] Implement `ShapeSystem`
  - [ ] create(shape, { includeCenter?, subdivide? })
  - [ ] Queryable: nodes, edges, center, bbox
  - [ ] Converts shape vertices to nodes
  - [ ] Optional edge subdivision
  - [ ] Optional center point inclusion
  - [ ] .place() tracking
  - [ ] .toSVG({ width, height, margin, fit?, debug? })
  - [ ] Unit tests for various input shapes
  - [ ] Visual tests

**All systems should:**
- Track placements internally
- Support chained .place() operations
- Auto-scale to fit output dimensions in toSVG()
- Handle debug visualization (show structure)
- Work with hardcoded numeric values only (no sequence expressions)

### 6. Utilities

**Priority: LOW - As needed**

- [ ] Geometry utilities
  - [ ] Ear clipping triangulation
  - [ ] Point-in-polygon test
  - [ ] Line-line intersection
  - [ ] Bounding box computation
  - [ ] Unit tests for each utility

- [ ] Helper functions
  - [ ] Angle normalization
  - [ ] Distance calculations
  - [ ] Miter limit computation

### 7. Documentation

**Priority: HIGH - Critical for handoff**

- [ ] Create `docs/object-model.md`
  - [ ] Copy drawing object model spec
  - [ ] Add implementation notes

- [ ] Create `docs/shape-api.md`
  - [ ] Copy shape API spec
  - [ ] Add code examples for each method

- [ ] Create `docs/systems-api.md`
  - [ ] Copy systems API spec
  - [ ] Add code examples

- [ ] Create `docs/llm-context.md`
  - [ ] Consolidated reference for AI assistants
  - [ ] Includes all specs + usage patterns
  - [ ] Implementation constraints and invariants

- [ ] Create `docs/api.md`
  - [ ] Human-readable API reference
  - [ ] Getting started guide
  - [ ] Common patterns and recipes

- [ ] Update README.md
  - [ ] Project overview
  - [ ] Installation (when published)
  - [ ] Quick examples
  - [ ] Link to full docs

### 8. Integration Tests & Visual Examples

**Priority: HIGH - Validates everything works together**

Create integration tests that generate the examples from the specs:

- [ ] Star pattern: `circle.radius(5).segments(10).points.every(2).expand(2)`
- [ ] Cross: `rect.size(5).lines.extrude(5)`
- [ ] Gear: `circle.radius(10).segments(16).lines.every(2, 0).extrude(1)`
- [ ] Rounded rect: `rect.wh(5, 10).points.round(2.5)`
- [ ] Spider web: raycast pattern with connections
- [ ] Star with inward rays
- [ ] Grid with alternating shapes
- [ ] Radial pattern from ShapeSystem + circle
- [ ] Star scaffold with ShapeSystem
- [ ] Hexagon with triangles at nodes

**Each test should:**
- Assert geometric properties (vertex count, segment count, winding)
- Generate SVG output to `test-output/`
- Be manually verifiable by opening SVG

**Test output naming:**
```
test-output/
├── star.svg
├── cross.svg
├── gear.svg
├── rounded-rect.svg
├── spider-web.svg
├── grid-system.svg
├── radial-system.svg
├── star-scaffold.svg
└── hexagon-triangles.svg
```

### 9. Example Usage Script

**Priority: LOW - Nice to have**

- [ ] Create `examples/basic.ts`
  - [ ] Demonstrates shape creation
  - [ ] Shows system usage
  - [ ] Outputs to examples/output/

- [ ] Create `examples/advanced.ts`
  - [ ] Complex compositions
  - [ ] Multiple systems
  - [ ] Raycast networks

## Testing Strategy

### Unit Tests
- Test each class/method in isolation
- Verify invariants (winding, closure, connectivity)
- Edge cases (zero vectors, degenerate shapes)
- ~80% code coverage minimum

### Integration Tests
- Test API examples from specs
- Verify context chaining works
- Test system placement and output
- Generate visual artifacts

### Visual Validation
- All tests output SVG to `test-output/`
- Manual inspection for correctness
- Keep outputs in git history (optional, or document expected results)

### Test Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode during development
npm run test:ui       # Vitest UI for debugging
```

## Definition of Done

Phase 1 is complete when:

- ✅ All primitives implemented with passing tests
- ✅ Shape API fully functional (circle, rect, square, hexagon, triangle)
- ✅ All context operations working (points, lines, shapes)
- ✅ GridSystem and ShapeSystem implemented and tested
- ✅ SVG output collector working
- ✅ All spec examples generate correct visual output
- ✅ Documentation complete (API docs + LLM context)
- ✅ No sequence integration (deferred to Phase 2)
- ✅ No UI (deferred to Phase 2)
- ✅ Test coverage >75%
- ✅ README with clear examples
- ✅ Builds without errors (`npm run build`)
- ✅ All tests passing (`npm test`)

## Success Criteria

You should be able to:

1. Create any example from the specs with code
2. Generate valid SVG output
3. Compose shapes and systems
4. Use raycast for generative patterns
5. Hand off to Phase 2 with solid foundation

## Next Steps (Phase 2 Preview)

After Phase 1 is solid:
- Sequence integration (`'size()'` string expressions)
- Additional systems (TreeSystem, VineSystem, NetworkSystem)
- Interactive playground/editor
- Visual debugger with step-through
- Boolean operations (union, subtract, intersect)
- Advanced optimizations (Watertight integration)
- WebGL rendering support

## Notes for Coding Agent

- **TypeScript strict mode required** - catch errors early
- **Immutability where possible** - contexts can mutate, but primitives should be stable
- **No external dependencies for core** - keep it lean (except test utils)
- **Visual tests are critical** - geometry bugs are hard to catch without seeing output
- **Defer optimization** - correctness first, speed later
- **Document weird edge cases** - geometry is full of surprises
- **Use descriptive test names** - "should maintain CCW winding after expand()"
- **Keep test-output in .gitignore** - but document how to regenerate

## Questions/Clarifications

If anything is unclear:
1. Refer to the three spec documents (object-model.md, shape-api.md, systems-api.md)
2. Check examples in specs for expected behavior
3. Prioritize correctness over performance
4. When in doubt, keep it simple

Good luck! 🎨