import { ShapeContext } from './ShapeContext';
import { Shape } from '../primitives/Shape';
import { Segment } from '../primitives/Segment';
import { Vector2 } from '../primitives/Vector2';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector';
/**
 * Context for operations on a continuous path (open or closed polyline).
 *
 * Unlike ShapeContext, PathContext treats geometry as stroked paths rather
 * than filled shapes. Useful for connection lines, curves, and wireframes.
 *
 * Inherits all ShapeContext methods but stamps with stroke-only styling by default.
 *
 * @example
 * ```typescript
 * import { PathContext } from 'patterin';
 *
 * // Create a path from segments
 * const path = new PathContext(segments);
 * path.stamp(svg, 0, 0, { stroke: '#00f', strokeWidth: 2 });
 * ```
 */
export declare class PathContext extends ShapeContext {
    constructor(shape: Shape | Segment[]);
    /**
     * Stamp as a path (stroke only, no fill).
     */
    stamp(collector: SVGCollector, x?: number, y?: number, style?: PathStyle): void;
    /**
     * Generate path data string.
     */
    toPathData(offsetX?: number, offsetY?: number): string;
    private generateConnectedPathData;
    /**
     * Resample the path into equidistant points.
     */
    resample(stepSize: number): PathContext;
    /**
     * Get total length of path.
     */
    get length(): number;
    /**
     * Create from points.
     */
    static fromPoints(points: Vector2[]): PathContext;
}
