/**
 * Simple test for sequence integration
 */

import { CircleContext, SVGCollector, Sequence } from '../../src';

// Create a sequence
const s = Sequence.repeat(0.5, 1, 1.5, 2);

// Create shapes with sequence scaling
const circle = new CircleContext();
circle
  .radius(15)
  .clone(11, 30)
  .scale(s);  // Each gets next: 0.5, 1, 1.5, 2, 0.5...

// Collect and render
const collector = new SVGCollector();
circle.stamp(collector);

const svg = collector.toString({
  width: 400,
  height: 400,
  margin: 20,
});

console.log(svg);
