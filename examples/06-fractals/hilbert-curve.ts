/**
 * Hilbert Curve
 * 
 * Generate a Hilbert space-filling curve.
 * Useful for mapping 2D space to 1D sequences while preserving locality.
 */

import { system } from '../../src/index';
import { saveOutput } from '../utils';

// Create Hilbert curve
const hilbert = system.lsystem({
  axiom: 'A',
  rules: {
    A: '-BF+AFA+FB-',
    B: '+AF-BFB-FA+'
  },
  iterations: 5,
  angle: 90,
  length: 10
});

hilbert.trace();
saveOutput(hilbert.toSVG({ width: 500, height: 500, margin: 20 }), 'hilbert-curve.svg');
