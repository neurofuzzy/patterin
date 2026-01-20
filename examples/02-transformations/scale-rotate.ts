/**
 * Scale and Rotate
 * 
 * Combine scaling and rotation transformations.
 * Creates a flower-like pattern with rotated shapes.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create a flower pattern: 8 rotated rectangles
for (let i = 0; i < 8; i++) {
  const angle = (360 / 8) * i;
  
  shape.rect()
    .size(60, 20)
    .rotate(angle)
    .stamp(svg);
}

// Add a circle in the center
shape.circle()
  .radius(15)
  .stamp(svg);

saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'scale-rotate.svg');
