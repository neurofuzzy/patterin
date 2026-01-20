import { GridSystem } from './GridSystem';
import { TessellationSystem } from './TessellationSystem';
import { ShapeSystem } from './ShapeSystem';
import { LSystem } from './LSystem';
import { QuiltSystem } from './QuiltSystem';
export { BaseSystem } from './BaseSystem';
export { EdgeBasedSystem } from './EdgeBasedSystem';
export { GridSystem } from './GridSystem';
export { TessellationSystem } from './TessellationSystem';
export { ShapeSystem } from './ShapeSystem';
export { LSystem } from './LSystem';
export { CloneSystem } from './CloneSystem';
export { QuiltSystem, blockShortcuts, QuiltPatternContext } from './QuiltSystem';
/**
 * System factory - main entry point for creating parametric scaffolds.
 *
 * Systems provide structured placement coordinates for shapes, enabling
 * complex patterns like grids, tessellations, fractals, and clones.
 *
 * All systems support:
 * - `.nodes` - Access to node coordinates
 * - `.edges` - Access to connections between nodes
 * - `.place(shape)` - Place a shape at each node
 * - `.stamp(collector)` - Render the system to SVG
 *
 * @example
 * ```typescript
 * import { system, shape } from 'patterin';
 *
 * // Create a hexagonal grid
 * const grid = system.grid({
 *   type: 'hexagonal',
 *   count: [10, 10],
 *   size: 30
 * });
 * grid.place(shape.hexagon().radius(12));
 *
 * // Tessellation pattern
 * const tiles = system.tessellation({
 *   pattern: 'truchet',
 *   variant: 'quarter-circles',
 *   size: 40,
 *   bounds: { width: 400, height: 400 }
 * });
 *
 * // L-System fractal
 * const dragon = system.lsystem({
 *   axiom: 'F',
 *   rules: { F: 'F+G', G: 'F-G' },
 *   iterations: 12,
 *   angle: 90,
 *   length: 4
 * });
 * ```
 */
export const system = {
    /**
     * Create a grid system (square, hexagonal, or triangular).
     *
     * @param options - Grid configuration (type, count, size, spacing)
     * @returns A GridSystem with positioned nodes
     *
     * @example
     * ```typescript
     * // Square grid
     * const square = system.grid({
     *   type: 'square',
     *   count: [5, 5],
     *   size: 40
     * });
     *
     * // Hex grid (flat-top)
     * const hex = system.grid({
     *   type: 'hexagonal',
     *   count: [8, 8],
     *   size: 30
     * });
     *
     * // Triangular grid
     * const tri = system.grid({
     *   type: 'triangular',
     *   count: [10, 10],
     *   size: 25
     * });
     * ```
     */
    grid(options) {
        return GridSystem.create(options);
    },
    /**
     * Create a tessellation system (Truchet, Penrose, etc.).
     *
     * @param options - Tessellation type, variant, size, and bounds
     * @returns A TessellationSystem with positioned tiles
     *
     * @example
     * ```typescript
     * // Truchet quarter-circles
     * const truchet = system.tessellation({
     *   pattern: 'truchet',
     *   variant: 'quarter-circles',
     *   size: 40,
     *   bounds: { width: 400, height: 400 }
     * });
     *
     * // Penrose tiling
     * const penrose = system.tessellation({
     *   pattern: 'penrose',
     *   size: 50,
     *   bounds: { width: 500, height: 500 }
     * });
     *
     * // Trihexagonal tiling
     * const trihex = system.tessellation({
     *   pattern: 'trihexagonal',
     *   size: 30,
     *   bounds: { width: 600, height: 600 }
     * });
     * ```
     */
    tessellation(options) {
        return TessellationSystem.create(options);
    },
    /**
     * Create a system from a shape's geometry.
     *
     * Converts shape vertices to nodes and segments to edges, allowing
     * you to place shapes at vertex positions or along edges.
     *
     * @param source - A ShapeContext or Shape to use as the scaffold
     * @param options - Optional configuration
     * @returns A ShapeSystem
     *
     * @example
     * ```typescript
     * // Place circles at hexagon vertices
     * const hex = shape.hexagon().radius(60);
     * const sys = system.fromShape(hex);
     * sys.place(shape.circle().radius(10));
     *
     * // Create a mandala
     * const base = shape.circle().radius(100).numSegments(12);
     * const mandala = system.fromShape(base);
     * mandala.place(shape.circle().radius(20));
     * ```
     */
    fromShape(source, options) {
        return new ShapeSystem(source, options);
    },
    /**
     * Create an L-System (Lindenmayer system) for fractals.
     *
     * L-Systems use string rewriting rules to generate complex recursive
     * patterns. Perfect for plants, curves, space-filling patterns, etc.
     *
     * @param options - Axiom, rules, iterations, angle, and length
     * @returns An LSystem that renders as a continuous path
     *
     * @example
     * ```typescript
     * // Dragon curve
     * const dragon = system.lsystem({
     *   axiom: 'F',
     *   rules: { F: 'F+G', G: 'F-G' },
     *   iterations: 12,
     *   angle: 90,
     *   length: 4
     * });
     *
     * // Hilbert curve
     * const hilbert = system.lsystem({
     *   axiom: 'L',
     *   rules: { L: '+RF-LFL-FR+', R: '-LF+RFR+FL-' },
     *   iterations: 5,
     *   angle: 90,
     *   length: 3
     * });
     *
     * // Plant
     * const plant = system.lsystem({
     *   axiom: 'F',
     *   rules: { F: 'FF+[+F-F-F]-[-F+F+F]' },
     *   iterations: 4,
     *   angle: 22.5,
     *   length: 3
     * });
     * ```
     */
    lsystem(options) {
        return LSystem.create(options);
    },
    /**
     * Create a quilt system for placing quilt block patterns.
     *
     * Use every(), slice(), and at() to select positions, then placeBlock()
     * to assign different block templates. Supports shortcuts: PW, BD, FS, SF, BT, DP, SS.
     *
     * @param options - Grid size and block size configuration
     * @returns A QuiltSystem with positioned block placements
     *
     * @example
     * ```typescript
     * // Create a 4x4 quilt
     * const quilt = system.quilt({
     *   gridSize: [4, 4],
     *   blockSize: 100
     * });
     *
     * // Alternate between two patterns
     * quilt.every(2).placeBlock('BD');      // BrokenDishes on even
     * quilt.every(2, 1).placeBlock('FS');   // FriendshipStar on odd
     *
     * quilt.stamp(svg);
     * ```
     */
    quilt(options) {
        return new QuiltSystem(options);
    },
};
