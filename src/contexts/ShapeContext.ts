import { Vertex } from '../primitives/Vertex';
import { Segment, Winding } from '../primitives/Segment';
import { Shape, BoundingBox } from '../primitives/Shape';
import { Vector2 } from '../primitives/Vector2';
import { BooleanOps } from '../geometry/Boolean';
import { SVGCollector, PathStyle, RenderMode, DEFAULT_STYLES } from '../collectors/SVGCollector';
import { PointContext } from './PointContext';
import { CloneSystem } from '../systems/CloneSystem';
import { SequenceFunction } from '../sequence/sequence';
import { Palette } from '../color/palette';

/**
 * Base class for contexts that operate on collections with selection capabilities.
 * Provides common selection methods: every(), at(), length
 */
abstract class SelectableContext<T, TSelf> {
    constructor(protected _items: T[]) { }

    /** Get number of selected items */
    get length(): number {
        return this._items.length;
    }

    /**
     * Select every nth item.
     * @param n - Select every nth item (1 = all, 2 = every other, etc.)
     * @param offset - Starting offset (default 0)
     */
    every(n: number, offset = 0): TSelf {
        if (n < 1) {
            // Prevent infinite loop for n <= 0
            return this.createNew([]);
        }
        const selected: T[] = [];
        for (let i = offset; i < this._items.length; i += n) {
            selected.push(this._items[i]);
        }
        return this.createNew(selected);
    }

    /**
     * Select items at specific indices.
     * @param indices - Zero-based indices of items to select
     */
    at(...indices: number[]): TSelf {
        const selected: T[] = [];
        for (const i of indices) {
            if (i >= 0 && i < this._items.length) {
                selected.push(this._items[i]);
            }
        }
        return this.createNew(selected);
    }

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
export class ShapeContext {
    /**
     * Global collector for auto-stamping (used by playground).
     * When set, shapes created via specialized contexts will auto-register.
     */
    static globalCollector: SVGCollector | null = null;

    constructor(protected _shape: Shape) { }

    /** Get the underlying shape */
    get shape(): Shape {
        return this._shape;
    }

    /** Get all vertices */
    get vertices(): Vertex[] {
        return this._shape.vertices;
    }

    /** Get all segments */
    get segments(): Segment[] {
        return this._shape.segments;
    }

    /** Get the center (centroid) of the shape */
    get center(): Vector2 {
        return this._shape.centroid();
    }

    /** Get the centroid of the shape */
    get centroid(): Vector2 {
        return this._shape.centroid();
    }

    /** Get the winding direction */
    get winding(): Winding {
        return this._shape.winding;
    }

    /** Get total perimeter length of the shape */
    get length(): number {
        let len = 0;
        for (const seg of this._shape.segments) {
            len += seg.length();
        }
        return len;
    }

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
    get points(): PointsContext {
        return new PointsContext(this._shape, this._shape.vertices);
    }

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
    get lines(): LinesContext {
        return new LinesContext(this._shape, this._shape.segments);
    }

    /**
     * Clone this shape n times with optional offset between each.
     * Returns a CloneSystem containing original + n clones.
     * Marks the original shape as ephemeral (construction geometry).
     * @param n - Number of clones to create (default 1)
     * @param x - Horizontal offset between each clone (default 0)
     * @param y - Vertical offset between each clone (default 0)
     */
    clone(n: number = 1, x: number = 0, y: number = 0): CloneSystem {
        // Mark original as ephemeral - it will only render through the CloneSystem
        this._shape.ephemeral = true;

        return new CloneSystem(this._shape, { count: n, offsetX: x, offsetY: y });
    }

    /** Scale shape uniformly by factor */
    scale(factor: number): this;
    /** Scale shape with different factors for X and Y axes */
    scale(factorX: number, factorY: number): this;
    scale(factorX: number, factorY?: number): this {
        if (factorY === undefined) {
            // Uniform scaling (existing behavior)
            this._shape.scale(factorX);
        } else {
            // Non-uniform scaling
            const center = this._shape.centroid();
            for (const vertex of this._shape.vertices) {
                const newX = center.x + (vertex.position.x - center.x) * factorX;
                const newY = center.y + (vertex.position.y - center.y) * factorY;
                vertex.position = new Vector2(newX, newY);
            }
        }
        return this;
    }

    /** Scale shape along X axis only */
    scaleX(factor: number): this {
        const center = this._shape.centroid();
        for (const vertex of this._shape.vertices) {
            const newX = center.x + (vertex.position.x - center.x) * factor;
            vertex.position = new Vector2(newX, vertex.position.y);
        }
        return this;
    }

    /** Scale shape along Y axis only */
    scaleY(factor: number): this {
        const center = this._shape.centroid();
        for (const vertex of this._shape.vertices) {
            const newY = center.y + (vertex.position.y - center.y) * factor;
            vertex.position = new Vector2(vertex.position.x, newY);
        }
        return this;
    }

    /** Rotate shape by angle in degrees */
    rotate(degrees: number): this {
        this._shape.rotate((degrees * Math.PI) / 180);
        return this;
    }

    /** Rotate shape by angle in radians */
    rotateRad(radians: number): this {
        this._shape.rotate(radians);
        return this;
    }

    /** Move shape to position */
    moveTo(x: number, y: number): this;
    moveTo(point: Vector2): this;
    moveTo(xOrPoint: number | Vector2, y?: number): this {
        if (typeof xOrPoint === 'number') {
            this._shape.moveTo(new Vector2(xOrPoint, y!));
        } else {
            this._shape.moveTo(xOrPoint);
        }
        return this;
    }

    /** Translate shape by delta */
    translate(x: number, y: number): this {
        this._shape.translate(new Vector2(x, y));
        return this;
    }

    /**
     * Offset (inset/outset) the shape outline.
     * @param distance - Offset distance (positive = outward, negative = inward)
     * @param count - Number of copies to generate. 0 = in-place modification. >0 = returns offset copies.
     * @param miterLimit - Miter limit for sharp corners (default 4)
     * @param includeOriginal - When count > 0, include the original shape in result (default false)
     * @returns ShapeContext (if count=0) or ShapesContext (if count>0)
     */
    offset(distance: number, count: number = 0, miterLimit = 4, includeOriginal = false): ShapeContext | ShapesContext {
        if (count > 0) {
            const shapes: Shape[] = [];
            if (includeOriginal) {
                shapes.push(this._shape);
            }
            let current = this._shape;
            for (let i = 0; i < count; i++) {
                const nextCtx = new ShapeContext(current).offsetShape(distance, miterLimit);
                shapes.push(nextCtx.shape);
                current = nextCtx.shape;
            }
            return new ShapesContext(shapes);
        }

        // In-place modification for count=0
        const offsetCtx = this.offsetShape(distance, miterLimit);
        this._shape.segments = offsetCtx.shape.segments;
        this._shape.winding = offsetCtx.shape.winding;
        this._shape.connectSegments();
        return this;
    }

