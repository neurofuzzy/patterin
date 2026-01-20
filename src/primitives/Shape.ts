import { Vector2 } from './Vector2';
import { Vertex } from './Vertex';
import { Segment, Winding } from './Segment';

export interface BoundingBox {
    min: Vector2;
    max: Vector2;
    width: number;
    height: number;
    center: Vector2;
}

/**
 * A closed loop of connected segments with consistent winding.
 */
export class Shape {
    /** Flag for construction geometry that won't render */
    ephemeral = false;

    /** Optional group/role identifier for color layering */
    group?: string;

    /** Optional color for this shape (hex string) */
    color?: string;

    constructor(
        public segments: Segment[],
        public winding: Winding = 'ccw'
    ) {
        // Ensure all segments have correct winding
        for (const seg of segments) {
            seg.winding = winding;
        }
    }

    /** Get unique vertices in winding order */
    get vertices(): Vertex[] {
        return this.segments.map((seg) => seg.start);
    }

    /** Check if the shape forms a closed loop */
    get closed(): boolean {
        if (this.segments.length === 0) return false;
        const first = this.segments[0];
        const last = this.segments[this.segments.length - 1];
        return last.end === first.start || last.end.equals(first.start);
    }

    /** Number of vertices/segments */
    get length(): number {
        return this.segments.length;
    }

    /**
     * Compute signed area of the shape.
     * Positive for CCW, negative for CW.
     */
    area(): number {
        let sum = 0;
        for (const seg of this.segments) {
            const p1 = seg.start.position;
            const p2 = seg.end.position;
            sum += p1.x * p2.y - p2.x * p1.y;
        }
        return sum / 2;
    }

    /** Compute centroid of the shape */
    centroid(): Vector2 {
        const verts = this.vertices;
        if (verts.length === 0) return Vector2.zero();

        let cx = 0;
        let cy = 0;
        for (const v of verts) {
            cx += v.x;
            cy += v.y;
        }
        return new Vector2(cx / verts.length, cy / verts.length);
    }

