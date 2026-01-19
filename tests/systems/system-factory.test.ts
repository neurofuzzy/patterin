import { describe, it, expect } from 'vitest';
import {
    system,
    GridSystem,
    TessellationSystem,
    ShapeSystem,
    shape,
    SVGCollector
} from '../../src/index.ts';

describe('System Factory', () => {
    describe('system.grid()', () => {
        it('should create a GridSystem with options', () => {
            const grid = system.grid({ rows: 3, cols: 3, spacing: 10 });
            expect(grid).toBeInstanceOf(GridSystem);
        });

        it('should create a GridSystem with default options', () => {
            const grid = system.grid({});
            expect(grid).toBeInstanceOf(GridSystem);
        });

        it('should have nodes at intersections', () => {
            const grid = system.grid({ rows: 2, cols: 2, spacing: 10 });
            // 2x2 square grid has (2+1) * (2+1) = 9 intersection nodes
            expect(grid.nodes.length).toBe(9);
        });

        it('should support direct place() on system', () => {
            const grid = system.grid({ rows: 2, cols: 2, spacing: 10 });
            const circle = shape.circle().radius(3);

            // Should be able to place directly on the system
            const result = grid.place(circle);
            expect(result).toBe(grid); // Returns this for chaining
        });
    });

    describe('system.tessellation()', () => {
        it('should create a TessellationSystem', () => {
            const tess = system.tessellation({
                pattern: 'truchet',
                bounds: { width: 100, height: 100 }
            });
            expect(tess).toBeInstanceOf(TessellationSystem);
        });

        it('should have nodes at intersections', () => {
            const tess = system.tessellation({
                pattern: 'truchet',
                bounds: { width: 100, height: 100 },
                tileSize: 20
            });
            expect(tess.nodes.vertices.length).toBeGreaterThan(0);
        });
    });

    describe('system.fromShape()', () => {
        it('should create a ShapeSystem from a ShapeContext', () => {
            const hex = shape.hexagon().radius(50);
            const sys = system.fromShape(hex);
            expect(sys).toBeInstanceOf(ShapeSystem);
        });

        it('should treat source shape as ephemeral', () => {
            const hex = shape.hexagon().radius(50);
            expect(hex.shape.ephemeral).toBe(false); // Before

            system.fromShape(hex);
            expect(hex.shape.ephemeral).toBe(true); // After - construction geometry
        });

        it('should have nodes matching source vertices', () => {
            const hex = shape.hexagon().radius(50);
            const sys = system.fromShape(hex);
            expect(sys.nodes.length).toBe(6); // Hexagon has 6 vertices
        });

        it('should include center node when requested', () => {
            const hex = shape.hexagon().radius(50);
            const sys = system.fromShape(hex, { includeCenter: true });
            expect(sys.nodes.length).toBe(7); // 6 vertices + 1 center
        });

        it('should support direct place() on system', () => {
            const hex = shape.hexagon().radius(50);
            const sys = system.fromShape(hex);
            const circle = shape.circle().radius(5);

            // Should be able to place directly on the system
            const result = sys.place(circle);
            expect(result).toBe(sys); // Returns this for chaining
        });

        it('should mark placed shape as ephemeral', () => {
            const hex = shape.hexagon().radius(50);
            const sys = system.fromShape(hex);
            const circle = shape.circle().radius(5);

            expect(circle.shape.ephemeral).toBe(false); // Before
            sys.place(circle);
            expect(circle.shape.ephemeral).toBe(true); // After - construction geometry
        });

        it('should render placements but not source shape without trace()', () => {
            const hex = shape.hexagon().radius(50);
            const sys = system.fromShape(hex);
            const circle = shape.circle().radius(5);

            sys.place(circle);

            const collector = new SVGCollector();
            sys.stamp(collector);

            // Should have placements (circles at each node)
            expect(collector.length).toBe(6); // One circle per vertex
        });

        it('should render source shape when traced', () => {
            const hex = shape.hexagon().radius(50);
            const sys = system.fromShape(hex).trace();

            const collector = new SVGCollector();
            sys.stamp(collector);

            // Should have the traced hexagon
            expect(collector.length).toBe(1);
        });

        it('should subdivide edges when requested', () => {
            const square = shape.square().size(100);
            const sys = system.fromShape(square, { subdivide: 3 });

            // 4 vertices × 3 subdivisions = 12 nodes (each edge has 3 points including start)
            // Actually: 4 edges × 3 = 12 total nodes
            expect(sys.nodes.length).toBe(12);
        });
    });
});
