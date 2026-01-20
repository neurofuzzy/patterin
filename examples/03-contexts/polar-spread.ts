/**
 * Polar Spread
 * 
 * Distribute shapes around a circle to create radial patterns.
 * Perfect for mandalas and decorative designs.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Create three concentric rings with different shape counts
// Ring 1: 6 shapes at radius 30
shape.circle()
  .radius(5)
  .clone(5, 0, 0)
  .spreadPolar(30)
  .stamp(svg);

// Ring 2: 12 shapes at radius 60
shape.circle()
  .radius(5)
  .clone(11, 0, 0)
  .spreadPolar(60)
  .stamp(svg);

// Ring 3: 18 shapes at radius 90
shape.circle()
  .radius(5)
  .clone(17, 0, 0)
  .spreadPolar(90)
  .stamp(svg);

// Center circle
shape.circle()
  .radius(8)
  .stamp(svg, 0, 0, { stroke: '#000', fill: '#000' });

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'polar-spread.svg');
