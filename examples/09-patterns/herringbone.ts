/**
 * Herringbone Pattern Example
 * 
 * Creates a herringbone pattern with V-shaped arrangement of rectangular bricks.
 * This pattern mimics the look of parquet flooring or woven textiles.
 */

import { pattern, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

// Create herringbone pattern
const p = pattern.herringbone({
  brickWidth: 60,
  brickHeight: 20,
  angle: 45,
  bounds: { width: 400, height: 400 }
});

const svg = new SVGCollector();

// Stamp first angle bricks
p.shapes.filter(s => s.group === 'angle1').forEach(shape => {
  svg.addShape(shape, { fill: '#8b7355', stroke: '#6b5840', strokeWidth: 1 });
});

// Stamp second angle bricks
p.shapes.filter(s => s.group === 'angle2').forEach(shape => {
  svg.addShape(shape, { fill: '#a5886b', stroke: '#6b5840', strokeWidth: 1 });
});

saveOutput(svg.toString({ width: 500, height: 500, margin: 20 }), 'herringbone.svg');
