/**
 * Eight-Pointed Star (LeMoyne Star) Example
 * 
 * Classic quilt block featuring 8 diamond-shaped points radiating from the center.
 * One of the most iconic star patterns in traditional quilting.
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const eightPointedStar = pattern.eightPointedStar({
  blockSize: 120,
  bounds: { width: 480, height: 480 }
});

const svg = new SVGCollector();

// Star points - vibrant color
eightPointedStar.shapes.filter(s => s.group === 'star-point').forEach(shape => {
  svg.addShape(shape, { fill: '#e74c3c', stroke: '#000', strokeWidth: 1 });
});

// Corner squares - complementary color
eightPointedStar.shapes.filter(s => s.group === 'corner').forEach(shape => {
  svg.addShape(shape, { fill: '#f39c12', stroke: '#000', strokeWidth: 1 });
});

// Background triangles - neutral
eightPointedStar.shapes.filter(s => s.group === 'background').forEach(shape => {
  svg.addShape(shape, { fill: '#ecf0f1', stroke: '#000', strokeWidth: 1 });
});

saveOutput(svg.toString({ width: 500, height: 500, margin: 10 }), 'eight-pointed-star.svg');
console.log('✓ Generated: examples/output/eight-pointed-star.svg');
