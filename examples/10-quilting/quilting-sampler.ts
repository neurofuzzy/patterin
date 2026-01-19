/**
 * Quilting Sampler Example
 * 
 * Demonstrates multiple traditional quilt blocks in a single composition.
 */

import { pattern, SVGCollector, Vector2 } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create a 3x3 grid of different quilt blocks
const blockSize = 120;
const spacing = 10;
const totalSize = blockSize + spacing;

// Row 1: Star blocks
// Friendship Star (0,0)
const friendshipStar = pattern.friendshipStar({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});

friendshipStar.shapes.forEach(shape => {
  const color = shape.group === 'star' ? '#e74c3c' : '#ecf0f1';
  svg.addShape(shape, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Sawtooth Star (1,0)
const sawtoothStar = pattern.sawtoothStar({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});

sawtoothStar.shapes.forEach(shape => {
  let fill = '#ecf0f1';
  if (shape.group === 'star-center') fill = '#f39c12';
  if (shape.group === 'star-point') fill = '#e67e22';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize, 0));
  svg.addShape(translated, { fill, stroke: '#000', strokeWidth: 1 });
});

// Shoo Fly (2,0)
const shooFly = pattern.shooFly({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});

shooFly.shapes.forEach(shape => {
  let fill = '#ecf0f1';
  if (shape.group === 'center') fill = '#9b59b6';
  if (shape.group === 'light') fill = '#bdc3c7';
  if (shape.group === 'dark') fill = '#8e44ad';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize * 2, 0));
  svg.addShape(translated, { fill, stroke: '#000', strokeWidth: 1 });
});

// Row 2: Geometric blocks
// Pinwheel (0,1)
const pinwheel = pattern.pinwheel({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});

pinwheel.shapes.forEach(shape => {
  const color = shape.group === 'blade' ? '#3498db' : '#ecf0f1';
  const translated = shape.clone();
  translated.translate(new Vector2(0, totalSize));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Broken Dishes (1,1)
const brokenDishes = pattern.brokenDishes({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});

brokenDishes.shapes.forEach(shape => {
  const color = shape.group === 'light' ? '#1abc9c' : '#16a085';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize, totalSize));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Dutchman's Puzzle (2,1)
const dutchmansPuzzle = pattern.dutchmansPuzzle({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});

dutchmansPuzzle.shapes.forEach(shape => {
  const color = shape.group === 'goose' ? '#e67e22' : '#ecf0f1';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize * 2, totalSize));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Row 3: Novelty blocks
// Bow Tie (0,2)
const bowTie = pattern.bowTie({
  blockSize,
  bounds: { width: blockSize, height: blockSize }
});

bowTie.shapes.forEach(shape => {
  const color = shape.group === 'tie' ? '#c0392b' : '#ecf0f1';
  const translated = shape.clone();
  translated.translate(new Vector2(0, totalSize * 2));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Snowball (1,2)
const snowball = pattern.snowball({
  blockSize,
  cornerSize: blockSize / 4,
  bounds: { width: blockSize, height: blockSize }
});

snowball.shapes.forEach(shape => {
  const color = shape.group === 'ball' ? '#2ecc71' : '#ecf0f1';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize, totalSize * 2));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

// Flying Geese (2,2)
const flyingGeese = pattern.flyingGeese({
  unitSize: 60,
  direction: 'horizontal',
  bounds: { width: blockSize, height: blockSize }
});

flyingGeese.shapes.forEach(shape => {
  const color = shape.group === 'goose' ? '#34495e' : '#95a5a6';
  const translated = shape.clone();
  translated.translate(new Vector2(totalSize * 2, totalSize * 2));
  svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
});

const width = totalSize * 3 + 20;
const height = totalSize * 3 + 20;
saveOutput(svg.toString({ width, height, margin: 10 }), 'quilting-sampler.svg');
console.log('✓ Generated: examples/output/quilting-sampler.svg');
