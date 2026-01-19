/**
 * Test individual blocks to check for flipping issues
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const blockSize = 120;
const svg = new SVGCollector();

// Test Friendship Star
const fs = pattern.friendshipStar({
  blockSize,
  bounds: { width: blockSize * 2, height: blockSize * 2 }
});

fs.shapes.forEach(shape => {
  let fill = '#ecf0f1';
  if (shape.group === 'star') fill = '#e74c3c';
  svg.addShape(shape, { fill, stroke: '#000', strokeWidth: 2 });
});

saveOutput(svg.toString({ width: 300, height: 300, margin: 30 }), 'block-test-friendship.svg');
console.log('✓ Generated: examples/output/block-test-friendship.svg');

// Test Sawtooth Star
const svg2 = new SVGCollector();
const ss = pattern.sawtoothStar({
  blockSize,
  bounds: { width: blockSize * 2, height: blockSize * 2 }
});

ss.shapes.forEach(shape => {
  let fill = '#ecf0f1';
  if (shape.group === 'star-center') fill = '#f39c12';
  if (shape.group === 'star-point') fill = '#e67e22';
  svg2.addShape(shape, { fill, stroke: '#000', strokeWidth: 2 });
});

saveOutput(svg2.toString({ width: 300, height: 300, margin: 30 }), 'block-test-sawtooth.svg');
console.log('✓ Generated: examples/output/block-test-sawtooth.svg');

// Test Eight-Pointed Star
const svg3 = new SVGCollector();
const eps = pattern.eightPointedStar({
  blockSize,
  bounds: { width: blockSize * 2, height: blockSize * 2 }
});

eps.shapes.forEach(shape => {
  let fill = '#ecf0f1';
  if (shape.group === 'star-point') fill = '#e74c3c';
  if (shape.group === 'corner') fill = '#f39c12';
  svg3.addShape(shape, { fill, stroke: '#000', strokeWidth: 2 });
});

saveOutput(svg3.toString({ width: 300, height: 300, margin: 30 }), 'block-test-eightpoint.svg');
console.log('✓ Generated: examples/output/block-test-eightpoint.svg');
