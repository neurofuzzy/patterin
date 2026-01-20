/**
 * Clone Grid
 * 
 * Create a 2D grid by chaining clone operations.
 * Demonstrates how nested cloning creates grid patterns.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create a 10x10 grid of squares (100 total)
const grid = shape.square()
  .size(20)
  .clone(9, 30, 0)    // 10 shapes horizontally (original + 9 clones)
  .clone(9, 0, 30);   // Clone each 10 times vertically (100 total)

grid.stamp(svg);

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'clone-grid.svg');
