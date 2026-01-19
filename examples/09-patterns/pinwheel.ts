/**
 * Pinwheel Pattern Example
 * 
 * Traditional Pinwheel quilt block made from four half-square triangles.
 * Popular in quilting since the 1800s.
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

// Traditional Pinwheel quilt block
const pinwheel = pattern.pinwheel({
  blockSize: 80,
  bounds: { width: 400, height: 400 }
});

const svg = new SVGCollector();

// Stamp blades
pinwheel.shapes.filter(s => s.group === 'blade').forEach(shape => {
  svg.addShape(shape, { fill: '#e74c3c', stroke: '#c0392b', strokeWidth: 1 });
});

// Stamp background
pinwheel.shapes.filter(s => s.group === 'background').forEach(shape => {
  svg.addShape(shape, { fill: '#3498db', stroke: '#2980b9', strokeWidth: 1 });
});

saveOutput(svg.toString({ width: 500, height: 500, margin: 20 }), 'pinwheel.svg');
console.log('✓ Generated: examples/output/pinwheel.svg');
