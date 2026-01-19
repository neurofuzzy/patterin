/**
 * Patterin - Declarative procedural 2D vector graphics
 *
 * A TypeScript library for creating intricate SVG patterns with a fluent,
 * context-aware API. Built for generative art, data visualization, plotters,
 * laser cutters, and creative coding.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { shape, system, SVGCollector } from 'patterin';
 *
 * // Create shapes
 * const star = shape.circle().radius(30).numSegments(10);
 * star.points.every(2).expand(15);
 *
 * // Create systems
 * const grid = system.grid({
 *   type: 'hexagonal',
 *   count: [10, 10],
 *   size: 30
 * });
 * grid.place(shape.hexagon().radius(12));
 *
 * // Render to SVG
 * const svg = new SVGCollector();
 * star.stamp(svg);
 * grid.stamp(svg);
 * console.log(svg.toString({ width: 800, height: 600 }));
 * ```
 *
 * ## Core Concepts
 *
 * ### Shape Factory
 * Create basic shapes: `circle()`, `rect()`, `square()`, `hexagon()`, `triangle()`
 *
 * ### Context Switching
 * - `shape.points` - Operate on vertices
 * - `shape.lines` - Operate on edges
 * - `shape.clone()` - Create multiple copies (returns ShapesContext)
 * - `shape.offset(distance, count)` - Generate concentric copies (returns ShapesContext)
 *
 * ### Systems
 * Parametric scaffolds for structured patterns:
 * - `system.grid()` - Square, hex, triangular grids
 * - `system.tessellation()` - Truchet, Penrose, trihexagonal
 * - `system.lsystem()` - Lindenmayer systems (fractals)
 * - `system.fromShape()` - Use shape geometry as scaffold
 *
 * ### SVG Output
 * `SVGCollector` accumulates geometry and renders to SVG with auto-computed viewBox.
 *
 * @packageDocumentation
 */
// ==================== Primitives ====================
/**
 * Core geometric primitives used throughout the library.
 * Most users won't need to import these directly.
 */
export { Vector2 } from './primitives/Vector2';
export { Vertex } from './primitives/Vertex';
export { Segment } from './primitives/Segment';
export { Shape } from './primitives/Shape';
// ==================== Contexts ====================
/**
 * Context classes for shape operations.
 * These provide the fluent API for transformations and operations.
 *
 * Note: PathContext is internal-only (used by LSystem) and not exported.
 */
export { ShapeContext, PointsContext, LinesContext, ShapesContext, CircleContext, RectContext, SquareContext, HexagonContext, TriangleContext, } from './contexts/index';
// ==================== Shape Factory ====================
/**
 * Main entry point for creating shapes.
 *
 * @example
 * ```typescript
 * import { shape } from 'patterin';
 *
 * const circle = shape.circle().radius(50);
 * const rect = shape.rect().size(100, 50);
 * const hex = shape.hexagon().radius(30);
 * ```
 */
export { shape } from './shapes/index';
// ==================== Collectors ====================
/**
 * SVG output collector for rendering geometry.
 *
 * @example
 * ```typescript
 * import { SVGCollector } from 'patterin';
 *
 * const svg = new SVGCollector();
 * shape.circle().radius(50).stamp(svg);
 * console.log(svg.toString());
 * ```
 */
export { SVGCollector } from './collectors/index';
// ==================== Systems ====================
/**
 * System classes for parametric scaffolds.
 * These provide structured placement coordinates for shapes.
 */
export { GridSystem } from './systems/index';
export { TessellationSystem } from './systems/index';
export { ShapeSystem } from './systems/index';
export { LSystem } from './systems/index';
export { CloneSystem } from './systems/index';
// ==================== System Factory ====================
/**
 * Main entry point for creating systems.
 *
 * @example
 * ```typescript
 * import { system } from 'patterin';
 *
 * const grid = system.grid({ type: 'square', count: [5, 5], size: 40 });
 * const tiles = system.tessellation({ pattern: 'truchet', size: 40, bounds: { width: 400, height: 400 } });
 * const fractal = system.lsystem({ axiom: 'F', rules: { F: 'F+G', G: 'F-G' }, iterations: 12, angle: 90, length: 4 });
 * ```
 */
export { system } from './systems/index';
// ==================== Pattern Factory ====================
/**
 * Main entry point for creating patterns.
 *
 * @example
 * ```typescript
 * import { pattern } from 'patterin';
 *
 * const checker = pattern.checker({ size: 20, bounds: { width: 400, height: 400 } });
 * const chevron = pattern.chevron({ stripeWidth: 30, bounds: { width: 400, height: 400 } });
 * const houndstooth = pattern.houndstooth({ size: 40, bounds: { width: 400, height: 400 } });
 * ```
 */
export { pattern } from './patterns/index';
