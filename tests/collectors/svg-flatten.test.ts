import { describe, it, expect } from 'vitest';
import { SVGCollector, shape } from '../../src/index.ts';

describe('SVGCollector flatten mode', () => {
    it('flatten mode should produce SVG without viewBox', () => {
        const collector = new SVGCollector();
        const rect = shape.square().size(100).shape;
        rect.translate({ x: 50, y: 50, subtract: () => ({ x: 0, y: 0 }), add: () => ({ x: 0, y: 0 }) } as any);
        collector.addShape(rect, { stroke: '#000', strokeWidth: 2 });

        const svg = collector.toString({
            width: 200,
            height: 200,
            flatten: true,
        });

        expect(svg).not.toContain('viewBox');
        expect(svg).toContain('width="200"');
        expect(svg).toContain('height="200"');
        expect(svg).toContain('<path');
    });

    it('flatten mode should transform coordinates', () => {
        const collector = new SVGCollector();
        // Add a simple path directly
        collector.addPath('M 0 0 L 100 0 L 100 100 L 0 100 Z', { stroke: '#000' });

        const svg = collector.toString({
            width: 200,
            height: 200,
            margin: 10,
            flatten: true,
        });

        // Coordinates should be scaled and offset
        // Original bounds: 0,0 to 100,100 with margin 10 = -10,-10 to 110,110
        // Should be scaled and centered in 200x200 viewport
        expect(svg).not.toContain('viewBox');
        expect(svg).toContain('<svg');
        expect(svg).toContain('</svg>');

        // The paths should have transformed coordinates (not the original 0,0)
        // Since we're scaling 120x120 (with margin) to fit 200x200, and centering
        const pathMatch = svg.match(/d="([^"]+)"/);
        expect(pathMatch).not.toBeNull();

        const pathData = pathMatch![1];
        // Extract first M coordinate
        const firstCoord = pathData.match(/M\s+([\d.]+)\s+([\d.]+)/);
        expect(firstCoord).not.toBeNull();

        // The coordinates should be transformed, not just 0,0
        const x = parseFloat(firstCoord![1]);
        const y = parseFloat(firstCoord![2]);
        // With scaling and centering, x and y should be positive (centered in viewport)
        expect(x).toBeGreaterThan(0);
        expect(y).toBeGreaterThan(0);
    });

    it('viewBox mode should still work for backward compatibility', () => {
        const collector = new SVGCollector();
        collector.addPath('M 0 0 L 100 0 L 100 100 L 0 100 Z', { stroke: '#000' });

        const svg = collector.toString({
            width: 200,
            height: 200,
            margin: 10,
            flatten: false,  // Explicitly use viewBox mode
        });

        expect(svg).toContain('viewBox');
    });
});
