import { BoundingBox, Shape, Segment, Vector2, Vertex, Winding } from '../primitives';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector';
import { PointContext } from './PointContext';
import { CloneSystem } from '../systems/CloneSystem';
import { SequenceFunction } from '../sequence/sequence';
/**
 * Base class for contexts that operate on collections with selection capabilities.
 * Provides common selection methods: every(), at(), length
 */
declare abstract class SelectableContext<T, TSelf> {
    protected _items: T[];
    constructor(_items: T[]);
    /** Get number of selected items */
    get length(): number;
    /**
     * Select every nth item.
     * @param n - Select every nth item (1 = all, 2 = every other, etc.)
     * @param offset - Starting offset (default 0)
     */
    every(n: number, offset?: number): TSelf;
    /**
     * Select items at specific indices.
     * @param indices - Zero-based indices of items to select
     */
    at(...indices: number[]): TSelf;
    /** Factory method for creating new instances with selected items */
    protected abstract createNew(items: T[]): TSelf;
}
/**
 * Base context for all shape operations.
 *
 * Provides a fluent API for transforming shapes, accessing vertices and segments,
 * and switching between different operation contexts (points, lines, shapes).
 *
 * All transformation methods return `this` for chaining.
 *
 * @example
 * ```typescript
 * import { shape } from 'patterin';
 *
 * // Basic transformations
 * const rect = shape.rect()
 *   .size(40)
 *   .scale(1.5)
 *   .rotate(45)
 *   .xy(100, 100);
 *
 * // Context switching
 * rect.points.every(2).expand(10);  // Operate on vertices
 * rect.lines.at(0, 2).extrude(15);  // Operate on segments
 *
 * // Generative operations
 * const rings = shape.circle()
 *   .radius(30)
 *   .offset(10, 5); // 5 concentric rings
 * ```
 */
