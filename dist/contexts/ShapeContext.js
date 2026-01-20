import { Shape, Segment, Vector2, Vertex } from '../primitives';
import { DEFAULT_STYLES } from '../collectors/SVGCollector';
import { PointContext } from './PointContext';
import { CloneSystem } from '../systems/CloneSystem';
/**
 * Base class for contexts that operate on collections with selection capabilities.
 * Provides common selection methods: every(), at(), length
 */
class SelectableContext {
    constructor(_items) {
        this._items = _items;
    }
    /** Get number of selected items */
    get length() {
        return this._items.length;
    }
    /**
     * Select every nth item.
     * @param n - Select every nth item (1 = all, 2 = every other, etc.)
     * @param offset - Starting offset (default 0)
     */
    every(n, offset = 0) {
        if (n < 1) {
            // Prevent infinite loop for n <= 0
            return this.createNew([]);
        }
        const selected = [];
        for (let i = offset; i < this._items.length; i += n) {
            selected.push(this._items[i]);
        }
        return this.createNew(selected);
    }
    /**
     * Select items at specific indices.
     * @param indices - Zero-based indices of items to select
     */
    at(...indices) {
        const selected = [];
        for (const i of indices) {
            if (i >= 0 && i < this._items.length) {
                selected.push(this._items[i]);
            }
        }
        return this.createNew(selected);
    }
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
    constructor(_shape) {
        this._shape = _shape;
    }
    /** Get the underlying shape */
    get shape() {
        return this._shape;
    }
    /** Get all vertices */
    get vertices() {
        return this._shape.vertices;
    }
    /** Get all segments */
    get segments() {
        return this._shape.segments;
    }
    /** Get the center (centroid) of the shape */
    get center() {
        return this._shape.centroid();
    }
    /** Get the centroid of the shape */
    get centroid() {
        return this._shape.centroid();
    }
    /** Get the winding direction */
    get winding() {
        return this._shape.winding;
    }
    /** Get total perimeter length of the shape */
    get length() {
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
    get points() {
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
    get lines() {
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
    clone(n = 1, x = 0, y = 0) {
        // Mark original as ephemeral - it will only render through the CloneSystem
        this._shape.ephemeral = true;
        return new CloneSystem(this._shape, { count: n, offsetX: x, offsetY: y });
    }
    /** Scale shape by factor */
    scale(factor) {
        this._shape.scale(factor);
        return this;
    }
    /** Rotate shape by angle in degrees */
    rotate(degrees) {
        this._shape.rotate((degrees * Math.PI) / 180);
        return this;
    }
    /** Rotate shape by angle in radians */
    rotateRad(radians) {
        this._shape.rotate(radians);
        return this;
    }
    moveTo(xOrPoint, y) {
        if (typeof xOrPoint === 'number') {
            this._shape.moveTo(new Vector2(xOrPoint, y));
        }
        else {
            this._shape.moveTo(xOrPoint);
        }
        return this;
    }
    /** Translate shape by delta */
    translate(x, y) {
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
    offset(distance, count = 0, miterLimit = 4, includeOriginal = false) {
        if (count > 0) {
            const shapes = [];
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
    expand(distance, count = 0, miterLimit = 4, includeOriginal = false) {
        return this.offset(Math.abs(distance), count, miterLimit, includeOriginal);
    }
    /**
     * Inset shape by distance.
     */
    inset(distance, count = 0, miterLimit = 4) {
        return this.offset(-Math.abs(distance), count, miterLimit);
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
    x(xPos) {
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
    y(yPos) {
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
    xy(xPos, yPos) {
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
    reverse() {
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
    bbox() {
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
    centerPoint() {
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
    trace() {
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
    ephemeral() {
        this._shape.ephemeral = true;
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
    stamp(collector, x = 0, y = 0, style = {}) {
        if (this._shape.ephemeral)
            return;
        const clone = this._shape.clone();
        if (x !== 0 || y !== 0) {
            clone.translate(new Vector2(x, y));
        }
        const finalStyle = {
            ...DEFAULT_STYLES.shape,
            ...style
        };
        collector.addShape(clone, finalStyle);
    }
    // ==================== Phase 1.5 Operations ====================
    /**
     * Explode shape into independent segments.
     * Marks original shape as ephemeral.
     * @returns LinesContext with orphan segments (disconnected)
     */
    explode() {
        this._shape.ephemeral = true;
        // Create independent segments (not connected to each other)
        const orphanSegments = [];
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
    collapse() {
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
    offsetShape(distance, miterLimit = 4) {
        const newPoints = [];
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
                }
                else {
                    newPoints.push(intersection);
                }
            }
            else {
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
    lineIntersection(a1, a2, b1, b2) {
        const d1 = a2.subtract(a1);
        const d2 = b2.subtract(b1);
        const cross = d1.x * d2.y - d1.y * d2.x;
        if (Math.abs(cross) < 1e-10)
            return null; // Parallel
        const t = ((b1.x - a1.x) * d2.y - (b1.y - a1.y) * d2.x) / cross;
        return new Vector2(a1.x + t * d1.x, a1.y + t * d1.y);
    }
}
/**
 * Global collector for auto-stamping (used by playground).
 * When set, shapes created via specialized contexts will auto-register.
 */
ShapeContext.globalCollector = null;
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
export class PointsContext extends SelectableContext {
    constructor(_shape, vertices) {
        super(vertices);
        this._shape = _shape;
    }
    /** Get selected vertices */
    get vertices() {
        return this._items;
    }
    createNew(items) {
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
    expand(distance) {
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
    inset(distance) {
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
    move(x, y) {
        const offset = new Vector2(x, y);
        for (const v of this._items) {
            v.position = v.position.add(offset);
        }
        return this;
    }
    /** Get midpoint of selected points */
    midPoint() {
        if (this._items.length === 0)
            return Vector2.zero();
        let sum = Vector2.zero();
        for (const v of this._items) {
            sum = sum.add(v.position);
        }
        return sum.divide(this._items.length);
    }
    /** Get bounding box of selected points */
    bbox() {
        if (this._items.length === 0) {
            return {
                min: Vector2.zero(),
                max: Vector2.zero(),
                width: 0,
                height: 0,
                center: Vector2.zero(),
            };
        }
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
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
    expandToCircles(radius, segments = 32) {
        const shapes = [];
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
    raycast(distance, direction) {
        const endpoints = [];
        const center = this._shape.centroid();
        for (const v of this._items) {
            let angle;
            if (typeof direction === 'number') {
                angle = direction * Math.PI / 180;
            }
            else {
                // Use vertex normal if available
                const normal = v.normal;
                if (normal.length() > 0.001) {
                    angle = Math.atan2(normal.y, normal.x);
                    if (direction === 'inward') {
                        angle += Math.PI;
                    }
                }
                else {
                    // Fallback to direction from center
                    const toCenter = center.subtract(v.position).normalize();
                    angle = Math.atan2(toCenter.y, toCenter.x);
                    if (direction === 'outward') {
                        angle += Math.PI;
                    }
                }
            }
            const endpoint = new Vector2(v.position.x + Math.cos(angle) * distance, v.position.y + Math.sin(angle) * distance);
            endpoints.push(new Vertex(endpoint.x, endpoint.y));
        }
        return new PointsContext(this._shape, endpoints);
    }
}
/**
 * Context for lines/segments operations.
 */
export class LinesContext extends SelectableContext {
    constructor(_shape, segments) {
        super(segments);
        this._shape = _shape;
    }
    /** Get selected segments */
    get segments() {
        return this._items;
    }
    createNew(items) {
        return new LinesContext(this._shape, items);
    }
    /**
     * Extrude selected lines outward.
     * For each selected segment A→B, replaces it with A→A'→B'→B where A' and B'
     * are the extruded positions (original + normal * distance).
     * Returns the modified ShapeContext.
     */
    extrude(distance) {
        if (this._items.length === 0)
            return new ShapeContext(this._shape);
        // Build a set of selected segments for quick lookup
        const selectedSet = new Set(this._items);
        const newPoints = [];
        const allSegments = this._shape.segments;
        if (allSegments.length === 0)
            return new ShapeContext(this._shape);
        // Iterate through all segments of the shape to build new point list
        for (let i = 0; i < allSegments.length; i++) {
            const seg = allSegments[i];
            const isSelected = selectedSet.has(seg);
            newPoints.push(seg.start.position);
            if (isSelected) {
                const normal = seg.normal.multiply(distance);
                newPoints.push(seg.start.position.add(normal)); // A'
                newPoints.push(seg.end.position.add(normal)); // B'
            }
        }
        // Create new shape from points
        if (newPoints.length >= 3) {
            // Remove duplicate consecutive points before creating shape
            const uniquePoints = newPoints.filter((p, i, arr) => {
                if (i === 0)
                    return true;
                return !p.equals(arr[i - 1]);
            });
            // Check for closing point duplication
            if (uniquePoints.length > 1 && uniquePoints[0].equals(uniquePoints[uniquePoints.length - 1])) {
                uniquePoints.pop();
            }
            if (uniquePoints.length < 3)
                return new ShapeContext(this._shape);
            const newShape = Shape.fromPoints(uniquePoints, this._shape.winding);
            newShape.ephemeral = this._shape.ephemeral;
            // Mutate the original shape
            this._shape.segments = newShape.segments;
            this._shape.winding = newShape.winding;
            this._shape.connectSegments();
        }
        return new ShapeContext(this._shape);
    }
    /**
     * Divide selected lines into n segments.
     * Returns points at division locations.
     */
    divide(n) {
        const vertices = [];
        for (const seg of this._items) {
            for (let i = 1; i < n; i++) {
                const t = i / n;
                const point = seg.pointAt(t);
                vertices.push(new Vertex(point.x, point.y));
            }
        }
        return new PointsContext(this._shape, vertices);
    }
    /** Get midpoint of all selected lines */
    midPoint() {
        if (this._items.length === 0)
            return Vector2.zero();
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
    collapse() {
        const midpoints = [];
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
    stamp(collector, x = 0, y = 0, style = {}) {
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
    expandToRect(distance) {
        const shapes = [];
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
export class ShapesContext extends SelectableContext {
    constructor(shapes) {
        super(shapes);
    }
    /** Get all shapes */
    get shapes() {
        return this._items;
    }
    createNew(items) {
        return new ShapesContext(items);
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
    slice(start, end) {
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
    spread(x, y) {
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
    clone(n, x = 0, y = 0) {
        const offset = new Vector2(x, y);
        const newShapes = [...this._items]; // Include originals
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
    get points() {
        const allVertices = [];
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
    get lines() {
        const allSegments = [];
        for (const shape of this._items) {
            allSegments.push(...shape.segments);
        }
        const refShape = this._items[0] ?? Shape.fromPoints([
            Vector2.zero(),
            new Vector2(1, 0),
            new Vector2(0, 1),
        ]);
        return new LinesContext(refShape, allSegments);
    }
    /** Make all shapes concrete */
    trace() {
        for (const shape of this._items) {
            shape.ephemeral = false;
        }
        return this;
    }
    /** Scale all shapes uniformly */
    scale(factor) {
        for (const shape of this._items) {
            shape.scale(factor);
        }
        return this;
    }
    /** Rotate all shapes by angle (degrees) */
    rotate(angleDeg) {
        const angleRad = angleDeg * Math.PI / 180;
        for (const shape of this._items) {
            shape.rotate(angleRad);
        }
        return this;
    }
    /** Translate all shapes by delta */
    translate(x, y) {
        const delta = new Vector2(x, y);
        for (const shape of this._items) {
            shape.translate(delta);
        }
        return this;
    }
    /**
     * Offset (inset/outset) all shape outlines.
     * @param distance - Offset distance
     * @param count - Number of copies per shape. 0 = in-place. >0 = returns offset copies.
     * @param miterLimit - Miter limit
     * @param includeOriginal - When count > 0, include original shapes in result (default false)
     */
    offset(distance, count = 0, miterLimit = 4, includeOriginal = false) {
        if (count > 0) {
            const newShapes = [];
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
    expand(distance, count = 0, miterLimit = 4, includeOriginal = false) {
        return this.offset(Math.abs(distance), count, miterLimit, includeOriginal);
    }
    /** Inset all shapes */
    inset(distance, count = 0, miterLimit = 4) {
        return this.offset(-Math.abs(distance), count, miterLimit);
    }
    /** Move all shapes so their collective center is at position */
    moveTo(x, y) {
        const bounds = this.getBounds();
        const currentCenter = new Vector2((bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2);
        const delta = new Vector2(x, y).subtract(currentCenter);
        return this.translate(delta.x, delta.y);
    }
    /** Set x position of collective center */
    x(xPos) {
        const bounds = this.getBounds();
        const currentX = (bounds.minX + bounds.maxX) / 2;
        return this.translate(xPos - currentX, 0);
    }
    /** Set y position of collective center */
    y(yPos) {
        const bounds = this.getBounds();
        const currentY = (bounds.minY + bounds.maxY) / 2;
        return this.translate(0, yPos - currentY);
    }
    /** Set x and y position of collective center */
    xy(xPos, yPos) {
        return this.moveTo(xPos, yPos);
    }
    /** Get bounds of all shapes */
    getBounds() {
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
    get vertices() {
        const all = [];
        for (const shape of this._items) {
            all.push(...shape.vertices);
        }
        return all;
    }
    /** Get all segments from all shapes (flattened) */
    get segments() {
        const all = [];
        for (const shape of this._items) {
            all.push(...shape.segments);
        }
        return all;
    }
    /** Get center of all shapes */
    get center() {
        const bounds = this.getBounds();
        return new Vector2((bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2);
    }
    /** Stamp all shapes to collector */
    stamp(collector, x = 0, y = 0, style = {}) {
        // Default style
        const finalStyle = {
            ...DEFAULT_STYLES.shape,
            ...style
        };
        for (const shape of this._items) {
            if (shape.ephemeral)
                continue;
            const clone = shape.clone();
            if (x !== 0 || y !== 0) {
                clone.translate(new Vector2(x, y));
            }
            collector.addShape(clone, finalStyle);
        }
    }
    // ==================== Phase 1.5 Operations ====================
    /**
     * Distribute shapes radially around a circle.
     * @param radius - Distance from origin
     * @param arc - Optional angle range: undefined = 360°, number = 0 to angle, [start, end] = range
     * @returns This ShapesContext (modified in place)
     */
    spreadPolar(radius, arc) {
        let startAngle = 0;
        let endAngle = 360;
        if (arc !== undefined) {
            if (typeof arc === 'number') {
                endAngle = arc;
            }
            else {
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
    constructor() {
        super(Shape.regularPolygon(32, 10));
        this._radius = 10;
        this._segments = 32;
        this._center = Vector2.zero();
    }
    /** Set circle radius */
    radius(r) {
        this._radius = r;
        this.rebuild();
        return this;
    }
    /** Set number of segments */
    numSegments(n) {
        this._segments = Math.max(3, n);
        this.rebuild();
        return this;
    }
    /** Set center position */
    setCenter(x, y) {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }
    rebuild() {
        this._shape = Shape.regularPolygon(this._segments, this._radius, this._center);
    }
}
/**
 * Rectangle context with width and height.
 */
export class RectContext extends ShapeContext {
    constructor(shape, width = 10, height = 10) {
        super(shape ?? RectContext.createRect(width, height, Vector2.zero()));
        this._center = Vector2.zero();
        this._width = width;
        this._height = height;
    }
    /** Get width */
    get w() { return this._width; }
    /** Get height */
    get h() { return this._height; }
    /** Set width */
    width(w) {
        this._width = w;
        this.rebuild();
        return this;
    }
    /** Set height */
    height(h) {
        this._height = h;
        this.rebuild();
        return this;
    }
    /** Set width and height */
    wh(w, h) {
        this._width = w;
        this._height = h;
        this.rebuild();
        return this;
    }
    /** Set size (square) */
    size(s) {
        return this.wh(s, s);
    }
    /** Set center position */
    setCenter(x, y) {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }
    rebuild() {
        this._shape = RectContext.createRect(this._width, this._height, this._center);
    }
    static createRect(width, height, center) {
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
    size(s) {
        return this.wh(s, s);
    }
}
/**
 * Hexagon context with radius.
 */
export class HexagonContext extends ShapeContext {
    constructor() {
        // 6 segments, rotated 30° so flat edge is at bottom
        super(Shape.regularPolygon(6, 10, Vector2.zero(), Math.PI / 6));
        this._radius = 10;
        this._center = Vector2.zero();
    }
    /** Set hexagon radius */
    radius(r) {
        this._radius = r;
        this.rebuild();
        return this;
    }
    /** Set center position */
    setCenter(x, y) {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }
    rebuild() {
        this._shape = Shape.regularPolygon(6, this._radius, this._center, Math.PI / 6);
    }
}
/**
 * Triangle context with radius.
 */
export class TriangleContext extends ShapeContext {
    constructor() {
        // 3 segments, rotated so one vertex points up
        super(Shape.regularPolygon(3, 10, Vector2.zero(), -Math.PI / 2));
        this._radius = 10;
        this._center = Vector2.zero();
    }
    /** Set triangle radius */
    radius(r) {
        this._radius = r;
        this.rebuild();
        return this;
    }
    /** Set center position */
    setCenter(x, y) {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }
    rebuild() {
        this._shape = Shape.regularPolygon(3, this._radius, this._center, -Math.PI / 2);
    }
}
