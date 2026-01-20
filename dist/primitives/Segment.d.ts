import { Vector2 } from './Vector2';
import { Vertex } from './Vertex';
export type Winding = 'cw' | 'ccw';
/**
 * A directed edge between two vertices with a normal.
 * Part of the half-edge structure for shape topology.
 */
export declare class Segment {
    start: Vertex;
    end: Vertex;
    private _normal;
    private _winding;
    /** Next segment in the loop */
    next: Segment | null;
    /** Previous segment in the loop */
    prev: Segment | null;
    constructor(start: Vertex, end: Vertex);
    /** Get the winding direction this segment uses for normal computation */
    get winding(): Winding;
    /** Set winding direction and invalidate normal */
    set winding(w: Winding);
    /** Get the segment normal (perpendicular, points outward based on winding) */
    get normal(): Vector2;
    /** Invalidate cached normal */
    invalidateNormal(): void;
    /**
     * Compute normal perpendicular to segment.
     * CCW winding: normal points to the right of direction (outward)
     * CW winding: normal points to the left of direction (outward)
     */
    computeNormal(): Vector2;
    /** Length of the segment */
    length(): number;
    /** Unit direction vector from start to end */
    direction(): Vector2;
    /** Raw direction vector (not normalized) */
    directionRaw(): Vector2;
    /** Midpoint of the segment */
    midpoint(): Vector2;
    /** Get point at parameter t (0 = start, 1 = end) */
    pointAt(t: number): Vector2;
    /** Check if this is a zero-length (degenerate) segment */
    isDegenerate(epsilon?: number): boolean;
    /** Clone this segment with new vertices */
    clone(): Segment;
    /** String representation */
    toString(): string;
    /**
     * Compute intersection point with another segment.
     * Returns null if segments don't intersect or are parallel.
     */
    intersect(other: Segment): Vector2 | null;
    /**
     * Compute intersection point with a ray from origin in direction.
     * Returns null if no intersection.
     */
    intersectRay(origin: Vector2, direction: Vector2): Vector2 | null;
}
