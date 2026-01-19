
import { describe, it, expect, beforeAll } from 'vitest';
import { shape, SVGCollector } from '../../src/index';
import { ShapesContext } from '../../src/contexts/ShapeContext';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('User Scenarios Check', () => {
    // Scenario 1: shape offset is working
    it('Scenario 1: shape.circle().offset(10,5)', () => {
        const s = shape.circle().radius(10);
        const result = s.offset(10, 5) as ShapesContext;

        console.log(`Scenario 1 Result Count: ${result.length}`);
        // With new default: offset(10, 5) returns only 5 copies (no original)
        expect(result.length).toBe(5);

        // Generate SVG
        const collector = new SVGCollector();
        result.stamp(collector);
        const svg = collector.toString({ margin: 20 });
        writeFileSync('test-output/scenario1.svg', svg);
        console.log('Generated test-output/scenario1.svg');

        result.shapes.forEach((s, i) => {
            const bbox = s.boundingBox();
            // First offset from radius 10 -> 20 (diameter 40), then 30 (diameter 60), etc.
            // Diameter should be 40, 60, 80, 100, 120
            expect(bbox.width).toBeCloseTo(40 + i * 20, 0); // Looser precision for circles
        });
    });

    // Scenario 2: ShapesContext offset in a system
    it('Scenario 2: CloneSystem chain', () => {
        const step1 = shape.rect().size(10);
        const step2 = step1.clone(1, 40, 0);
        const step3 = step2.clone(1, 0, 40);

        const subset = step3.every(2);
        expect(subset.length).toBe(2);

        subset.scale(3);
        subset.rotate(45);

        // offset(10, 2) -> 2 copies per original (no originals in result)
        const result = subset.offset(10, 2);

        console.log(`Scenario 2 Result Count: ${result.length}`);
        // 2 shapes selected × 2 offset copies = 4 shapes
        expect(result.length).toBe(4);

        // Generate SVG
        const collector = new SVGCollector();
        result.stamp(collector);

        const svg = collector.toString({ margin: 20 });
        writeFileSync('test-output/scenario2.svg', svg);
        console.log('Generated test-output/scenario2.svg');

        // Rect is 10×10, scaled 3x = 30×30, rotated 45° = ~42.43
        // First offset by 10: adds 10 padding each side = 50×50 rotated = ~70.71
        // Second offset by 10: adds another 10 = 70×70 rotated = ~98.99
        
        // Check output widths
        result.shapes.forEach((s, i) => {
            console.log(`Result Shape ${i} width: ${s.boundingBox().width.toFixed(2)}`);
        });

        // Basic sanity checks on sizes
        const expectedFirstOffset = 50 * Math.sqrt(2); // ~70.71
        expect(result.shapes[0].boundingBox().width).toBeCloseTo(expectedFirstOffset, 0.1);
        expect(result.shapes[1].boundingBox().width).toBeGreaterThan(result.shapes[0].boundingBox().width);
    });
});