export declare class ShapeContext {
    protected _shape: Shape;
    /**
     * Global collector for auto-stamping (used by playground).
     * When set, shapes created via specialized contexts will auto-register.
     */
    static globalCollector: SVGCollector | null;
    constructor(_shape: Shape);
    /** Get the underlying shape */
    get shape(): Shape;
    /** Get all vertices */
    get vertices(): Vertex[];
    /** Get all segments */
    get segments(): Segment[];
    /** Get the center (centroid) of the shape */
    get center(): Vector2;
    /** Get the centroid of the shape */
    get centroid(): Vector2;
    /** Get the winding direction */
    get winding(): Winding;
    /** Get total perimeter length of the shape */
    get length(): number;
    /**
     * Switch to points context for vertex operations.
     *
     * Enables operations on individual vertices: expand, inset, move, select, etc.
     *
     * @returns A PointsContext for operating on all vertices
     *
     * @example
     * ```typescript
     * const star = shape.circle().radius(50).numSegments(10);
     *
     * // Expand every other point to create star shape
     * star.points.every(2).expand(20);
     *
     * // Move specific points
     * star.points.at(0, 5).move(10, 0);
     * ```
     */
    get points(): PointsContext;
    /**
     * Switch to lines context for segment operations.
     *
     * Enables operations on edges: extrude, divide, collapse, select, etc.
     *
     * @returns A LinesContext for operating on all segments
     *
     * @example
     * ```typescript
     * const rect = shape.rect().size(40);
     *
     * // Extrude specific sides
     * rect.lines.at(0, 2).extrude(10);
     *
     * // Divide every other edge
     * rect.lines.every(2).divide(3);
     * ```
     */
    get lines(): LinesContext;
    /**
     * Clone this shape n times with optional offset between each.
     * Returns a CloneSystem containing original + n clones.
     * Marks the original shape as ephemeral (construction geometry).
     * @param n - Number of clones to create (default 1)
     * @param x - Horizontal offset between each clone (default 0)
     * @param y - Vertical offset between each clone (default 0)
     */
    clone(n?: number, x?: number, y?: number): CloneSystem;
    /** Scale shape uniformly by factor */
    scale(factor: number): this;
    /** Scale shape with different factors for X and Y axes */
    scale(factorX: number, factorY: number): this;
    /** Scale shape along X axis only */
    scaleX(factor: number): this;
    /** Scale shape along Y axis only */
    scaleY(factor: number): this;
    /** Rotate shape by angle in degrees */
    rotate(degrees: number): this;
    /** Rotate shape by angle in radians */
    rotateRad(radians: number): this;
    /** Move shape to position */
    moveTo(x: number, y: number): this;
    moveTo(point: Vector2): this;
    /** Translate shape by delta */
    translate(x: number, y: number): this;
    /**
     * Offset (inset/outset) the shape outline.
     * @param distance - Offset distance (positive = outward, negative = inward)
     * @param count - Number of copies to generate. 0 = in-place modification. >0 = returns offset copies.
     * @param miterLimit - Miter limit for sharp corners (default 4)
     * @param includeOriginal - When count > 0, include the original shape in result (default false)
     * @returns ShapeContext (if count=0) or ShapesContext (if count>0)
     */
    offset(distance: number, count?: number, miterLimit?: number, includeOriginal?: boolean): ShapeContext | ShapesContext;
    /**
     * Expand shape (outset) by distance.
     */
    expand(distance: number, count?: number, miterLimit?: number, includeOriginal?: boolean): ShapeContext | ShapesContext;
    /**
     * Inset shape by distance.
     */
    inset(distance: number, count?: number, miterLimit?: number): ShapeContext | ShapesContext;
    /**
     * Set x position of centroid (keeps y unchanged).
     *
     * @param xPos - Target x coordinate
     * @returns This context for chaining
     *
     * @example
     * ```typescript
     * shape.circle().radius(20).x(100); // Center at x=100
     * ```
     */
    x(xPos: number): this;
    /**
     * Set y position of centroid (keeps x unchanged).
     *
     * @param yPos - Target y coordinate
     * @returns This context for chaining
     *
     * @example
     * ```typescript
     * shape.circle().radius(20).y(50); // Center at y=50
     * ```
     */
    y(yPos: number): this;
    /**
     * Set x and y position of centroid.
     * Convenience method equivalent to `moveTo(x, y)`.
     *
     * @param xPos - Target x coordinate
     * @param yPos - Target y coordinate
     * @returns This context for chaining
     *
     * @example
     * ```typescript
     * shape.rect().size(30).xy(100, 100);
     * ```
     */
    xy(xPos: number, yPos: number): this;
    /**
     * Reverse the winding direction of the shape.
     *
     * Changes clockwise to counter-clockwise (or vice versa).
     * Useful for boolean operations and fill rules.
     *
     * @returns This context for chaining
     *
     * @example
     * ```typescript
     * const rect = shape.rect().size(40);
     * console.log(rect.winding); // 'cw'
     * rect.reverse();
     * console.log(rect.winding); // 'ccw'
     * ```
     */
    reverse(): this;
    /**
     * Get the bounding box of this shape as an ephemeral rectangle.
     *
     * The returned rectangle is marked as ephemeral (construction geometry)
     * and will not be auto-rendered.
     *
     * @returns A RectContext representing the bounding box
     *
     * @example
     * ```typescript
     * const star = shape.circle().radius(50).numSegments(10);
     * star.points.every(2).expand(20);
     *
     * const box = star.bbox();
     * console.log(box.shape.boundingBox());
     * ```
     */
    bbox(): RectContext;
    /**
     * Get the center point (centroid) of the shape.
     *
     * @returns The centroid as a Vector2
     *
     * @example
     * ```typescript
     * const rect = shape.rect().size(40).xy(100, 100);
     * const c = rect.centerPoint();
     * console.log(c); // Vector2(100, 100)
     * ```
     */
    centerPoint(): Vector2;
    /**
     * Make this shape concrete (not ephemeral).
     *
     * Concrete shapes will be rendered. Use this to un-mark construction geometry.
     *
     * @returns This context for chaining
     *
     * @example
     * ```typescript
     * const box = shape.rect().size(40).bbox(); // Ephemeral by default
     * box.trace(); // Now it will render
     * ```
     */
    trace(): this;
    /**
     * Mark this shape as ephemeral (construction geometry).
     *
     * Ephemeral shapes won't be auto-rendered. Useful for temporary/helper geometry.
     *
     * @returns This context for chaining
     *
     * @example
     * ```typescript
     * const guide = shape.rect().size(100).ephemeral();
     * // guide won't render, but can be used for operations
     * ```
     */
    ephemeral(): this;
    /**
     * Stamp (render) this shape to an SVG collector.
     *
     * @param collector - The SVGCollector to render to
     * @param x - Optional x offset for rendering (default 0)
     * @param y - Optional y offset for rendering (default 0)
     * @param style - Optional PathStyle for stroke, fill, etc.
     *
     * @example
     * ```typescript
     * import { shape, SVGCollector } from 'patterin';
     *
     * const svg = new SVGCollector();
     * const rect = shape.rect().size(40);
     *
     * rect.stamp(svg, 0, 0, { stroke: '#f00', strokeWidth: 2 });
     * console.log(svg.toString());
     * ```
     */
    stamp(collector: SVGCollector, x?: number, y?: number, style?: PathStyle): void;
    /**
     * Explode shape into independent segments.
     * Marks original shape as ephemeral.
     * @returns LinesContext with orphan segments (disconnected)
     */
    explode(): LinesContext;
    /**
     * Collapse shape to its centroid point.
     * Marks original shape as ephemeral.
     * @returns PointContext at the centroid
     */
    collapse(): PointContext;
    /**
     * Offset shape outline inward (negative) or outward (positive).
     * Uses vertex normal offset with miter limit.
     * @param distance - Offset distance (positive = outward, negative = inward)
     * @param miterLimit - Miter limit for sharp corners (default 4, same as SVG)
     * @returns New ShapeContext with offset shape
     */
    offsetShape(distance: number, miterLimit?: number): ShapeContext;
    /** Helper: find intersection of two lines (or null if parallel) */
    private lineIntersection;
}
/**
 * Context for operating on vertices (points) of a shape.
 *
 * Accessed via `shape.points` or `shapes.points`.
 * Supports selection, transformation, and generative operations on vertices.
 *
 * @example
 * ```typescript
 * // Create a star by expanding alternating points
 * const star = shape.circle().radius(30).numSegments(10);
 * star.points.every(2).expand(15);
 *
 * // Move specific corner points
 * const rect = shape.rect().size(40);
 * rect.points.at(0, 2).move(5, 5);
 *
 * // Create circles at all vertices
 * const mandala = shape.hexagon().radius(50);
 * mandala.points.expandToCircles(10);
 * ```
 */