    /**
     * Expand shape (outset) by distance.
     */
    expand(distance: number, count: number = 0, miterLimit = 4, includeOriginal = false): ShapeContext | ShapesContext {
        return this.offset(Math.abs(distance), count, miterLimit, includeOriginal);
    }

    /**
     * Inset shape by distance.
     */
    inset(distance: number, count: number = 0, miterLimit = 4): ShapeContext | ShapesContext {
        return this.offset(-Math.abs(distance), count, miterLimit);
    }

    /**
     * Subtract another shape (or shapes) from this shape.
     * @param other Shape, ShapeContext, or ShapesContext to subtract.
     * @returns A ShapesContext containing the resulting shape(s).
     */
    subtract(other: Shape | ShapeContext | ShapesContext): ShapesContext {
        const clips = this.resolveShapes(other);
        const result = BooleanOps.difference([this._shape], clips);
        // Result is a single logical group (compound shape)
        return ShapesContext.fromGroups([result]);
    }

    /** Helper to resolve inputs to Shape[] */
    protected resolveShapes(other: Shape | ShapeContext | ShapesContext): Shape[] {
        if (other instanceof Shape) return [other];
        if (other instanceof ShapeContext) return [other.shape];
        // Check for ShapesContext structurally to avoid circular type issues if relevant
        if ('shapes' in other && Array.isArray((other as any).shapes)) {
            return (other as any).shapes;
        }
        return [];
    }

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
    x(xPos: number): this {
        const center = this._shape.centroid();
        const dx = xPos - center.x;
        this._shape.translate(new Vector2(dx, 0));
        return this;
    }

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
    y(yPos: number): this {
        const center = this._shape.centroid();
        const dy = yPos - center.y;
        this._shape.translate(new Vector2(0, dy));
        return this;
    }

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
    xy(xPos: number, yPos: number): this {
        const center = this._shape.centroid();
        const dx = xPos - center.x;
        const dy = yPos - center.y;
        this._shape.translate(new Vector2(dx, dy));
        return this;
    }

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
    reverse(): this {
        this._shape.reverse();
        return this;
    }

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
    bbox(): RectContext {
        const bounds = this._shape.boundingBox();
        const rect = Shape.fromPoints([
            bounds.min,
            new Vector2(bounds.max.x, bounds.min.y),
            bounds.max,
            new Vector2(bounds.min.x, bounds.max.y),
        ]);
        rect.ephemeral = true;
        return new RectContext(rect, bounds.width, bounds.height);
    }

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
    centerPoint(): Vector2 {
        return this._shape.centroid();
    }

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
    trace(): this {
        this._shape.ephemeral = false;
        return this;
    }

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
    ephemeral(): this {
        this._shape.ephemeral = true;
        return this;
    }

    /**
     * Set the color for this shape.
     * 
     * Color is stored as a hex string and used by SVGCollector during rendering.
     * The rendering mode (fill, stroke, glass) determines how the color is applied.
     * 
     * @param colorValue - Hex color string (e.g., '#ff5733')
     * @returns This context for chaining
     * 
     * @example
     * ```typescript
     * const circle = shape.circle().radius(30).color('#ff5733');
     * 
     * // Use with palette
     * const colors = new Palette(6, "blues").toArray();
     * shape.rect().size(40).color(colors[0]);
     * ```
     */
    color(colorValue: string): this {
        this._shape.color = colorValue;
        return this;
    }

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
    stamp(collector: SVGCollector, x = 0, y = 0, style: PathStyle = {}): void {
        if (this._shape.ephemeral) return;

        const clone = this._shape.clone();
        if (x !== 0 || y !== 0) {
            clone.translate(new Vector2(x, y));
        }

        // Use the provided style directly, allowing render mode to control defaults
        collector.addShape(clone, style);
    }

    // ==================== Phase 1.5 Operations ====================

    /**
     * Explode shape into independent segments.
     * Marks original shape as ephemeral.
     * @returns LinesContext with orphan segments (disconnected)
     */
    explode(): LinesContext {
        this._shape.ephemeral = true;

        // Create independent segments (not connected to each other)
        const orphanSegments: Segment[] = [];
        for (const seg of this._shape.segments) {
            const start = new Vertex(seg.start.position.x, seg.start.position.y);
            const end = new Vertex(seg.end.position.x, seg.end.position.y);
            orphanSegments.push(new Segment(start, end));
        }

        return new LinesContext(this._shape, orphanSegments);
    }

    /**
     * Collapse shape to its centroid point.
     * Marks original shape as ephemeral.
     * @returns PointContext at the centroid
     */
    collapse(): PointContext {
        this._shape.ephemeral = true;
        return new PointContext(this._shape.centroid(), this._shape);
    }

    /**
     * Offset shape outline inward (negative) or outward (positive).
     * Uses vertex normal offset with miter limit.
     * @param distance - Offset distance (positive = outward, negative = inward)
     * @param miterLimit - Miter limit for sharp corners (default 4, same as SVG)
     * @returns New ShapeContext with offset shape
     */
    offsetShape(distance: number, miterLimit = 4): ShapeContext {
        const newPoints: Vector2[] = [];
        const vertices = this._shape.vertices;
        const segments = this._shape.segments;
        const n = vertices.length;

        for (let i = 0; i < n; i++) {
            const vertex = vertices[i];
            const prevSeg = segments[(i - 1 + n) % n];
            const nextSeg = segments[i];

            // Compute offset direction (vertex normal = average of adjacent segment normals)
            const normal = vertex.normal;
            const offsetDir = normal.multiply(distance);

            // Offset the adjacent segments
            const prevStart = prevSeg.start.position.add(prevSeg.normal.multiply(distance));
            const prevEnd = prevSeg.end.position.add(prevSeg.normal.multiply(distance));
            const nextStart = nextSeg.start.position.add(nextSeg.normal.multiply(distance));
            const nextEnd = nextSeg.end.position.add(nextSeg.normal.multiply(distance));

            // Find intersection of offset segments
            const intersection = this.lineIntersection(prevStart, prevEnd, nextStart, nextEnd);

            if (intersection) {
                // Check miter length
                const miterLength = intersection.subtract(vertex.position).length();
                const maxMiter = Math.abs(distance) * miterLimit;

                if (miterLength > maxMiter) {
                    // Insert bevel (two vertices instead of sharp corner)
                    newPoints.push(prevEnd);
                    newPoints.push(nextStart);
                } else {
                    newPoints.push(intersection);
                }
            } else {
                // Parallel lines - just offset the vertex
                newPoints.push(vertex.position.add(offsetDir));
            }
        }

        if (newPoints.length >= 3) {
            const newShape = Shape.fromPoints(newPoints, this._shape.winding);
            return new ShapeContext(newShape);
        }

        return new ShapeContext(this._shape.clone());
    }

