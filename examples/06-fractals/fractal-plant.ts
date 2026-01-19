/**
 * Fractal Plant
 * 
 * Generate an organic branching plant structure.
 * Demonstrates L-system branching with stack operations [ and ].
 */

import { system } from '../../src/index';
import { saveOutput } from '../utils';

// Create fractal plant with branches
const plant = system.lsystem({
  axiom: 'X',
  rules: {
    X: 'F+[[X]-X]-F[-FX]+X',
    F: 'FF'
  },
  iterations: 5,
  angle: 25,
  length: 3,
  initialAngle: 90  // Start pointing upward
});

plant.trace();
saveOutput(plant.toSVG({ width: 500, height: 600, margin: 20 }), 'fractal-plant.svg');
