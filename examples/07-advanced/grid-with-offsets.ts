/**
 * Grid with Subset Offsets
 * 
 * Create a grid and add offset rings to selected shapes.
 * Demonstrates complex composition with selective transformations.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Create a 5x5 grid of hexagons
const grid = shape.hexagon()
  .radius(15)
  .clone(4, 40, 0)
  .clone(4, 0, 40);

// Select every other hexagon and create offset rings
const subset = grid.every(2);

// Add 2 concentric rings around selected shapes
const rings = subset.offset(8, 2);

// Render everything
grid.stamp(svg);    // All hexagons
rings.stamp(svg);   // Just the offset rings

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'grid-with-offsets.svg');
