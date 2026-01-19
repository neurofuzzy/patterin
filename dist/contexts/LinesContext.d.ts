import { Shape } from '../primitives/Shape';
import { Vector2 } from '../primitives/Vector2';
import { Segment } from '../primitives/Segment';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector';
import { ShapeContext } from './ShapeContext';
import { PointsContext } from './PointsContext';
/**
 * Context for operating on lines/segments of a shape.
 *
 * Accessed via `shape.lines` or `shapes.lines`.
 * Supports selection, extrusion, division, and other edge operations.
 *
 * @example
 * ```typescript
 * // Extrude specific sides of a rectangle
 * const rect = shape.rect().size(40);
 * rect.lines.at(0, 2).extrude(10);
 *
 * // Divide edges into segments
 * const hex = shape.hexagon().radius(30);
 * const points = hex.lines.every(2).divide(3);
 * ```
 */
export declare class LinesContext {
    protected _shape: Shape;
    protected _segments: Segment[];
    constructor(_shape: Shape, _segments: Segment[]);
    /** Get selected segments */
    get segments(): Segment[];
    /** Get number of selected lines */
    get length(): number;
    /** Select every nth line */
    every(n: number, offset?: number): LinesContext;
    /** Select lines at specific indices */
    at(...indices: number[]): LinesContext;
    /**
     * Extrude selected lines outward.
     * For each selected segment A→B, replaces it with A→A'→B'→B where A' and B'
     * are the extruded positions (original + normal * distance).
     * Returns the modified ShapeContext.
     */
    extrude(distance: number): ShapeContext;
    /**
     * Divide selected lines into n segments.
     * Returns points at division locations.
     */
    divide(n: number): PointsContext;
    /** Get midpoint of all selected lines */
    midPoint(): Vector2;
    /**
     * Collapse selected segments to their midpoints.
     * Modifies parent shape: removes segment and merges vertices at midpoint.
     * @returns PointsContext with midpoint locations
     */
    collapse(): PointsContext;
    /**
     * Stamp segments as line paths to collector.
     * Uses thinner default stroke width (0.5) for connection lines.
     */
    stamp(collector: SVGCollector, x?: number, y?: number, style?: PathStyle): void;
    /**
     * Expand each segment into a rectangle with square end caps.
     * Does NOT modify the original shape.
     * @param distance - Half-height of rectangle (total height = 2 * distance)
     * @returns ShapesContext with independent rectangle shapes
     */
    expandToRect(distance: number): any;
}
