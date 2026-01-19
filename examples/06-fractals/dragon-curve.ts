/**
 * Dragon Curve
 * 
 * Generate the Heighway dragon fractal.
 * A space-filling curve that never crosses itself.
 */

import { system } from '../../src/index';
import { saveOutput } from '../utils';

// Create dragon curve
const dragon = system.lsystem({
  axiom: 'F',
  rules: {
    F: 'F+G',
    G: 'F-G'
  },
  iterations: 12,
  angle: 90,
  length: 3
});

dragon.trace();
saveOutput(dragon.toSVG({ width: 500, height: 500, margin: 20 }), 'dragon-curve.svg');
