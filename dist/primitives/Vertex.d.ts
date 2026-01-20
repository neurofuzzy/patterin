import { Vector2 } from './Vector2';
import type { Segment } from './Segment';
/**
 * A point in 2D space with a computed normal direction.
 * Vertices are part of shapes and reference adjacent segments.
 */
export declare class Vertex {
    x: number;
    y: number;
    private _normal;
    /** Reference to previous segment (where this vertex is the end) */
    prevSegment: Segment | null;
    /** Reference to next segment (where this vertex is the start) */
    nextSegment: Segment | null;
    constructor(x: number, y: number);
    /** Get position as Vector2 */
    get position(): Vector2;
    /** Set position from Vector2 */
    set position(v: Vector2);
    /**
     * Get the computed normal at this vertex.
     * Averaged from adjacent segment normals.
     */
    get normal(): Vector2;
    /** Invalidate cached normal (call when geometry changes) */
    invalidateNormal(): void;
    /**
     * Compute normal by averaging adjacent segment normals.
     * Points "outward" relative to shape winding.
     */
    computeNormal(): Vector2;
    /** Move vertex along its normal by a distance */
    moveAlongNormal(distance: number): void;
    /** Clone this vertex (without segment references) */
    clone(): Vertex;
    /** Check if position equals another vertex within epsilon */
    equals(other: Vertex, epsilon?: number): boolean;
    /** String representation */
    toString(): string;
    /** Create from Vector2 */
    static fromVector(v: Vector2): Vertex;
}
