import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { shape, SVGCollector } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('ShapeContext - bbox()', () => {
    it('bbox should return ephemeral rect context', () => {
        const tri = shape.triangle().radius(40);
        const bbox = tri.bbox();

        expect(bbox.shape.ephemeral).toBe(true);
    });

    it('bbox should have correct dimensions', () => {
        const rect = shape.rect().wh(100, 50);
        const bbox = rect.bbox();
        const bounds = bbox.shape.boundingBox();

        expect(bounds.width).toBeCloseTo(100, 1);
        expect(bounds.height).toBeCloseTo(50, 1);
    });

    it('traced bbox should stamp', () => {
        const collector = new SVGCollector();
        const tri = shape.triangle().radius(40);

        tri.stamp(collector, 50, 50, { stroke: '#000', strokeWidth: 2, fill: '#90ee90' });

        const bbox = tri.bbox().trace();
        bbox.stamp(collector, 50, 50, { stroke: '#999', strokeWidth: 1, dash: [4, 4] });

        expect(collector.length).toBe(2);
        const svg = collector.toString({ width: 400, height: 400 });
        expect(svg).toContain('stroke-dasharray="4 4"');
        writeFileSync('test-output/triangle-bbox.svg', svg);
    });
});

describe('ShapeContext - transforms', () => {
    it('scale should change size around centroid', () => {
        const sq = shape.square().size(20);
        const originalCenter = sq.center;

        sq.scale(2);

        const bbox = sq.shape.boundingBox();
        expect(bbox.width).toBeCloseTo(40, 1);
        expect(sq.center.x).toBeCloseTo(originalCenter.x, 1);
    });

    it('rotate should preserve centroid', () => {
        const sq = shape.square().size(20);
        const originalCenter = sq.center;

        sq.rotate(Math.PI / 4);

        expect(sq.center.x).toBeCloseTo(originalCenter.x, 1);
        expect(sq.center.y).toBeCloseTo(originalCenter.y, 1);
    });

    it('moveTo should position centroid', () => {
        const sq = shape.square().size(20);
        sq.moveTo(100, 100);

        expect(sq.center.x).toBeCloseTo(100, 1);
        expect(sq.center.y).toBeCloseTo(100, 1);
    });

    it('offset should translate shape', () => {
        const sq = shape.square().size(20).moveTo(0, 0);
        sq.offset(50, 30);

        expect(sq.center.x).toBeCloseTo(50, 1);
        expect(sq.center.y).toBeCloseTo(30, 1);
    });
});
