/**
 * Point Circles (Mandala)
 * 
 * Place circles at each vertex of a polygon to create mandala patterns.
 * Demonstrates expandToCircles() for decorative effects.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Create a hexagon with circles at each vertex
const hex = shape.hexagon()
  .radius(60);

// Render the hexagon
hex.stamp(svg, 0, 0, { stroke: '#666', strokeWidth: 2 });

// Place circles at each vertex
hex.points.expandToCircles(15, 16)
  .stamp(svg, 0, 0, { stroke: '#000', fill: 'none', strokeWidth: 1.5 });

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'point-circles.svg');
