import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { shape, SVGCollector } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('ShapeContext.explode()', () => {
    it('should mark shape as ephemeral', () => {
        const rect = shape.rect().wh(100, 50);
        rect.explode();
        expect(rect.shape.ephemeral).toBe(true);
    });

    it('should return orphan segments equal to vertex count', () => {
        const rect = shape.rect().wh(100, 50);
        const lines = rect.explode();
        expect(lines.length).toBe(4);
    });

    it('should create disconnected segments (orphan)', () => {
        const rect = shape.rect().wh(100, 50);
        const lines = rect.explode();
        // Each segment should have unique vertex instances
        const seg0End = lines.segments[0].end;
        const seg1Start = lines.segments[1].start;
        expect(seg0End).not.toBe(seg1Start);
    });

    it('should generate visual SVG', () => {
        const collector = new SVGCollector();
        const rect = shape.rect().wh(100, 50);
        const lines = rect.explode();

        // Stamp exploded lines as individual strokes
        for (const seg of lines.segments) {
            const path = `M ${seg.start.x} ${seg.start.y} L ${seg.end.x} ${seg.end.y}`;
            collector.addPath(path, { stroke: '#000', strokeWidth: 2 });
        }

        const svg = collector.toString({ width: 200, height: 100 });
        expect(collector.length).toBe(4);
        writeFileSync('test-output/exploded-rect.svg', svg);
    });
});

describe('ShapeContext.collapse()', () => {
    it('should mark shape as ephemeral', () => {
        const circle = shape.circle().radius(50);
        circle.collapse();
        expect(circle.shape.ephemeral).toBe(true);
    });

    it('should return PointContext at centroid', () => {
        const circle = shape.circle().radius(50).moveTo(100, 100);
        const point = circle.collapse();
        expect(point.x).toBeCloseTo(100, 1);
        expect(point.y).toBeCloseTo(100, 1);
    });
});

describe('ShapeContext.offsetShape()', () => {
    it('should expand shape with positive distance', () => {
        const rect = shape.rect().wh(100, 100);
        const offset = rect.offsetShape(10);
        const bbox = offset.shape.boundingBox();
        expect(bbox.width).toBeGreaterThan(100);
        expect(bbox.height).toBeGreaterThan(100);
    });

    it('should shrink shape with negative distance', () => {
        const rect = shape.rect().wh(100, 100);
        const offset = rect.offsetShape(-10);
        const bbox = offset.shape.boundingBox();
        expect(bbox.width).toBeLessThan(100);
        expect(bbox.height).toBeLessThan(100);
    });

    it('should create concentric circles', () => {
        const collector = new SVGCollector();
        const circle = shape.circle().radius(100).numSegments(32);

        for (let i = 0; i < 5; i++) {
            const offset = circle.offsetShape(-15 * i);
            offset.stamp(collector, 100, 100, { stroke: '#000', strokeWidth: 1 });
        }

        const svg = collector.toString({ width: 400, height: 400 });
        expect(collector.length).toBe(5);
        writeFileSync('test-output/concentric-circles.svg', svg);
    });
});

describe('ShapeContext.trace()', () => {
    it('should restore ephemeral shape', () => {
        const rect = shape.rect().wh(100, 50);
        rect.explode();
        expect(rect.shape.ephemeral).toBe(true);
        rect.trace();
        expect(rect.shape.ephemeral).toBe(false);
    });
});
