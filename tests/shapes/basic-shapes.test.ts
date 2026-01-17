import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { shape, SVGCollector } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('Basic Shapes', () => {
    it('circle should have 32 vertices by default', () => {
        const circle = shape.circle().radius(40);
        expect(circle.vertices.length).toBe(32);
    });

    it('circle should stamp with correct styles', () => {
        const collector = new SVGCollector();
        shape.circle().radius(40).stamp(collector, 50, 50, { stroke: '#000', strokeWidth: 2 });
        const svg = collector.toString({ width: 400, height: 400 });

        expect(collector.length).toBe(1);
        expect(svg).toContain('stroke="#000"');
        expect(svg).toContain('stroke-width="2"');
        writeFileSync('test-output/circle.svg', svg);
    });

    it('rect should have 4 vertices', () => {
        const rect = shape.rect().wh(80, 40);
        expect(rect.vertices.length).toBe(4);
    });

    it('hexagon should have 6 vertices', () => {
        const hex = shape.hexagon().radius(40);
        expect(hex.vertices.length).toBe(6);
    });

    it('hexagon should stamp with fill', () => {
        const collector = new SVGCollector();
        shape.hexagon().radius(40).stamp(collector, 50, 50, {
            stroke: '#333',
            strokeWidth: 2,
            fill: '#ffcc00'
        });
        const svg = collector.toString({ width: 400, height: 400 });

        expect(collector.length).toBe(1);
        expect(svg).toContain('fill="#ffcc00"');
        writeFileSync('test-output/hexagon.svg', svg);
    });

    it('triangle should have 3 vertices', () => {
        const tri = shape.triangle().radius(40);
        expect(tri.vertices.length).toBe(3);
    });

    it('square should be equal width and height', () => {
        const sq = shape.square().size(50);
        const bbox = sq.shape.boundingBox();
        expect(bbox.width).toBeCloseTo(50, 1);
        expect(bbox.height).toBeCloseTo(50, 1);
    });
});
