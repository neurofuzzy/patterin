/**
 * QuiltSystem Example - Alternating Block Patterns
 * 
 * Demonstrates using every() to apply different quilt blocks to specific positions.
 */

import { system, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create a 4x4 quilt grid
const quilt = system.quilt({
    gridSize: [4, 4],
    blockSize: 80
});

// Apply BrokenDishes to even positions (0, 2, 4, ...)
quilt.every(2).placeBlock('BD');

// Apply FriendshipStar to odd positions (1, 3, 5, ...)
quilt.every(2, 1).placeBlock('FS');

// Stamp to SVG - shapes are grouped by 'light' and 'dark'
const shapes = quilt.shapes;
shapes.shapes.forEach(shape => {
    const color = shape.group === 'dark' ? '#3498db' : '#ecf0f1';
    svg.addShape(shape, { fill: color, stroke: '#2c3e50', strokeWidth: 1 });
});

const size = 4 * 80 + 40;
saveOutput(svg.toString({ width: size, height: size, margin: 20 }), 'quilt-alternating.svg');
console.log('✓ Generated: examples/output/quilt-alternating.svg');
