import { Shape } from '../primitives/Shape';
import { Vector2 } from '../primitives/Vector2';
import { Vertex } from '../primitives/Vertex';
import { Segment } from '../primitives/Segment';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector';
import { PointsContext } from './PointsContext';
import { LinesContext } from './LinesContext';
/**
 * Context for operating on multiple shapes as a collection.
 *
 * Returned by generative operations (`offset` with count > 0), `.clone()`,
 * system methods, and when selecting subsets of shapes.
 *
 * Supports selection, bulk transformations, and collective operations.
 *
 * @example
 * ```typescript
 * // Create concentric circles
 * const rings = shape.circle()
 *   .radius(20)
 *   .offset(10, 5); // Returns ShapesContext with 5 rings
 *
 * // Transform every other shape
 * const grid = shape.rect()
 *   .clone(5, 30, 0)
 *   .clone(5, 0, 30);
 * grid.every(2).scale(1.5).rotate(45);
 *
 * // Select and transform subset
 * const subset = grid.slice(0, 10);
 * subset.translate(100, 0);
 * ```
 */
export declare class ShapesContext {
    protected _shapes: Shape[];
    constructor(_shapes: Shape[]);
    /** Get all shapes */
    get shapes(): Shape[];
    /** Get number of shapes */
    get length(): number;
    /**
     * Select every nth shape.
     *
     * @param n - Select every nth shape (1 = all, 2 = every other, etc.)
     * @param offset - Starting offset (default 0)
     * @returns A new ShapesContext with the selected shapes
     *
     * @example
     * ```typescript
     * // Transform alternating shapes in a grid
     * const grid = shape.square()
     *   .size(10)
     *   .clone(10, 20, 0)
     *   .clone(10, 0, 20);
     * grid.every(2).scale(2).rotate(45);
     * ```
     */
    every(n: number, offset?: number): ShapesContext;
    /**
     * Select shapes at specific indices.
     *
     * @param indices - Zero-based indices of shapes to select
     * @returns A new ShapesContext with the selected shapes
     *
     * @example
     * ```typescript
     * // Scale first and last shape only
     * const shapes = shape.circle().radius(10).offset(5, 5);
     * shapes.at(0, 4).scale(2);
     * ```
     */
    at(...indices: number[]): ShapesContext;
    /**
     * Select a range of shapes (similar to Array.slice).
     *
     * @param start - Starting index (inclusive)
     * @param end - Ending index (exclusive), or undefined for all remaining
     * @returns A new ShapesContext with the selected range
     *
     * @example
     * ```typescript
     * const all = shape.rect().size(20).offset(5, 10);
     * const first5 = all.slice(0, 5);
     * const last5 = all.slice(5);
     * ```
     */
    slice(start: number, end?: number): ShapesContext;
    /**
     * Spread shapes by adding cumulative offset to each.
     *
     * @param x - Horizontal offset per shape
     * @param y - Vertical offset per shape
     * @returns This ShapesContext for chaining
     *
     * @example
     * ```typescript
     * // Create diagonal line of circles
     * const circles = shape.circle()
     *   .radius(10)
     *   .clone(5); // 6 circles at origin
     * circles.spread(30, 30); // Spread diagonally
     * ```
     */
    spread(x: number, y: number): ShapesContext;
    /**
     * Clone the entire selection n times with optional offset.
     * Each copy of the ENTIRE selection is offset by (x*i, y*i).
     * Returns originals + (n * selection.length) new shapes.
     * @param n - Number of copies to create
     * @param x - Horizontal offset between each copy (default 0)
     * @param y - Vertical offset between each copy (default 0)
     */
    clone(n: number, x?: number, y?: number): ShapesContext;
    /** Get all points from all shapes */
    get points(): PointsContext;
    /** Get all lines from all shapes */
    get lines(): LinesContext;
    /** Make all shapes concrete */
    trace(): ShapesContext;
    /** Scale all shapes uniformly */
    scale(factor: number): this;
    /** Rotate all shapes by angle (degrees) */
    rotate(angleDeg: number): this;
    /** Translate all shapes by delta */
    translate(x: number, y: number): this;
    /**
     * Offset (inset/outset) all shape outlines.
     * @param distance - Offset distance
     * @param count - Number of copies per shape. 0 = in-place. >0 = returns offset copies.
     * @param miterLimit - Miter limit
     * @param includeOriginal - When count > 0, include original shapes in result (default false)
     */
    offset(distance: number, count?: number, miterLimit?: number, includeOriginal?: boolean): ShapesContext;
    /** Expand all shapes */
    expand(distance: number, count?: number, miterLimit?: number, includeOriginal?: boolean): ShapesContext;
    /** Inset all shapes */
    inset(distance: number, count?: number, miterLimit?: number): ShapesContext;
    /** Move all shapes so their collective center is at position */
    moveTo(x: number, y: number): this;
    /** Set x position of collective center */
    x(xPos: number): this;
    /** Set y position of collective center */
    y(yPos: number): this;
    /** Set x and y position of collective center */
    xy(xPos: number, yPos: number): this;
    /** Get bounds of all shapes */
    getBounds(): {
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    };
    /** Get all vertices from all shapes (flattened) */
    get vertices(): Vertex[];
    /** Get all segments from all shapes (flattened) */
    get segments(): Segment[];
    /** Get center of all shapes */
    get center(): Vector2;
    /** Stamp all shapes to collector */
    stamp(collector: SVGCollector, x?: number, y?: number, style?: PathStyle): void;
    /**
     * Distribute shapes radially around a circle.
     * @param radius - Distance from origin
     * @param arc - Optional angle range: undefined = 360°, number = 0 to angle, [start, end] = range
     * @returns This ShapesContext (modified in place)
     */
    spreadPolar(radius: number, arc?: number | [number, number]): this;
}
