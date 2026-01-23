import { Shape } from '../primitives/Shape';
import { Palette } from '../color/palette';

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
export const DEFAULT_STYLES = {
    /** Style for traced system connections (cells, tiles, scaffold shapes) */
    connection: { stroke: '#39c', strokeWidth: 0.5 } as PathStyle,
    /** Style for placed shapes at nodes */
    placement: { stroke: '#c93', strokeWidth: 1 } as PathStyle,
    /** Default style for standalone shapes */
    shape: { stroke: '#c93', strokeWidth: 1 } as PathStyle,
    /** Default style for lines/segments */
    line: { stroke: '#c93', strokeWidth: 0.5 } as PathStyle,
} as const;

interface PathEntry {
    d: string;
    style: PathStyle;
    group?: string;
}

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
export class SVGCollector {
    private paths: PathEntry[] = [];
    private minX = Infinity;
    private minY = Infinity;
    private maxX = -Infinity;
    private maxY = -Infinity;
    private currentGroup?: string;
    private _segmentCount = 0;

    /** Current rendering mode for shapes */
    private renderMode: RenderMode = 'stroke';

    /** Default color palette for auto-assignment */
    private readonly defaultPalette: string[];

    /** Current color index for auto-assignment */
    private colorIndex = 0;

    constructor() {
        // Create a diverse default palette covering the spectrum
        this.defaultPalette = new Palette(
            16,
            "reds", "oranges", "yellows", "greens",
            "cyans", "blues", "purples", "magentas"
        ).toArray();
    }

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
    addPath(pathData: string, style: PathStyle = {}): void {
        this.validatePathData(pathData);
        this.paths.push({ d: pathData, style, group: this.currentGroup });
        this.updateBoundsFromPath(pathData);

        // simple segment count approximation (count all commands except M/m)
        const commands = pathData.match(/[LlHhVvCcSsQqTtAaZz]/g);
        if (commands) {
            this._segmentCount += commands.length;
        }
    }

    /**
     * Validate path data for NaN or Infinity values
     * @private
     */
    private validatePathData(d: string, shape?: Shape): void {
        if (d.includes('NaN') || d.includes('Infinity')) {
            const shapeName = shape?.constructor.name || 'shape';
            throw new Error(
                `Invalid coordinates detected (NaN or Infinity) in ${shapeName}. ` +
                `This usually means a mathematical operation failed ` +
                `(division by zero, invalid scale factor, etc.).`
            );
        }
    }

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
    addShape(shape: Shape, style: PathStyle = {}): void {
        if (shape.ephemeral) return;

        // Determine the color to use
        let shapeColor = shape.color;
        if (!shapeColor) {
            // Auto-assign from default palette
            shapeColor = this.defaultPalette[this.colorIndex % this.defaultPalette.length];
            this.colorIndex++;
        }

        // Apply render mode to get base style
        const renderModeStyle = this.applyRenderMode(shapeColor);

        // Merge: render mode base → explicit style overrides
        const finalStyle = {
            ...renderModeStyle,
            ...style
        };

        const pathData = shape.toPathData();
        this.validatePathData(pathData, shape);
        this.addPath(pathData, finalStyle);
    }

    /**
     * Add multiple shapes as a single compound path.
     * Essential for shapes with holes (e.g. results of boolean subtract).
     */
    addCompound(shapes: Shape[], style: PathStyle = {}): void {
        const validShapes = shapes.filter(s => !s.ephemeral);
        if (validShapes.length === 0) return;

        // Use color of first shape for the whole compound shape
        let shapeColor = validShapes[0].color;
        if (!shapeColor) {
            shapeColor = this.defaultPalette[this.colorIndex % this.defaultPalette.length];
            this.colorIndex++;
        }

        const renderModeStyle = this.applyRenderMode(shapeColor);
        const finalStyle = {
            ...renderModeStyle,
            ...style
        };

        // Concatenate path data
        const pathData = validShapes
            .map(s => s.toPathData())
            .filter(d => d.length > 0)
            .join(' ');

        if (pathData.length > 0) {
            this.addPath(pathData, finalStyle);
        }
    }

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
    beginGroup(name: string): void {
        this.currentGroup = name;
    }

