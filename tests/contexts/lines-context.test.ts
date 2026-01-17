import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { shape, SVGCollector } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('Lines Context - extrude()', () => {
    it('extrude should add 2 vertices per selected segment', () => {
        const rect = shape.rect().size(20);
        const originalCount = rect.vertices.length; // 4

        // Extrude all 4 lines
        rect.lines.extrude(30);

        // Each extruded line adds 2 vertices: A -> A' -> B' -> B
        expect(rect.vertices.length).toBe(originalCount + 4 * 2); // 12
    });

    it('cross pattern should have 12 vertices', () => {
        const collector = new SVGCollector();
        const rectCtx = shape.rect().size(20);

        rectCtx.lines.extrude(30);

        expect(rectCtx.vertices.length).toBe(12);
        rectCtx.stamp(collector, 50, 50, { stroke: '#000', strokeWidth: 2 });
        writeFileSync('test-output/cross.svg', collector.toString({ width: 400, height: 400 }));
    });

    it('extrude every(2) should add vertices for half the lines', () => {
        const circle = shape.circle().radius(40).numSegments(16);
        const originalCount = circle.vertices.length; // 16

        // Extrude every 2nd line (8 lines)
        circle.lines.every(2, 0).extrude(10);

        // 8 extruded lines * 2 vertices each = +16 vertices
        expect(circle.vertices.length).toBe(originalCount + 16); // 32
    });

    it('gear pattern should stamp correctly', () => {
        const collector = new SVGCollector();
        const circleCtx = shape.circle().radius(40).numSegments(16);

        circleCtx.lines.every(2, 0).extrude(10);
        circleCtx.stamp(collector, 50, 50, { stroke: '#000', strokeWidth: 2 });

        expect(collector.length).toBe(1);
        writeFileSync('test-output/gear.svg', collector.toString({ width: 400, height: 400 }));
    });

    it('every(2) should select half the lines', () => {
        const circle = shape.circle().numSegments(8);
        const selected = circle.lines.every(2);
        expect(selected.length).toBe(4);
    });

    it('divide should return intermediate points', () => {
        const rect = shape.rect().size(100);
        const divided = rect.lines.at(0).divide(4);
        // Dividing 1 line into 4 parts creates 3 intermediate points
        expect(divided.length).toBe(3);
    });
});
