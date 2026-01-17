import { Shape } from '../primitives/Shape.ts';

export interface PathStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    dash?: number[];
}

interface PathEntry {
    d: string;
    style: PathStyle;
}

/**
 * SVG output collector.
 * Collects paths and generates valid SVG with auto-computed viewBox.
 */
export class SVGCollector {
    private paths: PathEntry[] = [];
    private minX = Infinity;
    private minY = Infinity;
    private maxX = -Infinity;
    private maxY = -Infinity;

    /**
     * Add a path to the collector.
     */
    addPath(pathData: string, style: PathStyle = {}): void {
        this.paths.push({ d: pathData, style });
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
    } = {}): string {
        const { margin = 10, background } = options;
        const bounds = this.getBounds(margin);

        const width = options.width ?? bounds.width;
        const height = options.height ?? bounds.height;

        const lines: string[] = [];
        lines.push(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" width="${width}" height="${height}">`
        );

        if (background) {
            lines.push(
                `  <rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="${background}"/>`
            );
        }

        for (const path of this.paths) {
            lines.push(`  ${this.renderPath(path)}`);
        }

        lines.push('</svg>');
        return lines.join('\n');
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
