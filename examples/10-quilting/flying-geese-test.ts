/**
 * Flying Geese Test - Larger units for clarity
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

// Create just a few large Flying Geese units to see the structure clearly
const test = pattern.flyingGeese({
  unitSize: 60,  // Larger units
  direction: 'horizontal',
  bounds: { width: 360, height: 180 }  // 3x3 grid of units (120x60 each)
});

const svg = new SVGCollector();

console.log('Total shapes:', test.shapes.length);
console.log('Goose shapes:', test.shapes.filter(s => s.group === 'goose').length);
console.log('Sky shapes:', test.shapes.filter(s => s.group === 'sky').length);

// Render geese (dark)
test.shapes.filter(s => s.group === 'goose').forEach(shape => {
  svg.addShape(shape, { fill: '#2c3e50', stroke: '#c0392b', strokeWidth: 2 });
});

// Render sky (light)
test.shapes.filter(s => s.group === 'sky').forEach(shape => {
  svg.addShape(shape, { fill: '#ecf0f1', stroke: '#c0392b', strokeWidth: 2 });
});

saveOutput(svg.toString({ width: 400, height: 220, margin: 20 }), 'flying-geese-test.svg');
console.log('✓ Generated: examples/output/flying-geese-test.svg');
