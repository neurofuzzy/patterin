/**
 * Grid Placement with Variation
 * 
 * Place different shapes at grid points for varied patterns.
 * Demonstrates how grids provide structured scaffolding for creativity.
 */

import { system, shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Create a square grid
const grid = system.grid({
  type: 'square',
  count: [8, 8],
  size: 40
});

// Place hexagons, then modify alternating ones
const hexagons = shape.hexagon().radius(15);
hexagons.lines.every(2).extrude(5);  // Make them gear-like

grid.place(hexagons);
grid.stamp(svg);

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'grid-placement.svg');
