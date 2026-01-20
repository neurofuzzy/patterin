/**
 * Geometric Pattern
 * 
 * Complex geometric composition combining:
 * - Nested shapes
 * - Rotational symmetry
 * - Multiple shape types
 * - Layered detail
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Base: Large hexagon with nested insets
const base = shape.hexagon()
  .radius(120)
  .inset(15, 3);
base.stamp(svg, 0, 0, { stroke: '#666', strokeWidth: 1 });

// Layer 1: Rotated squares at each vertex
const vertices = shape.hexagon().radius(120);
vertices.points.expandToCircles(20, 4)  // 4 segments = square
  .every(1)
  .rotate(45)
  .stamp(svg, 0, 0, { stroke: '#000', strokeWidth: 1.5 });

// Layer 2: Small gears at midpoints between vertices
for (let i = 0; i < 6; i++) {
  const angle1 = (360 / 6) * i;
  const angle2 = (360 / 6) * ((i + 1) % 6);
  const midAngle = ((angle1 + angle2) / 2) * Math.PI / 180;
  
  const x = Math.cos(midAngle) * 80;
  const y = Math.sin(midAngle) * 80;
  
  const gear = shape.circle()
    .radius(12)
    .numSegments(12)
    .xy(x, y);
  
  gear.lines.every(2).extrude(5);
  gear.stamp(svg);
}

// Center: Decorative star
const centerStar = shape.circle()
  .radius(30)
  .numSegments(16);
centerStar.points.every(2).expand(15);
centerStar.stamp(svg, 0, 0, { stroke: '#000', strokeWidth: 2 });

saveOutput(svg.toString({ width: 600, height: 600, margin: 20 }), 'geometric-pattern.svg');
