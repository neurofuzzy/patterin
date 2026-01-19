import { Shape } from '../primitives/Shape';
import { Vector2 } from '../primitives/Vector2';
/**
 * Context for a single point in 2D space.
 *
 * Returned by `.collapse()` operations or created for standalone point operations.
 * Can be expanded into shapes or used for raycasting.
 *
 * @example
 * ```typescript
 * // Collapse a shape to its centroid
 * const center = shape.rect().size(40).collapse();
 * console.log(center.x, center.y);
 *
 * // Expand point into a circle
 * const circle = center.expand(20, 32);
 *
 * // Raycast from a point
 * const endpoint = center.raycast(50, 45); // 45° angle, 50 units
 * ```
 */
export class PointContext {
    constructor(_position, _parentShape) {
        this._position = _position;
        this._parentShape = _parentShape;
    }
    /** Get the point position */
    get position() {
        return this._position;
    }
    /** Get x coordinate */
    get x() {
        return this._position.x;
    }
    /** Get y coordinate */
    get y() {
        return this._position.y;
    }
    /** Whether this point has a parent shape (for normal direction) */
    get isOrphan() {
        return !this._parentShape;
    }
    /**
     * Expand point into a circle shape.
     * @param radius - Radius of the circle
     * @param segments - Number of segments (default 32)
     * @returns Independent ShapeContext (not connected to parent)
     */
    expand(radius, segments = 32) {
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
    raycast(distance, direction) {
        let angle;
        if (typeof direction === 'number') {
            angle = direction * Math.PI / 180;
        }
        else if (this._parentShape) {
            // Use vertex normal if we have a parent shape
            const vertex = this._parentShape.vertices.find(v => v.position.equals(this._position));
            if (vertex) {
                const normal = vertex.normal;
                angle = Math.atan2(normal.y, normal.x);
                if (direction === 'inward') {
                    angle += Math.PI;
                }
            }
            else {
                // Fallback to shape center direction
                const center = this._parentShape.centroid();
                const toCenter = center.subtract(this._position).normalize();
                angle = Math.atan2(toCenter.y, toCenter.x);
                if (direction === 'outward') {
                    angle += Math.PI;
                }
            }
        }
        else {
            throw new Error('Orphan point requires explicit direction angle');
        }
        const endpoint = new Vector2(this._position.x + Math.cos(angle) * distance, this._position.y + Math.sin(angle) * distance);
        return new PointContext(endpoint);
    }
}
