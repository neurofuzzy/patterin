/**
 * Houndstooth Pattern Example
 * 
 * Creates a classic houndstooth pattern with distinctive jagged tooth shapes.
 * This iconic pattern features interlocking checks in contrasting colors.
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

// Create houndstooth pattern
const p = pattern.houndstooth({
  size: 40,
  bounds: { width: 400, height: 400 }
});

const svg = new SVGCollector();

// Stamp light teeth
p.shapes.filter(s => s.group === 'light').forEach(shape => {
  svg.addShape(shape, { fill: '#ffffff', stroke: 'none' });
});

// Stamp dark teeth
p.shapes.filter(s => s.group === 'dark').forEach(shape => {
  svg.addShape(shape, { fill: '#000000', stroke: 'none' });
});

saveOutput(svg.toString({ width: 500, height: 500, margin: 20 }), 'houndstooth.svg');
