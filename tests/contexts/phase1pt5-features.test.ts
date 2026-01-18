import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { shape, SVGCollector } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('PointsContext.expandToCircles()', () => {
    it('should create circles at each vertex', () => {
        const hex = shape.hexagon().radius(50);
        const circles = hex.points.expandToCircles(10);
        expect(circles.length).toBe(6);
    });

    it('should not modify original shape', () => {
        const hex = shape.hexagon().radius(50);
        hex.points.expandToCircles(10);
        expect(hex.vertices.length).toBe(6);
    });

    it('should generate visual SVG', () => {
        const collector = new SVGCollector();
        const hex = shape.hexagon().radius(50);

        hex.stamp(collector, 100, 100, { stroke: '#000', strokeWidth: 2 });
        hex.points.expandToCircles(8, 16).stamp(collector, 100, 100, {
            stroke: '#333', fill: '#ff0'
        });

        const svg = collector.toString({ width: 400, height: 400 });
        expect(collector.length).toBe(7); // 1 hex + 6 circles
        writeFileSync('test-output/point-expansion.svg', svg);
    });
});

describe('PointsContext.raycast()', () => {
    it('should return endpoints at correct distance', () => {
        const circle = shape.circle().radius(50).numSegments(8);
        const rays = circle.points.raycast(20, 'outward');
        expect(rays.length).toBe(8);
    });

    it('should accept numeric angle', () => {
        const circle = shape.circle().radius(50).numSegments(4);
        const rays = circle.points.raycast(30, 45);
        expect(rays.length).toBe(4);
    });
});

describe('LinesContext.collapse()', () => {
    it('should return midpoints of selected segments', () => {
        const rect = shape.rect().wh(100, 100);
        const midpoints = rect.lines.collapse();
        expect(midpoints.length).toBe(4);
    });
});

describe('LinesContext.expandToRect()', () => {
    it('should create rectangles from segments', () => {
        const rect = shape.rect().wh(100, 50);
        const rects = rect.lines.at(0).expandToRect(5);
        expect(rects.length).toBe(1);
    });

    it('should create rectangle with correct width', () => {
        const rect = shape.rect().wh(100, 50);
        const rects = rect.lines.at(0).expandToRect(5);
        const bbox = rects.shapes[0].boundingBox();
        expect(bbox.height).toBeCloseTo(10, 1); // 5 * 2
    });
});

describe('ShapesContext.spreadPolar()', () => {
    it('should distribute shapes around circle', () => {
        const circles = shape.circle().radius(5).clone(7).spreadPolar(50);  // 8 shapes total
        expect(circles.length).toBe(8);
    });

    it('should position first shape at 0 degrees (right)', () => {
        const circles = shape.circle().radius(5).clone(4).spreadPolar(50);
        const center = circles.shapes[0].centroid();
        expect(center.x).toBeCloseTo(50, 1);
        expect(center.y).toBeCloseTo(0, 1);
    });

    it('should support partial arc', () => {
        const circles = shape.circle().radius(5).clone(3).spreadPolar(50, 180);  // 4 shapes
        const first = circles.shapes[0].centroid();
        const last = circles.shapes[3].centroid();
        expect(first.x).toBeCloseTo(50, 1); // 0 degrees
        expect(last.x).toBeCloseTo(-50, 1); // 180 degrees
    });

    it('should generate mandala pattern', () => {
        const collector = new SVGCollector();

        for (let ring = 1; ring <= 3; ring++) {
            // clone(n) returns n+1 shapes, so we use ring*6-1 to get ring*6 shapes
            const circles = shape.circle().radius(6)
                .clone(ring * 6 - 1)   // ring*6 shapes total
                .spreadPolar(ring * 25);
            circles.stamp(collector);
        }

        const svg = collector.toString({ width: 400, height: 400 });
        expect(collector.length).toBe(6 + 12 + 18); // 36 circles
        writeFileSync('test-output/polar-mandala.svg', svg);
    });
});
