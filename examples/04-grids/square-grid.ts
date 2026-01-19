/**
 * Square Grid
 * 
 * Create a basic square grid using the grid system.
 * Demonstrates parametric grid generation.
 */

import { system, shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Create a 10x10 square grid
const grid = system.grid({
  type: 'square',
  count: [10, 10],
  size: 30
});

// Place small circles at each grid point
grid.place(shape.circle().radius(5));

grid.stamp(svg);

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'square-grid.svg');
