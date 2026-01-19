import type { SVGCollector, PathStyle } from './collectors/SVGCollector.ts';
import type { ShapeContext } from './contexts/ShapeContext.ts';

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
 * Extends IDrawable with placement, masking, and export capabilities.
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
     * Segments crossing the boundary are clipped at intersection.
     * Marks the mask shape as ephemeral.
     * @param maskShape - Shape to use as clipping mask
     */
    mask(maskShape: ShapeContext): this;

    /**
     * Generate SVG output.
     * @param options - SVG output options (width, height, margin)
     */
    toSVG(options: { width: number; height: number; margin?: number }): string;
}
