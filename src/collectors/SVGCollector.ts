import { Shape } from '../primitives/Shape.ts';

export interface PathStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    dash?: number[];
}

/**
 * Default styles for system rendering.
 * Traced connections use thinner strokes than placed shapes.
 */
export const DEFAULT_STYLES = {
    /** Style for traced system connections (cells, tiles, scaffold shapes) */
    connection: { stroke: '#999', strokeWidth: 0.5 } as PathStyle,
    /** Style for placed shapes at nodes */
    placement: { stroke: '#999', strokeWidth: 1 } as PathStyle,
} as const;

interface PathEntry {
    d: string;
    style: PathStyle;
    group?: string;
}

/**
 * SVG output collector.
 * Collects paths and generates valid SVG with auto-computed viewBox.
 * Supports grouping paths for organized output.
 */
export class SVGCollector {
    private paths: PathEntry[] = [];
    private minX = Infinity;
    private minY = Infinity;
    private maxX = -Infinity;
    private maxY = -Infinity;
    private currentGroup?: string;

    /**
     * Add a path to the collector.
     */
    addPath(pathData: string, style: PathStyle = {}): void {
        this.paths.push({ d: pathData, style, group: this.currentGroup });
        this.updateBoundsFromPath(pathData);
    }

    /**
     * Add a shape to the collector.
     */
    addShape(shape: Shape, style: PathStyle = {}): void {
        if (shape.ephemeral) return;
        this.addPath(shape.toPathData(), style);
    }

    /**
     * Begin a named group. All paths added after this will be in the group.
     */
    beginGroup(name: string): void {
        this.currentGroup = name;
    }

    /**
     * End the current group.
     */
    endGroup(): void {
        this.currentGroup = undefined;
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
     * Get computed bounds with optional margin.
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
     * Generate SVG string.
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

        if (style.dash && style.dash.length > 0) {
            attrs.push(`stroke-dasharray="${style.dash.join(' ')}"`);
        }

        return `<path ${attrs.join(' ')}/>`;
    }

    /**
     * Clear all paths.
     */
    clear(): void {
        this.paths = [];
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
