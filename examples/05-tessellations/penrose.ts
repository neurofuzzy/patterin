/**
 * Penrose Tiling
 * 
 * Generate aperiodic Penrose tiling patterns.
 * These never-repeating patterns are mathematically fascinating.
 */

import { system } from '../../src/index';
import { saveOutput } from '../utils';

// Create Penrose tiling
const penrose = system.tessellation({
  pattern: 'penrose',
  size: 30,
  bounds: { width: 400, height: 400 },
  iterations: 4
});

saveOutput(penrose.toSVG({ width: 500, height: 500, margin: 20 }), 'penrose.svg');
