/**
 * Star Shape
 * 
 * Create a star by modifying alternating points of a circle.
 * Demonstrates context switching to operate on points.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create a circle with 10 points
const star = shape.circle()
  .radius(50)
  .numSegments(10);

// Pull every other point inward to create star shape
star.points.every(2).expand(-25);

star.stamp(svg);

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'star.svg');
