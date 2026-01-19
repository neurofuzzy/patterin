/**
 * Gingham Pattern Example
 * 
 * Creates a classic gingham pattern with overlapping horizontal and vertical bands
 * creating a woven checkered appearance.
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

// Create gingham pattern
const p = pattern.gingham({
  checkSize: 20,
  bands: [1, 3, 1, 3],  // Thin-thick-thin-thick pattern
  bounds: { width: 400, height: 400 }
});

const svg = new SVGCollector();

// Stamp horizontal light bands
p.shapes.filter(s => s.group === 'horizontal-light').forEach(shape => {
  svg.addShape(shape, { fill: '#e8f4f8', stroke: 'none' });
});

// Stamp horizontal dark bands
p.shapes.filter(s => s.group === 'horizontal-dark').forEach(shape => {
  svg.addShape(shape, { fill: '#4a90e2', stroke: 'none' });
});

// Stamp vertical light bands
p.shapes.filter(s => s.group === 'vertical-light').forEach(shape => {
  svg.addShape(shape, { fill: '#e8f4f8', stroke: 'none' });
});

// Stamp vertical dark bands
p.shapes.filter(s => s.group === 'vertical-dark').forEach(shape => {
  svg.addShape(shape, { fill: '#4a90e2', stroke: 'none' });
});

// Stamp intersection light
p.shapes.filter(s => s.group === 'intersection-light').forEach(shape => {
  svg.addShape(shape, { fill: '#f5f9fc', stroke: 'none' });
});

// Stamp intersection dark (where both bands are dark)
p.shapes.filter(s => s.group === 'intersection-dark').forEach(shape => {
  svg.addShape(shape, { fill: '#2171c7', stroke: 'none' });
});

saveOutput(svg.toString({ width: 500, height: 500, margin: 20 }), 'gingham.svg');
