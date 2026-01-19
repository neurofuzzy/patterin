/**
 * Line Extrusion
 * 
 * Extrude specific edges to create complex shapes.
 * Demonstrates precise control over individual segments.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Create a hexagon and extrude alternating edges
const hex1 = shape.hexagon()
  .radius(50)
  .xy(-100, 0);

hex1.lines.every(2).extrude(20);
hex1.stamp(svg);

// Create a square and extrude specific edges
const square1 = shape.square()
  .size(80)
  .xy(100, 0);

square1.lines.at(0, 2).extrude(25);  // Top and bottom edges
square1.stamp(svg);

saveOutput(svg.toString({ width: 500, height: 300, margin: 20 }), 'line-extrusion.svg');
