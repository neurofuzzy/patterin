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

describe('Lines Context - subdivide()', () => {
    it('should subdivide a single line into n segments', () => {
        const rect = shape.rect().size(100);
        const originalSegmentCount = rect.segments.length; // 4
        
        // Subdivide first line into 3 subsegments
        const subsegments = rect.lines.at(0).subdivide(3);
        
        // Should return 3 new subsegments
        expect(subsegments.length).toBe(3);
        
        // Shape should now have 3 + 3 remaining = 6 segments
        expect(rect.segments.length).toBe(originalSegmentCount - 1 + 3);
    });

    it('should double segment count when subdividing all lines by 2', () => {
        const rect = shape.rect().size(100);
        const originalCount = rect.segments.length; // 4
        
        rect.lines.subdivide(2);
        
        // Each segment becomes 2, so 4 * 2 = 8
        expect(rect.segments.length).toBe(originalCount * 2);
    });

    it('should subdivide only selected lines with every(2)', () => {
        const hex = shape.hexagon().radius(50);
        const originalCount = hex.segments.length; // 6
        
        // Select every 2nd line (3 lines)
        hex.lines.every(2).subdivide(3);
        
        // 3 selected lines become 3*3 = 9 segments
        // 3 unselected lines remain = 3 segments
        // Total = 12 segments
        expect(hex.segments.length).toBe(9 + 3);
    });

    it('should allow chaining with at() and extrude()', () => {
        const rect = shape.rect().size(100);
        const originalCount = rect.vertices.length; // 4
        
        // Subdivide first line into 3, then extrude middle subsegment
        rect.lines.at(0).subdivide(3).at(1).extrude(10);
        
        // Original: 4 vertices
        // Subdivide line 0: adds 2 vertices (division points) = 6 vertices
        // Extrude 1 subsegment: adds 2 vertices = 8 vertices
        expect(rect.vertices.length).toBe(8);
    });

    it('should work with multiple selected segments in one shape', () => {
        const rect = shape.rect().size(100);
        const originalCount = rect.segments.length; // 4
        
        // Subdivide lines at indices 0 and 2
        rect.lines.at(0, 2).subdivide(3);
        
        // 2 selected lines become 2*3 = 6 segments
        // 2 unselected lines remain = 2 segments
        // Total = 8 segments
        expect(rect.segments.length).toBe(8);
    });

    it('should handle n < 2 by returning unchanged', () => {
        const rect = shape.rect().size(100);
        const originalCount = rect.segments.length;
        
        const result = rect.lines.subdivide(1);
        
        expect(rect.segments.length).toBe(originalCount);
        expect(result.length).toBe(4); // All original segments returned
    });

    it('should work across multiple shapes via ShapesContext', () => {
        // Create 3 triangles
        const cloneSystem = shape.triangle().radius(30).clone(2).spread(100, 0);
        const shapes = cloneSystem.shapes;
        
        // Each triangle has 3 segments, 3 triangles = 9 total segments
        const totalSegmentsBefore = shapes.shapes.reduce((sum, s) => sum + s.segments.length, 0);
        expect(totalSegmentsBefore).toBe(9);
        
        // Subdivide all lines by 2
        shapes.lines.subdivide(2);
        
        // All segments doubled: 9 * 2 = 18
        const totalSegmentsAfter = shapes.shapes.reduce((sum, s) => sum + s.segments.length, 0);
        expect(totalSegmentsAfter).toBe(18);
    });

    it('should handle selection across multiple shapes', () => {
        // Create 2 rectangles
        const cloneSystem = shape.rect().size(50).clone(1).spread(100, 0);
        const shapes = cloneSystem.shapes;
        
        // Each rect has 4 segments, 2 rects = 8 total
        const totalSegmentsBefore = shapes.shapes.reduce((sum, s) => sum + s.segments.length, 0);
        expect(totalSegmentsBefore).toBe(8);
        
        // Select every 2nd line across both shapes (4 lines) and subdivide by 3
        shapes.lines.every(2).subdivide(3);
        
        // 4 selected segments become 4*3 = 12
        // 4 unselected remain = 4
        // Total = 16
        const totalSegmentsAfter = shapes.shapes.reduce((sum, s) => sum + s.segments.length, 0);
        expect(totalSegmentsAfter).toBe(16);
    });

    it('should create gear pattern with subdivide and extrude', () => {
        const collector = new SVGCollector();
        const hex = shape.hexagon().radius(50);
        
        // Subdivide all lines into 3, then extrude every 4th subsegment
        hex.lines.subdivide(3).every(4).extrude(4);
        
        hex.stamp(collector, 100, 100, { stroke: '#000', strokeWidth: 2 });
        
        expect(collector.length).toBe(1);
        writeFileSync('test-output/gear-subdivide.svg', collector.toString({ width: 400, height: 400 }));
    });

    it('should maintain shape integrity after subdivision', () => {
        const rectCtx = shape.rect().size(100);
        
        rectCtx.lines.at(0, 2).subdivide(4);
        
        // Shape should still be closed
        expect(rectCtx.shape.closed).toBe(true);
        
        // All segments should be properly connected
        for (let i = 0; i < rectCtx.segments.length; i++) {
            const seg = rectCtx.segments[i];
            const nextSeg = rectCtx.segments[(i + 1) % rectCtx.segments.length];
            
            // Current segment's end should be next segment's start
            expect(seg.end.position.x).toBeCloseTo(nextSeg.start.position.x, 5);
            expect(seg.end.position.y).toBeCloseTo(nextSeg.start.position.y, 5);
        }
    });
});