    /** Compute bounding box */
    boundingBox(): BoundingBox {
        const verts = this.vertices;
        if (verts.length === 0) {
            return {
                min: Vector2.zero(),
                max: Vector2.zero(),
                width: 0,
                height: 0,
                center: Vector2.zero(),
            };
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const v of verts) {
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

    /**
     * Reverse winding direction.
     * Flips CW to CCW or vice versa.
     */
    reverse(): void {
        if (this.segments.length === 0) return;

        // Get vertices in current order
        const oldVertices = this.vertices.map(v => v.clone());

        // Reverse the order
        oldVertices.reverse();

        // Create new segments from reversed vertices
        const newSegments: Segment[] = [];
        for (let i = 0; i < oldVertices.length; i++) {
            const next = (i + 1) % oldVertices.length;
            newSegments.push(new Segment(oldVertices[i], oldVertices[next]));
        }

        // Update winding
        this.winding = this.winding === 'ccw' ? 'cw' : 'ccw';
        this.segments = newSegments;

        // Reconnect segments
        this.connectSegments();
    }

    /** Connect segments in a loop (prev/next references) */
    connectSegments(): void {
        const n = this.segments.length;
        if (n === 0) return;

        for (let i = 0; i < n; i++) {
            const seg = this.segments[i];
            seg.winding = this.winding;
            seg.next = this.segments[(i + 1) % n];
            seg.prev = this.segments[(i - 1 + n) % n];
        }

        // Ensure vertex segment references are correct
        for (const seg of this.segments) {
            seg.start.nextSegment = seg;
            seg.end.prevSegment = seg;
        }

        // Invalidate all normals
        for (const seg of this.segments) {
            seg.invalidateNormal();
        }
    }

    /** Validate shape invariants */
    validate(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (this.segments.length === 0) {
            errors.push('Shape has no segments');
            return { valid: false, errors };
        }

        // Check closure
        if (!this.closed) {
            errors.push('Shape is not closed');
        }

        // Check connectivity
        for (let i = 0; i < this.segments.length; i++) {
            const current = this.segments[i];
            const next = this.segments[(i + 1) % this.segments.length];

            if (!current.end.equals(next.start)) {
                errors.push(`Segment ${i} end does not match segment ${i + 1} start`);
            }
        }

        // Check for degenerate segments
        for (let i = 0; i < this.segments.length; i++) {
            if (this.segments[i].isDegenerate()) {
                errors.push(`Segment ${i} is degenerate (zero length)`);
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Remove degenerate (zero-length) segments.
     * Updates connectivity after removal.
     */
    removeDegenerate(epsilon = 1e-10): void {
        this.segments = this.segments.filter((seg) => !seg.isDegenerate(epsilon));
        if (this.segments.length > 0) {
            this.connectSegments();
        }
    }

    /** Clone this shape with new vertices and segments */
    clone(): Shape {
        const vertices = this.vertices.map((v) => v.clone());
        const segments: Segment[] = [];

        for (let i = 0; i < vertices.length; i++) {
            const next = (i + 1) % vertices.length;
            segments.push(new Segment(vertices[i], vertices[next]));
        }

        const shape = new Shape(segments, this.winding);
        shape.ephemeral = this.ephemeral;
        shape.open = this.open;
        shape.group = this.group;
        shape.color = this.color;
        shape.connectSegments();
        return shape;
    }

    /** Scale shape around origin or center */
    scale(factor: number, center?: Vector2): void {
        const c = center ?? this.centroid();
        for (const v of this.vertices) {
            const offset = v.position.subtract(c);
            v.position = c.add(offset.multiply(factor));
        }
        // Invalidate normals
        for (const seg of this.segments) {
            seg.invalidateNormal();
        }
    }

    /** Rotate shape around origin or center */
    rotate(angle: number, center?: Vector2): void {
        const c = center ?? this.centroid();
        for (const v of this.vertices) {
            const offset = v.position.subtract(c);
            v.position = c.add(offset.rotate(angle));
        }
        // Invalidate normals
        for (const seg of this.segments) {
            seg.invalidateNormal();
        }
    }

    /** Translate shape by offset */
    translate(offset: Vector2): void {
        for (const v of this.vertices) {
            v.position = v.position.add(offset);
        }
        // Normals don't change on translation
    }

    /** Move shape so centroid is at position */
    moveTo(position: Vector2): void {
        const current = this.centroid();
        const offset = position.subtract(current);
        this.translate(offset);
    }

    /**
     * Test if a point is inside the shape using ray casting algorithm.
     * Uses y-axis jitter to avoid exact vertex intersection issues.
     */
    containsPoint(point: Vector2, epsilon = 1e-10): boolean {
        const verts = this.vertices;
        if (verts.length < 3) return false;

        // Try with the original point first
        const result = this.containsPointInternal(point, epsilon);

        // If the result might be affected by edge cases, jitter and retry
        // This handles cases where ray passes exactly through vertices
        if (this.isNearVertex(point, epsilon * 100)) {
            // Jitter the point slightly and check multiple times
            const jitters = [
                new Vector2(point.x, point.y + epsilon * 10),
                new Vector2(point.x, point.y - epsilon * 10),
                new Vector2(point.x + epsilon * 10, point.y),
            ];

            let insideCount = result ? 1 : 0;
            for (const jittered of jitters) {
                if (this.containsPointInternal(jittered, epsilon)) {
                    insideCount++;
                }
            }
            // Majority vote
            return insideCount >= 2;
        }

        return result;
    }

    /** Check if point is near any vertex */
    private isNearVertex(point: Vector2, threshold: number): boolean {
        for (const v of this.vertices) {
            if (point.distanceTo(v.position) < threshold) {
                return true;
            }
        }
        return false;
    }

    /** Internal ray casting implementation */
    private containsPointInternal(point: Vector2, epsilon: number): boolean {
        const verts = this.vertices;
        let inside = false;

        for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
            const vi = verts[i].position;
            const vj = verts[j].position;

            // Check if ray from point going right intersects this edge
            const intersects = ((vi.y > point.y) !== (vj.y > point.y)) &&
                (point.x < (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y + epsilon) + vi.x);

            if (intersects) {
                inside = !inside;
            }
        }

        return inside;
    }

    /** Flag for open paths (no closing Z) */
    open = false;

    /**
     * Convert shape to SVG path data string.
     */
    toPathData(): string {
        if (this.segments.length === 0) return '';

        const verts = this.vertices;
        const parts: string[] = [];

        parts.push(`M ${verts[0].x} ${verts[0].y}`);
        for (let i = 1; i < verts.length; i++) {
            parts.push(`L ${verts[i].x} ${verts[i].y}`);
        }

        if (!this.open) {
            parts.push('Z');
        }

        return parts.join(' ');
    }

    /** String representation */
    toString(): string {
        return `Shape(${this.segments.length} segments, ${this.winding})`;
    }

    /**
     * Create a shape from an array of points.
     * Points should be in order (CCW for standard winding).
     */
    static fromPoints(points: Vector2[], winding: Winding = 'ccw'): Shape {
        if (points.length < 3) {
            throw new Error('Shape requires at least 3 points');
        }

        const vertices = points.map((p) => new Vertex(p.x, p.y));
        const segments: Segment[] = [];

        for (let i = 0; i < vertices.length; i++) {
            const next = (i + 1) % vertices.length;
            segments.push(new Segment(vertices[i], vertices[next]));
        }

        const shape = new Shape(segments, winding);
        shape.connectSegments();
        return shape;
    }

    /**
     * Create a regular polygon with n sides.
     */
    static regularPolygon(
        n: number,
        radius: number,
        center = Vector2.zero(),
        rotationOffset = 0
    ): Shape {
        if (n < 3) {
            throw new Error('Polygon requires at least 3 sides');
        }

        const points: Vector2[] = [];
        for (let i = 0; i < n; i++) {
            const angle = rotationOffset + (i / n) * Math.PI * 2;
            points.push(
                new Vector2(
                    center.x + Math.cos(angle) * radius,
                    center.y + Math.sin(angle) * radius
                )
            );
        }

        return Shape.fromPoints(points, 'ccw');
    }
}
