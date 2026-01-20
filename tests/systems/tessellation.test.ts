import { describe, it, expect, beforeAll } from 'vitest';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { TessellationSystem, SVGCollector, shape } from '../../src/index.ts';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

/** Helper: Render tessellation with cyan edges and magenta nodes */
function renderTess(tess: ReturnType<typeof TessellationSystem.create>, width: number, height: number): string {
    const collector = new SVGCollector();

    // Trace edges in cyan
    tess.trace();
    tess.stamp(collector, { stroke: '#00ffff', strokeWidth: 1, fill: 'none' });

    // Nodes as magenta circles
    for (const v of tess.nodes.vertices) {
        const circle = shape.circle().radius(3).numSegments(16).moveTo(v.x, v.y);
        circle.stamp(collector, 0, 0, { stroke: '#ff00ff', strokeWidth: 1, fill: '#ff00ff' });
    }

    return collector.toString({ width, height });
}

describe('Trihexagonal Tessellation', () => {
    it('should create nodes at hexagon and triangle intersections', () => {
        const tess = TessellationSystem.create({
            pattern: 'trihexagonal',
            bounds: { width: 150, height: 150 },
            spacing: 30,
        });
        // Trihexagonal has vertices from hexagons and triangles
        expect(tess.nodes.vertices.length).toBeGreaterThan(10);
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
    it('should create nodes from triangle vertices', () => {
        const tess = TessellationSystem.create({
            pattern: 'penrose',
            bounds: { width: 200, height: 200 },
            iterations: 3,
        });
        // Penrose creates many triangle vertices
        expect(tess.nodes.vertices.length).toBeGreaterThan(10);
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

        expect(tess1.nodes.vertices.length).toBe(tess2.nodes.vertices.length);
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
    it('should extract vertices from custom unit shape', () => {
        const unit = shape.circle().radius(10).numSegments(8);
        const tess = TessellationSystem.create({
            pattern: 'custom',
            bounds: { width: 100, height: 100 },
            unit,
            spacing: 30,
        });
        // Custom tessellation extracts vertices from repeated unit shapes
        expect(tess.nodes.vertices.length).toBeGreaterThan(0);
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
    it('trace() should make tessellation edges renderable', () => {
        const tess = TessellationSystem.create({
            pattern: 'penrose',
            bounds: { width: 100, height: 100 },
            iterations: 3,
        });
        const svg1 = tess.toSVG({ width: 200, height: 200 });
        expect(svg1).not.toContain('<path');

        tess.trace();
        const svg2 = tess.toSVG({ width: 200, height: 200 });
        expect(svg2).toContain('<path'); // Traced edges render as line network
    });

    it('should create nodes at intersection points', () => {
        const tess = TessellationSystem.create({
            pattern: 'penrose',
            bounds: { width: 100, height: 100 },
            iterations: 3,
        });
        // Penrose creates triangle vertices
        expect(tess.nodes.vertices.length).toBeGreaterThan(10);
    });
});
