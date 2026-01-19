import { Vector2 } from './Vector2';
import type { Segment } from './Segment';

/**
 * A point in 2D space with a computed normal direction.
 * Vertices are part of shapes and reference adjacent segments.
 */
export class Vertex {
    private _normal: Vector2 | null = null;

    /** Reference to previous segment (where this vertex is the end) */
    prevSegment: Segment | null = null;

    /** Reference to next segment (where this vertex is the start) */
    nextSegment: Segment | null = null;

    constructor(
        public x: number,
        public y: number
    ) { }

    /** Get position as Vector2 */
    get position(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    /** Set position from Vector2 */
    set position(v: Vector2) {
        this.x = v.x;
        this.y = v.y;
        this.invalidateNormal();
    }

    /**
     * Get the computed normal at this vertex.
     * Averaged from adjacent segment normals.
     */
    get normal(): Vector2 {
        if (this._normal === null) {
            this._normal = this.computeNormal();
        }
        return this._normal;
    }

    /** Invalidate cached normal (call when geometry changes) */
    invalidateNormal(): void {
        this._normal = null;
    }

    /**
     * Compute normal by averaging adjacent segment normals.
     * Points "outward" relative to shape winding.
     */
    computeNormal(): Vector2 {
        if (!this.prevSegment && !this.nextSegment) {
            // Isolated vertex, no normal
            return Vector2.zero();
        }

        if (this.prevSegment && this.nextSegment) {
            // Average of adjacent segment normals
            const prevNormal = this.prevSegment.normal;
            const nextNormal = this.nextSegment.normal;
            const avg = prevNormal.add(nextNormal);
            const len = avg.length();
            if (len < 1e-10) {
                // Parallel segments, use either
                return prevNormal;
            }
            return avg.normalize();
        }

        // Only one segment connected
        if (this.prevSegment) {
            return this.prevSegment.normal;
        }
        if (this.nextSegment) {
            return this.nextSegment.normal;
        }

        return Vector2.zero();
    }

    /** Move vertex along its normal by a distance */
    moveAlongNormal(distance: number): void {
        const n = this.normal;
        this.x += n.x * distance;
        this.y += n.y * distance;
        this.invalidateNormal();
    }

    /** Clone this vertex (without segment references) */
    clone(): Vertex {
        return new Vertex(this.x, this.y);
    }

    /** Check if position equals another vertex within epsilon */
    equals(other: Vertex, epsilon = 1e-10): boolean {
        return this.position.equals(other.position, epsilon);
    }

    /** String representation */
    toString(): string {
        return `Vertex(${this.x}, ${this.y})`;
    }

    /** Create from Vector2 */
    static fromVector(v: Vector2): Vertex {
        return new Vertex(v.x, v.y);
    }
}