export declare class PointsContext extends SelectableContext<Vertex, PointsContext> {
    protected _shape: Shape;
    constructor(_shape: Shape, vertices: Vertex[]);
    /** Get selected vertices */
    get vertices(): Vertex[];
    protected createNew(items: Vertex[]): PointsContext;
    /**
     * Expand selected points outward along their normals.
     *
     * Modifies the shape in-place by moving vertices perpendicular to their edges.
     *
     * @param distance - Distance to move points (positive = outward, negative = inward)
     * @returns ShapeContext for the modified shape
     *
     * @example
     * ```typescript
     * // Create a star
     * const star = shape.circle().radius(30).numSegments(10);
     * star.points.every(2).expand(15);
     *
     * // Inset corners of a square
     * shape.square().size(40).points.expand(-5);
     * ```
     */
    expand(distance: number): ShapeContext;
    /**
     * Inset selected points inward along their normals.
     * Convenience method equivalent to `expand(-distance)`.
     *
     * @param distance - Distance to move points inward
     * @returns ShapeContext for the modified shape
     *
     * @example
     * ```typescript
     * shape.hexagon().radius(40).points.every(2).inset(10);
     * ```
     */
    inset(distance: number): ShapeContext;
    /**
     * Move selected points by a relative offset.
     *
     * @param x - Horizontal offset
     * @param y - Vertical offset
     * @returns This PointsContext for chaining
     *
     * @example
     * ```typescript
     * // Move top corners of a rectangle up
     * const rect = shape.rect().size(40);
     * rect.points.at(1, 2).move(0, 10);
     * ```
     */
    move(x: number, y: number): PointsContext;
    /** Get midpoint of selected points */
    midPoint(): Vector2;
    /** Get bounding box of selected points */
    bbox(): BoundingBox;
    /**
     * Expand each point into a circle shape.
     * Does NOT modify the original shape.
     * @param radius - Circle radius
     * @param segments - Number of circle segments (default 32)
     * @returns ShapesContext with independent circle shapes
     */
    expandToCircles(radius: number, segments?: number): ShapesContext;
    /**
     * Cast rays from each point.
     * @param distance - Ray distance
     * @param direction - Angle in degrees, or 'outward'/'inward' relative to shape center
     * @returns PointsContext with ray endpoints
     */
    raycast(distance: number, direction: number | 'outward' | 'inward'): PointsContext;
}
/**
 * Context for lines/segments operations.
 */
