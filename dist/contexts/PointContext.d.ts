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
export declare class PointContext {
    private _position;
    private _parentShape?;
    constructor(_position: Vector2, _parentShape?: Shape | undefined);
    /** Get the point position */
    get position(): Vector2;
    /** Get x coordinate */
    get x(): number;
    /** Get y coordinate */
    get y(): number;
    /** Whether this point has a parent shape (for normal direction) */
    get isOrphan(): boolean;
    /**
     * Expand point into a circle shape.
     * @param radius - Radius of the circle
     * @param segments - Number of segments (default 32)
     * @returns Independent ShapeContext (not connected to parent)
     */
    expand(radius: number, segments?: number): Shape;
    /**
     * Cast a ray from this point.
     * @param distance - Distance to cast
     * @param direction - Angle in degrees (0 = right, 90 = up) or 'outward'/'inward' (requires parent)
     * @returns New PointContext at ray endpoint
     */
    raycast(distance: number, direction: number | 'outward' | 'inward'): PointContext;
}
