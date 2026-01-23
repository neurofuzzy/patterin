
import { describe, it, expect } from 'vitest';
import { shape, Shape } from '../../src/index';
import { Vector2 } from '../../src/primitives/Vector2';
import { ShapeContext } from '../../src/contexts/ShapeContext';

describe('Points Rounding', () => {
    it('should round all corners of a square', () => {
        let s: ShapeContext = shape.rect().size(100); // 100x100 square
        // Initial vertices: 4
        expect(s.vertices.length).toBe(4);

        s = s.points.round(10); // Round with radius 10

        // Should have more vertices now
        expect(s.vertices.length).toBeGreaterThan(4);

        // Check bounding box - should be preserved for a square aligned with axes
        // bbox() returns RectContext which has 'w' getter
        const bbox = s.bbox();
        expect(bbox.w).toBeCloseTo(100);
        expect(bbox.h).toBeCloseTo(100);
    });

    it('should round specific corners', () => {
        const s = shape.rect().size(100);

        // Round only top-left (index 0)
        const rounded = s.points.at(0).round(20);

        // 3 original corners + 1 rounded corner
        // Original corners are sharp points
        const original = shape.rect().size(100);
        let matchCount = 0;
        for (const v of rounded.vertices) {
            for (const ov of original.vertices) {
                if (v.position.distanceTo(ov.position) < 1e-5) {
                    matchCount++;
                }
            }
        }
        // Should match exactly 3 original corners
        expect(matchCount).toBe(3);
    });

    it('should clamp radius if too large', () => {
        let s: ShapeContext = shape.rect().size(10);
        // Side length 10. Max radius possible without overlap is 5.
        // Try radius 10. 

        s = s.points.round(10);

        // Check bounds are preserved (still 10x10)
        const bbox = s.bbox();
        expect(bbox.w).toBeCloseTo(10);
        expect(bbox.h).toBeCloseTo(10);

        // Verify no vertices are at the original corners
        const original = shape.rect().size(10);
        let matchCount = 0;
        for (const v of s.vertices) {
            for (const ov of original.vertices) {
                if (v.position.distanceTo(ov.position) < 1e-5) {
                    matchCount++;
                }
            }
        }
        expect(matchCount).toBe(0);
    });

    it('should handle obtuse angles (hexagon)', () => {
        // Use Shape.regularPolygon explicitly
        // regularPolygon(n, radius, center, rotation)
        const hex = Shape.regularPolygon(6, 100);
        let s = new ShapeContext(hex);
        const initialCount = s.vertices.length;

        s = s.points.round(10);

        expect(s.vertices.length).toBeGreaterThan(initialCount);
    });

    it('should ignore straight lines', () => {
        // Create a shape with collinear points: (0,0) -> (50,0) -> (100,0) -> ...
        // Rect with extra point on edge
        const sShape = Shape.fromPoints([
            new Vector2(0, 0),
            new Vector2(50, 0), // Straight line vertex at index 1
            new Vector2(100, 0),
            new Vector2(100, 100),
            new Vector2(0, 100)
        ]);

        let s = new ShapeContext(sShape);

        s = s.points.at(1).round(10);

        // Vertex at (50,0) should remain unchanged because angle is 180
        let found = false;
        for (const v of s.vertices) {
            if (v.position.distanceTo(new Vector2(50, 0)) < 1e-5) {
                found = true;
                break;
            }
        }
        expect(found).toBe(true);
    });
});
