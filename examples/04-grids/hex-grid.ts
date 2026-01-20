/**
 * Hexagonal Grid
 * 
 * Create a hexagonal grid pattern.
 * Hexagonal grids are perfect for organic or honeycomb patterns.
 */

import { system, shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Create a hexagonal grid
const grid = system.grid({
  type: 'hexagonal',
  count: [8, 8],
  size: 35
});

// Place hexagons at each grid point
grid.place(shape.hexagon().radius(15));

grid.stamp(svg);

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'hex-grid.svg');