    /** Helper: find intersection of two lines (or null if parallel) */
    private lineIntersection(
        a1: Vector2, a2: Vector2,
        b1: Vector2, b2: Vector2
    ): Vector2 | null {
        const d1 = a2.subtract(a1);
        const d2 = b2.subtract(b1);
        const cross = d1.x * d2.y - d1.y * d2.x;

        if (Math.abs(cross) < 1e-10) return null; // Parallel

        const t = ((b1.x - a1.x) * d2.y - (b1.y - a1.y) * d2.x) / cross;
        return new Vector2(a1.x + t * d1.x, a1.y + t * d1.y);
    }
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
export class PointsContext extends SelectableContext<Vertex, PointsContext> {
    constructor(
        protected _shape: Shape,
        vertices: Vertex[]
    ) {
        super(vertices);
    }

    /** Get selected vertices */
    get vertices(): Vertex[] {
        return this._items;
    }

    protected createNew(items: Vertex[]): PointsContext {
        return new PointsContext(this._shape, items);
    }

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
    expand(distance: number): ShapeContext {
        for (const v of this._items) {
            v.moveAlongNormal(distance);
        }
        // Invalidate all segment normals
        for (const seg of this._shape.segments) {
            seg.invalidateNormal();
        }
        return new ShapeContext(this._shape);
    }

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
    inset(distance: number): ShapeContext {
        return this.expand(-distance);
    }

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
    move(x: number, y: number): PointsContext {
        const offset = new Vector2(x, y);
        for (const v of this._items) {
            v.position = v.position.add(offset);
        }
        return this;
    }

    /** Get midpoint of selected points */
    midPoint(): Vector2 {
        if (this._items.length === 0) return Vector2.zero();
        let sum = Vector2.zero();
        for (const v of this._items) {
            sum = sum.add(v.position);
        }
        return sum.divide(this._items.length);
    }

    /** Get bounding box of selected points */
    bbox(): BoundingBox {
        if (this._items.length === 0) {
            return {
                min: Vector2.zero(),
                max: Vector2.zero(),
                width: 0,
                height: 0,
                center: Vector2.zero(),
            };
        }

        let minX = Infinity,
            minY = Infinity;
        let maxX = -Infinity,
            maxY = -Infinity;

        for (const v of this._items) {
            minX = Math.min(minX, v.x);
            minY = Math.min(minY, v.y);
            maxX = Math.max(maxX, v.x);
            maxY = Math.max(maxY, v.y);
        }

        const min = new Vector2(minX, minY);
        const max = new Vector2(maxX, maxY);

        return {
            min,
            max,
            width: maxX - minX,
            height: maxY - minY,
            center: min.lerp(max, 0.5),
        };
    }

    // ==================== Phase 1.5 Operations ====================

    /**
     * Expand each point into a circle shape.
     * Does NOT modify the original shape.
     * @param radius - Circle radius
     * @param segments - Number of circle segments (default 32)
     * @returns ShapesContext with independent circle shapes
     */
    expandToCircles(radius: number, segments = 32): ShapesContext {
        const shapes: Shape[] = [];
        for (const v of this._items) {
            const circle = Shape.regularPolygon(segments, radius, v.position);
            shapes.push(circle);
        }
        return new ShapesContext(shapes);
    }

    /**
     * Cast rays from each point.
     * @param distance - Ray distance
     * @param direction - Angle in degrees, or 'outward'/'inward' relative to shape center
     * @returns PointsContext with ray endpoints
     */
    raycast(distance: number, direction: number | 'outward' | 'inward'): PointsContext {
        const endpoints: Vertex[] = [];
        const center = this._shape.centroid();

        for (const v of this._items) {
            let angle: number;

            if (typeof direction === 'number') {
                angle = direction * Math.PI / 180;
            } else {
                // Use vertex normal if available
                const normal = v.normal;
                if (normal.length() > 0.001) {
                    angle = Math.atan2(normal.y, normal.x);
                    if (direction === 'inward') {
                        angle += Math.PI;
                    }
                } else {
                    // Fallback to direction from center
                    const toCenter = center.subtract(v.position).normalize();
                    angle = Math.atan2(toCenter.y, toCenter.x);
                    if (direction === 'outward') {
                        angle += Math.PI;
                    }
                }
            }

            const endpoint = new Vector2(
                v.position.x + Math.cos(angle) * distance,
                v.position.y + Math.sin(angle) * distance
            );
            endpoints.push(new Vertex(endpoint.x, endpoint.y));
        }

        return new PointsContext(this._shape, endpoints);
    }

