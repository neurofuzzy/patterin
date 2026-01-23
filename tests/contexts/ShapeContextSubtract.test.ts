
import { describe, test, expect } from 'vitest';
import { shape } from '../../src/index';
import { ShapeContext } from '../../src/contexts/ShapeContext';
import { ShapesContext } from '../../src/contexts/ShapeContext';
import { Vector2 } from '../../src/primitives/Vector2';

describe('ShapeContext.subtract', () => {

    test('Square subtract smaller square (hole)', () => {
        const box = shape.rect().size(100).setCenter(0, 0); // [-50, 50]
        const hole = shape.rect().size(50).setCenter(0, 0); // [-25, 25]

        const result = box.subtract(hole);

        // A shape with a hole is represented as two shapes (Outer CCW, Inner CW) in Patterin currently
        // Alternatively, if they are stitched into one complex polygon (not supported by simple Shape), it might be different.
        // But BooleanOps.stitchSegments returns array of Shape.
        expect(result.length).toBe(2);

        // Verify windings
        const s1 = result.shapes[0];
        const s2 = result.shapes[1];
        // One should be cw, one ccw
        expect(s1.winding !== s2.winding).toBe(true);
    });

    test('Square subtract overlapping corner', () => {
        const s1 = shape.rect().size(100).setCenter(0, 0); // [-50, 50]
        const s2 = shape.rect().size(100).setCenter(50, 50); // [0, 100]

        // Intersection is [0, 50] x [0, 50]. 
        // s1 - s2 should remove the top-right quadrant of s1.
        // Result: L-shaped polygon. 6 vertices.

        const result = s1.subtract(s2);

        expect(result.length).toBe(1);
        expect(result.shapes[0].vertices.length).toBe(6);
    });

    test('Disjoint subtraction', () => {
        const s1 = shape.rect().size(100).setCenter(0, 0);
        const s2 = shape.rect().size(100).setCenter(200, 0);

        const result = s1.subtract(s2);

        expect(result.length).toBe(1);
        // Should be copy of s1
        expect(result.shapes[0].vertices.length).toBe(4);
    });

    test('Full subtraction', () => {
        const s1 = shape.rect().size(50).setCenter(0, 0);
        const s2 = shape.rect().size(100).setCenter(0, 0); // Larger containing s1

        const result = s1.subtract(s2);

        expect(result.length).toBe(0);
    });

    test('ShapesContext subtract', () => {
        // Grid of 2 squares
        const grid = shape.rect().size(40).setCenter(0, 0)
            .clone(2, 100, 0); // at 0,0 and 100,0

        const gridShapes = grid.shapes;

        // Let's subtract a circle from both
        const hole = shape.circle().radius(10).setCenter(0, 0);
        const hole2 = shape.circle().radius(10).setCenter(100, 0);

        // Subtract hole 1
        let result = gridShapes.subtract(hole);
        // Subtract hole 2
        result = result.subtract(hole2);

        // Expectation:
        // Original at 0,0: gets hole (2 shapes)
        // Clone 1 at 100,0: gets hole (2 shapes)
        // Clone 2 at 200,0: no hole (1 shape)
        // Total: 5 shapes.

        expect(result.length).toBeGreaterThanOrEqual(5);
    });
});
