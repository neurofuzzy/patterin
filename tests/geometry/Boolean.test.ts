
import { describe, it, expect } from 'vitest';
import { shape } from '../../src/index';

describe('Boolean Operations', () => {
    it('should union two overlapping squares', () => {
        // Creates s1 at (0,0) and s2 at (50,50) via cloning
        const s = shape.rect().size(100).xy(0, 0);
        const shapes = s.clone(1, 50, 50).shapes; // Access ShapesContext from CloneSystem

        // shapes contains 2 overlapping rects
        expect(shapes.length).toBe(2);

        const unioned = shapes.union();

        expect(unioned.length).toBe(1); // Should merge into 1

        const uShape = unioned.shapes[0];
        // Vertices: (50, -50), (50, 0), (100, 0), (100, 100), (0, 100), (0, 50), (-50, 50), (-50, -50)
        expect(uShape.vertices.length).toBeGreaterThanOrEqual(6);
        expect(uShape.area()).toBeCloseTo(100 * 100 + 100 * 100 - 50 * 50); // 17500
    });

    it('should handle disjoint shapes', () => {
        const s = shape.rect().size(10).xy(0, 0);
        const shapes = s.clone(1, 100, 100).shapes; // Far away

        const unioned = shapes.union();

        expect(unioned.length).toBe(2); // Should remain 2 disjoint shapes
    });

    it('should handle containment', () => {
        const s = shape.rect().size(100); // 100x100

        // Create a clone system
        const clones = s.clone(1);

        // Modify only the second shape (the clone) to be smaller
        // every(1, 1) selects every 1st item starting at offset 1 (so index 1, 2, 3...)
        // Since we only have index 0 (original) and index 1 (clone), this selects just the clone
        clones.every(1, 1).scale(0.5);

        // Now we have one 100x100 rect and one 50x50 rect, both centered at 0,0
        const unioned = clones.shapes.union();

        expect(unioned.length).toBe(1);
        expect(unioned.shapes[0].area()).toBeCloseTo(10000); // Area of larger square
    });

    it('should handle identical overlapping shapes', () => {
        const s = shape.rect().size(100);
        // Clone without moving or scaling -> identical shapes
        const shapes = s.clone(1).shapes;

        const unioned = shapes.union();

        // Should result in 1 shape (either one)
        // Currently expected to fail if boundary checks are too strict
        expect(unioned.length).toBe(1);
        expect(unioned.shapes[0].area()).toBeCloseTo(10000);
    });
});
