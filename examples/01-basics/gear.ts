/**
 * Gear Shape
 * 
 * Create a gear by extruding alternating edges of a circle.
 * Demonstrates line context for edge manipulation.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create a circle with 16 edges
const gear = shape.circle()
  .radius(50)
  .numSegments(16);

// Extrude every other edge outward to create teeth
gear.lines.every(2).extrude(15);

gear.stamp(svg);

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'gear.svg');
