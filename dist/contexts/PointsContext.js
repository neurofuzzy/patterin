import { Shape } from '../primitives/Shape';
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
export class PointsContext {
    constructor(_shape, _vertices) {
        this._shape = _shape;
        this._vertices = _vertices;
    }
    /** Get selected vertices */
    get vertices() {
        return this._vertices;
    }
    /** Get number of selected points */
    get length() {
        return this._vertices.length;
    }
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
    every(n, offset = 0) {
        const selected = [];
        for (let i = offset; i < this._vertices.length; i += n) {
            selected.push(this._vertices[i]);
        }
        return new PointsContext(this._shape, selected);
    }
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
    at(...indices) {
        const selected = [];
        for (const i of indices) {
            if (i >= 0 && i < this._vertices.length) {
                selected.push(this._vertices[i]);
            }
        }
        return new PointsContext(this._shape, selected);
    }
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
    expand(distance) {
        for (const v of this._vertices) {
            v.moveAlongNormal(distance);
        }
        // Invalidate all segment normals
        for (const seg of this._shape.segments) {
            seg.invalidateNormal();
        }
        return new ShapeContext(this._shape);
    }
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
    inset(distance) {
        return this.expand(-distance);
    }
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
    move(x, y) {
        const offset = new Vector2(x, y);
        for (const v of this._vertices) {
            v.position = v.position.add(offset);
        }
        return this;
    }
    /** Get midpoint of selected points */
    midPoint() {
        if (this._vertices.length === 0)
            return Vector2.zero();
        let sum = Vector2.zero();
        for (const v of this._vertices) {
            sum = sum.add(v.position);
        }
        return sum.divide(this._vertices.length);
    }
    /** Get bounding box of selected points */
    bbox() {
        if (this._vertices.length === 0) {
            return {
                min: Vector2.zero(),
                max: Vector2.zero(),
                width: 0,
                height: 0,
                center: Vector2.zero(),
            };
        }
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for (const v of this._vertices) {
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
    // ==================== Phase 1.5 Operations ====================
    /**
     * Expand each point into a circle shape.
     * Does NOT modify the original shape.
     * @param radius - Circle radius
     * @param segments - Number of circle segments (default 32)
     * @returns ShapesContext with independent circle shapes
     */
    expandToCircles(radius, segments = 32) {
        const shapes = [];
        for (const v of this._vertices) {
            const circle = Shape.regularPolygon(segments, radius, v.position);
            shapes.push(circle);
        }
        const { ShapesContext: SC } = require('./ShapesContext');
        return new SC(shapes);
    }
    /**
     * Cast rays from each point.
     * @param distance - Ray distance
     * @param direction - Angle in degrees, or 'outward'/'inward' relative to shape center
     * @returns PointsContext with ray endpoints
     */
    raycast(distance, direction) {
        const endpoints = [];
        const center = this._shape.centroid();
        for (const v of this._vertices) {
            let angle;
            if (typeof direction === 'number') {
                angle = direction * Math.PI / 180;
            }
            else {
                // Use vertex normal if available
                const normal = v.normal;
                if (normal.length() > 0.001) {
                    angle = Math.atan2(normal.y, normal.x);
                    if (direction === 'inward') {
                        angle += Math.PI;
                    }
                }
                else {
                    // Fallback to direction from center
                    const toCenter = center.subtract(v.position).normalize();
                    angle = Math.atan2(toCenter.y, toCenter.x);
                    if (direction === 'outward') {
                        angle += Math.PI;
                    }
                }
            }
            const endpoint = new Vector2(v.position.x + Math.cos(angle) * distance, v.position.y + Math.sin(angle) * distance);
            endpoints.push(new Vertex(endpoint.x, endpoint.y));
        }
        return new PointsContext(this._shape, endpoints);
    }
}
