/**
 * Brick Pattern Example
 * 
 * Demonstrates various brick bond patterns including running bond,
 * stack bond, basket weave, Flemish bond, and the special James Bond pattern.
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

// Running Bond - Classic offset pattern
console.log('Generating Running Bond...');
const running = pattern.brick({
  type: 'running',
  brickWidth: 60,
  brickHeight: 30,
  mortarWidth: 2,
  bounds: { width: 400, height: 400 }
});

const svgRunning = new SVGCollector();
running.shapes.forEach(shape => {
  const color = shape.group === 'brick-even' ? '#c44e3a' : '#a73c2c';
  svgRunning.addShape(shape, { fill: color, stroke: '#8b3426', strokeWidth: 1 });
});
saveOutput(svgRunning.toString({ width: 500, height: 500 }), 'brick-running.svg');

// Stack Bond - Direct stacking
console.log('Generating Stack Bond...');
const stack = pattern.brick({
  type: 'stack',
  brickWidth: 60,
  brickHeight: 30,
  mortarWidth: 2,
  bounds: { width: 400, height: 400 }
});

const svgStack = new SVGCollector();
stack.shapes.forEach(shape => {
  const color = shape.group === 'brick-light' ? '#c44e3a' : '#a73c2c';
  svgStack.addShape(shape, { fill: color, stroke: '#8b3426', strokeWidth: 1 });
});
saveOutput(svgStack.toString({ width: 500, height: 500 }), 'brick-stack.svg');

// Basket Weave
console.log('Generating Basket Weave...');
const basket = pattern.brick({
  type: 'basket',
  brickWidth: 60,
  brickHeight: 30,
  mortarWidth: 2,
  bounds: { width: 400, height: 400 }
});

const svgBasket = new SVGCollector();
basket.shapes.forEach(shape => {
  const color = shape.group === 'horizontal' ? '#c44e3a' : '#a73c2c';
  svgBasket.addShape(shape, { fill: color, stroke: '#8b3426', strokeWidth: 1 });
});
saveOutput(svgBasket.toString({ width: 500, height: 500 }), 'brick-basket.svg');

// Flemish Bond
console.log('Generating Flemish Bond...');
const flemish = pattern.brick({
  type: 'flemish',
  brickWidth: 60,
  brickHeight: 30,
  mortarWidth: 2,
  bounds: { width: 400, height: 400 }
});

const svgFlemish = new SVGCollector();
flemish.shapes.forEach(shape => {
  const color = shape.group === 'header' ? '#a73c2c' : '#c44e3a';
  svgFlemish.addShape(shape, { fill: color, stroke: '#8b3426', strokeWidth: 1 });
});
saveOutput(svgFlemish.toString({ width: 500, height: 500 }), 'brick-flemish.svg');

console.log('✓ All brick patterns generated!');