export declare class LinesContext extends SelectableContext<Segment, LinesContext> {
    protected _shape: Shape;
    constructor(_shape: Shape, segments: Segment[]);
    /** Get selected segments */
    get segments(): Segment[];
    protected createNew(items: Segment[]): LinesContext;
    /**
     * Extrude selected lines outward.
     * For each selected segment A→B, replaces it with A→A'→B'→B where A' and B'
     * are the extruded positions (original + normal * distance).
     * Returns the modified ShapeContext.
     */
    extrude(distance: number): ShapeContext;
    /**
     * Divide selected lines into n segments.
     * Returns points at division locations.
     */
    divide(n: number): PointsContext;
    /** Get midpoint of all selected lines */
    midPoint(): Vector2;
    /**
     * Collapse selected segments to their midpoints.
     * Modifies parent shape: removes segment and merges vertices at midpoint.
     * @returns PointsContext with midpoint locations
     */
    collapse(): PointsContext;
    /**
     * Stamp segments as line paths to collector.
     * Uses thinner default stroke width (0.5) for connection lines.
     */
    stamp(collector: SVGCollector, x?: number, y?: number, style?: PathStyle): void;
    /**
     * Expand each segment into a rectangle with square end caps.
     * Does NOT modify the original shape.
     * @param distance - Half-height of rectangle (total height = 2 * distance)
     * @returns ShapesContext with independent rectangle shapes
     */
    expandToRect(distance: number): ShapesContext;
}
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
export declare class ShapesContext extends SelectableContext<Shape, ShapesContext> {
    constructor(shapes: Shape[]);
    /** Get all shapes */
    get shapes(): Shape[];
    protected createNew(items: Shape[]): ShapesContext;
    /**
     * Helper to resolve a value that might be a sequence or a number.
     * If it's a sequence, call it to advance and get the next value.
     * Otherwise, return the number as-is.
     */
    private resolveValue;
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
    /** Scale all shapes uniformly (supports sequences) */
    scale(factor: number | SequenceFunction): this;
    /** Scale all shapes along X axis only (supports sequences) */
    scaleX(factor: number | SequenceFunction): this;
    /** Scale all shapes along Y axis only (supports sequences) */
    scaleY(factor: number | SequenceFunction): this;
    /** Rotate all shapes by angle in degrees (supports sequences) */
    rotate(angleDeg: number | SequenceFunction): this;
    /** Translate all shapes by delta (supports sequences for x and y) */
    translate(x: number | SequenceFunction, y: number | SequenceFunction): this;
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
    /** Set x position of collective center (supports sequences) */
    x(xPos: number | SequenceFunction): this;
    /** Set y position of collective center (supports sequences) */
    y(yPos: number | SequenceFunction): this;
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
/**
 * Circle context with radius and segments.
 */
export declare class CircleContext extends ShapeContext {
    private _radius;
    private _segments;
    private _center;
    constructor();
    /** Set circle radius */
    radius(r: number): this;
    /** Set number of segments */
    numSegments(n: number): this;
    /** Set center position */
    setCenter(x: number, y: number): this;
    private rebuild;
}
/**
 * Rectangle context with width and height.
 */
export declare class RectContext extends ShapeContext {
    private _width;
    private _height;
    private _center;
    constructor(shape?: Shape, width?: number, height?: number);
    /** Get width */
    get w(): number;
    /** Get height */
    get h(): number;
    /** Set width */
    width(w: number): this;
    /** Set height */
    height(h: number): this;
    /** Set width and height */
    wh(w: number, h: number): this;
    /** Set size (square) */
    size(s: number): this;
    /** Set center position */
    setCenter(x: number, y: number): this;
    private rebuild;
    static createRect(width: number, height: number, center: Vector2): Shape;
}
/**
 * Square context (special case of rectangle).
 */
export declare class SquareContext extends RectContext {
    constructor(size?: number);
    /** Set square size */
    size(s: number): this;
}
/**
 * Hexagon context with radius.
 */
export declare class HexagonContext extends ShapeContext {
    private _radius;
    private _center;
    constructor();
    /** Set hexagon radius */
    radius(r: number): this;
    /** Set center position */
    setCenter(x: number, y: number): this;
    private rebuild;
}
/**
 * Triangle context with radius.
 */
export declare class TriangleContext extends ShapeContext {
    private _radius;
    private _center;
    constructor();
    /** Set triangle radius */
    radius(r: number): this;
    /** Set center position */
    setCenter(x: number, y: number): this;
    private rebuild;
}
export {};