    /**
     * End the current group.
     * 
     * Subsequent paths will not be associated with a group until
     * `beginGroup()` is called again.
     */
    endGroup(): void {
        this.currentGroup = undefined;
    }

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
    setRenderMode(mode: RenderMode): void {
        this.renderMode = mode;
    }

    /**
     * Get the current rendering mode.
     */
    getRenderMode(): RenderMode {
        return this.renderMode;
    }

    /**
     * Apply render mode styling to a color.
     * @param color - The color to apply
     * @returns PathStyle based on the current render mode
     */
    private applyRenderMode(color: string): PathStyle {
        switch (this.renderMode) {
            case 'fill':
                return {
                    fill: color,
                    stroke: 'none'
                };
            case 'stroke':
                return {
                    fill: 'none',
                    stroke: color,
                    strokeWidth: 1
                };
            case 'glass':
                return {
                    fill: color,
                    fillOpacity: 0.5,
                    stroke: color,
                    strokeWidth: 1
                };
        }
    }

    /**
     * Parse path data to update bounds.
     */
    private updateBoundsFromPath(d: string): void {
        // Simple regex to extract coordinates from path data
        const coordPattern = /[ML]\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/gi;
        let match;
        while ((match = coordPattern.exec(d)) !== null) {
            const x = parseFloat(match[1]);
            const y = parseFloat(match[2]);
            this.minX = Math.min(this.minX, x);
            this.minY = Math.min(this.minY, y);
            this.maxX = Math.max(this.maxX, x);
            this.maxY = Math.max(this.maxY, y);
        }
    }

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
    getBounds(margin = 0): { x: number; y: number; width: number; height: number } {
        if (this.paths.length === 0 || this.minX === Infinity) {
            return { x: 0, y: 0, width: 100, height: 100 };
        }
        return {
            x: this.minX - margin,
            y: this.minY - margin,
            width: this.maxX - this.minX + margin * 2,
            height: this.maxY - this.minY + margin * 2,
        };
    }

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
    toString(options: {
        width?: number;
        height?: number;
        margin?: number;
        background?: string;
        autoScale?: boolean;
        flatten?: boolean;
    } = {}): string {
        const { margin = 10, background, autoScale = true, flatten = false } = options;
        let width = options.width ?? 100;
        let height = options.height ?? 100;

        const bounds = this.getBounds(margin);

        // If we didn't specify dimensions, use the bounds
        if (!options.width) width = bounds.width;
        if (!options.height) height = bounds.height;

        const lines: string[] = [];

        if (flatten || !autoScale) {
            // Flatten mode: transform coordinates directly, no viewBox
            lines.push(
                `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
            );

            // Calculate transform for flatten mode
            let scale = 1;
            let offsetX = 0;
            let offsetY = 0;

            if (autoScale && bounds.width > 0 && bounds.height > 0) {
                // Scale to fit viewport
                const scaleX = width / bounds.width;
                const scaleY = height / bounds.height;
                scale = Math.min(scaleX, scaleY);

                // Center in viewport
                const scaledWidth = bounds.width * scale;
                const scaledHeight = bounds.height * scale;
                offsetX = (width - scaledWidth) / 2 - bounds.x * scale;
                offsetY = (height - scaledHeight) / 2 - bounds.y * scale;
            }

            if (background) {
                lines.push(
                    `  <rect x="0" y="0" width="${width}" height="${height}" fill="${background}"/>`
                );
            }

            // Render paths, grouping by group name
            this.renderPathsGrouped(lines, (path) => {
                const transformedD = this.transformPathData(path.d, scale, offsetX, offsetY);
                return this.renderPathWithData(transformedD, path.style);
            });
        } else {
            // Original viewBox mode for backward compatibility
            const viewBox = `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`;
            lines.push(
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">`
            );

            if (background) {
                lines.push(
                    `  <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="${background}"/>`
                );
            }

            // Render paths, grouping by group name
            this.renderPathsGrouped(lines, (path) => this.renderPath(path));
        }

        lines.push('</svg>');
        return lines.join('\n');
    }