    /**
     * Round selected corners with a circular arc.
     * 
     * Uses a tangent circle algorithm to fit an arc of the valid radius
     * into the corner formed by the vertex and its neighbors.
     * 
     * @param radius - Radius of the rounding arc
     * @param segments - Number of segments to use for the arc (default 32 for full circle quality)
     * @returns ShapeContext for the modified shape
     * 
     * @example
     * ```typescript
     * // Round all corners of a rectangle
     * shape.rect().size(50).points.round(10);
     * 
     * // Round specific corners
     * shape.rect().size(50).points.at(0, 2).round(10);
     * ```
     */
    round(radius: number, segments = 32): ShapeContext {
        if (radius <= 0) return new ShapeContext(this._shape);

        const vertices = this._shape.vertices;
        const n = vertices.length;
        if (n < 3) return new ShapeContext(this._shape);

        const newPoints: Vector2[] = [];
        const selectedSet = new Set(this._items);

        for (let i = 0; i < n; i++) {
            const current = vertices[i];

            // If not selected, just keep the vertex
            if (!selectedSet.has(current)) {
                newPoints.push(current.position);
                continue;
            }

            const prev = vertices[(i - 1 + n) % n];
            const next = vertices[(i + 1) % n];

            const p1 = prev.position;
            const p2 = current.position;
            const p3 = next.position;

            const v1 = p1.subtract(p2);
            const v2 = p3.subtract(p2);
            const len1 = v1.length();
            const len2 = v2.length();

            // Skip invalid geometry
            if (len1 < 1e-6 || len2 < 1e-6) {
                newPoints.push(p2);
                continue;
            }

            // Normalize directions
            const d1 = v1.divide(len1);
            const d2 = v2.divide(len2);

            // Calculate angle between vectors
            const angle = Math.acos(d1.dot(d2));

            // Skip if parallel (0 or 180 degrees)
            // 180 degrees (PI radians) means straight line -> cannot round
            // 0 degrees means spike back -> technically possible but usually artifacts
            if (Math.abs(angle - Math.PI) < 1e-4 || Math.abs(angle) < 1e-4) {
                newPoints.push(p2);
                continue;
            }

            // Calculate half-angle tangent distance
            // tan(alpha/2) = R / L  => L = R / tan(alpha/2)
            const alpha = angle; // Angle between vectors
            // The corner angle is actually the interior angle.
            // Our vectors d1, d2 point away from the corner. 
            // So the angle calculated by dot product is exactly the angle we need for the formula.
            // The tangent distance is from the corner vertex along the edges.

            let tangentDist = radius / Math.tan(alpha / 2);

            // Clamp tangent distance to half the length of smallest segment to avoid overlap
            // This prevents the arc from consuming the whole edge
            const maxDist = Math.min(len1, len2) / 2;
            let effectiveRadius = radius;

            if (tangentDist > maxDist) {
                // Adjust radius to fit
                tangentDist = maxDist;
                effectiveRadius = tangentDist * Math.tan(alpha / 2);
            }

            // Calculate tangent points
            const t1 = p2.add(d1.multiply(tangentDist));
            const t2 = p2.add(d2.multiply(tangentDist));

            // Calculate center of circle
            // The center is 'radius' distance away from the edge, perpendicular to it.
            // But we need to be careful with direction (winding).
            // A safer way: The center lies on the bisector of the angle.
            const bisector = d1.add(d2).normalize();
            const distToCenter = effectiveRadius / Math.sin(alpha / 2);
            const center = p2.add(bisector.multiply(distToCenter));

            // Generate arc points
            // Start angle: from Center to T1
            const startAngle = t1.subtract(center).angle();
            // End angle: from Center to T2
            const endAngle = t2.subtract(center).angle();

            // Determine arc sweep
            // We need to go from T1 to T2.
            // Which way? depends on winding. Assume shortest path for now (acute side).
            let sweep = endAngle - startAngle;

            // Normalize sweep to -PI to PI
            if (sweep > Math.PI) sweep -= 2 * Math.PI;
            if (sweep < -Math.PI) sweep += 2 * Math.PI;

            // Generate points
            // Determine number of segments for this arc using step size or fixed count
            // Allocating fraction of segments based on angular size
            const arcSegments = Math.max(1, Math.ceil(Math.abs(sweep) / (2 * Math.PI) * segments));

            for (let j = 0; j <= arcSegments; j++) {
                const fraction = j / arcSegments;
                const theta = startAngle + sweep * fraction;
                newPoints.push(new Vector2(
                    center.x + Math.cos(theta) * effectiveRadius,
                    center.y + Math.sin(theta) * effectiveRadius
                ));
            }
        }


        // Remove duplicates if any (though logic shouldn't produce adjacent identicals usually)
        if (newPoints.length >= 3) {
            const newShape = Shape.fromPoints(newPoints, this._shape.winding);
            // Mutate the original shape structure (preserve identity)
            this._shape.segments = newShape.segments;
            this._shape.winding = newShape.winding; // Should be same
            this._shape.connectSegments();
        }

        // Return context for the same (now mutated) shape
        return new ShapeContext(this._shape);
    }
}

/**
 * Context for lines/segments operations.
 */
export class LinesContext extends SelectableContext<Segment, LinesContext> {
    constructor(
        protected _shape: Shape,
        segments: Segment[],
        protected _parentShapes?: Map<Segment, Shape>
    ) {
        super(segments);
    }

    /** Get selected segments */
    get segments(): Segment[] {
        return this._items;
    }

    protected createNew(items: Segment[]): LinesContext {
        return new LinesContext(this._shape, items, this._parentShapes);
    }

    /**
     * Extrude selected lines outward.
     * For each selected segment A→B, replaces it with A→A'→B'→B where A' and B'
     * are the extruded positions (original + normal * distance).
     * Returns the modified ShapeContext.
     */
    /**
     * Extrude selected lines outward.
     * Use parent map to handle extrusion across multiple shapes.
     * Returns a ShapeContext (if single shape) or ShapesContext (if multiple).
     */
    extrude(distance: number): ShapeContext | ShapesContext {
        if (this._items.length === 0) return new ShapeContext(this._shape);

        // Group selected segments by their parent shape
        const segmentsByShape = new Map<Shape, Segment[]>();
        const parentMap = this._parentShapes ?? new Map(this._items.map(s => [s, this._shape]));

        for (const seg of this._items) {
            const parent = parentMap.get(seg);
            if (parent) {
                if (!segmentsByShape.has(parent)) {
                    segmentsByShape.set(parent, []);
                }
                segmentsByShape.get(parent)!.push(seg);
            }
        }

        const affectedShapes: Shape[] = [];

        // Process each affected shape
        for (const [shape, selectedSegs] of segmentsByShape) {
            affectedShapes.push(shape);
            const selectedSet = new Set(selectedSegs);
            const newPoints: Vector2[] = [];
            const allSegments = shape.segments;

            if (allSegments.length === 0) continue;

            // Iterate through all segments of the shape
            for (let i = 0; i < allSegments.length; i++) {
                const seg = allSegments[i];
                const isSelected = selectedSet.has(seg);

                newPoints.push(seg.start.position);

                if (isSelected) {
                    const normal = seg.normal.multiply(distance);
                    newPoints.push(seg.start.position.add(normal)); // A'
                    newPoints.push(seg.end.position.add(normal));   // B'
                }
            }

            // Update shape if we have enough points
            if (newPoints.length >= 3) {
                // Remove duplicate consecutive points
                const uniquePoints = newPoints.filter((p, i, arr) => {
                    if (i === 0) return true;
                    return !p.equals(arr[i - 1]);
                });
                if (uniquePoints.length > 1 && uniquePoints[0].equals(uniquePoints[uniquePoints.length - 1])) {
                    uniquePoints.pop();
                }

                if (uniquePoints.length >= 3) {
                    const newShape = Shape.fromPoints(uniquePoints, shape.winding);
                    newShape.ephemeral = shape.ephemeral;

                    // Mutate the original shape
                    shape.segments = newShape.segments;
                    shape.winding = newShape.winding;
                    shape.connectSegments();
                }
            }
        }

        if (affectedShapes.length === 1) {
            return new ShapeContext(affectedShapes[0]);
        }

        // Return ShapesContext if multiple shapes were modified
        // If nothing was modified, return context of original reference shape
        return affectedShapes.length > 0
            ? new ShapesContext(affectedShapes)
            : new ShapeContext(this._shape);
    }

