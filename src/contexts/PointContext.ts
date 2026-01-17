import { Shape } from '../primitives/Shape.ts';
import { Vector2 } from '../primitives/Vector2.ts';

/**
 * Context for a single point.
 * Used as return type from collapse() and for orphan point operations.
 */
export class PointContext {
    constructor(
        private _position: Vector2,
        private _parentShape?: Shape
    ) { }

    /** Get the point position */
    get position(): Vector2 {
        return this._position;
    }

    /** Get x coordinate */
    get x(): number {
        return this._position.x;
    }

    /** Get y coordinate */
    get y(): number {
        return this._position.y;
    }

    /** Whether this point has a parent shape (for normal direction) */
    get isOrphan(): boolean {
        return !this._parentShape;
    }

    /**
     * Expand point into a circle shape.
     * @param radius - Radius of the circle
     * @param segments - Number of segments (default 32)
     * @returns Independent ShapeContext (not connected to parent)
     */
    expand(radius: number, segments = 32): Shape {
        const shape = Shape.regularPolygon(segments, radius);
        shape.moveTo(this._position);
        return shape;
    }

    /**
     * Cast a ray from this point.
     * @param distance - Distance to cast
     * @param direction - Angle in degrees (0 = right, 90 = up) or 'outward'/'inward' (requires parent)
     * @returns New PointContext at ray endpoint
     */
    raycast(distance: number, direction: number | 'outward' | 'inward'): PointContext {
        let angle: number;

        if (typeof direction === 'number') {
            angle = direction * Math.PI / 180;
        } else if (this._parentShape) {
            // Use vertex normal if we have a parent shape
            const vertex = this._parentShape.vertices.find(
                v => v.position.equals(this._position)
            );
            if (vertex) {
                const normal = vertex.normal;
                angle = Math.atan2(normal.y, normal.x);
                if (direction === 'inward') {
                    angle += Math.PI;
                }
            } else {
                // Fallback to shape center direction
                const center = this._parentShape.centroid();
                const toCenter = center.subtract(this._position).normalize();
                angle = Math.atan2(toCenter.y, toCenter.x);
                if (direction === 'outward') {
                    angle += Math.PI;
                }
            }
        } else {
            throw new Error('Orphan point requires explicit direction angle');
        }

        const endpoint = new Vector2(
            this._position.x + Math.cos(angle) * distance,
            this._position.y + Math.sin(angle) * distance
        );

        return new PointContext(endpoint);
    }
}
