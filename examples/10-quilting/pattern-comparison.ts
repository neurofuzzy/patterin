/**
 * Compare patterns - generate single blocks to check consistency
 */

import { pattern, SVGCollector, Vector2 } from '../../src/index';
import { saveOutput } from '../utils';

const blockSize = 100;

// Test each pattern with a 2x2 grid of blocks to see if they tile consistently

// Flying Geese
const fg = pattern.flyingGeese({
  unitSize: 50,
  direction: 'horizontal',
  bounds: { width: blockSize * 2, height: blockSize * 2 }
});

const svg1 = new SVGCollector();
fg.shapes.forEach(s => {
  const color = s.group === 'goose' ? '#3498db' : '#ecf0f1';
  svg1.addShape(s, { fill: color, stroke: '#000', strokeWidth: 2 });
});
saveOutput(svg1.toString({ width: 250, height: 250 }), 'compare-flying-geese.svg');

// Friendship Star
const fs = pattern.friendshipStar({
  blockSize,
  bounds: { width: blockSize * 2, height: blockSize * 2 }
});

const svg2 = new SVGCollector();
fs.shapes.forEach(s => {
  const color = s.group === 'star' ? '#9b59b6' : '#ecf0f1';
  svg2.addShape(s, { fill: color, stroke: '#000', strokeWidth: 2 });
});
saveOutput(svg2.toString({ width: 250, height: 250 }), 'compare-friendship-star.svg');

// Sawtooth Star
const ss = pattern.sawtoothStar({
  blockSize,
  bounds: { width: blockSize * 2, height: blockSize * 2 }
});

const svg3 = new SVGCollector();
ss.shapes.forEach(s => {
  let color = '#ecf0f1';
  if (s.group === 'star-center') color = '#e74c3c';
  if (s.group === 'star-point') color = '#c0392b';
  svg3.addShape(s, { fill: color, stroke: '#000', strokeWidth: 2 });
});
saveOutput(svg3.toString({ width: 250, height: 250 }), 'compare-sawtooth-star.svg');

// Broken Dishes
const bd = pattern.brokenDishes({
  blockSize,
  bounds: { width: blockSize * 2, height: blockSize * 2 }
});

const svg4 = new SVGCollector();
bd.shapes.forEach(s => {
  const color = s.group === 'light' ? '#1abc9c' : '#16a085';
  svg4.addShape(s, { fill: color, stroke: '#000', strokeWidth: 2 });
});
saveOutput(svg4.toString({ width: 250, height: 250 }), 'compare-broken-dishes.svg');

// Pinwheel
const pw = pattern.pinwheel({
  blockSize,
  bounds: { width: blockSize * 2, height: blockSize * 2 }
});

const svg5 = new SVGCollector();
pw.shapes.forEach(s => {
  const color = s.group === 'blade' ? '#e67e22' : '#ecf0f1';
  svg5.addShape(s, { fill: color, stroke: '#000', strokeWidth: 2 });
});
saveOutput(svg5.toString({ width: 250, height: 250 }), 'compare-pinwheel.svg');

console.log('✓ Generated comparison SVGs');
