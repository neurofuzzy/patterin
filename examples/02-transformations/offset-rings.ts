/**
 * Offset Rings
 * 
 * Create concentric shapes using offset().
 * Shows both outset (expanding) and inset (shrinking) operations.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create 5 expanding rings around a hexagon
const hexRings = shape.hexagon()
  .radius(30)
  .offset(15, 5, 4, true);  // 5 rings, 15 units apart, include original

hexRings.stamp(svg, 0, -150);

// Create nested inset squares
const nestedSquares = shape.square()
  .size(120)
  .inset(15, 4);  // 4 smaller squares inside

nestedSquares.stamp(svg, 0, 150);

saveOutput(svg.toString({ width: 400, height: 600, margin: 20 }), 'offset-rings.svg');
