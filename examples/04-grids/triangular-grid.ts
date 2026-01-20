/**
 * Triangular Grid
 * 
 * Create a triangular grid pattern.
 * Useful for triangulated patterns and geometric designs.
 */

import { system, shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Create a triangular grid
const grid = system.grid({
  type: 'triangular',
  count: [10, 10],
  size: 30
});

// Place small triangles at each grid point
grid.place(shape.triangle().radius(8));

grid.stamp(svg);

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'triangular-grid.svg');
