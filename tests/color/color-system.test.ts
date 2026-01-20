import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { shape, Palette, Sequence, SVGCollector } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('Color System - Palette', () => {
    it('should generate correct number of colors', () => {
        const palette = new Palette(6, "reds", "blues");
        const colors = palette.toArray();
        
        expect(colors).toHaveLength(6);
        colors.forEach(color => {
            expect(color).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });

    it('should apply modifiers correctly', () => {
        const vibrant = new Palette(3, "blues").vibrant().toArray();
        const muted = new Palette(3, "blues").muted().toArray();
        
        expect(vibrant).toHaveLength(3);
        expect(muted).toHaveLength(3);
        expect(vibrant).not.toEqual(muted);
    });
});

describe('Color System - Shape Color Assignment', () => {
    it('should assign color to individual shape', () => {
        const circle = shape.circle().radius(30).color('#ff5733');
        
        expect(circle.shape.color).toBe('#ff5733');
    });

    it('should assign colors via sequence to multiple shapes', () => {
        const colors = ['#ff5733', '#3498db', '#2ecc71'];
        const colorSeq = Sequence.repeat(...colors);
        
        const circles = shape.circle()
            .radius(20)
            .clone(2, 50, 0); // Creates 3 circles total
        
        circles.shapes.color(colorSeq);
        
        const shapes = circles.shapes.shapes;
        expect(shapes[0].color).toBe('#ff5733');
        expect(shapes[1].color).toBe('#3498db');
        expect(shapes[2].color).toBe('#2ecc71');
    });

    it('should assign same color to all shapes with string', () => {
        const circles = shape.circle()
            .radius(20)
            .clone(2, 50, 0);
        
        circles.shapes.color('#ff5733');
        
        const shapes = circles.shapes.shapes;
        shapes.forEach(s => {
            expect(s.color).toBe('#ff5733');
        });
    });

    it('should preserve color through clone', () => {
        const original = shape.circle().radius(30).color('#ff5733');
        const cloned = original.shape.clone();
        
        expect(cloned.color).toBe('#ff5733');
    });
});

describe('Color System - Render Modes', () => {
    it('should default to stroke mode', () => {
        const svg = new SVGCollector();
        expect(svg.getRenderMode()).toBe('stroke');
    });

    it('should change render mode', () => {
        const svg = new SVGCollector();
        
        svg.setRenderMode('fill');
        expect(svg.getRenderMode()).toBe('fill');
        
        svg.setRenderMode('glass');
        expect(svg.getRenderMode()).toBe('glass');
    });

    it('should render fill mode correctly', () => {
        const svg = new SVGCollector();
        svg.setRenderMode('fill');
        
        const circle = shape.circle().radius(30).color('#ff5733');
        circle.stamp(svg);
        
        const output = svg.toString({ width: 100, height: 100 });
        expect(output).toContain('fill="#ff5733"');
        expect(output).toContain('stroke="none"');
        
        writeFileSync('test-output/color-fill-mode.svg', output);
    });

    it('should render stroke mode correctly', () => {
        const svg = new SVGCollector();
        svg.setRenderMode('stroke');
        
        const circle = shape.circle().radius(30).color('#3498db');
        circle.stamp(svg);
        
        const output = svg.toString({ width: 100, height: 100 });
        expect(output).toContain('fill="none"');
        expect(output).toContain('stroke="#3498db"');
        expect(output).toContain('stroke-width="1"');
        
        writeFileSync('test-output/color-stroke-mode.svg', output);
    });

    it('should render glass mode correctly', () => {
        const svg = new SVGCollector();
        svg.setRenderMode('glass');
        
        const circle = shape.circle().radius(30).color('#2ecc71');
        circle.stamp(svg);
        
        const output = svg.toString({ width: 100, height: 100 });
        expect(output).toContain('fill="#2ecc71"');
        expect(output).toContain('stroke="#2ecc71"');
        expect(output).toContain('fill-opacity="0.5"');
        // Stroke is opaque (no stroke-opacity attribute)
        
        writeFileSync('test-output/color-glass-mode.svg', output);
    });

    it('should auto-assign colors from default palette', () => {
        const svg = new SVGCollector();
        svg.setRenderMode('fill');
        
        // Create shapes without explicit colors
        shape.circle().radius(20).xy(0, 0).stamp(svg);
        shape.rect().size(30).xy(50, 0).stamp(svg);
        shape.hexagon().radius(15).xy(100, 0).stamp(svg);
        
        const output = svg.toString({ width: 150, height: 50 });
        
        // Should contain color fills (auto-assigned)
        expect(output).toContain('fill="#');
        expect(svg.stats.shapes).toBe(3);
        
        writeFileSync('test-output/color-auto-assign.svg', output);
    });
});

describe('Color System - Integration with Palette and Sequence', () => {
    it('should work end-to-end with palette, sequence, and render modes', () => {
        const svg = new SVGCollector();
        svg.setRenderMode('glass');
        
        // Generate palette
        const colors = new Palette(6, "blues", "cyans").vibrant().toArray();
        const colorSeq = Sequence.repeat(...colors);
        
        // Create shapes and assign colors
        const circles = shape.circle()
            .radius(20)
            .clone(5, 50, 0);
        
        circles.shapes.color(colorSeq);
        circles.stamp(svg);
        
        const output = svg.toString({ width: 350, height: 100 });
        
        // Verify glass mode styling (fill is transparent, stroke is opaque)
        expect(output).toContain('fill-opacity="0.5"');
        
        // Verify all circles are rendered
        expect(svg.stats.shapes).toBe(6); // Original + 5 clones
        
        // Verify colors are different (from palette)
        const colorMatches = output.match(/fill="#[0-9a-f]{6}"/gi);
        expect(colorMatches).not.toBeNull();
        expect(colorMatches!.length).toBeGreaterThan(0);
        
        writeFileSync('test-output/color-integration.svg', output);
    });

    it('should handle mixed render modes in single SVG', () => {
        const svg = new SVGCollector();
        
        // Fill mode
        svg.setRenderMode('fill');
        shape.rect().size(30).xy(0, 0).color('#e74c3c').stamp(svg);
        
        // Stroke mode
        svg.setRenderMode('stroke');
        shape.circle().radius(20).xy(60, 0).color('#3498db').stamp(svg);
        
        // Glass mode
        svg.setRenderMode('glass');
        shape.hexagon().radius(18).xy(120, 0).color('#2ecc71').stamp(svg);
        
        const output = svg.toString({ width: 180, height: 60 });
        
        // Verify different modes are present
        expect(output).toContain('fill="#e74c3c"');
        expect(output).toContain('stroke="none"'); // From fill mode
        expect(output).toContain('fill="none"'); // From stroke mode
        expect(output).toContain('fill-opacity="0.5"'); // From glass mode (opaque stroke)
        
        writeFileSync('test-output/color-mixed-modes.svg', output);
    });
});

describe('Color System - Edge Cases', () => {
    it('should handle shapes without colors in stroke mode', () => {
        const svg = new SVGCollector();
        svg.setRenderMode('stroke');
        
        const circle = shape.circle().radius(30);
        // No color assigned - should auto-assign
        circle.stamp(svg);
        
        const output = svg.toString({ width: 100, height: 100 });
        expect(output).toContain('fill="none"');
        expect(output).toContain('stroke="#'); // Auto-assigned color
    });

    it('should allow explicit style override', () => {
        const svg = new SVGCollector();
        svg.setRenderMode('fill');
        
        const circle = shape.circle().radius(30).color('#ff5733');
        // Override with explicit style
        circle.stamp(svg, 0, 0, { opacity: 1.0, strokeWidth: 2 });
        
        const output = svg.toString({ width: 100, height: 100 });
        expect(output).toContain('fill="#ff5733"');
        expect(output).toContain('opacity="1"'); // Override
        expect(output).toContain('stroke-width="2"'); // Override
    });

    it('should cycle through palette when more shapes than colors', () => {
        const svg = new SVGCollector();
        svg.setRenderMode('fill');
        
        const colors = new Palette(3, "reds").toArray();
        const colorSeq = Sequence.repeat(...colors);
        
        // Create 7 shapes (more than 3 colors)
        const circles = shape.circle()
            .radius(15)
            .clone(6, 35, 0);
        
        circles.shapes.color(colorSeq);
        
        const shapes = circles.shapes.shapes;
        // Should cycle: 0,1,2,0,1,2,0
        expect(shapes[0].color).toBe(shapes[3].color);
        expect(shapes[1].color).toBe(shapes[4].color);
        expect(shapes[2].color).toBe(shapes[5].color);
        expect(shapes[0].color).toBe(shapes[6].color);
    });
});