    /**
     * Divide selected lines into n segments.
     * Returns points at division locations.
     */
    divide(n: number): PointsContext {
        const vertices: Vertex[] = [];

        for (const seg of this._items) {
            for (let i = 1; i < n; i++) {
                const t = i / n;
                const point = seg.pointAt(t);
                vertices.push(new Vertex(point.x, point.y));
            }
        }

        return new PointsContext(this._shape, vertices);
    }

    /**
     * Subdivide selected lines into n segments each.
     * Mutates the parent shape(s) by replacing each selected segment with n subsegments.
     * Returns a LinesContext with all newly created subsegments.
     * 
     * @param n - Number of subsegments to create per selected line
     * @returns LinesContext containing all newly created subsegments
     * 
     * @example
     * ```typescript
     * // Subdivide and extrude middle segment
     * rect.lines.at(0).subdivide(3).at(1).extrude(10);
     * 
     * // Subdivide every other line in multiple shapes
     * shapes.lines.every(2).subdivide(4);
     * ```
     */
    subdivide(n: number): LinesContext {
        // Handle edge case
        if (n < 2) {
            return new LinesContext(this._shape, this._items, this._parentShapes);
        }

        // Group selected segments by their parent shape
        const segmentsByShape = new Map<Shape, Segment[]>();

        // Build parent shapes map if not provided (single shape case)
        const parentMap = this._parentShapes ?? new Map(this._items.map(s => [s, this._shape]));

        for (const seg of this._items) {
            const parent = parentMap.get(seg);
            if (!parent) continue;

            if (!segmentsByShape.has(parent)) {
                segmentsByShape.set(parent, []);
            }
            segmentsByShape.get(parent)!.push(seg);
        }

        // Track all newly created subsegments to return
        const allNewSubsegments: Segment[] = [];

        // Process each shape
        for (const [shape, selectedSegs] of segmentsByShape) {
            const selectedSet = new Set(selectedSegs);
            const newSegments: Segment[] = [];
            const segmentToSubsegments = new Map<Segment, Segment[]>();

            // Build new segments array in one pass
            for (const seg of shape.segments) {
                if (selectedSet.has(seg)) {
                    // Subdivide this segment
                    const subsegments = this.subdivideSegment(seg, n);
                    newSegments.push(...subsegments);
                    segmentToSubsegments.set(seg, subsegments);
                    allNewSubsegments.push(...subsegments);
                } else {
                    // Keep original segment
                    newSegments.push(seg);
                }
            }

            // Replace shape's segments array
            shape.segments = newSegments;
            shape.connectSegments();
        }

        // Return LinesContext with all newly created subsegments
        // Use the first parent shape as reference, or this._shape if none
        const refShape = segmentsByShape.keys().next().value ?? this._shape;
        return new LinesContext(refShape, allNewSubsegments, parentMap);
    }

    /**
     * Helper to subdivide a single segment into n subsegments.
     * Creates n-1 new vertices at division points and n new segments.
     */
    private subdivideSegment(seg: Segment, n: number): Segment[] {
        const subsegments: Segment[] = [];
        const vertices: Vertex[] = [seg.start];

        // Create n-1 intermediate vertices
        for (let i = 1; i < n; i++) {
            const t = i / n;
            const point = seg.pointAt(t);
            vertices.push(new Vertex(point.x, point.y));
        }

        // Add end vertex
        vertices.push(seg.end);

        // Create n segments connecting the vertices
        for (let i = 0; i < n; i++) {
            const newSeg = new Segment(vertices[i], vertices[i + 1]);
            newSeg.winding = seg.winding;
            subsegments.push(newSeg);
        }

        return subsegments;
    }

    /** Get midpoint of all selected lines */
    midPoint(): Vector2 {
        if (this._items.length === 0) return Vector2.zero();
        let sum = Vector2.zero();
        for (const seg of this._items) {
            sum = sum.add(seg.midpoint());
        }
        return sum.divide(this._items.length);
    }

    // ==================== Phase 1.5 Operations ====================

    /**
     * Collapse selected segments to their midpoints.
     * Modifies parent shape: removes segment and merges vertices at midpoint.
     * @returns PointsContext with midpoint locations
     */
    collapse(): PointsContext {
        const midpoints: Vertex[] = [];

        for (const seg of this._items) {
            const mid = seg.midpoint();
            midpoints.push(new Vertex(mid.x, mid.y));
        }

        // Note: Full topology modification would remove segments from parent shape.
        // For now, just return the midpoints. Shape modification is complex.
        return new PointsContext(this._shape, midpoints);
    }

    /**
     * Stamp segments as line paths to collector.
     * Uses thinner default stroke width (0.5) for connection lines.
     */
    stamp(collector: SVGCollector, x = 0, y = 0, style: PathStyle = {}): void {
        // Default style for connection lines - thinner than shapes
        const finalStyle = {
            ...DEFAULT_STYLES.line,
            ...style
        };

        for (const seg of this._items) {
            // Convert segment to path data (M startX startY L endX endY)
            const startPos = seg.start.position;
            const endPos = seg.end.position;
            const pathData = `M ${startPos.x + x} ${startPos.y + y} L ${endPos.x + x} ${endPos.y + y}`;
            collector.addPath(pathData, finalStyle);
        }
    }

