import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { shape } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('CloneSystem', () => {
    it('should create correct number of shapes with nested clone', () => {
        const clones = shape.rect().clone(4, 40, 0).clone(4, 0, 40);
        // (4+1) * (4+1) = 25 shapes
        expect(clones.length).toBe(25);
    });

    it('every(2) should select every other shape', () => {
        const clones = shape.rect().clone(4, 40, 0).clone(4, 0, 40);
        const selected = clones.every(2);
        // 25 shapes, every 2 = indices 0,2,4,6,8,10,12,14,16,18,20,22,24 = 13 shapes
        expect(selected.length).toBe(13);
    });

    it('every(2).scale(2) should scale only selected shapes', () => {
        const clones = shape.rect().clone(4, 40, 0).clone(4, 0, 40);

        // Get initial bounding box of first shape
        const shapesBeforeScale = clones.shapes.shapes;
        const firstBbox = shapesBeforeScale[0].boundingBox();
        const originalWidth = firstBbox.width;

        // Scale every other shape
        clones.every(2).scale(2);

        // Now check the shapes again
        const shapesAfterScale = clones.shapes.shapes;
        const scaledBbox = shapesAfterScale[0].boundingBox();  // Index 0 was selected
        const unscaledBbox = shapesAfterScale[1].boundingBox();  // Index 1 was not

        // Selected shape should be scaled
        expect(scaledBbox.width).toBeCloseTo(originalWidth * 2, 5);
        // Unselected shape should remain original size
        expect(unscaledBbox.width).toBeCloseTo(originalWidth, 5);
    });

    it('every().scale() should not cause double rendering', () => {
        const clones = shape.rect().clone(4, 40, 0).clone(4, 0, 40);
        clones.every(2).scale(2);

        const svg = clones.toSVG({ width: 400, height: 400, margin: 20 });
        const pathCount = (svg.match(/<path/g) || []).length;

        // Should have exactly 25 paths (one per shape), not 50 (double)
        expect(pathCount).toBe(25);
        writeFileSync('test-output/clone-every-scale.svg', svg);
    });

    it('slice() should select range of shapes', () => {
        const clones = shape.rect().clone(4, 40, 0).clone(4, 0, 40);
        const sliced = clones.slice(0, 5);
        expect(sliced.length).toBe(5);
    });

    it('slice().rotate() should rotate only selected shapes', () => {
        const clones = shape.rect().clone(4, 40, 0);

        // Rotate first 3 shapes
        clones.slice(0, 3).rotate(45);

        const svg = clones.toSVG({ width: 400, height: 100, margin: 20 });
        // All shapes should still render
        const pathCount = (svg.match(/<path/g) || []).length;
        expect(pathCount).toBe(5);
        writeFileSync('test-output/clone-slice-rotate.svg', svg);
    });
});
