/**
 * Checker Pattern Example
 * 
 * Creates a classic checkerboard pattern with alternating light and dark squares.
 * Demonstrates basic pattern usage with grouped shapes for different colors.
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

// Create checker pattern
const p = pattern.checker({
  size: 30,
  bounds: { width: 400, height: 400 }
});

const svg = new SVGCollector();

// Stamp light checks with light gray fill
p.shapes.filter(s => s.group === 'light').forEach(shape => {
  svg.addShape(shape, { fill: '#f0f0f0', stroke: 'none' });
});

// Stamp dark checks with dark gray fill
p.shapes.filter(s => s.group === 'dark').forEach(shape => {
  svg.addShape(shape, { fill: '#333', stroke: 'none' });
});

saveOutput(svg.toString({ width: 500, height: 500, margin: 20 }), 'checker.svg');
