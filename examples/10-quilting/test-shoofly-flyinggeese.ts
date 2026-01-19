/**
 * Test Shoo Fly and Flying Geese fixes
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const blockSize = 150;

// Test Shoo Fly
const sf = pattern.shooFly({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});

const svg1 = new SVGCollector();
sf.shapes.forEach(s => {
  let fill = '#ecf0f1';
  if (s.group === 'center') fill = '#9b59b6';
  if (s.group === 'light') fill = '#bdc3c7';
  if (s.group === 'dark') fill = '#8e44ad';
  svg1.addShape(s, { fill, stroke: '#000', strokeWidth: 2 });
});
saveOutput(svg1.toString({ width: 200, height: 200 }), 'test-shoofly.svg');
console.log('✓ Shoo Fly test generated');

// Test Flying Geese with unitSize=60 in 120x120 block (should show 2x2 grid)
const fg = pattern.flyingGeese({
  unitSize: 60,
  direction: 'horizontal',
  bounds: { width: 120, height: 120 }
});

const svg2 = new SVGCollector();
fg.shapes.forEach(s => {
  const color = s.group === 'goose' ? '#e74c3c' : '#ecf0f1';
  svg2.addShape(s, { fill: color, stroke: '#000', strokeWidth: 2 });
});
saveOutput(svg2.toString({ width: 180, height: 180, margin: 30 }), 'test-flying-geese.svg');
console.log(`✓ Flying Geese test generated (${fg.shapes.length} shapes total)`);
console.log(`  Geese: ${fg.shapes.filter(s => s.group === 'goose').length}`);
console.log(`  Sky: ${fg.shapes.filter(s => s.group === 'sky').length}`);
