import { Shape } from '../primitives/Shape';
export interface PathStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
    dash?: number[];
}
/**
 * Rendering mode for shapes.
 * - 'fill': Solid fill with the shape's color, no stroke
 * - 'stroke': Stroke only with the shape's color, no fill
 * - 'glass': Semi-transparent fill (50% opacity) with stroke
 */
export type RenderMode = 'fill' | 'stroke' | 'glass';
/**
 * Default styles for system rendering.
 * Traced connections use thinner strokes than placed shapes.
 */
export declare const DEFAULT_STYLES: {
    /** Style for traced system connections (cells, tiles, scaffold shapes) */
    readonly connection: PathStyle;
    /** Style for placed shapes at nodes */
    readonly placement: PathStyle;
    /** Default style for standalone shapes */
    readonly shape: PathStyle;
    /** Default style for lines/segments */
    readonly line: PathStyle;
};
/**
 * SVG output collector for rendering shapes and paths.
 *
 * Collects all geometry, automatically computes viewBox bounds,
 * and generates valid SVG output with configurable styling.
 *
 * Key features:
 * - Auto-computed viewBox from geometry bounds
 * - Optional margin and centering
 * - Named groups for organized SVG structure
 * - Style per path (stroke, fill, opacity, dash)
 * - Statistics (shape count, segment count)
 *
 * @example
 * ```typescript
 * import { shape, SVGCollector } from 'patterin';
 *
 * const svg = new SVGCollector();
 *
 * // Add shapes
 * const circle = shape.circle().radius(50);
 * circle.stamp(svg);
 *
 * // Add with custom style
 * const rect = shape.rect().size(40).xy(100, 0);
 * rect.stamp(svg, 0, 0, {
 *   stroke: '#f00',
 *   strokeWidth: 2,
 *   fill: 'none'
 * });
 *
 * // Render to string
 * const svgString = svg.toString({
 *   width: 800,
 *   height: 600,
 *   margin: 20,
 *   autoScale: true
 * });
 *
 * console.log(svgString);
 * ```
 */
