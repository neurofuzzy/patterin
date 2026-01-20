import { describe, it, expect } from 'vitest';
import { system, shape, SVGCollector } from '../../src/index';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Helper to save test output
const saveTestOutput = (svg: string, filename: string) => {
    const outputDir = join(process.cwd(), 'test-output');
    try {
        mkdirSync(outputDir, { recursive: true });
    } catch (e) {
        // Directory might already exist
    }
    writeFileSync(join(outputDir, filename), svg);
    console.log(`Generated test-output/${filename}`);
};

describe('QuiltSystem', () => {
    describe('Basic Creation', () => {
        it('should create a quilt system with correct dimensions', () => {
            const quilt = system.quilt({
                gridSize: [3, 3],
                blockSize: 60
            });

            expect(quilt).toBeDefined();
            expect(quilt.length).toBe(9); // 3x3 = 9 blocks
            
            const bounds = quilt.getBounds();
            expect(bounds.minX).toBe(0);
            expect(bounds.minY).toBe(0);
            expect(bounds.maxX).toBe(180); // 3 * 60
            expect(bounds.maxY).toBe(180);
        });

        it('should create 4x4 quilt', () => {
            const quilt = system.quilt({
                gridSize: [4, 4],
                blockSize: 100
            });

            expect(quilt.length).toBe(16);
            const bounds = quilt.getBounds();
            expect(bounds.maxX).toBe(400);
            expect(bounds.maxY).toBe(400);
        });

        it('should use default block template', () => {
            const quilt = system.quilt({
                gridSize: [2, 2],
                blockSize: 50
            });

            // Should have default pinwheel blocks
            const shapes = quilt.shapes.shapes;
            expect(shapes.length).toBeGreaterThan(0);
        });
    });

    describe('QuiltPatternContext', () => {
        it('should provide pattern context', () => {
            const quilt = system.quilt({
                gridSize: [3, 3],
                blockSize: 60
            });

            expect(quilt.pattern).toBeDefined();
            expect(quilt.pattern.constructor.name).toBe('QuiltPatternContext');
        });

        it('should place blocks using pattern.placeBlock()', () => {
            const quilt = system.quilt({
                gridSize: [2, 2],
                blockSize: 80
            });

            quilt.pattern.placeBlock('PW');
            const shapes = quilt.shapes.shapes;
            
            // Pinwheel is a 2x2 four-patch, so each block has multiple shapes
            expect(shapes.length).toBeGreaterThan(0);
            
            // Verify shapes have groups
            const hasGroups = shapes.some(s => s.group === 'dark' || s.group === 'light');
            expect(hasGroups).toBe(true);

            // Export test output with colors
            const svg = new SVGCollector();
            shapes.forEach(s => {
                const color = s.group === 'dark' ? '#333' : '#999';
                svg.addShape(s, { fill: color, stroke: '#000', strokeWidth: 1 });
            });
            saveTestOutput(svg.toString({ width: 200, height: 200 }), 'quilt-basic-pinwheel.svg');
        });

        it('should support block shortcuts', () => {
            const quilt = system.quilt({
                gridSize: [1, 1],
                blockSize: 60
            });

            // Test various shortcuts
            expect(() => quilt.pattern.placeBlock('PW')).not.toThrow(); // Pinwheel
            expect(() => quilt.pattern.placeBlock('BD')).not.toThrow(); // Broken Dishes
            expect(() => quilt.pattern.placeBlock('FS')).not.toThrow(); // Friendship Star
            expect(() => quilt.pattern.placeBlock('SF')).not.toThrow(); // Shoo Fly
            expect(() => quilt.pattern.placeBlock('BT')).not.toThrow(); // Bow Tie
            expect(() => quilt.pattern.placeBlock('DP')).not.toThrow(); // Dutchman's Puzzle
            expect(() => quilt.pattern.placeBlock('SS')).not.toThrow(); // Sawtooth Star
        });

        it('should support full block names', () => {
            const quilt = system.quilt({
                gridSize: [1, 1],
                blockSize: 60
            });

            expect(() => quilt.pattern.placeBlock('pinwheel')).not.toThrow();
            expect(() => quilt.pattern.placeBlock('brokenDishes')).not.toThrow();
            expect(() => quilt.pattern.placeBlock('friendshipStar')).not.toThrow();
        });

        it('should throw error for unknown block', () => {
            const quilt = system.quilt({
                gridSize: [1, 1],
                blockSize: 60
            });

            expect(() => quilt.pattern.placeBlock('INVALID')).toThrow();
        });
    });

    describe('Selection Methods', () => {
        it('should select every nth block', () => {
            const quilt = system.quilt({
                gridSize: [4, 4],
                blockSize: 50
            });

            // Place different blocks on even/odd positions
            quilt.pattern.every(2).placeBlock('BD');
            quilt.pattern.every(2, 1).placeBlock('FS');

            const shapes = quilt.shapes.shapes;
            expect(shapes.length).toBeGreaterThan(0);

            // Export test output with colors
            const svg = new SVGCollector();
            shapes.forEach(s => {
                const color = s.group === 'dark' ? '#9b59b6' : '#ecf0f1';
                svg.addShape(s, { fill: color, stroke: '#2c3e50', strokeWidth: 1 });
            });
            saveTestOutput(svg.toString({ width: 250, height: 250 }), 'quilt-every-alternating.svg');
        });

        it('should select slice of blocks', () => {
            const quilt = system.quilt({
                gridSize: [3, 3],
                blockSize: 60
            });

            quilt.pattern.slice(0, 3).placeBlock('PW');
            quilt.pattern.slice(3, 6).placeBlock('BD');
            quilt.pattern.slice(6, 9).placeBlock('FS');

            const shapes = quilt.shapes.shapes;
            expect(shapes.length).toBeGreaterThan(0);
        });

        it('should select blocks at specific indices', () => {
            const quilt = system.quilt({
                gridSize: [3, 3],
                blockSize: 60
            });

            // Place blocks at corners (0, 2, 6, 8)
            quilt.pattern.at(0, 2, 6, 8).placeBlock('FS');
            // Place blocks at sides
            quilt.pattern.at(1, 3, 5, 7).placeBlock('BD');
            // Place block at center
            quilt.pattern.at(4).placeBlock('SS');

            const shapes = quilt.shapes.shapes;
            expect(shapes.length).toBeGreaterThan(0);

            // Export test output with colors
            const svg = new SVGCollector();
            shapes.forEach(s => {
                const color = s.group === 'dark' ? '#333' : '#999';
                svg.addShape(s, { fill: color, stroke: '#000', strokeWidth: 1 });
            });
            saveTestOutput(svg.toString({ width: 250, height: 250 }), 'quilt-at-custom-layout.svg');
        });

        it('should clear selection with all()', () => {
            const quilt = system.quilt({
                gridSize: [2, 2],
                blockSize: 80
            });

            quilt.pattern.all().placeBlock('PW');
            const shapes = quilt.shapes.shapes;
            expect(shapes.length).toBeGreaterThan(0);
        });

        it('should return QuiltSystem from placeBlock() for chaining', () => {
            const quilt = system.quilt({
                gridSize: [3, 3],
                blockSize: 60
            });

            const result = quilt.pattern.every(2).placeBlock('BD');
            expect(result).toBe(quilt);

            // Should allow further operations
            result.pattern.every(2, 1).placeBlock('FS');
        });
    });

    describe('Shape Groups', () => {
        it('should tag shapes with light/dark groups', () => {
            const quilt = system.quilt({
                gridSize: [1, 1],
                blockSize: 60
            });

            quilt.pattern.placeBlock('PW');
            const shapes = quilt.shapes.shapes;

            const darkShapes = shapes.filter(s => s.group === 'dark');
            const lightShapes = shapes.filter(s => s.group === 'light');

            expect(darkShapes.length).toBeGreaterThan(0);
            expect(lightShapes.length).toBeGreaterThan(0);

            // Export test output with colors
            const svg = new SVGCollector();
            shapes.forEach(s => {
                const color = s.group === 'dark' ? '#e74c3c' : '#ecf0f1';
                svg.addShape(s, { fill: color, stroke: '#2c3e50', strokeWidth: 2 });
            });
            saveTestOutput(svg.toString({ width: 100, height: 100 }), 'quilt-groups-colored.svg');
        });

        it('should generate correct shapes for different block types', () => {
            const blockSize = 60;
            const svg = new SVGCollector();

            // Test all block types in a grid
            const blocks = [
                { name: 'PW', label: 'Pinwheel' },
                { name: 'BD', label: 'Broken Dishes' },
                { name: 'FS', label: 'Friendship Star' },
                { name: 'SF', label: 'Shoo Fly' },
                { name: 'BT', label: 'Bow Tie' },
                { name: 'DP', label: 'Dutchman\'s Puzzle' },
                { name: 'SS', label: 'Sawtooth Star' }
            ];

            blocks.forEach((block, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                
                const quilt = system.quilt({
                    gridSize: [1, 1],
                    blockSize
                });
                quilt.pattern.placeBlock(block.name);
                expect(quilt.shapes.shapes.length).toBeGreaterThan(0);

                // Add to sampler with offset
                const shapes = quilt.shapes.shapes;
                shapes.forEach(s => {
                    const translated = s.clone();
                    translated.translate({ x: col * 70, y: row * 70 });
                    const color = s.group === 'dark' ? '#333' : '#999';
                    svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
                });
            });

            saveTestOutput(svg.toString({ width: 280, height: 210 }), 'quilt-all-blocks-sampler.svg');
        });
    });

    describe('Inherited BaseSystem Features', () => {
        it('should support scale transformation', () => {
            const quilt = system.quilt({
                gridSize: [2, 2],
                blockSize: 50
            });

            quilt.pattern.placeBlock('PW');
            
            const boundsBeforeScale = quilt.getBounds();
            quilt.scale(2);
            const boundsAfterScale = quilt.getBounds();

            expect(boundsAfterScale.maxX).toBeCloseTo(boundsBeforeScale.maxX * 2, 1);
            expect(boundsAfterScale.maxY).toBeCloseTo(boundsBeforeScale.maxY * 2, 1);
        });

        it('should support rotate transformation', () => {
            const quilt = system.quilt({
                gridSize: [2, 2],
                blockSize: 50
            });

            quilt.pattern.placeBlock('PW');
            
            expect(() => quilt.rotate(45)).not.toThrow();
        });

        it('should support mask operation', () => {
            const quilt = system.quilt({
                gridSize: [5, 5],
                blockSize: 40
            });

            quilt.pattern.placeBlock('PW');
            
            const lengthBefore = quilt.length;
            expect(lengthBefore).toBe(25); // 5x5

            const maskCircle = shape.circle().radius(100);
            quilt.mask(maskCircle);

            const lengthAfter = quilt.length;
            expect(lengthAfter).toBeLessThan(lengthBefore);
            expect(lengthAfter).toBeGreaterThan(0);

            // Export test output showing masked quilt with colors
            const shapes = quilt.shapes.shapes;
            const svg = new SVGCollector();
            shapes.forEach(s => {
                const color = s.group === 'dark' ? '#333' : '#999';
                svg.addShape(s, { fill: color, stroke: '#000', strokeWidth: 1 });
            });
            saveTestOutput(svg.toString({ width: 250, height: 250 }), 'quilt-masked-circle.svg');
        });

        it('should support trace operation', () => {
            const quilt = system.quilt({
                gridSize: [2, 2],
                blockSize: 60
            });

            quilt.pattern.placeBlock('BD');
            
            expect(() => quilt.trace()).not.toThrow();
        });

        it('should support stamp to SVG collector', () => {
            const quilt = system.quilt({
                gridSize: [2, 2],
                blockSize: 60
            });

            quilt.pattern.placeBlock('PW');
            quilt.trace();

            const svg = new SVGCollector();
            expect(() => quilt.stamp(svg)).not.toThrow();
            
            const output = svg.toString({ width: 200, height: 200 });
            expect(output).toContain('svg');
            expect(output).toContain('path');
        });

        it('should support toSVG direct rendering', () => {
            const quilt = system.quilt({
                gridSize: [2, 2],
                blockSize: 60
            });

            quilt.pattern.placeBlock('BD');
            quilt.trace();

            const svg = quilt.toSVG({ width: 200, height: 200 });
            expect(svg).toContain('svg');
            expect(svg).toContain('viewBox');
        });
    });

    describe('Complete Examples', () => {
        it('should create alternating block pattern', () => {
            const quilt = system.quilt({
                gridSize: [4, 4],
                blockSize: 80
            });

            quilt.pattern.every(2).placeBlock('BD');
            quilt.pattern.every(2, 1).placeBlock('FS');

            const shapes = quilt.shapes.shapes;
            expect(shapes.length).toBeGreaterThan(0);

            // Verify we have both light and dark shapes
            const darkCount = shapes.filter(s => s.group === 'dark').length;
            const lightCount = shapes.filter(s => s.group === 'light').length;
            expect(darkCount).toBeGreaterThan(0);
            expect(lightCount).toBeGreaterThan(0);

            // Export with colors
            const svg = new SVGCollector();
            shapes.forEach(s => {
                const color = s.group === 'dark' ? '#333' : '#999';
                svg.addShape(s, { fill: color, stroke: '#000', strokeWidth: 1 });
            });
            saveTestOutput(svg.toString({ width: 360, height: 360 }), 'quilt-alternating-colored.svg');
        });

        it('should create sampler with multiple block types', () => {
            const svg = new SVGCollector();
            const blocks = ['PW', 'BD', 'FS', 'SF', 'BT', 'DP', 'SS', 'PW', 'BD'];
            const colors = [
                { dark: '#3498db', light: '#ecf0f1' },
                { dark: '#1abc9c', light: '#16a085' },
                { dark: '#e74c3c', light: '#ecf0f1' },
                { dark: '#9b59b6', light: '#ecf0f1' },
                { dark: '#34495e', light: '#ecf0f1' },
                { dark: '#e67e22', light: '#ecf0f1' },
                { dark: '#f39c12', light: '#ecf0f1' },
                { dark: '#27ae60', light: '#ecf0f1' },
                { dark: '#c0392b', light: '#f1c40f' }
            ];

            blocks.forEach((blockName, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                
                const quilt = system.quilt({
                    gridSize: [1, 1],
                    blockSize: 60
                });
                quilt.pattern.placeBlock(blockName);

                const shapes = quilt.shapes.shapes;
                expect(shapes.length).toBeGreaterThan(0);

                shapes.forEach(shape => {
                    const translated = shape.clone();
                    translated.translate({ x: col * 70, y: row * 70 });
                    const color = shape.group === 'dark' ? colors[index].dark : colors[index].light;
                    svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
                });
            });

            const output = svg.toString({ width: 250, height: 250 });
            expect(output).toContain('svg');
            expect(output.length).toBeGreaterThan(1000); // Should have substantial content
            
            saveTestOutput(output, 'quilt-sampler-multicolor.svg');
        });

        it('should create custom layout with specific blocks', () => {
            const quilt = system.quilt({
                gridSize: [3, 3],
                blockSize: 60
            });

            // Corners: Friendship Star
            quilt.pattern.at(0, 2, 6, 8).placeBlock('FS');
            // Sides: Broken Dishes
            quilt.pattern.at(1, 3, 5, 7).placeBlock('BD');
            // Center: Sawtooth Star
            quilt.pattern.at(4).placeBlock('SS');

            const shapes = quilt.shapes.shapes;
            expect(shapes.length).toBeGreaterThan(0);

            // Should render correctly
            quilt.trace();
            const svg = new SVGCollector();
            quilt.stamp(svg);
            const output = svg.toString({ width: 200, height: 200 });
            expect(output).toContain('svg');
            
            saveTestOutput(output, 'quilt-custom-layout.svg');
        });
    });
});
