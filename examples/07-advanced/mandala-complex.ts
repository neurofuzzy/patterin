/**
 * Complex Mandala
 * 
 * Create an intricate mandala combining multiple techniques:
 * - Multiple concentric rings
 * - Varied shapes and sizes
 * - Point expansion
 * - Polar distribution
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Center: star shape
const center = shape.circle()
  .radius(20)
  .numSegments(12);
center.points.every(2).expand(15);
center.stamp(svg, 0, 0, { stroke: '#000', strokeWidth: 2 });

// Ring 1: 8 circles with internal stars
for (let i = 0; i < 8; i++) {
  const angle = (360 / 8) * i;
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * 60;
  const y = Math.sin(rad) * 60;
  
  const ring1Shape = shape.circle()
    .radius(15)
    .numSegments(8)
    .xy(x, y);
  
  ring1Shape.points.every(2).expand(8);
  ring1Shape.stamp(svg);
}

// Ring 2: 12 small hexagons
shape.hexagon()
  .radius(8)
  .clone(11, 0, 0)
  .spreadPolar(100)
  .stamp(svg);

// Ring 3: 16 tiny circles
shape.circle()
  .radius(4)
  .clone(15, 0, 0)
  .spreadPolar(130)
  .stamp(svg);

// Outer ring: 24 decorated points
const outer = shape.circle()
  .radius(140)
  .numSegments(24);

outer.points.expandToCircles(6, 8)
  .stamp(svg);

saveOutput(svg.toString({ width: 600, height: 600, margin: 20 }), 'mandala-complex.svg');
