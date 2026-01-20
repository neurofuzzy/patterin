import type { SVGCollector, PathStyle } from './collectors/SVGCollector';
import type { ShapeContext, ShapesContext } from './contexts/ShapeContext';
import type { SystemBounds, SVGOptions } from './types';
/**
 * Shared interface for all drawable objects (shapes, systems).
 * Provides consistent trace/stamp API for rendering.
 */
export interface IDrawable {
    /**
     * Make the object concrete (renderable).
     * Marks ephemeral construction geometry as final output.
     */
    trace(): this;
    /**
     * Render the object to a collector.
     * @param collector - SVGCollector to receive shapes
     * @param style - Optional path style override
     */
    stamp(collector: SVGCollector, style?: PathStyle): void;
}
/**
 * System interface - all coordinate systems implement this.
 * Extends IDrawable with placement, masking, selection, and transform capabilities.
 */
export interface ISystem extends IDrawable {
    /**
     * Place a shape at each node in the system.
     * Marks the source shape as ephemeral (construction geometry).
     * @param shapeCtx - Shape to place at nodes
     * @param style - Optional style for placements
     */
    place(shapeCtx: ShapeContext, style?: PathStyle): this;
    /**
     * Clip system to mask shape boundary.
     * Points outside the mask are removed.
     * Marks the mask shape as ephemeral.
     * @param maskShape - Shape to use as clipping mask
     */
    mask(maskShape: ShapeContext): this;
    /** Return all shapes in the system */
    get shapes(): ShapesContext;
    /** Generate SVG output */
    toSVG(options: SVGOptions): string;
    /**
     * Select every nth shape for modification.
     * @param n - Select every nth shape
     * @param offset - Starting offset (default 0)
     * @returns ShapesContext with selected shapes
     */
    every(n: number, offset?: number): ShapesContext;
    /**
     * Select a range of shapes for modification.
     * @param start - Start index (inclusive)
     * @param end - End index (exclusive)
     * @returns ShapesContext with selected shapes
     */
    slice(start: number, end?: number): ShapesContext;
    /**
     * Scale all shapes uniformly.
     * @param factor - Scale factor
     * @returns This system (modified in place)
     */
    scale(factor: number): this;
    /**
     * Rotate all shapes by angle.
     * @param angleDeg - Angle in degrees
     * @returns This system (modified in place)
     */
    rotate(angleDeg: number): this;
    /** Number of shapes in the system */
    get length(): number;
    /** Get bounding box of all geometry */
    getBounds(): SystemBounds;
}
