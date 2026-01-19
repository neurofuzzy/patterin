/**
 * Basic Circle
 * 
 * The simplest example: create a circle and render it to SVG.
 */

import { shape, SVGCollector } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Create a circle with 50-unit radius
const circle = shape.circle().radius(50);

// Render to SVG
circle.stamp(svg);

// Save to file
saveOutput(svg.toString({ width: 400, height: 400, margin: 20 }), 'circle.svg');
