import { Vector2 } from './Vector2.ts';
import { Vertex } from './Vertex.ts';

export type Winding = 'cw' | 'ccw';

/**
 * A directed edge between two vertices with a normal.
 * Part of the half-edge structure for shape topology.
 */
export class Segment {
    private _normal: Vector2 | null = null;
    private _winding: Winding = 'ccw';

    /** Next segment in the loop */
    next: Segment | null = null;

    /** Previous segment in the loop */
    prev: Segment | null = null;

    constructor(
        public start: Vertex,
        public end: Vertex
    ) {
        // Link vertices to this segment
        this.start.nextSegment = this;
        this.end.prevSegment = this;
    }

    /** Get the winding direction this segment uses for normal computation */
    get winding(): Winding {
        return this._winding;
    }

    /** Set winding direction and invalidate normal */
    set winding(w: Winding) {
        if (this._winding !== w) {
            this._winding = w;
            this._normal = null;
        }
    }

    /** Get the segment normal (perpendicular, points outward based on winding) */
    get normal(): Vector2 {
        if (this._normal === null) {
            this._normal = this.computeNormal();
        }
        return this._normal;
    }

    /** Invalidate cached normal */
    invalidateNormal(): void {
        this._normal = null;
        this.start.invalidateNormal();
        this.end.invalidateNormal();
    }

    /**
     * Compute normal perpendicular to segment.
     * CCW winding: normal points to the right of direction (outward)
     * CW winding: normal points to the left of direction (outward)
     */
    computeNormal(): Vector2 {
        const dir = this.direction();
        if (this._winding === 'ccw') {
            // Right-hand rule: perpendicular CW for outward normal
            return dir.perpendicularCW();
        } else {
            // CCW perpendicular for CW winding
            return dir.perpendicular();
        }
    }

    /** Length of the segment */
    length(): number {
        return this.start.position.distanceTo(this.end.position);
    }

    /** Unit direction vector from start to end */
    direction(): Vector2 {
        return this.end.position.subtract(this.start.position).normalize();
    }

    /** Raw direction vector (not normalized) */
    directionRaw(): Vector2 {
        return this.end.position.subtract(this.start.position);
    }

    /** Midpoint of the segment */
    midpoint(): Vector2 {
        return this.start.position.lerp(this.end.position, 0.5);
    }

    /** Get point at parameter t (0 = start, 1 = end) */
    pointAt(t: number): Vector2 {
        return this.start.position.lerp(this.end.position, t);
    }

    /** Check if this is a zero-length (degenerate) segment */
    isDegenerate(epsilon = 1e-10): boolean {
        return this.length() < epsilon;
    }

    /** Clone this segment with new vertices */
    clone(): Segment {
        return new Segment(this.start.clone(), this.end.clone());
    }

    /** String representation */
    toString(): string {
        return `Segment(${this.start} -> ${this.end})`;
    }

    /**
     * Compute intersection point with another segment.
     * Returns null if segments don't intersect or are parallel.
     */
    intersect(other: Segment): Vector2 | null {
        const p1 = this.start.position;
        const p2 = this.end.position;
        const p3 = other.start.position;
        const p4 = other.end.position;

        const d1 = p2.subtract(p1);
        const d2 = p4.subtract(p3);

        const cross = d1.cross(d2);
        if (Math.abs(cross) < 1e-10) {
            // Parallel or coincident
            return null;
        }

        const d3 = p3.subtract(p1);
        const t = d3.cross(d2) / cross;
        const u = d3.cross(d1) / cross;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return p1.add(d1.multiply(t));
        }

        return null;
    }

    /**
     * Compute intersection point with a ray from origin in direction.
     * Returns null if no intersection.
     */
    intersectRay(origin: Vector2, direction: Vector2): Vector2 | null {
        const p1 = this.start.position;
        const p2 = this.end.position;

        const d1 = direction;
        const d2 = p2.subtract(p1);

        const cross = d1.cross(d2);
        if (Math.abs(cross) < 1e-10) {
            return null;
        }

        const d3 = p1.subtract(origin);
        const t = d3.cross(d2) / cross;
        const u = d3.cross(d1) / cross;

        if (t >= 0 && u >= 0 && u <= 1) {
            return origin.add(d1.multiply(t));
        }

        return null;
    }
}
