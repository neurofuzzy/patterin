/**
 * Sierpiński Triangle
 * 
 * Generate a Sierpiński arrowhead curve.
 * Traces a path that approximates the Sierpiński triangle fractal.
 */

import { system } from '../../src/index';
import { saveOutput } from '../utils';

// Create Sierpiński triangle
const sierpinski = system.lsystem({
  axiom: 'F',
  rules: {
    F: 'G-F-G',
    G: 'F+G+F'
  },
  iterations: 6,
  angle: 60,
  length: 2
});

sierpinski.trace();
saveOutput(sierpinski.toSVG({ width: 500, height: 500, margin: 20 }), 'sierpinski.svg');
