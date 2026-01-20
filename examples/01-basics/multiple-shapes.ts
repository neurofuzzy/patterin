/**
 * Multiple Shapes
 * 
 * Position multiple shapes in a composition using xy() for absolute positioning.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create and position multiple shapes
shape.circle()
  .radius(30)
  .xy(-80, 0)
  .stamp(svg);

shape.square()
  .size(50)
  .xy(80, 0)
  .stamp(svg);

shape.hexagon()
  .radius(25)
  .xy(0, -80)
  .stamp(svg);

shape.triangle()
  .radius(25)
  .xy(0, 80)
  .stamp(svg);

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'multiple-shapes.svg');
