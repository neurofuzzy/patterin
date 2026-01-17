import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { shape, SVGCollector } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('Points Context - expand()', () => {
    it('expand should move selected vertices outward along normals', () => {
        const circle = shape.circle().radius(30).numSegments(10);
        const originalRadius = 30;

        // Expanding every 2nd point creates star points
        circle.points.every(2).expand(15);

        // After expand, some vertices should be further from center
        const center = circle.center;
        const distances = circle.vertices.map(v => {
            const dx = v.x - center.x;
            const dy = v.y - center.y;
            return Math.sqrt(dx * dx + dy * dy);
        });

        // Should have mix of original radius and expanded radius
        const minDist = Math.min(...distances);
        const maxDist = Math.max(...distances);

        expect(minDist).toBeCloseTo(originalRadius, 1);
        expect(maxDist).toBeGreaterThan(originalRadius + 10);
    });

    it('star pattern should maintain vertex count', () => {
        const collector = new SVGCollector();
        const starCtx = shape.circle().radius(30).numSegments(10);

        starCtx.points.every(2).expand(30);

        expect(starCtx.vertices.length).toBe(10);
        starCtx.stamp(collector, 50, 50, { stroke: '#000', strokeWidth: 2, fill: '#ff0' });
        writeFileSync('test-output/star.svg', collector.toString({ width: 400, height: 400 }));
    });

    it('every(2) should select half the points', () => {
        const circle = shape.circle().numSegments(8);
        const selected = circle.points.every(2);
        expect(selected.length).toBe(4);
    });

    it('every(2, 1) should select the other half', () => {
        const circle = shape.circle().numSegments(8);
        const selected = circle.points.every(2, 1);
        expect(selected.length).toBe(4);
    });

    it('at() should select specific points', () => {
        const circle = shape.circle().numSegments(8);
        const selected = circle.points.at(0, 2, 4);
        expect(selected.length).toBe(3);
    });
});
