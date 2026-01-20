/**
 * Koch Curve
 * 
 * Generate a Koch curve fractal.
 * One of the earliest described fractals, demonstrating self-similarity.
 */

import { system } from '../../src/index';
import { saveOutput } from '../utils';

// Create Koch curve
const koch = system.lsystem({
  axiom: 'F',
  rules: { 
    F: 'F+F-F-F+F'
  },
  iterations: 4,
  angle: 90,
  length: 2
});

koch.trace();
saveOutput(koch.toSVG({ width: 600, height: 400, margin: 20 }), 'koch-curve.svg');
