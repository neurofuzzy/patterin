/**
 * Fixed Quilting Sampler 
 * All blocks use consistent grid subdivisions and 45° tangram-style HSTs
 */

import { pattern, SVGCollector, Vector2 } from '../../src/index';
import { saveOutput } from '../utils';

const blockSize = 120;
const svg = new SVGCollector();

// Helper to translate and add shapes
function addBlock(shapes: any[], xOffset: number, yOffset: number, colorMap: (group: string) => string) {
  shapes.forEach(shape => {
    const translated = shape.clone();
    translated.translate(new Vector2(xOffset, yOffset));
    svg.addShape(translated, { fill: colorMap(shape.group || ''), stroke: '#000', strokeWidth: 1 });
  });
}

// Row 1: Nine-Patch Stars (3x3 grid)
// Friendship Star (0,0)
const fs = pattern.friendshipStar({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
addBlock(fs.shapes, 0, 0, (g) => g === 'star' ? '#e74c3c' : '#ecf0f1');

// Sawtooth Star (1,0)
const ss = pattern.sawtoothStar({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
addBlock(ss.shapes, blockSize, 0, (g) => {
  if (g === 'star-center') return '#f39c12';
  if (g === 'star-point') return '#e67e22';
  return '#ecf0f1';
});

// Shoo Fly (2,0)
const sf = pattern.shooFly({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
addBlock(sf.shapes, blockSize * 2, 0, (g) => {
  if (g === 'center') return '#9b59b6';
  if (g === 'light') return '#bdc3c7';
  if (g === 'dark') return '#8e44ad';
  return '#ecf0f1';
});

// Row 2: Four-Patch blocks (2x2 grid)
// Pinwheel (0,1)
const pw = pattern.pinwheel({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
addBlock(pw.shapes, 0, blockSize, (g) => g === 'blade' ? '#3498db' : '#ecf0f1');

// Broken Dishes (1,1)
const bd = pattern.brokenDishes({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
addBlock(bd.shapes, blockSize, blockSize, (g) => g === 'light' ? '#1abc9c' : '#16a085');

// Bow Tie (2,1)
const bt = pattern.bowTie({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
addBlock(bt.shapes, blockSize * 2, blockSize, (g) => g === 'tie' ? '#c0392b' : '#ecf0f1');

// Row 3: Mixed blocks
// Snowball (0,2)
const sb = pattern.snowball({
  blockSize,
  cornerSize: blockSize / 4,
  bounds: { width: blockSize, height: blockSize }
});
addBlock(sb.shapes, 0, blockSize * 2, (g) => g === 'ball' ? '#2ecc71' : '#ecf0f1');

// Flying Geese unit that fits blockSize (1,2)
const fg = pattern.flyingGeese({
  unitSize: blockSize / 2,
  direction: 'horizontal',
  bounds: { width: blockSize, height: blockSize }
});
addBlock(fg.shapes, blockSize, blockSize * 2, (g) => g === 'goose' ? '#34495e' : '#95a5a6');

// Dutchman's Puzzle (2,2)
const dp = pattern.dutchmansPuzzle({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
addBlock(dp.shapes, blockSize * 2, blockSize * 2, (g) => g === 'goose' ? '#e67e22' : '#ecf0f1');

const size = blockSize * 3;
saveOutput(svg.toString({ width: size + 20, height: size + 20, margin: 10 }), 'sampler-fixed.svg');
console.log('✓ Generated: examples/output/sampler-fixed.svg');
