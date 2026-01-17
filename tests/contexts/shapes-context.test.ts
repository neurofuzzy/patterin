import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { shape, SVGCollector } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('Shapes Context - clone() and spread()', () => {
    it('clone should create n independent copies', () => {
        const shapes = shape.square().size(20).clone(5);
        expect(shapes.length).toBe(5);
    });

    it('cloned shapes should be independent', () => {
        const shapes = shape.square().size(20).clone(3);
        shapes.shapes[0].scale(2);

        // Other shapes should not be affected
        const bbox1 = shapes.shapes[1].boundingBox();
        expect(bbox1.width).toBeCloseTo(20, 1);
    });

    it('spread should offset shapes incrementally', () => {
        const shapes = shape.square().size(20).clone(3).spread(50, 0);

        const centers = shapes.shapes.map(s => s.centroid());
        const x0 = centers[0].x;
        const x1 = centers[1].x;
        const x2 = centers[2].x;

        expect(x1 - x0).toBeCloseTo(50, 1);
        expect(x2 - x1).toBeCloseTo(50, 1);
    });

    it('spread squares should stamp correctly', () => {
        const collector = new SVGCollector();
        const shapes = shape.square().size(20).clone(5).spread(30, 0);

        shapes.stamp(collector, 20, 50, { stroke: '#000', strokeWidth: 2 });

        expect(collector.length).toBe(5);
        writeFileSync('test-output/spread-squares.svg', collector.toString({ width: 200, height: 100 }));
    });

    it('every should select subset of shapes', () => {
        const shapes = shape.circle().clone(6);
        const selected = shapes.every(2);
        expect(selected.length).toBe(3);
    });

    it('slice should return range of shapes', () => {
        const shapes = shape.circle().clone(5);
        const sliced = shapes.slice(1, 3);
        expect(sliced.length).toBe(2);
    });
});
