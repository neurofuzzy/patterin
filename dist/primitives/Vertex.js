import { Vector2 } from './Vector2';
/**
 * A point in 2D space with a computed normal direction.
 * Vertices are part of shapes and reference adjacent segments.
 */
export class Vertex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this._normal = null;
        /** Reference to previous segment (where this vertex is the end) */
        this.prevSegment = null;
        /** Reference to next segment (where this vertex is the start) */
        this.nextSegment = null;
    }
    /** Get position as Vector2 */
    get position() {
        return new Vector2(this.x, this.y);
    }
    /** Set position from Vector2 */
    set position(v) {
        this.x = v.x;
        this.y = v.y;
        this.invalidateNormal();
    }
    /**
     * Get the computed normal at this vertex.
     * Averaged from adjacent segment normals.
     */
    get normal() {
        if (this._normal === null) {
            this._normal = this.computeNormal();
        }
        return this._normal;
    }
    /** Invalidate cached normal (call when geometry changes) */
    invalidateNormal() {
        this._normal = null;
    }
    /**
     * Compute normal by averaging adjacent segment normals.
     * Points "outward" relative to shape winding.
     */
    computeNormal() {
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
    moveAlongNormal(distance) {
        const n = this.normal;
        this.x += n.x * distance;
        this.y += n.y * distance;
        this.invalidateNormal();
    }
    /** Clone this vertex (without segment references) */
    clone() {
        return new Vertex(this.x, this.y);
    }
    /** Check if position equals another vertex within epsilon */
    equals(other, epsilon = 1e-10) {
        return this.position.equals(other.position, epsilon);
    }
    /** String representation */
    toString() {
        return `Vertex(${this.x}, ${this.y})`;
    }
    /** Create from Vector2 */
    static fromVector(v) {
        return new Vertex(v.x, v.y);
    }
}
