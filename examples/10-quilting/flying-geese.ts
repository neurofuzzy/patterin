/**
 * Flying Geese Pattern Example
 * 
 * Traditional Flying Geese units - central triangle (goose) with
 * two smaller side triangles (sky). Shows both horizontal and vertical arrangements.
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

// Horizontal Flying Geese
const horizontal = pattern.flyingGeese({
  unitSize: 30,
  direction: 'horizontal',
  bounds: { width: 400, height: 300 }
});

const svg1 = new SVGCollector();

horizontal.shapes.filter(s => s.group === 'goose').forEach(shape => {
  svg1.addShape(shape, { fill: '#2c3e50', stroke: '#000', strokeWidth: 1 });
});

horizontal.shapes.filter(s => s.group === 'sky').forEach(shape => {
  svg1.addShape(shape, { fill: '#ecf0f1', stroke: '#000', strokeWidth: 1 });
});

saveOutput(svg1.toString({ width: 500, height: 400, margin: 50 }), 'flying-geese-horizontal.svg');
console.log('✓ Generated: examples/output/flying-geese-horizontal.svg');

// Vertical Flying Geese
const vertical = pattern.flyingGeese({
  unitSize: 30,
  direction: 'vertical',
  bounds: { width: 300, height: 400 }
});

const svg2 = new SVGCollector();

vertical.shapes.filter(s => s.group === 'goose').forEach(shape => {
  svg2.addShape(shape, { fill: '#e74c3c', stroke: '#000', strokeWidth: 1 });
});

vertical.shapes.filter(s => s.group === 'sky').forEach(shape => {
  svg2.addShape(shape, { fill: '#ecf0f1', stroke: '#000', strokeWidth: 1 });
});

saveOutput(svg2.toString({ width: 400, height: 500, margin: 50 }), 'flying-geese-vertical.svg');
console.log('✓ Generated: examples/output/flying-geese-vertical.svg');
