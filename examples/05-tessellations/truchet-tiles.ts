/**
 * Truchet Tiles
 * 
 * Generate random Truchet tile patterns.
 * Each tile is randomly rotated to create emergent patterns.
 */

import { system } from '../../src/index';
import { saveOutput } from '../utils';

// Create Truchet pattern with quarter circles
const truchet = system.tessellation({
  pattern: 'truchet',
  variant: 'quarter-circles',
  size: 30,
  bounds: { width: 300, height: 300 },
  seed: 42  // Use seed for reproducible randomness
});

saveOutput(truchet.toSVG({ width: 400, height: 400, margin: 20 }), 'truchet-tiles.svg');