    /**
     * Render paths grouped by their group name.
     */
    private renderPathsGrouped(lines: string[], renderFn: (path: PathEntry) => string): void {
        // Group paths by their group name, maintaining order
        const groups: { name: string | undefined; paths: PathEntry[] }[] = [];
        let currentGroupName: string | undefined = undefined;
        let currentGroupPaths: PathEntry[] = [];

        for (const path of this.paths) {
            if (path.group !== currentGroupName) {
                if (currentGroupPaths.length > 0) {
                    groups.push({ name: currentGroupName, paths: currentGroupPaths });
                }
                currentGroupName = path.group;
                currentGroupPaths = [path];
            } else {
                currentGroupPaths.push(path);
            }
        }
        if (currentGroupPaths.length > 0) {
            groups.push({ name: currentGroupName, paths: currentGroupPaths });
        }

        // Render groups
        for (const group of groups) {
            if (group.name) {
                lines.push(`  <g id="${group.name}">`);
                for (const path of group.paths) {
                    lines.push(`    ${renderFn(path)}`);
                }
                lines.push(`  </g>`);
            } else {
                for (const path of group.paths) {
                    lines.push(`  ${renderFn(path)}`);
                }
            }
        }
    }

    /**
     * Transform path data coordinates by scale and offset.
     */
    private transformPathData(d: string, scale: number, offsetX: number, offsetY: number): string {
        // Match coordinates in M, L commands and transform them
        return d.replace(
            /([ML])\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s+(-?\d+\.?\d*(?:e[+-]?\d+)?)/gi,
            (_match, cmd, xStr, yStr) => {
                const x = parseFloat(xStr) * scale + offsetX;
                const y = parseFloat(yStr) * scale + offsetY;
                return `${cmd} ${x} ${y}`;
            }
        );
    }

    /**
     * Render a path element with pre-transformed data.
     */
    private renderPathWithData(d: string, style: PathStyle): string {
        const attrs: string[] = [`d="${d}"`];

        if (style.fill !== undefined) {
            attrs.push(`fill="${style.fill}"`);
        } else {
            attrs.push('fill="none"');
        }

        if (style.stroke !== undefined) {
            attrs.push(`stroke="${style.stroke}"`);
        }

        if (style.strokeWidth !== undefined) {
            attrs.push(`stroke-width="${style.strokeWidth}"`);
        }

        if (style.opacity !== undefined) {
            attrs.push(`opacity="${style.opacity}"`);
        }

        if (style.fillOpacity !== undefined) {
            attrs.push(`fill-opacity="${style.fillOpacity}"`);
        }

        if (style.strokeOpacity !== undefined) {
            attrs.push(`stroke-opacity="${style.strokeOpacity}"`);
        }

        if (style.dash && style.dash.length > 0) {
            attrs.push(`stroke-dasharray="${style.dash.join(' ')}"`);
        }

        return `<path ${attrs.join(' ')}/>`;
    }

    /**
     * Render a single path element.
     */
    private renderPath(entry: PathEntry): string {
        const attrs: string[] = [`d="${entry.d}"`];
        const style = entry.style;

        if (style.fill !== undefined) {
            attrs.push(`fill="${style.fill}"`);
        } else {
            attrs.push('fill="none"');
        }

        if (style.stroke !== undefined) {
            attrs.push(`stroke="${style.stroke}"`);
        }

        if (style.strokeWidth !== undefined) {
            attrs.push(`stroke-width="${style.strokeWidth}"`);
        }

        if (style.opacity !== undefined) {
            attrs.push(`opacity="${style.opacity}"`);
        }

        if (style.fillOpacity !== undefined) {
            attrs.push(`fill-opacity="${style.fillOpacity}"`);
        }

        if (style.strokeOpacity !== undefined) {
            attrs.push(`stroke-opacity="${style.strokeOpacity}"`);
        }

        if (style.dash && style.dash.length > 0) {
            attrs.push(`stroke-dasharray="${style.dash.join(' ')}"`);
        }

        return `<path ${attrs.join(' ')}/>`;
    }

    /**
     * Get statistics about collected paths.
     */
    get stats(): { shapes: number; segments: number } {
        return {
            shapes: this.paths.length,
            segments: this._segmentCount
        };
    }

    /**
     * Clear all paths.
     */
    clear(): void {
        this.paths = [];
        this._segmentCount = 0;
        this.minX = Infinity;
        this.minY = Infinity;
        this.maxX = -Infinity;
        this.maxY = -Infinity;
    }

    /**
     * Get the number of paths collected.
     */
    get length(): number {
        return this.paths.length;
    }
}
