/**
 * Quilting Sampler Example
 * 
 * Demonstrates the new unified quilt pattern library with all available block templates.
 */

import { pattern, SVGCollector, Vector2 } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create a 3x3 grid of different quilt blocks
const blockSize = 120;
const spacing = 10;
const totalSize = blockSize + spacing;

// Available blocks: pinwheel, brokenDishes, friendshipStar, shooFly, bowTie, dutchmansPuzzle, sawtoothStar

// Row 1
// Pinwheel (0,0)
const pinwheel = pattern.quilt({
  blockName: 'pinwheel',
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
pinwheel.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#3498db' : '#ecf0f1';
  svg.addShape(shape, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Broken Dishes (1,0)
const brokenDishes = pattern.quilt({
  blockName: 'brokenDishes',
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
brokenDishes.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#1abc9c' : '#16a085';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize, 0));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Friendship Star (2,0)
const friendshipStar = pattern.quilt({
  blockName: 'friendshipStar',
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
friendshipStar.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#e74c3c' : '#ecf0f1';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize * 2, 0));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Row 2
// Shoo Fly (0,1)
const shooFly = pattern.quilt({
  blockName: 'shooFly',
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
shooFly.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#9b59b6' : '#ecf0f1';
  const translated = shape.clone();
  translated.translate(new Vector2(0, totalSize));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Bow Tie (1,1)
const bowTie = pattern.quilt({
  blockName: 'bowTie',
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
bowTie.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#34495e' : '#ecf0f1';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize, totalSize));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Dutchman's Puzzle (2,1)
const dutchmansPuzzle = pattern.quilt({
  blockName: 'dutchmansPuzzle',
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
dutchmansPuzzle.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#e67e22' : '#ecf0f1';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize * 2, totalSize));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Row 3
// Sawtooth Star (0,2)
const sawtoothStar = pattern.quilt({
  blockName: 'sawtoothStar',
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
sawtoothStar.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#f39c12' : '#ecf0f1';
  const translated = shape.clone();
  translated.translate(new Vector2(0, totalSize * 2));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Broken Dishes (1,2) - to differentiate from pinwheel in block 9
const brokenDishes2 = pattern.quilt({
  blockName: 'brokenDishes',
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
brokenDishes2.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#27ae60' : '#ecf0f1';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize, totalSize * 2));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Pinwheel again with different colors (2,2)
const pinwheel2 = pattern.quilt({
  blockName: 'pinwheel',
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});
pinwheel2.shapes.forEach(shape => {
  const color = shape.group === 'dark' ? '#c0392b' : '#f1c40f';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize * 2, totalSize * 2));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

const width = totalSize * 3 + 20;
const height = totalSize * 3 + 20;
saveOutput(svg.toString({ width, height, margin: 10 }), 'quilting-sampler.svg');
console.log('✓ Generated: examples/output/quilting-sampler.svg');
