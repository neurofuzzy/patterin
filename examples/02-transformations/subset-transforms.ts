/**
 * Subset Transformations
 * 
 * Apply transformations to selected shapes in a collection.
 * Creates a checkerboard pattern with varied shapes.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create a 5x5 grid
const grid = shape.square()
  .size(20)
  .clone(4, 35, 0)
  .clone(4, 0, 35);

// Transform every other square (checkerboard pattern)
grid.every(2)
  .scale(1.3)
  .rotate(45);

grid.stamp(svg);

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'subset-transforms.svg');
