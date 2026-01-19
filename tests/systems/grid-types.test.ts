import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { GridSystem, SVGCollector, shape } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

/** Helper: Render grid with cyan edges and magenta nodes */
function renderGrid(grid: ReturnType<typeof GridSystem.create>, width: number, height: number): string {
    const collector = new SVGCollector();

    // Trace edges in cyan
    grid.trace();
    grid.stamp(collector, { stroke: '#00ffff', strokeWidth: 1, fill: 'none' });

    // Nodes as magenta circles
    for (const v of grid.nodes.vertices) {
        const circle = shape.circle().radius(3).numSegments(16).moveTo(v.x, v.y);
        circle.stamp(collector, 0, 0, { stroke: '#ff00ff', strokeWidth: 1, fill: '#ff00ff' });
    }

    return collector.toString({ width, height });
}

describe('Hexagonal Grid', () => {
    it('should create hex intersection nodes', () => {
        const grid = GridSystem.create({
            type: 'hexagonal',
            rows: 3,
            cols: 3,
            spacing: 20,
        });
        // 3x3 hex grid has many shared vertices at intersections
        expect(grid.nodes.vertices.length).toBeGreaterThan(9);
    });

    it('pointy orientation should work', () => {
        const grid = GridSystem.create({
            type: 'hexagonal',
            rows: 4,
            cols: 5,
            spacing: 30,
            orientation: 'pointy',
        });
        const svg = renderGrid(grid, 400, 400);
        expect(svg).toContain('<path');
        expect(svg).toContain('#00ffff'); // cyan traces
        expect(svg).toContain('#ff00ff'); // magenta nodes
        writeFileSync('test-output/hex-grid-pointy.svg', svg);
    });

    it('flat orientation should work', () => {
        const grid = GridSystem.create({
            type: 'hexagonal',
            rows: 4,
            cols: 5,
            spacing: 30,
            orientation: 'flat',
        });
        const svg = renderGrid(grid, 400, 400);
        expect(svg).toContain('<path');
        writeFileSync('test-output/hex-grid-flat.svg', svg);
    });
});

describe('Triangular Grid', () => {
    it('should create triangle intersection nodes', () => {
        const grid = GridSystem.create({
            type: 'triangular',
            rows: 4,
            cols: 6,
            spacing: 30,
        });
        // Triangular grid has vertices at triangle corners (shared between adjacent triangles)
        expect(grid.nodes.vertices.length).toBeGreaterThan(10);
    });

    it('should generate visual SVG', () => {
        const grid = GridSystem.create({
            type: 'triangular',
            rows: 6,
            cols: 10,
            spacing: 40,
        });
        const svg = renderGrid(grid, 400, 400);
        expect(svg).toContain('<path');
        writeFileSync('test-output/triangular-grid.svg', svg);
    });
});

describe('Grid Tracing', () => {
    it('trace() should make grid edges renderable', () => {
        const grid = GridSystem.create({
            type: 'square',
            rows: 3,
            cols: 3,
            spacing: 20,
        });
        const svg1 = grid.toSVG({ width: 200, height: 200 });
        expect(svg1).not.toContain('<path'); // No placements, no traced edges

        grid.trace();
        const svg2 = grid.toSVG({ width: 200, height: 200 });
        expect(svg2).toContain('<path'); // Traced edges render as line network
    });

    it('should create nodes at grid intersections', () => {
        const grid = GridSystem.create({
            type: 'square',
            rows: 3,
            cols: 3,
            spacing: 20,
        });
        // Square grid 3x3 has (3+1) * (3+1) = 16 intersection nodes
        expect(grid.nodes.vertices.length).toBe(16);
    });
});