    /**
     * Expand each segment into a rectangle with square end caps.
     * Does NOT modify the original shape.
     * @param distance - Half-height of rectangle (total height = 2 * distance)
     * @returns ShapesContext with independent rectangle shapes
     */
    expandToRect(distance: number): ShapesContext {
        const shapes: Shape[] = [];

        for (const seg of this._items) {
            const start = seg.start.position;
            const end = seg.end.position;
            const normal = seg.normal.multiply(distance);

            // Create rectangle: start, end, end+normal, start+normal
            const rect = Shape.fromPoints([
                start.subtract(normal),
                end.subtract(normal),
                end.add(normal),
                start.add(normal),
            ]);
            shapes.push(rect);
        }

        return new ShapesContext(shapes);
    }
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
export class ShapesContext extends SelectableContext<Shape, ShapesContext> {
    private _isCompound: boolean;
    private _groups: Shape[][] | null = null; // Groups of shapes that form compound paths

    constructor(shapes: Shape[], isCompound = false) {
        super(shapes);
        this._isCompound = isCompound;
    }

    /** Create a ShapesContext from groups of shapes (e.g. from boolean operations) */
    static fromGroups(groups: Shape[][]): ShapesContext {
        const flat = groups.reduce((acc, g) => acc.concat(g), []);
        const ctx = new ShapesContext(flat);
        ctx._groups = groups;
        return ctx;
    }

    /** Treat these shapes as a single compound path (rendering only) */
    compound(): this {
        this._isCompound = true;
        // If no explicit groups, treat all as one group
        if (!this._groups) {
            this._groups = [this._items];
        }
        return this;
    }

    /** Get all shapes */
    get shapes(): Shape[] {
        return this._items;
    }

    protected createNew(items: Shape[]): ShapesContext {
        return new ShapesContext(items);
    }

    /**
     * Helper to resolve a value that might be a sequence or a number.
     * If it's a sequence, call it to advance and get the next value.
     * Otherwise, return the number as-is.
     */
    private resolveValue(value: number | SequenceFunction): number {
        return typeof value === 'function' && 'current' in value
            ? value()  // Call sequence to advance and get next value
            : value;   // Use number as-is
    }

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
    slice(start: number, end?: number): ShapesContext {
        return new ShapesContext(this._items.slice(start, end));
    }

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
    spread(x: number, y: number): ShapesContext {
        const offset = new Vector2(x, y);
        for (let i = 0; i < this._items.length; i++) {
            this._items[i].translate(offset.multiply(i));
        }
        return this;
    }

    /**
     * Clone the entire selection n times with optional offset.
     * Each copy of the ENTIRE selection is offset by (x*i, y*i).
     * Returns originals + (n * selection.length) new shapes.
     * @param n - Number of copies to create
     * @param x - Horizontal offset between each copy (default 0)
     * @param y - Vertical offset between each copy (default 0)
     */
    clone(n: number, x: number = 0, y: number = 0): ShapesContext {
        const offset = new Vector2(x, y);
        const newShapes: Shape[] = [...this._items]; // Include originals

        // Create n copies of the entire selection
        for (let copyNum = 1; copyNum <= n; copyNum++) {
            for (const shape of this._items) {
                const clone = shape.clone();
                clone.translate(offset.multiply(copyNum));
                newShapes.push(clone);
            }
        }
        return new ShapesContext(newShapes);
    }

    /** Get all points from all shapes */
    get points(): PointsContext {
        const allVertices: Vertex[] = [];
        for (const shape of this._items) {
            allVertices.push(...shape.vertices);
        }
        // Use first shape as reference (may be empty)
        const refShape = this._items[0] ?? Shape.fromPoints([
            Vector2.zero(),
            new Vector2(1, 0),
            new Vector2(0, 1),
        ]);
        return new PointsContext(refShape, allVertices);
    }

    /** Get all lines from all shapes */
    get lines(): LinesContext {
        const allSegments: Segment[] = [];
        const parentShapes = new Map<Segment, Shape>();

        for (const shape of this._items) {
            for (const seg of shape.segments) {
                allSegments.push(seg);
                parentShapes.set(seg, shape);
            }
        }

        const refShape = this._items[0] ?? Shape.fromPoints([
            Vector2.zero(),
            new Vector2(1, 0),
            new Vector2(0, 1),
        ]);
        return new LinesContext(refShape, allSegments, parentShapes);
    }

    /** Make all shapes concrete */
    trace(): ShapesContext {
        for (const shape of this._items) {
            shape.ephemeral = false;
        }
        return this;
    }

    /** Scale all shapes uniformly (supports sequences) */
    scale(factor: number | SequenceFunction): this {
        for (const shape of this._items) {
            shape.scale(this.resolveValue(factor));
        }
        return this;
    }

    /** Scale all shapes along X axis only (supports sequences) */
    scaleX(factor: number | SequenceFunction): this {
        for (const shape of this._items) {
            const ctx = new ShapeContext(shape);
            ctx.scaleX(this.resolveValue(factor));
        }
        return this;
    }

    /** Scale all shapes along Y axis only (supports sequences) */
    scaleY(factor: number | SequenceFunction): this {
        for (const shape of this._items) {
            const ctx = new ShapeContext(shape);
            ctx.scaleY(this.resolveValue(factor));
        }
        return this;
    }

    /** Rotate all shapes by angle in degrees (supports sequences) */
    rotate(angleDeg: number | SequenceFunction): this {
        for (const shape of this._items) {
            const angle = this.resolveValue(angleDeg);
            shape.rotate(angle * Math.PI / 180);
        }
        return this;
    }

    /** Translate all shapes by delta (supports sequences for x and y) */
    translate(x: number | SequenceFunction, y: number | SequenceFunction): this {
        for (const shape of this._items) {
            const dx = this.resolveValue(x);
            const dy = this.resolveValue(y);
            shape.translate(new Vector2(dx, dy));
        }
        return this;
    }

    /**
     * Merge all shapes in this context into a single shape (or set of shapes).
     * Uses boolean selection logic to combine overlapping shapes.
     * 
     * @returns ShapesContext containing the merged result
     */
    union(): ShapesContext {
        // BooleanOps.union returns Shape[], so we wrap it
        const result = BooleanOps.union(this._items);
        // Union of all items -> Single logical group
        return ShapesContext.fromGroups([result]);
    }

