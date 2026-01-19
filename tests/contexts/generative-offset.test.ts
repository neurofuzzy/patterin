
import { describe, it, expect } from 'vitest';
import { shape } from '../../src/index';
import { ShapesContext } from '../../src/contexts/ShapeContext';
import { Vector2 } from '../../src/primitives/Vector2';

describe('Generative Offset', () => {
    it('should modify in-place when count=0', () => {
        const s = shape.rect().size(10);
        const original = s.clone(); // keep ref

        s.offset(5); // +5 padding

        // Size should increase from 10 to 20 (5 on each side)
        expect(s.bbox().w).toBeCloseTo(20);
    });

    it('should generate copies when count > 0 (ShapeContext)', () => {
        const s = shape.rect().size(10);

        // Offset 5, 2 copies
        // Returns ShapesContext with 3 shapes: original(10), copy1(20), copy2(30)
        const result = s.offset(5, 2);

        expect(result instanceof ShapesContext).toBe(true);
        // Original + 2 copies = 3 shapes
        expect((result as any).length).toBe(3); // cast because return type is union

        const shapes = (result as ShapesContext).shapes;
        expect(shapes[0].boundingBox().width).toBeCloseTo(10);
        expect(shapes[1].boundingBox().width).toBeCloseTo(20);
        expect(shapes[2].boundingBox().width).toBeCloseTo(30);
    });

    it('should generate copies when count > 0 (ShapesContext)', () => {
        // Start with 2 rects
        const s = shape.rect().size(10).clone(1, 100, 0); // 2 rects at 0 and 100

        // Offset 5, 1 copy each
        // Should result in 4 shapes total: 2 originals + 2 copies
        const result = s.every(1).offset(5, 1);

        expect(result.length).toBe(4);

        // Check sizes
        const shapes = result.shapes;
        // Logic: [original, copy, original, copy] or [orig, orig, copy, copy]?
        // My implementation: for each shape { push orig; loop copies; }
        // So: [orig1, copy1, orig2, copy2]

        expect(shapes[0].boundingBox().width).toBeCloseTo(10); // Orig 1
        expect(shapes[1].boundingBox().width).toBeCloseTo(20); // Copy 1
        expect(shapes[2].boundingBox().width).toBeCloseTo(10); // Orig 2
        expect(shapes[3].boundingBox().width).toBeCloseTo(20); // Copy 2
    });

    it('expand and inset should work as aliases', () => {
        const s = shape.rect().size(10);

        const expanded = s.expand(5, 1); // [10, 20]
        const inset = s.inset(2, 1); // [10, 6] (10 - 2*2)

        // Expand returns ShapesContext
        expect((expanded as any).length).toBe(2);
        expect((expanded as any).shapes[1].boundingBox().width).toBeCloseTo(20);

        // Inset returns ShapesContext
        expect((inset as any).length).toBe(2);
        expect((inset as any).shapes[1].boundingBox().width).toBeCloseTo(6);
    });
});
