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
export { Segment, type Winding } from './primitives/Segment';
export { Shape, type BoundingBox } from './primitives/Shape';

// ==================== Interfaces ====================
/**
 * Type definitions for drawable objects and systems.
 */
export type { IDrawable, ISystem } from './interfaces';

// ==================== Contexts ====================
/**
 * Context classes for shape operations.
 * These provide the fluent API for transformations and operations.
 * 
 * Note: PathContext is internal-only (used by LSystem) and not exported.
 */
export {
    ShapeContext,
    PointsContext,
    LinesContext,
    ShapesContext,
    CircleContext,
    RectContext,
    SquareContext,
    HexagonContext,
    TriangleContext,
} from './contexts/index';

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
export { SVGCollector, type PathStyle, type RenderMode } from './collectors/index';

// ==================== Systems ====================
/**
 * System classes for parametric scaffolds.
 * These provide structured placement coordinates for shapes.
 */
export { GridSystem, type GridOptions, type GridType } from './systems/index';
export { TessellationSystem, type TessellationOptions, type TessellationPattern } from './systems/index';
export { ShapeSystem, type ShapeSystemOptions } from './systems/index';
export { LSystem, type LSystemOptions } from './systems/index';
export { CloneSystem, type CloneOptions } from './systems/index';
export { QuiltSystem, type QuiltOptions } from './systems/index';

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

// ==================== Quilt Templates ====================
/**
 * Quilt block templates for use with system.quilt().
 * 
 * @example
 * ```typescript
 * import { system } from 'patterin';
 * 
 * // Create a 4x4 quilt
 * const quilt = system.quilt({ gridSize: [4, 4], blockSize: 100 });
 * 
 * // Apply different blocks to different positions
 * quilt.every(2).placeBlock('BD');      // BrokenDishes on even
 * quilt.every(2, 1).placeBlock('FS');   // FriendshipStar on odd
 * 
 * quilt.stamp(svg);
 * ```
 */
export type {
    QuiltBlockTemplate,
    BlockRotation,
    CellDefinition,
} from './patterns/index';
export { quiltBlockTemplates } from './patterns/index';

// ==================== Sequence Generator ====================
/**
 * Flexible sequence generator that can be used as a number in any function.
 * Supports multiple modes: repeat, yoyo, once, shuffle, random, additive, and multiplicative.
 * 
 * @example
 * ```typescript
 * import { Sequence, shape } from 'patterin';
 * 
 * // Create a repeating sequence
 * const sizes = Sequence.repeat(10, 20, 30);
 * 
 * // Use it like a number - advances each time it's called
 * for (let i = 0; i < 5; i++) {
 *   shape.circle().radius(sizes()).move(i * 50, 0).stamp(svg);
 * }
 * 
 * // Yoyo sequence (bounces back and forth)
 * const angles = Sequence.yoyo(0, 45, 90);
 * 
 * // Random with seed (deterministic)
 * const colors = Sequence.random(42, 1, 2, 3, 4, 5);
 * ```
 */
export { Sequence, sequence, type SequenceFunction, type SequenceValue, type SequenceMode } from './sequence/sequence';

// ==================== Color Palette Generator ====================
/**
 * Declarative color palette generator with zone-based distribution.
 * Generates harmonious color palettes with even distribution across specified zones.
 * 
 * @example
 * ```typescript
 * import { Palette, Sequence, shape, SVGCollector } from 'patterin';
 * 
 * // Generate a palette
 * const colors = new Palette(6, "blues", "cyans").vibrant().toArray();
 * 
 * // Use with Sequence for shape coloring
 * const colorSeq = Sequence.repeat(...colors);
 * const shapes = shape.circle().radius(20).clone(5, 40, 0);
 * shapes.color(colorSeq);
 * 
 * // Render with different modes
 * const svg = new SVGCollector();
 * svg.setRenderMode('glass'); // 'fill', 'stroke', or 'glass'
 * shapes.stamp(svg);
 * ```
 */
export { Palette, palette, type ColorZone, type HSLColor } from './color/palette';

