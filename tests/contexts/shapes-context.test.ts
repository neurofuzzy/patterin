import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { shape, SVGCollector } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('Shapes Context - clone() and spread()', () => {
    it('clone should create n+1 shapes (original + n clones)', () => {
        const shapes = shape.square().size(20).clone(5);
        expect(shapes.length).toBe(6); // original + 5 clones
    });

    it('cloned shapes should be independent', () => {
        const clones = shape.square().size(20).clone(3);
        clones.shapes.shapes[0].scale(2);

        // Other shapes should not be affected
        const bbox1 = clones.shapes.shapes[1].boundingBox();
        expect(bbox1.width).toBeCloseTo(20, 1);
    });

    it('spread should offset shapes incrementally', () => {
        const shapes = shape.square().size(20).clone(3).spread(50, 0);  // 4 shapes total

        const centers = shapes.shapes.shapes.map(s => s.centroid());
        const x0 = centers[0].x;
        const x1 = centers[1].x;
        const x2 = centers[2].x;

        expect(x1 - x0).toBeCloseTo(50, 1);
        expect(x2 - x1).toBeCloseTo(50, 1);
    });

    it('spread squares should stamp correctly', () => {
        const collector = new SVGCollector();
        const shapes = shape.square().size(20).clone(5).spread(30, 0);  // 6 shapes

        shapes.stamp(collector);

        expect(collector.length).toBe(6);  // 1 original + 5 clones
        writeFileSync('test-output/spread-squares.svg', collector.toString({ width: 200, height: 100 }));
    });

    it('every should select subset of shapes', () => {
        const shapes = shape.circle().clone(6);  // 7 shapes total
        const selected = shapes.every(2);
        expect(selected.length).toBe(4);  // indices 0, 2, 4, 6
    });

    it('slice should return range of shapes', () => {
        const shapes = shape.circle().clone(5);
        const sliced = shapes.slice(1, 3);
        expect(sliced.length).toBe(2);
    });

    it('nested clone should create grid pattern (5x5)', () => {
        // Clone 4 times horizontally (5 shapes), then 4 times vertically (5 rows)
        // Expected: 5 * 5 = 25 rectangles
        // Each rect has 4 segments, so total segments = 4 * 25 = 100
        const grid = shape.rect().wh(20, 20)
            .clone(4, 40, 0)   // 5 shapes in a row
            .clone(4, 0, 40);  // 5 rows

        expect(grid.length).toBe(25);  // 5 x 5 grid

        // Count total segments
        let totalSegments = 0;
        for (const s of grid.shapes.shapes) {
            totalSegments += s.segments.length;
        }
        expect(totalSegments).toBe(4 * 5 * 5);  // 4 segments per rect * 25 rects

        // Verify grid positions - check corners
        const shapes = grid.shapes.shapes;
        const centers = shapes.map(s => s.centroid());

        // Find shapes at approximate grid positions
        const topLeft = centers.find(c => c.x < 20 && c.y < 20);
        const topRight = centers.find(c => c.x > 140 && c.y < 20);
        const bottomLeft = centers.find(c => c.x < 20 && c.y > 140);
        const bottomRight = centers.find(c => c.x > 140 && c.y > 140);

        expect(topLeft).toBeDefined();
        expect(topRight).toBeDefined();
        expect(bottomLeft).toBeDefined();
        expect(bottomRight).toBeDefined();
    });
});
