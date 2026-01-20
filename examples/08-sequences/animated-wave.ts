/**
 * Animated Wave Pattern
 * 
 * Uses sequence generators to create an organic wave pattern.
 * Demonstrates how sequences can replace manual calculations
 * for more readable, declarative code.
 */

import { shape, SVGCollector, Sequence } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create sequences for variation
const heights = Sequence.yoyo(20, 40, 60, 80, 60, 40);
const rotations = Sequence.repeat(0, 5, 10, 5, 0, -5, -10, -5);
const spacing = Sequence.additive(30, 5, -2);

let xPos = 0;

// Create wave of rectangles with varying heights and rotations
for (let i = 0; i < 24; i++) {
  xPos += spacing();
  
  shape.rect()
    .size(20, heights())
    .rotate(rotations())
    .xy(xPos, 0)
    .stamp(svg);
}

saveOutput(svg.toString({ width: 900, height: 400, margin: 50 }), 'animated-wave.svg');
