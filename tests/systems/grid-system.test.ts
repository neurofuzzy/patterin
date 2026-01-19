import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { shape, GridSystem } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

describe('GridSystem', () => {
    it('should create correct number of nodes', () => {
        const grid = GridSystem.create({ rows: 3, cols: 3, spacing: 100 });
        // 4 rows * 4 cols = 16 nodes
        expect(grid.nodes.length).toBe(16);
    });


    it('nodes.every(2) should select half the nodes', () => {
        const grid = GridSystem.create({ rows: 2, cols: 2, spacing: 100 });
        // 3x3 = 9 nodes, every(2) = 5
        const selected = grid.nodes.every(2);
        expect(selected.length).toBe(5);
    });

    it('place should add shapes to output', () => {
        const grid = GridSystem.create({ rows: 3, cols: 3, spacing: 100 });
        grid.nodes.place(shape.circle().radius(10), { stroke: '#000', strokeWidth: 2 });

        const svg = grid.toSVG({ width: 400, height: 400, margin: 20 });
        const pathCount = (svg.match(/<path/g) || []).length;

        expect(pathCount).toBe(16);
        expect(svg).toContain('stroke="#000"');
        writeFileSync('test-output/grid-system.svg', svg);
    });

    it('should support node placements with every()', () => {
        const grid = GridSystem.create({ rows: 2, cols: 2, spacing: 100 });
        grid.nodes.place(shape.square().size(30), { stroke: '#000', strokeWidth: 2 });
        grid.nodes.every(2).place(shape.circle().radius(8), { stroke: '#333', fill: '#ff0' });

        const svg = grid.toSVG({ width: 300, height: 300, margin: 20 });
        const pathCount = (svg.match(/<path/g) || []).length;

        expect(pathCount).toBeGreaterThan(4);
        expect(svg).toContain('fill="#ff0"');
        writeFileSync('test-output/grid-alternating.svg', svg);
    });

    it('toSVG should scale content to fit', () => {
        const grid = GridSystem.create({ rows: 1, cols: 1, spacing: 1000 });
        grid.nodes.place(shape.circle().radius(50), { stroke: '#000' });

        // Even with large spacing, should fit in 100x100
        const svg = grid.toSVG({ width: 100, height: 100, margin: 10 });
        expect(svg).toContain('width="100"');
        expect(svg).toContain('height="100"');
    });
});
