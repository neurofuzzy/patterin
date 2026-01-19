/**
 * Trihexagonal Tessellation
 * 
 * Create trihexagonal (hexagons and triangles) tiling.
 * A semi-regular tessellation with pleasing geometric properties.
 */

import { system } from '../../src/index';
import { saveOutput } from '../utils';

// Create trihexagonal tessellation
const tess = system.tessellation({
  pattern: 'trihexagonal',
  size: 40,
  bounds: { width: 400, height: 400 }
});

saveOutput(tess.toSVG({ width: 500, height: 500, margin: 20 }), 'trihexagonal.svg');
