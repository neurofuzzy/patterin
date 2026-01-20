/**
 * Sequence Generator Demo
 * 
 * Demonstrates all sequence modes: repeat, yoyo, once, shuffle, random,
 * additive, and multiplicative. Shows how sequences can replace loops
 * and manual indexing for more expressive, declarative code.
 */

import { shape, system, SVGCollector, Sequence } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// ============================================================================
// Example 1: Repeat Sequence - Basic cycling
// ============================================================================
// Create varying circle sizes that repeat
const sizes = Sequence.repeat(10, 20, 30, 40);

for (let i = 0; i < 12; i++) {
  shape.circle()
    .radius(sizes())  // Advances each time: 10, 20, 30, 40, 10, 20...
    .xy(-300 + i * 50, -250)
    .stamp(svg);
}

// ============================================================================
// Example 2: Yoyo Sequence - Back and forth
// ============================================================================
// Bounce between values for organic variation
const yoyoSizes = Sequence.yoyo(15, 25, 35, 25);

for (let i = 0; i < 10; i++) {
  shape.circle()
    .radius(yoyoSizes())  // Goes: 25, 35, 25, 15, 25, 35...
    .xy(-300 + i * 60, -100)
    .stamp(svg);
}

// ============================================================================
// Example 3: Random Sequence - Deterministic randomness
// ============================================================================
// Use a seed for reproducible "random" patterns
const randomAngles = Sequence.random(42, 0, 15, 30, 45);

for (let i = 0; i < 8; i++) {
  shape.rect()
    .size(60, 15)
    .rotate(randomAngles())  // Random but deterministic with seed 42
    .xy(-300 + i * 75, 50)
    .stamp(svg);
}

// ============================================================================
// Example 4: Additive Sequence - Running total
// ============================================================================
// Create expanding distances using cumulative addition
const distances = Sequence.additive(5, 10, 15, 10);
let xPos = -300;

for (let i = 0; i < 8; i++) {
  xPos += distances();  // Adds: 5, then 10, then 15, then 10, cycling...
  shape.circle()
    .radius(8)
    .xy(xPos, 180)
    .stamp(svg);
}

// ============================================================================
// Example 5: Multiplicative Sequence - Exponential growth
// ============================================================================
// Create exponentially growing sizes
const growth = Sequence.multiplicative(1.2, 1.3, 1.1);

let currentSize = 5;
for (let i = 0; i < 6; i++) {
  currentSize *= growth();  // Multiplies: ×1.2, ×1.3, ×1.1, cycling...
  shape.circle()
    .radius(Math.min(currentSize, 50))
    .xy(-300 + i * 100, 300)
    .stamp(svg);
}

// ============================================================================
// Example 6: Nested Sequences - Sequences inside sequences
// ============================================================================
// Create complex variation patterns by nesting
const innerSeq = Sequence.repeat(5, 10);
const outerSeq = Sequence.repeat(20, 30, innerSeq, 25);

for (let i = 0; i < 12; i++) {
  shape.square()
    .size(outerSeq())  // Uses nested sequence values
    .xy(200 + (i % 6) * 50, -250 + Math.floor(i / 6) * 50)
    .stamp(svg);
}

// ============================================================================
// Example 7: Sequences with Shape Collections - Declarative API
// ============================================================================
const scales = Sequence.repeat(0.5, 1, 1.5, 2);

shape.circle()
  .radius(15)
  .xy(-100, 250)
  .clone(11, 25)
  .scale(scales);  // Each circle gets next scale value

// Multi-axis scaling
const scaleX = Sequence.yoyo(0.5, 1, 1.5);
const scaleY = Sequence.repeat(1.5, 1, 0.5);

const rects = shape.rect()
  .size(20)
  .xy(-100, 320)
  .clone(11, 25);

rects.every(1).scaleX(scaleX);  // Varies width
rects.every(1).scaleY(scaleY);  // Varies height independently

saveOutput(svg.toString({ width: 1200, height: 800, margin: 50 }), 'sequences-demo.svg');
