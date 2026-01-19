/**
 * Chevron Pattern Example
 * 
 * Creates a zigzag chevron pattern with alternating colored stripes
 * forming V-shapes across the canvas.
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

// Create chevron pattern
const p = pattern.chevron({
  stripeWidth: 40,
  angle: 45,
  bounds: { width: 400, height: 400 }
});

const svg = new SVGCollector();

// Stamp first set of stripes
p.shapes.filter(s => s.group === 'stripe1').forEach(shape => {
  svg.addShape(shape, { fill: '#4a90e2', stroke: 'none' });
});

// Stamp second set of stripes
p.shapes.filter(s => s.group === 'stripe2').forEach(shape => {
  svg.addShape(shape, { fill: '#7fb3d5', stroke: 'none' });
});

saveOutput(svg.toString({ width: 500, height: 500, margin: 20 }), 'chevron.svg');
