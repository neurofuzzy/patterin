import { Shape, BoundingBox } from '../primitives/Shape';
import { Vector2 } from '../primitives/Vector2';
import { Vertex } from '../primitives/Vertex';
import { ShapeContext } from './ShapeContext';
/**
 * Context for operating on vertices (points) of a shape.
 *
 * Accessed via `shape.points` or `shapes.points`.
 * Supports selection, transformation, and generative operations on vertices.
 *
 * @example
 * ```typescript
 * // Create a star by expanding alternating points
 * const star = shape.circle().radius(30).numSegments(10);
 * star.points.every(2).expand(15);
 *
 * // Move specific corner points
 * const rect = shape.rect().size(40);
 * rect.points.at(0, 2).move(5, 5);
 *
 * // Create circles at all vertices
 * const mandala = shape.hexagon().radius(50);
 * mandala.points.expandToCircles(10);
 * ```
 */
export declare class PointsContext {
    protected _shape: Shape;
    protected _vertices: Vertex[];
    constructor(_shape: Shape, _vertices: Vertex[]);
    /** Get selected vertices */
    get vertices(): Vertex[];
    /** Get number of selected points */
    get length(): number;
    /**
     * Select every nth point.
     *
     * @param n - Select every nth point (1 = all, 2 = every other, etc.)
     * @param offset - Starting offset (default 0)
     * @returns A new PointsContext with the selected points
     *
     * @example
     * ```typescript
     * // Expand every other point
     * shape.hexagon().radius(30).points.every(2).expand(10);
     *
     * // Select every 3rd point, starting at index 1
     * shape.circle().numSegments(12).points.every(3, 1).move(5, 0);
     * ```
     */
    every(n: number, offset?: number): PointsContext;
    /**
     * Select points at specific indices.
     *
     * @param indices - Zero-based indices of points to select
     * @returns A new PointsContext with the selected points
     *
     * @example
     * ```typescript
     * // Expand corners 0 and 2 of a rectangle
     * shape.rect().size(40).points.at(0, 2).expand(5);
     *
     * // Move first and last point
     * shape.triangle().radius(30).points.at(0, 2).move(10, 0);
     * ```
     */
    at(...indices: number[]): PointsContext;
    /**
     * Expand selected points outward along their normals.
     *
     * Modifies the shape in-place by moving vertices perpendicular to their edges.
     *
     * @param distance - Distance to move points (positive = outward, negative = inward)
     * @returns ShapeContext for the modified shape
     *
     * @example
     * ```typescript
     * // Create a star
     * const star = shape.circle().radius(30).numSegments(10);
     * star.points.every(2).expand(15);
     *
     * // Inset corners of a square
     * shape.square().size(40).points.expand(-5);
     * ```
     */
    expand(distance: number): ShapeContext;
    /**
     * Inset selected points inward along their normals.
     * Convenience method equivalent to `expand(-distance)`.
     *
     * @param distance - Distance to move points inward
     * @returns ShapeContext for the modified shape
     *
     * @example
     * ```typescript
     * shape.hexagon().radius(40).points.every(2).inset(10);
     * ```
     */
    inset(distance: number): ShapeContext;
    /**
     * Move selected points by a relative offset.
     *
     * @param x - Horizontal offset
     * @param y - Vertical offset
     * @returns This PointsContext for chaining
     *
     * @example
     * ```typescript
     * // Move top corners of a rectangle up
     * const rect = shape.rect().size(40);
     * rect.points.at(1, 2).move(0, 10);
     * ```
     */
    move(x: number, y: number): PointsContext;
    /** Get midpoint of selected points */
    midPoint(): Vector2;
    /** Get bounding box of selected points */
    bbox(): BoundingBox;
    /**
     * Expand each point into a circle shape.
     * Does NOT modify the original shape.
     * @param radius - Circle radius
     * @param segments - Number of circle segments (default 32)
     * @returns ShapesContext with independent circle shapes
     */
    expandToCircles(radius: number, segments?: number): any;
    /**
     * Cast rays from each point.
     * @param distance - Ray distance
     * @param direction - Angle in degrees, or 'outward'/'inward' relative to shape center
     * @returns PointsContext with ray endpoints
     */
    raycast(distance: number, direction: number | 'outward' | 'inward'): PointsContext;
}
