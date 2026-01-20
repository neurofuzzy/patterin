/**
 * Plotter Art
 * 
 * Design optimized for pen plotting with:
 * - Single continuous paths where possible
 * - No fills (stroke only)
 * - Varied line weights through density
 * - Geometric precision
 */

import { shape, system, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';
const svg = new SVGCollector();

// Background grid pattern
const bgGrid = system.grid({
  type: 'square',
  count: [20, 20],
  size: 20
});
bgGrid.place(shape.circle().radius(2));
bgGrid.stamp(svg, { stroke: '#ccc', strokeWidth: 0.5 });

// Main composition: Nested offset squares
const mainSquare = shape.square()
  .size(180)
  .offset(15, 6, 4, true);
mainSquare.stamp(svg, 0, 0, { stroke: '#000', strokeWidth: 1.5 });

// Decorative corners: small spirals made from offset circles
for (let i = 0; i < 4; i++) {
  const angle = (360 / 4) * i + 45;
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * 110;
  const y = Math.sin(rad) * 110;
  
  const spiral = shape.circle()
    .radius(15)
    .offset(3, 5);
  spiral.stamp(svg, x, y, { stroke: '#000', strokeWidth: 0.75 });
}

// Center: Dense concentric circles
const center = shape.circle()
  .radius(5)
  .offset(5, 8, 4, true);
center.stamp(svg, 0, 0, { stroke: '#000', strokeWidth: 1 });

saveOutput(svg.toString({ width: 500, height: 500, margin: 30 }), 'plotter-art.svg');
