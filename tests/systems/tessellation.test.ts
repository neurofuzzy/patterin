import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { TessellationSystem, SVGCollector, shape } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

/** Helper: Render tessellation with cyan traces and magenta nodes */
function renderTess(tess: ReturnType<typeof TessellationSystem.create>, width: number, height: number): string {
    const collector = new SVGCollector();

    // Trace tiles in cyan
    tess.trace();
    tess.tiles.stamp(collector, 0, 0, { stroke: '#00ffff', strokeWidth: 1, fill: 'none' });

    // Nodes as magenta circles
    for (const v of tess.nodes.vertices) {
        const circle = shape.circle().radius(3).numSegments(16).moveTo(v.x, v.y);
        circle.stamp(collector, 0, 0, { stroke: '#ff00ff', strokeWidth: 1, fill: '#ff00ff' });
    }

    return collector.toString({ width, height });
}

describe('Truchet Tessellation', () => {
    it('should create tiles based on bounds and tileSize', () => {
        const tess = TessellationSystem.create({
            pattern: 'truchet',
            bounds: { width: 100, height: 100 },
            tileSize: 20,
        });
        // 5 cols * 5 rows = 25 tiles
        expect(tess.tiles.length).toBe(25);
    });

    it('should be deterministic with same seed', () => {
        const tess1 = TessellationSystem.create({
            pattern: 'truchet',
            bounds: { width: 100, height: 100 },
            tileSize: 20,
            seed: 42,
        });
        const tess2 = TessellationSystem.create({
            pattern: 'truchet',
            bounds: { width: 100, height: 100 },
            tileSize: 20,
            seed: 42,
        });

        tess1.trace();
        tess2.trace();

        const svg1 = tess1.toSVG({ width: 200, height: 200 });
        const svg2 = tess2.toSVG({ width: 200, height: 200 });
        expect(svg1).toBe(svg2);
    });

    it('quarter-circles variant should generate SVG', () => {
        const tess = TessellationSystem.create({
            pattern: 'truchet',
            bounds: { width: 200, height: 200 },
            tileSize: 25,
            variant: 'quarter-circles',
            seed: 12345,
        });
        const svg = renderTess(tess, 400, 400);
        expect(svg).toContain('<path');
        expect(svg).toContain('#00ffff'); // cyan traces
        expect(svg).toContain('#ff00ff'); // magenta nodes
        writeFileSync('test-output/truchet-circles.svg', svg);
    });

    it('diagonal variant should generate SVG', () => {
        const tess = TessellationSystem.create({
            pattern: 'truchet',
            bounds: { width: 200, height: 200 },
            tileSize: 20,
            variant: 'diagonal',
            seed: 67890,
        });
        const svg = renderTess(tess, 400, 400);
        expect(svg).toContain('<path');
        writeFileSync('test-output/truchet-diagonal.svg', svg);
    });
});

describe('Trihexagonal Tessellation', () => {
    it('should create hexagons and triangles', () => {
        const tess = TessellationSystem.create({
            pattern: 'trihexagonal',
            bounds: { width: 150, height: 150 },
            spacing: 30,
        });
        expect(tess.hexagons.length).toBeGreaterThan(0);
        expect(tess.triangles.length).toBeGreaterThan(0);
    });

    it('hexagons should have 6 vertices', () => {
        const tess = TessellationSystem.create({
            pattern: 'trihexagonal',
            bounds: { width: 100, height: 100 },
            spacing: 30,
        });
        const hex = tess.hexagons.shapes[0];
        expect(hex.vertices.length).toBe(6);
    });

    it('should generate visual SVG', () => {
        const tess = TessellationSystem.create({
            pattern: 'trihexagonal',
            bounds: { width: 300, height: 300 },
            spacing: 40,
        });
        const svg = renderTess(tess, 400, 400);
        expect(svg).toContain('<path');
        writeFileSync('test-output/trihexagonal.svg', svg);
    });
});

describe('Penrose Tessellation', () => {
    it('should create kites and darts', () => {
        const tess = TessellationSystem.create({
            pattern: 'penrose',
            bounds: { width: 200, height: 200 },
            iterations: 3,
        });
        expect(tess.kites.length).toBeGreaterThan(0);
        expect(tess.darts.length).toBeGreaterThan(0);
    });

    it('should have triangular tiles', () => {
        const tess = TessellationSystem.create({
            pattern: 'penrose',
            bounds: { width: 100, height: 100 },
            iterations: 3,
        });
        const tile = tess.tiles.shapes[0];
        expect(tile.vertices.length).toBe(3);
    });

    it('should be deterministic with same seed', () => {
        const tess1 = TessellationSystem.create({
            pattern: 'penrose',
            bounds: { width: 100, height: 100 },
            iterations: 3,
            seed: 999,
        });
        const tess2 = TessellationSystem.create({
            pattern: 'penrose',
            bounds: { width: 100, height: 100 },
            iterations: 3,
            seed: 999,
        });

        expect(tess1.tiles.length).toBe(tess2.tiles.length);
    });

    it('should generate visual SVG', () => {
        const tess = TessellationSystem.create({
            pattern: 'penrose',
            bounds: { width: 400, height: 400 },
            iterations: 4,
            seed: 42,
        });
        const svg = renderTess(tess, 400, 400);
        expect(svg).toContain('<path');
        writeFileSync('test-output/penrose.svg', svg);
    });
});

describe('Custom Tessellation', () => {
    it('should repeat custom unit shape', () => {
        const unit = shape.circle().radius(10).numSegments(8);
        const tess = TessellationSystem.create({
            pattern: 'custom',
            bounds: { width: 100, height: 100 },
            unit,
            spacing: 30,
        });
        expect(tess.tiles.length).toBeGreaterThan(0);
    });

    it('should support hexagonal arrangement', () => {
        const unit = shape.hexagon().radius(15);
        const tess = TessellationSystem.create({
            pattern: 'custom',
            bounds: { width: 150, height: 150 },
            unit,
            spacing: 35,
            arrangement: 'hexagonal',
        });
        const svg = renderTess(tess, 400, 400);
        expect(svg).toContain('<path');
        writeFileSync('test-output/custom-hex-tess.svg', svg);
    });
});

describe('TessellationSystem Tracing', () => {
    it('tiles should be ephemeral by default', () => {
        const tess = TessellationSystem.create({
            pattern: 'truchet',
            bounds: { width: 100, height: 100 },
            tileSize: 20,
        });
        const tile = tess.tiles.shapes[0];
        expect(tile.ephemeral).toBe(true);
    });

    it('trace() should make tiles renderable', () => {
        const tess = TessellationSystem.create({
            pattern: 'truchet',
            bounds: { width: 100, height: 100 },
            tileSize: 20,
        });
        const svg1 = tess.toSVG({ width: 200, height: 200 });
        expect(svg1).not.toContain('<path');

        tess.trace();
        const svg2 = tess.toSVG({ width: 200, height: 200 });
        expect(svg2).toContain('<path');
    });
});