export declare class SVGCollector {
    private paths;
    private minX;
    private minY;
    private maxX;
    private maxY;
    private currentGroup?;
    private _segmentCount;
    /** Current rendering mode for shapes */
    private renderMode;
    /** Default color palette for auto-assignment */
    private readonly defaultPalette;
    /** Current color index for auto-assignment */
    private colorIndex;
    constructor();
    /**
     * Add a path (raw SVG path data) to the collector.
     *
     * @param pathData - SVG path data string (e.g. "M 0 0 L 10 10")
     * @param style - Optional PathStyle for stroke, fill, etc.
     *
     * @example
     * ```typescript
     * svg.addPath('M 0 0 L 100 100', { stroke: '#00f', strokeWidth: 2 });
     * ```
     */
    addPath(pathData: string, style?: PathStyle): void;
    /**
     * Validate path data for NaN or Infinity values
     * @private
     */
    private validatePathData;
    /**
     * Add a shape to the collector.
     *
     * Ephemeral shapes are skipped automatically.
     * Colors are applied based on the current render mode.
     *
     * @param shape - The Shape primitive to add
     * @param style - Optional PathStyle for stroke, fill, etc. (overrides render mode)
     *
     * @example
     * ```typescript
     * const s = Shape.circle(50);
     * svg.addShape(s, { stroke: '#0f0', strokeWidth: 1.5 });
     * ```
     */
    addShape(shape: Shape, style?: PathStyle): void;
    /**
     * Begin a named group for organizational purposes.
     *
     * All paths added after this call will be tagged with the group name.
     * Groups can be used to organize SVG structure or apply group-level styling.
     *
     * @param name - The group name/identifier
     *
     * @example
     * ```typescript
     * svg.beginGroup('circles');
     * shape.circle().radius(10).stamp(svg);
     * shape.circle().radius(20).stamp(svg);
     * svg.endGroup();
     *
     * svg.beginGroup('rectangles');
     * shape.rect().size(30).stamp(svg);
     * svg.endGroup();
     * ```
     */
    beginGroup(name: string): void;
    /**
     * End the current group.
     *
     * Subsequent paths will not be associated with a group until
     * `beginGroup()` is called again.
     */
    endGroup(): void;
    /**
     * Set the rendering mode for shapes.
     *
     * Determines how shape colors are rendered:
     * - 'fill': Solid fill with no stroke
     * - 'stroke': Stroke only with no fill
     * - 'glass': Semi-transparent fill (50% opacity) with stroke
     *
     * @param mode - The rendering mode to use
     *
     * @example
     * ```typescript
     * const svg = new SVGCollector();
     * svg.setRenderMode('fill');
     * shape.circle().radius(30).color('#ff5733').stamp(svg);
     *
     * svg.setRenderMode('glass');
     * shape.rect().size(40).color('#3498db').stamp(svg);
     * ```
     */
    setRenderMode(mode: RenderMode): void;
    /**
     * Get the current rendering mode.
     */
    getRenderMode(): RenderMode;
    /**
     * Apply render mode styling to a color.
     * @param color - The color to apply
     * @returns PathStyle based on the current render mode
     */
    private applyRenderMode;
    /**
     * Parse path data to update bounds.
     */
    private updateBoundsFromPath;
    /**
     * Get the computed bounding box of all collected geometry.
     *
     * @param margin - Optional margin to add around bounds (default 0)
     * @returns Bounding box with x, y, width, height
     *
     * @example
     * ```typescript
     * const svg = new SVGCollector();
     * shape.circle().radius(50).stamp(svg);
     *
     * const bounds = svg.getBounds(10); // 10px margin
     * console.log(bounds); // { x: -60, y: -60, width: 120, height: 120 }
     * ```
     */
    getBounds(margin?: number): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /**
     * Generate complete SVG string with all collected geometry.
     *
     * Automatically computes viewBox from geometry bounds. Supports
     * auto-scaling, margins, background, and flatten mode.
     *
     * @param options - Configuration for SVG output
     * @param options.width - SVG width in pixels (default: auto from bounds)
     * @param options.height - SVG height in pixels (default: auto from bounds)
     * @param options.margin - Margin around geometry (default: 10)
     * @param options.background - Background color (default: transparent)
     * @param options.autoScale - Scale geometry to fit viewport (default: true)
     * @param options.flatten - Flatten coordinates (no viewBox transform) (default: false)
     * @returns Complete SVG markup as a string
     *
     * @example
     * ```typescript
     * const svg = new SVGCollector();
     * shape.circle().radius(50).stamp(svg);
     *
     * // Auto-sized SVG
     * const svg1 = svg.toString();
     *
     * // Fixed size with auto-scaling
     * const svg2 = svg.toString({
     *   width: 800,
     *   height: 600,
     *   margin: 20,
     *   autoScale: true
     * });
     *
     * // With background
     * const svg3 = svg.toString({
     *   width: 400,
     *   height: 400,
     *   background: '#f0f0f0',
     *   margin: 10
     * });
     *
     * // Flatten mode (for precise coordinate control)
     * const svg4 = svg.toString({
     *   width: 1000,
     *   height: 1000,
     *   flatten: true,
     *   autoScale: false
     * });
     * ```
     */
    toString(options?: {
        width?: number;
        height?: number;
        margin?: number;
        background?: string;
        autoScale?: boolean;
        flatten?: boolean;
    }): string;
    /**
     * Render paths grouped by their group name.
     */
    private renderPathsGrouped;
    /**
     * Transform path data coordinates by scale and offset.
     */
    private transformPathData;
    /**
     * Render a path element with pre-transformed data.
     */
    private renderPathWithData;
    /**
     * Render a single path element.
     */
    private renderPath;
    /**
     * Get statistics about collected paths.
     */
    get stats(): {
        shapes: number;
        segments: number;
    };
    /**
     * Clear all paths.
     */
    clear(): void;
    /**
     * Get the number of paths collected.
     */
    get length(): number;
}
