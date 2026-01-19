
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
        expect(result.length).toBe(6);

        // Generate SVG
        const collector = new SVGCollector();
        result.stamp(collector);
        const svg = collector.toString({ margin: 20 });
        writeFileSync('test-output/scenario1.svg', svg);
        console.log('Generated test-output/scenario1.svg');

        result.shapes.forEach((s, i) => {
            const bbox = s.boundingBox();
            // Diameter should be 20, 40, 60, 80, 100, 120
            expect(bbox.width).toBeCloseTo(20 + i * 20, 0); // Looser precision for circles
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

        // offset(10, 2) -> 3 shapes per original (1 orig + 2 copies)
        const result = subset.offset(10, 2);

        console.log(`Scenario 2 Result Count: ${result.length}`);
        expect(result.length).toBe(6);

        // Generate SVG
        const collector = new SVGCollector();
        result.stamp(collector);

        const svg = collector.toString({ margin: 20 });
        writeFileSync('test-output/scenario2.svg', svg);
        console.log('Generated test-output/scenario2.svg');

        const expectedRotatedWidth = 30 * Math.sqrt(2);
        // Check output widths
        result.shapes.forEach((s, i) => {
            console.log(`Result Shape ${i} width: ${s.boundingBox().width.toFixed(2)}`);
        });

        // Basic sanity checks on sizes
        expect(result.shapes[0].boundingBox().width).toBeCloseTo(expectedRotatedWidth, 0.1);
        expect(result.shapes[1].boundingBox().width).toBeGreaterThan(result.shapes[0].boundingBox().width);
    });
});
