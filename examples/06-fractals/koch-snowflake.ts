/**
 * Koch Snowflake
 * 
 * Generate the famous Koch snowflake fractal.
 * A closed curve created from three Koch curves forming a triangle.
 */

import { system } from '../../src/index';
import { saveOutput } from '../utils';

// Create Koch snowflake (closed form)
const snowflake = system.lsystem({
  axiom: 'F++F++F',  // Start with triangle (3 sides, 120° turns)
  rules: { 
    F: 'F-F++F-F'
  },
  iterations: 4,
  angle: 60,
  length: 2
});

snowflake.trace();
saveOutput(snowflake.toSVG({ width: 500, height: 500, margin: 20 }), 'koch-snowflake.svg');