    /**
     * Subtract another shape (or shapes) from EACH shape in this context.
     * @param other Shape, ShapeContext, or ShapesContext to subtract.
     * @returns A new ShapesContext containing the resulting shapes.
     */
    subtract(other: Shape | ShapeContext | ShapesContext): ShapesContext {
        const clips = this.resolveShapes(other);
        const groups: Shape[][] = [];

        for (const subject of this._items) {
            const res = BooleanOps.difference([subject], clips);
            if (res.length > 0) groups.push(res);
        }
        return ShapesContext.fromGroups(groups);
    }

    /** Helper to resolve inputs to Shape[] */
    private resolveShapes(other: Shape | ShapeContext | ShapesContext): Shape[] {
        if (other instanceof Shape) return [other];
        if (other instanceof ShapeContext) return [other.shape];
        if ('shapes' in other && Array.isArray((other as any).shapes)) {
            return (other as any).shapes;
        }
        return [];
    }

    /**
     * Offset (inset/outset) all shape outlines.
     * @param distance - Offset distance
     * @param count - Number of copies per shape. 0 = in-place. >0 = returns offset copies.
     * @param miterLimit - Miter limit
     * @param includeOriginal - When count > 0, include original shapes in result (default false)
     */
    offset(distance: number, count: number = 0, miterLimit = 4, includeOriginal = false): ShapesContext {
        if (count > 0) {
            const newShapes: Shape[] = [];
            for (const shape of this._items) {
                if (includeOriginal) {
                    newShapes.push(shape); // Original
                }
                let current = shape;
                for (let i = 0; i < count; i++) {
                    const ctx = new ShapeContext(current);
                    const offsetCtx = ctx.offsetShape(distance, miterLimit);
                    newShapes.push(offsetCtx.shape);
                    current = offsetCtx.shape;
                }
            }
            return new ShapesContext(newShapes);
        }

        for (let i = 0; i < this._items.length; i++) {
            const shape = this._items[i];
            const ctx = new ShapeContext(shape);
            const offsetCtx = ctx.offsetShape(distance, miterLimit);
            // Copy offset geometry back to original shape
            shape.segments = offsetCtx.shape.segments;
            shape.winding = offsetCtx.shape.winding;
            shape.connectSegments();
        }
        return this;
    }

    /** Expand all shapes */
    expand(distance: number, count: number = 0, miterLimit = 4, includeOriginal = false): ShapesContext {
        return this.offset(Math.abs(distance), count, miterLimit, includeOriginal);
    }

    /** Inset all shapes */
    inset(distance: number, count: number = 0, miterLimit = 4): ShapesContext {
        return this.offset(-Math.abs(distance), count, miterLimit);
    }

    /**
     * Set color for all shapes (supports sequences and palettes).
     * 
     * When a Palette is provided, each shape gets the next color from the palette.
     * When a sequence is provided, each shape gets the next color from the sequence.
     * When a string is provided, all shapes get the same color.
     * 
     * @param colorValue - Hex color string, Sequence, or Palette
     * @returns This ShapesContext for chaining
     * 
     * @example
     * ```typescript
     * // Same color for all shapes
     * shapes.color('#ff5733');
     * 
     * // Use palette directly (streamlined API)
     * shapes.color(palette.create(6, "blues", "cyans").vibrant());
     * 
     * // Use sequence for different colors
     * shapes.color(sequence.repeat(10, 20, 30));
     * ```
     */
    color(colorValue: string | SequenceFunction | Palette): this {
        if (colorValue instanceof Palette) {
            // Palette: assign next color to each shape
            for (const shape of this._items) {
                shape.color = colorValue.next();
            }
        } else if (typeof colorValue === 'function' && 'current' in colorValue) {
            // Sequence: assign next color to each shape
            for (const shape of this._items) {
                const nextColor = colorValue();
                shape.color = String(nextColor);
            }
        } else {
            // String: assign same color to all shapes
            for (const shape of this._items) {
                shape.color = colorValue;
            }
        }
        return this;
    }

    /** Move all shapes so their collective center is at position */
    moveTo(x: number, y: number): this {
        const bounds = this.getBounds();
        const currentCenter = new Vector2(
            (bounds.minX + bounds.maxX) / 2,
            (bounds.minY + bounds.maxY) / 2
        );
        const delta = new Vector2(x, y).subtract(currentCenter);
        return this.translate(delta.x, delta.y);
    }

    /** Set x position of collective center (supports sequences) */
    x(xPos: number | SequenceFunction): this {
        if (typeof xPos === 'function' && 'current' in xPos) {
            // If it's a sequence, position each shape individually
            for (const shape of this._items) {
                const targetX = this.resolveValue(xPos);
                const currentX = shape.centroid().x;
                shape.translate(new Vector2(targetX - currentX, 0));
            }
        } else {
            // For a single number, move the entire collection as a group
            const bounds = this.getBounds();
            const currentX = (bounds.minX + bounds.maxX) / 2;
            this.translate(xPos - currentX, 0);
        }
        return this;
    }

    /** Set y position of collective center (supports sequences) */
    y(yPos: number | SequenceFunction): this {
        if (typeof yPos === 'function' && 'current' in yPos) {
            // If it's a sequence, position each shape individually
            for (const shape of this._items) {
                const targetY = this.resolveValue(yPos);
                const currentY = shape.centroid().y;
                shape.translate(new Vector2(0, targetY - currentY));
            }
        } else {
            // For a single number, move the entire collection as a group
            const bounds = this.getBounds();
            const currentY = (bounds.minY + bounds.maxY) / 2;
            this.translate(0, yPos - currentY);
        }
        return this;
    }

    /** Set x and y position of collective center */
    xy(xPos: number, yPos: number): this {
        return this.moveTo(xPos, yPos);
    }

    /** Get bounds of all shapes */
    getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for (const shape of this._items) {
            for (const v of shape.vertices) {
                minX = Math.min(minX, v.x);
                minY = Math.min(minY, v.y);
                maxX = Math.max(maxX, v.x);
                maxY = Math.max(maxY, v.y);
            }
        }
        return { minX, minY, maxX, maxY };
    }

