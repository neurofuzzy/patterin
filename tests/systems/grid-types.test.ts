import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { GridSystem, SVGCollector, shape } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

/** Helper: Render grid with cyan traces and magenta nodes */
function renderGrid(grid: ReturnType<typeof GridSystem.create>, width: number, height: number): string {
    const collector = new SVGCollector();

    // Trace cells in cyan
    grid.trace();
    grid.cells.stamp(collector, 0, 0, { stroke: '#00ffff', strokeWidth: 1, fill: 'none' });

    // Nodes as magenta circles
    for (const v of grid.nodes.vertices) {
        const circle = shape.circle().radius(3).numSegments(16).moveTo(v.x, v.y);
        circle.stamp(collector, 0, 0, { stroke: '#ff00ff', strokeWidth: 1, fill: '#ff00ff' });
    }

    return collector.toString({ width, height });
}

describe('Hexagonal Grid', () => {
    it('should create hex cells', () => {
        const grid = GridSystem.create({
            type: 'hexagonal',
            rows: 3,
            cols: 3,
            spacing: 20,
        });
        expect(grid.cells.length).toBe(9);
    });

    it('should have 6 vertices per hex cell', () => {
        const grid = GridSystem.create({
            type: 'hexagonal',
            rows: 2,
            cols: 2,
            spacing: 20,
        });
        const cell = grid.cells.shapes[0];
        expect(cell.vertices.length).toBe(6);
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
    it('should create triangle cells', () => {
        const grid = GridSystem.create({
            type: 'triangular',
            rows: 4,
            cols: 6,
            spacing: 30,
        });
        expect(grid.cells.length).toBe(24);
    });

    it('should have 3 vertices per triangle', () => {
        const grid = GridSystem.create({
            type: 'triangular',
            rows: 2,
            cols: 2,
            spacing: 30,
        });
        const cell = grid.cells.shapes[0];
        expect(cell.vertices.length).toBe(3);
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

describe('Brick Grid', () => {
    it('should create brick cells', () => {
        const grid = GridSystem.create({
            type: 'brick',
            rows: 4,
            cols: 6,
            spacing: { x: 40, y: 20 },
        });
        expect(grid.cells.length).toBe(24);
    });

    it('should have 4 vertices per brick', () => {
        const grid = GridSystem.create({
            type: 'brick',
            rows: 2,
            cols: 2,
            spacing: 30,
        });
        const cell = grid.cells.shapes[0];
        expect(cell.vertices.length).toBe(4);
    });

    it('offset 0.5 should work (running bond)', () => {
        const grid = GridSystem.create({
            type: 'brick',
            rows: 5,
            cols: 8,
            spacing: { x: 40, y: 20 },
            brickOffset: 0.5,
        });
        const svg = renderGrid(grid, 400, 200);
        expect(svg).toContain('<path');
        writeFileSync('test-output/brick-grid.svg', svg);
    });

    it('offset 0 should align columns (stack bond)', () => {
        const grid = GridSystem.create({
            type: 'brick',
            rows: 3,
            cols: 4,
            spacing: { x: 40, y: 20 },
            brickOffset: 0,
        });
        // All nodes in same column should have same x
        const nodesByCol = new Map<number, number[]>();
        for (const v of grid.nodes.vertices) {
            const col = Math.round(v.x / 40);
            if (!nodesByCol.has(col)) nodesByCol.set(col, []);
            nodesByCol.get(col)!.push(v.x);
        }
        // Check that each column has consistent x values
        for (const xValues of nodesByCol.values()) {
            const first = xValues[0];
            for (const x of xValues) {
                expect(Math.abs(x - first)).toBeLessThan(1);
            }
        }
    });
});

describe('Grid Tracing', () => {
    it('trace() should make cells renderable', () => {
        const grid = GridSystem.create({
            type: 'square',
            rows: 3,
            cols: 3,
            spacing: 20,
        });
        const svg1 = grid.toSVG({ width: 200, height: 200 });
        expect(svg1).not.toContain('<path'); // No placements, no traced cells

        grid.trace();
        const svg2 = grid.toSVG({ width: 200, height: 200 });
        expect(svg2).toContain('<path'); // Traced cells render
    });

    it('cells should be ephemeral by default', () => {
        const grid = GridSystem.create({
            type: 'hexagonal',
            rows: 2,
            cols: 2,
            spacing: 20,
        });
        const cell = grid.cells.shapes[0];
        expect(cell.ephemeral).toBe(true);
    });
});
