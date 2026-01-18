import { Shape, BoundingBox } from '../primitives/Shape.ts';
import { Vector2 } from '../primitives/Vector2.ts';
import { Vertex } from '../primitives/Vertex.ts';
import { Segment, Winding } from '../primitives/Segment.ts';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector.ts';
import { PointContext } from './PointContext.ts';
import { CloneSystem } from '../systems/CloneSystem.ts';

/**
 * Base context for all shape operations.
 * Wraps a Shape and provides fluent API for transformations.
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

    /** Access points context for vertex operations */
    get points(): PointsContext {
        return new PointsContext(this._shape, this._shape.vertices);
    }

    /** Access lines context for segment operations */
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

    /** Scale shape by factor */
    scale(factor: number): this {
        this._shape.scale(factor);
        return this;
    }

    /** Rotate shape by angle in radians */
    rotate(angle: number): this {
        this._shape.rotate(angle);
        return this;
    }

    /** Rotate shape by angle in degrees */
    rotateDeg(degrees: number): this {
        return this.rotate((degrees * Math.PI) / 180);
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

    /** Offset shape by delta */
    offset(x: number, y: number): this {
        this._shape.translate(new Vector2(x, y));
        return this;
    }

    /** Translate shape by delta (alias for offset) */
    translate(x: number, y: number): this {
        return this.offset(x, y);
    }

    /** Set x position (moves centroid to x, keeping y) */
    x(xPos: number): this {
        const center = this._shape.centroid();
        const dx = xPos - center.x;
        this._shape.translate(new Vector2(dx, 0));
        return this;
    }

    /** Set y position (moves centroid to y, keeping x) */
    y(yPos: number): this {
        const center = this._shape.centroid();
        const dy = yPos - center.y;
        this._shape.translate(new Vector2(0, dy));
        return this;
    }

    /** Set x and y position (moves centroid) */
    xy(xPos: number, yPos: number): this {
        const center = this._shape.centroid();
        const dx = xPos - center.x;
        const dy = yPos - center.y;
        this._shape.translate(new Vector2(dx, dy));
        return this;
    }

    /** Reverse winding direction */
    reverse(): this {
        this._shape.reverse();
        return this;
    }

    /** Get bounding box as ephemeral rect context */
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

    /** Get center point as ephemeral point */
    centerPoint(): Vector2 {
        return this._shape.centroid();
    }

    /** Make shape concrete if ephemeral */
    trace(): this {
        this._shape.ephemeral = false;
        return this;
    }

    /** Mark shape as ephemeral */
    ephemeral(): this {
        this._shape.ephemeral = true;
        return this;
    }

    /** Stamp shape to collector */
    stamp(collector: SVGCollector, x = 0, y = 0, style: PathStyle = {}): void {
        if (this._shape.ephemeral) return;

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
 * Context for points/vertices operations.
 */
export class PointsContext {
    constructor(
        protected _shape: Shape,
        protected _vertices: Vertex[]
    ) { }

    /** Get selected vertices */
    get vertices(): Vertex[] {
        return this._vertices;
    }

    /** Get number of selected points */
    get length(): number {
        return this._vertices.length;
    }

    /** Select every nth point */
    every(n: number, offset = 0): PointsContext {
        const selected: Vertex[] = [];
        for (let i = offset; i < this._vertices.length; i += n) {
            selected.push(this._vertices[i]);
        }
        return new PointsContext(this._shape, selected);
    }

    /** Select points at specific indices */
    at(...indices: number[]): PointsContext {
        const selected: Vertex[] = [];
        for (const i of indices) {
            if (i >= 0 && i < this._vertices.length) {
                selected.push(this._vertices[i]);
            }
        }
        return new PointsContext(this._shape, selected);
    }

    /** Expand selected points outward along normals */
    expand(distance: number): ShapeContext {
        for (const v of this._vertices) {
            v.moveAlongNormal(distance);
        }
        // Invalidate all segment normals
        for (const seg of this._shape.segments) {
            seg.invalidateNormal();
        }
        return new ShapeContext(this._shape);
    }

    /** Inset selected points inward along normals */
    inset(distance: number): ShapeContext {
        return this.expand(-distance);
    }

    /** Move selected points by offset */
    move(x: number, y: number): PointsContext {
        const offset = new Vector2(x, y);
        for (const v of this._vertices) {
            v.position = v.position.add(offset);
        }
        return this;
    }

    /** Get midpoint of selected points */
    midPoint(): Vector2 {
        if (this._vertices.length === 0) return Vector2.zero();
        let sum = Vector2.zero();
        for (const v of this._vertices) {
            sum = sum.add(v.position);
        }
        return sum.divide(this._vertices.length);
    }

    /** Get bounding box of selected points */
    bbox(): BoundingBox {
        if (this._vertices.length === 0) {
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

        for (const v of this._vertices) {
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
        for (const v of this._vertices) {
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

        for (const v of this._vertices) {
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
}

/**
 * Context for lines/segments operations.
 */
export class LinesContext {
    constructor(
        protected _shape: Shape,
        protected _segments: Segment[]
    ) { }

    /** Get selected segments */
    get segments(): Segment[] {
        return this._segments;
    }

    /** Get number of selected lines */
    get length(): number {
        return this._segments.length;
    }

    /** Select every nth line */
    every(n: number, offset = 0): LinesContext {
        const selected: Segment[] = [];
        for (let i = offset; i < this._segments.length; i += n) {
            selected.push(this._segments[i]);
        }
        return new LinesContext(this._shape, selected);
    }

    /** Select lines at specific indices */
    at(...indices: number[]): LinesContext {
        const selected: Segment[] = [];
        for (const i of indices) {
            if (i >= 0 && i < this._segments.length) {
                selected.push(this._segments[i]);
            }
        }
        return new LinesContext(this._shape, selected);
    }

    /**
     * Extrude selected lines outward.
     * For each selected segment A→B, replaces it with A→A'→B'→B where A' and B'
     * are the extruded positions (original + normal * distance).
     * Returns the modified ShapeContext.
     */
    extrude(distance: number): ShapeContext {
        if (this._segments.length === 0) return new ShapeContext(this._shape);

        // Build a set of selected segments for quick lookup
        const selectedSet = new Set(this._segments);
        const newPoints: Vector2[] = [];
        const allSegments = this._shape.segments;

        if (allSegments.length === 0) return new ShapeContext(this._shape);

        // Iterate through all segments of the shape to build new point list
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

        // Create new shape from points
        if (newPoints.length >= 3) {
            // Remove duplicate consecutive points before creating shape
            const uniquePoints = newPoints.filter((p, i, arr) => {
                if (i === 0) return true;
                return !p.equals(arr[i - 1]);
            });
            // Check for closing point duplication
            if (uniquePoints.length > 1 && uniquePoints[0].equals(uniquePoints[uniquePoints.length - 1])) {
                uniquePoints.pop();
            }

            if (uniquePoints.length < 3) return new ShapeContext(this._shape);

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
    divide(n: number): PointsContext {
        const vertices: Vertex[] = [];

        for (const seg of this._segments) {
            for (let i = 1; i < n; i++) {
                const t = i / n;
                const point = seg.pointAt(t);
                vertices.push(new Vertex(point.x, point.y));
            }
        }

        return new PointsContext(this._shape, vertices);
    }

    /** Get midpoint of all selected lines */
    midPoint(): Vector2 {
        if (this._segments.length === 0) return Vector2.zero();
        let sum = Vector2.zero();
        for (const seg of this._segments) {
            sum = sum.add(seg.midpoint());
        }
        return sum.divide(this._segments.length);
    }

    // ==================== Phase 1.5 Operations ====================

    /**
     * Collapse selected segments to their midpoints.
     * Modifies parent shape: removes segment and merges vertices at midpoint.
     * @returns PointsContext with midpoint locations
     */
    collapse(): PointsContext {
        const midpoints: Vertex[] = [];

        for (const seg of this._segments) {
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

        for (const seg of this._segments) {
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

        for (const seg of this._segments) {
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
 * Context for multiple shapes.
 */
export class ShapesContext {
    constructor(protected _shapes: Shape[]) { }

    /** Get all shapes */
    get shapes(): Shape[] {
        return this._shapes;
    }

    /** Get number of shapes */
    get length(): number {
        return this._shapes.length;
    }

    /** Select every nth shape */
    every(n: number, offset = 0): ShapesContext {
        const selected: Shape[] = [];
        for (let i = offset; i < this._shapes.length; i += n) {
            selected.push(this._shapes[i]);
        }
        return new ShapesContext(selected);
    }

    /** Select shapes at specific indices */
    at(...indices: number[]): ShapesContext {
        const selected: Shape[] = [];
        for (const i of indices) {
            if (i >= 0 && i < this._shapes.length) {
                selected.push(this._shapes[i]);
            }
        }
        return new ShapesContext(selected);
    }

    /** Select range of shapes */
    slice(start: number, end?: number): ShapesContext {
        return new ShapesContext(this._shapes.slice(start, end));
    }

    /** Spread shapes with offset between each */
    spread(x: number, y: number): ShapesContext {
        const offset = new Vector2(x, y);
        for (let i = 0; i < this._shapes.length; i++) {
            this._shapes[i].translate(offset.multiply(i));
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
        const newShapes: Shape[] = [...this._shapes]; // Include originals

        // Create n copies of the entire selection
        for (let copyNum = 1; copyNum <= n; copyNum++) {
            for (const shape of this._shapes) {
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
        for (const shape of this._shapes) {
            allVertices.push(...shape.vertices);
        }
        // Use first shape as reference (may be empty)
        const refShape = this._shapes[0] ?? Shape.fromPoints([
            Vector2.zero(),
            new Vector2(1, 0),
            new Vector2(0, 1),
        ]);
        return new PointsContext(refShape, allVertices);
    }

    /** Get all lines from all shapes */
    get lines(): LinesContext {
        const allSegments: Segment[] = [];
        for (const shape of this._shapes) {
            allSegments.push(...shape.segments);
        }
        const refShape = this._shapes[0] ?? Shape.fromPoints([
            Vector2.zero(),
            new Vector2(1, 0),
            new Vector2(0, 1),
        ]);
        return new LinesContext(refShape, allSegments);
    }

    /** Make all shapes concrete */
    trace(): ShapesContext {
        for (const shape of this._shapes) {
            shape.ephemeral = false;
        }
        return this;
    }

    /** Scale all shapes uniformly */
    scale(factor: number): this {
        for (const shape of this._shapes) {
            shape.scale(factor);
        }
        return this;
    }

    /** Rotate all shapes by angle (degrees) */
    rotate(angleDeg: number): this {
        const angleRad = angleDeg * Math.PI / 180;
        for (const shape of this._shapes) {
            shape.rotate(angleRad);
        }
        return this;
    }

    /** Stamp all shapes to collector */
    stamp(collector: SVGCollector, x = 0, y = 0, style: PathStyle = {}): void {
        // Default style
        const finalStyle = {
            ...DEFAULT_STYLES.shape,
            ...style
        };

        for (const shape of this._shapes) {
            if (shape.ephemeral) continue;
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
        const n = this._shapes.length;

        // For full circle, don't put last shape on top of first
        const step = angleRange === 360
            ? angleRange / n
            : angleRange / Math.max(1, n - 1);

        for (let i = 0; i < n; i++) {
            const angleDeg = startAngle + step * i;
            const angleRad = angleDeg * Math.PI / 180;

            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;

            this._shapes[i].moveTo(new Vector2(x, y));
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