    /** Get all vertices from all shapes (flattened) */
    get vertices(): Vertex[] {
        const all: Vertex[] = [];
        for (const shape of this._items) {
            all.push(...shape.vertices);
        }
        return all;
    }

    /** Get all segments from all shapes (flattened) */
    get segments(): Segment[] {
        const all: Segment[] = [];
        for (const shape of this._items) {
            all.push(...shape.segments);
        }
        return all;
    }

    /** Get center of all shapes */
    get center(): Vector2 {
        const bounds = this.getBounds();
        return new Vector2(
            (bounds.minX + bounds.maxX) / 2,
            (bounds.minY + bounds.maxY) / 2
        );
    }

    /** Stamp all shapes to collector */
    stamp(collector: SVGCollector, x = 0, y = 0, style: PathStyle = {}): void {
        // Compound/Grouped rendering
        if (this._groups) {
            for (const group of this._groups) {
                const shapesToStamp: Shape[] = [];
                for (const shape of group) {
                    if (shape.ephemeral) continue;
                    const clone = shape.clone();
                    if (x !== 0 || y !== 0) {
                        clone.translate(new Vector2(x, y));
                    }
                    shapesToStamp.push(clone);
                }
                collector.addCompound(shapesToStamp, style);
            }
            return;
        }

        // Standard rendering: each shape is a separate path
        // Use the provided style directly, allowing render mode to control defaults
        for (const shape of this._items) {
            if (shape.ephemeral) continue;
            const clone = shape.clone();
            if (x !== 0 || y !== 0) {
                clone.translate(new Vector2(x, y));
            }
            collector.addShape(clone, style);
        }
    }

    // ==================== Phase 1.5 Operations ====================

    /**
     * Distribute shapes radially around a circle.
     * @param radius - Distance from origin
     * @param arc - Optional angle range: undefined = 360°, number = 0 to angle, [start, end] = range
     * @returns This ShapesContext (modified in place)
     */
    spreadPolar(radius: number, arc?: number | [number, number]): this {
        let startAngle = 0;
        let endAngle = 360;

        if (arc !== undefined) {
            if (typeof arc === 'number') {
                endAngle = arc;
            } else {
                startAngle = arc[0];
                endAngle = arc[1];
            }
        }

        const angleRange = endAngle - startAngle;
        const n = this._items.length;

        // For full circle, don't put last shape on top of first
        const step = angleRange === 360
            ? angleRange / n
            : angleRange / Math.max(1, n - 1);

        for (let i = 0; i < n; i++) {
            const angleDeg = startAngle + step * i;
            const angleRad = angleDeg * Math.PI / 180;

            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;

            this._items[i].moveTo(new Vector2(x, y));
        }

        return this;
    }
}

/**
 * Circle context with radius and segments.
 */
export class CircleContext extends ShapeContext {
    private _radius = 10;
    private _segments = 32;
    private _center = Vector2.zero();

    constructor() {
        super(Shape.regularPolygon(32, 10));
    }

    /** Set circle radius */
    radius(r: number): this {
        this._radius = r;
        this.rebuild();
        return this;
    }

    /** Set number of segments */
    numSegments(n: number): this {
        this._segments = Math.max(3, n);
        this.rebuild();
        return this;
    }

    /** Set center position */
    setCenter(x: number, y: number): this {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }

    private rebuild(): void {
        this._shape = Shape.regularPolygon(
            this._segments,
            this._radius,
            this._center
        );
    }
}

/**
 * Rectangle context with width and height.
 */
export class RectContext extends ShapeContext {
    private _width: number;
    private _height: number;
    private _center = Vector2.zero();

    constructor(shape?: Shape, width = 10, height = 10) {
        super(shape ?? RectContext.createRect(width, height, Vector2.zero()));
        this._width = width;
        this._height = height;
    }

    /** Get width */
    get w(): number { return this._width; }

    /** Get height */
    get h(): number { return this._height; }

    /** Set width */
    width(w: number): this {
        this._width = w;
        this.rebuild();
        return this;
    }

    /** Set height */
    height(h: number): this {
        this._height = h;
        this.rebuild();
        return this;
    }

    /** Set width and height */
    wh(w: number, h: number): this {
        this._width = w;
        this._height = h;
        this.rebuild();
        return this;
    }

    /** Set size (square) */
    size(s: number): this {
        return this.wh(s, s);
    }

    /** Set center position */
    setCenter(x: number, y: number): this {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }

    private rebuild(): void {
        this._shape = RectContext.createRect(this._width, this._height, this._center);
    }

    static createRect(width: number, height: number, center: Vector2): Shape {
        const hw = width / 2;
        const hh = height / 2;
        return Shape.fromPoints([
            new Vector2(center.x - hw, center.y - hh),
            new Vector2(center.x + hw, center.y - hh),
            new Vector2(center.x + hw, center.y + hh),
            new Vector2(center.x - hw, center.y + hh),
        ]);
    }
}

/**
 * Square context (special case of rectangle).
 */
export class SquareContext extends RectContext {
    constructor(size = 10) {
        super(undefined, size, size);
    }

    /** Set square size */
    size(s: number): this {
        return this.wh(s, s);
    }
}

/**
 * Hexagon context with radius.
 */
export class HexagonContext extends ShapeContext {
    private _radius = 10;
    private _center = Vector2.zero();

    constructor() {
        // 6 segments, rotated 30° so flat edge is at bottom
        super(Shape.regularPolygon(6, 10, Vector2.zero(), Math.PI / 6));
    }

    /** Set hexagon radius */
    radius(r: number): this {
        this._radius = r;
        this.rebuild();
        return this;
    }

    /** Set center position */
    setCenter(x: number, y: number): this {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }

    private rebuild(): void {
        this._shape = Shape.regularPolygon(6, this._radius, this._center, Math.PI / 6);
    }
}

/**
 * Triangle context with radius.
 */
export class TriangleContext extends ShapeContext {
    private _radius = 10;
    private _center = Vector2.zero();

    constructor() {
        // 3 segments, rotated so one vertex points up
        super(Shape.regularPolygon(3, 10, Vector2.zero(), -Math.PI / 2));
    }

    /** Set triangle radius */
    radius(r: number): this {
        this._radius = r;
        this.rebuild();
        return this;
    }

    /** Set center position */
    setCenter(x: number, y: number): this {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }

    private rebuild(): void {
        this._shape = Shape.regularPolygon(3, this._radius, this._center, -Math.PI / 2);
    }
}

