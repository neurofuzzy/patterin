/**
 * Log Cabin Quilt Block Example
 * 
 * One of the most iconic quilt blocks, featuring strips (logs) arranged
 * around a center square with traditional light and dark sides.
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const logCabin = pattern.logCabin({
  blockSize: 120,
  stripWidth: 15,
  bounds: { width: 480, height: 480 }
});

const svg = new SVGCollector();

// Center "hearth" - traditionally red or yellow
logCabin.shapes.filter(s => s.group === 'center').forEach(shape => {
  svg.addShape(shape, { fill: '#c0392b', stroke: '#000', strokeWidth: 1 });
});

// Light side - warm colors
logCabin.shapes.filter(s => s.group === 'light').forEach(shape => {
  svg.addShape(shape, { fill: '#f39c12', stroke: '#000', strokeWidth: 1 });
});

// Dark side - cool colors
logCabin.shapes.filter(s => s.group === 'dark').forEach(shape => {
  svg.addShape(shape, { fill: '#2c3e50', stroke: '#000', strokeWidth: 1 });
});

saveOutput(svg.toString({ width: 500, height: 500, margin: 10 }), 'log-cabin.svg');
console.log('✓ Generated: examples/output/log-cabin.svg');
