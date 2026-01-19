import { test, expect } from 'vitest';
import { LSystem } from '../../src/systems/LSystem.ts';

test('LSystem: Koch Curve', () => {
    const koch = LSystem.create({
        axiom: 'F',
        rules: { 'F': 'F+F-F-F+F' },
        iterations: 1,
        angle: 90,
        length: 10
    });

    // Iteration 1: F+F-F-F+F (5 segments)
    expect(koch.segments.length).toBe(5);

    // Endpoint Check
    // (0,0) -> (10,0) -> (10,10) -> (20,10) -> (20,0) -> (30,0)
    const lastNode = koch.nodes.vertices[koch.nodes.length - 1];
    expect(lastNode.x).toBeCloseTo(30);
    expect(lastNode.y).toBeCloseTo(0);
});

test('LSystem: Branching Plant', () => {
    const plant = LSystem.create({
        axiom: 'X',
        rules: {
            'X': 'F[+X][-X]FX',
            'F': 'FF'
        },
        iterations: 1,
        angle: 45,
        length: 10
    });

    // Iteration 1 for X: F[+X][-X]FX
    // F draws. [+X] branches. [-X] branches. F draws.
    // 2 segments drawn.
    expect(plant.segments.length).toBe(2);
});

test('LSystem: PathContext', () => {
    const plant = LSystem.create({
        axiom: 'F',
        rules: {},
        iterations: 1,
        angle: 0,
        length: 20
    });

    // Just F, length 20.
    expect(plant.path).toBeDefined();
    expect(plant.path.length).toBeCloseTo(20);
});

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { beforeAll } from 'vitest';

beforeAll(() => {
    if (!existsSync('test-output')) {
        mkdirSync('test-output');
    }
});

test('LSystem: Generate SVG Output', () => {
    // 1. Fractal Plant
    const plant = LSystem.create({
        axiom: 'X',
        rules: {
            'X': 'F+[[X]-X]-F[-FX]+X',
            'F': 'FF'
        },
        iterations: 4,
        angle: 25,
        length: 5
    });

    plant.trace();
    const svg = plant.toSVG({ width: 500, height: 500 });
    writeFileSync('test-output/lsystem-plant.svg', svg);
    expect(svg).toContain('<path');
    expect(svg).not.toMatch(/d="[^"]*Z"/); // Should NOT end with Z

    // 2. Dragon Curve
    const dragon = LSystem.create({
        axiom: 'F',
        rules: {
            'F': 'F+G',
            'G': 'F-G'
        },
        iterations: 10,
        angle: 90,
        length: 5
    });

    dragon.trace();
    const svg2 = dragon.toSVG({ width: 500, height: 500 });
    writeFileSync('test-output/lsystem-dragon.svg', svg2);
    expect(svg2).toContain('<path');

    // 3. Koch Snowflake
    const snowflake = LSystem.create({
        axiom: 'F++F++F',
        rules: { 'F': 'F-F++F-F' },
        iterations: 4,
        angle: 60,
        length: 2
    });
    snowflake.trace();
    const svg3 = snowflake.toSVG({ width: 500, height: 500 });
    writeFileSync('test-output/lsystem-snowflake.svg', svg3);

    // Check closure roughly (start approx equals end)
    const firstNode = snowflake.nodes.vertices[0];
    const lastNode = snowflake.nodes.vertices[snowflake.nodes.length - 1];
    expect(firstNode.x).toBeCloseTo(lastNode.x, 1);
    expect(firstNode.y).toBeCloseTo(lastNode.y, 1);

    // 4. Hilbert Curve
    const hilbert = LSystem.create({
        axiom: 'A',
        rules: {
            'A': '-BF+AFA+FB-',
            'B': '+AF-BFB-FA+'
        },
        iterations: 5,
        angle: 90,
        length: 10
    });
    hilbert.trace();
    const svg4 = hilbert.toSVG({ width: 500, height: 500 });
    writeFileSync('test-output/lsystem-hilbert.svg', svg4);
    expect(svg4).toContain('<path');

    // 5. Sierpinski Triangle
    const sierpinski = LSystem.create({
        axiom: 'F',
        rules: {
            'F': 'G-F-G',
            'G': 'F+G+F'
        },
        iterations: 6,
        angle: 60,
        length: 2
    });
    sierpinski.trace();
    const svg5 = sierpinski.toSVG({ width: 500, height: 500 });
    writeFileSync('test-output/lsystem-sierpinski.svg', svg5);
    expect(svg5).toContain('<path');

    // 6. Gosper Curve
    const gosper = LSystem.create({
        axiom: 'F',
        rules: {
            'F': 'F+G++G-F--FF-G+',
            'G': '-F+GG++G+F--F-G'
        },
        iterations: 4,
        angle: 60,
        length: 5
    });
    gosper.trace();
    const svg6 = gosper.toSVG({ width: 500, height: 500 });
    writeFileSync('test-output/lsystem-gosper.svg', svg6);
    expect(svg6).toContain('<path');
});
