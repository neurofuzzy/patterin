/**
 * Point Expansion
 * 
 * Create stars by expanding selected points radially.
 * Demonstrates fine control over individual vertices.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Create a 5-pointed star
const star5 = shape.circle()
  .radius(40)
  .numSegments(10)
  .xy(-100, 0);

star5.points.every(2).expand(25);
star5.stamp(svg);

// Create an 8-pointed star
const star8 = shape.circle()
  .radius(40)
  .numSegments(16)
  .xy(100, 0);

star8.points.every(2).expand(20);
star8.stamp(svg);

saveOutput(svg.toString({ width: 500, height: 300, margin: 20 }), 'point-expansion.svg');
