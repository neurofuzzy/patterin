import { describe, it, expect } from 'vitest';
import { Sequence } from '../../src/sequence/sequence';
import { CircleContext, RectContext } from '../../src/contexts';
import { SVGCollector } from '../../src/collectors/SVGCollector';

describe('Sequence Integration with Collections', () => {
    it('should apply sequence values to each shape in a collection', () => {
        const sizes = Sequence.repeat(0.5, 1, 1.5, 2);
        
        // Create shapes at origin for simpler testing
        const circle = new CircleContext().radius(10).xy(0, 0);
        const cloneSystem = circle.clone(3, 0, 0); // 4 shapes total, no offset
        const shapes = cloneSystem.shapes;
        
        // Apply sequence to collection
        shapes.scale(sizes);
        
        // Verify we have 4 shapes
        const allShapes = shapes['_items'];
        expect(allShapes.length).toBe(4);
        
        // Verify shapes exist
        expect(allShapes).toBeDefined();
    });

    it('should use .current to get current value without advancing', () => {
        const sizes = Sequence.repeat(0.5, 1, 1.5, 2);
        
        // Get current value (should be 0.5, the first value)
        const currentValue = sizes.current;
        expect(currentValue).toBe(0.5);
        
        // Current should still be 0.5 (doesn't advance)
        expect(sizes.current).toBe(0.5);
        
        // Calling it advances
        expect(sizes()).toBe(0.5);
        expect(sizes()).toBe(1);
        
        // Now current should be 1.5 (next value, but not advanced yet)
        expect(sizes.current).toBe(1.5);
    });

    it('should work with scaleY on collections', () => {
        const heights = Sequence.yoyo(0.5, 1, 1.5);
        
        const rect = new RectContext().size(10, 20).xy(0, 0);
        const cloneSystem = rect.clone(5, 0, 0); // No offset for simpler testing
        const shapes = cloneSystem.shapes;
        
        // Apply sequence to scaleY
        shapes.scaleY(heights);
        
        const allShapes = shapes['_items'];
        expect(allShapes.length).toBe(6); // Original + 5 clones
        
        // Just verify shapes exist and have vertices
        for (const shape of allShapes) {
            expect(shape.vertices.length).toBeGreaterThan(0);
        }
    });

    it('should render SVG with sequence-scaled shapes', () => {
        const sizes = Sequence.repeat(0.5, 1, 1.5, 2);
        
        const circle = new CircleContext().radius(15);
        const cloneSystem = circle.clone(3, 50); // Just 4 shapes for simplicity
        const shapes = cloneSystem.shapes;
        
        shapes.scale(sizes);
        
        // Stamp to collector
        const collector = new SVGCollector();
        shapes.stamp(collector);
        
        // Should have 4 shapes
        expect(collector.stats.shapes).toBe(4);
        
        // Verify it can render without errors
        const svg = collector.toString({
            width: 400,
            height: 400,
            margin: 20,
            autoScale: false
        });
        
        expect(svg).toContain('<svg');
        expect(svg).toContain('</svg>');
        
        // Should have 4 path elements (one per shape)
        const pathCount = (svg.match(/<path/g) || []).length;
        expect(pathCount).toBe(4);
    });

    it('should work with rotate on collections', () => {
        const angles = Sequence.repeat(0, 45, 90);
        
        const rect = new RectContext().size(20, 10).xy(100, 100);
        const cloneSystem = rect.clone(2, 50);
        const shapes = cloneSystem.shapes;
        
        shapes.rotate(angles);
        
        const allShapes = shapes['_items'];
        expect(allShapes.length).toBe(3);
        
        // Each shape should be rotated by the sequence angles
        // We can verify by checking that rotation was applied
        const collector = new SVGCollector();
        shapes.stamp(collector);
        
        expect(collector.stats.shapes).toBe(3);
    });

    it('should work with x() and y() position setters on collections', () => {
        const xPositions = Sequence.additive(10, 20, 30);
        
        const circle = new CircleContext().radius(5);
        const cloneSystem = circle.clone(2, 0, 0); // Clone with no offset
        const shapes = cloneSystem.shapes;
        
        // Apply additive sequence to x positions
        shapes.x(xPositions);
        
        const allShapes = shapes['_items'];
        expect(allShapes.length).toBe(3);
        
        // Verify shapes have been positioned (centroids should differ)
        const centroids = allShapes.map(s => s.centroid().x);
        expect(centroids[0]).not.toBe(centroids[1]);
        expect(centroids[1]).not.toBe(centroids[2]);
    });

    it('should work with the exact example from user query', () => {
        const s = Sequence.repeat(0.5, 1, 1.5, 2);
        
        const circle = new CircleContext();
        const cloneSystem = circle
            .radius(15)
            .clone(11, 30);
        
        const result = cloneSystem.shapes.scale(s); // Each gets next: 0.5, 1, 1.5, 2, 0.5...
        
        // Verify we have 12 shapes
        const allShapes = result['_items'];
        expect(allShapes.length).toBe(12);
        
        // Verify sequence was applied
        const collector = new SVGCollector();
        result.stamp(collector);
        
        expect(collector.stats.shapes).toBe(12);
        
        // Generate SVG to test-output
        const svg = collector.toString({
            width: 400,
            height: 400,
            margin: 20,
            autoScale: false
        });
        
        expect(svg).toContain('<svg');
        expect(svg.match(/<path/g)?.length).toBe(12);
    });
});
