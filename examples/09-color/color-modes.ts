/**
 * Color System Integration Test
 * Tests all three rendering modes (fill, stroke, glass) with the Palette system
 */

import { shape, Palette, Sequence, SVGCollector } from '../../src';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure output directory exists
mkdirSync(join(__dirname, '../output'), { recursive: true });

// Create a color palette
const colors = new Palette(6, "reds", "oranges", "yellows", "greens", "cyans", "blues")
  .vibrant()
  .toArray();

console.log('Generated colors:', colors);

// Create a sequence of colors
const colorSeq = Sequence.repeat(...colors);

// Test 1: Fill mode
const svg1 = new SVGCollector();
svg1.setRenderMode('fill');

const circles1 = shape.circle()
  .radius(30)
  .clone(5, 80, 0);

circles1.shapes.color(colorSeq);
circles1.stamp(svg1);

writeFileSync(
  join(__dirname, '../output/color-fill.svg'),
  svg1.toString({ width: 500, height: 200, margin: 20 })
);

console.log('✓ Fill mode test complete');

// Test 2: Stroke mode
const svg2 = new SVGCollector();
svg2.setRenderMode('stroke');

// Reset sequence
colorSeq.reset();

const circles2 = shape.circle()
  .radius(30)
  .clone(5, 80, 0);

circles2.shapes.color(colorSeq);
circles2.stamp(svg2);

writeFileSync(
  join(__dirname, '../output/color-stroke.svg'),
  svg2.toString({ width: 500, height: 200, margin: 20 })
);

console.log('✓ Stroke mode test complete');

// Test 3: Glass mode
const svg3 = new SVGCollector();
svg3.setRenderMode('glass');

// Reset sequence
colorSeq.reset();

const circles3 = shape.circle()
  .radius(30)
  .clone(5, 80, 0);

circles3.shapes.color(colorSeq);
circles3.stamp(svg3);

writeFileSync(
  join(__dirname, '../output/color-glass.svg'),
  svg3.toString({ width: 500, height: 200, margin: 20 })
);

console.log('✓ Glass mode test complete');

// Test 4: Individual color assignment
const svg4 = new SVGCollector();
svg4.setRenderMode('fill');

shape.rect().size(40).xy(0, 0).color('#ff5733').stamp(svg4);
shape.circle().radius(20).xy(100, 0).color('#3498db').stamp(svg4);
shape.hexagon().radius(25).xy(200, 0).color('#2ecc71').stamp(svg4);

writeFileSync(
  join(__dirname, '../output/color-individual.svg'),
  svg4.toString({ width: 300, height: 100, margin: 20 })
);

console.log('✓ Individual color assignment test complete');

// Test 5: Auto-assignment from default palette
const svg5 = new SVGCollector();
svg5.setRenderMode('stroke');

// Shapes without .color() get auto-assigned
shape.rect().size(30).xy(0, 0).stamp(svg5);
shape.circle().radius(20).xy(80, 0).stamp(svg5);
shape.hexagon().radius(15).xy(160, 0).stamp(svg5);
shape.triangle().radius(20).xy(240, 0).stamp(svg5);
shape.square().size(30).xy(320, 0).stamp(svg5);

writeFileSync(
  join(__dirname, '../output/color-auto.svg'),
  svg5.toString({ width: 400, height: 100, margin: 20 })
);

console.log('✓ Auto-assignment test complete');

// Test 6: Mixed rendering modes
const svg6 = new SVGCollector();

svg6.setRenderMode('fill');
shape.rect().size(40).xy(0, 0).color('#e74c3c').stamp(svg6);

svg6.setRenderMode('stroke');
shape.circle().radius(25).xy(100, 0).color('#3498db').stamp(svg6);

svg6.setRenderMode('glass');
shape.hexagon().radius(25).xy(200, 0).color('#2ecc71').stamp(svg6);

writeFileSync(
  join(__dirname, '../output/color-mixed.svg'),
  svg6.toString({ width: 300, height: 100, margin: 20 })
);

console.log('✓ Mixed modes test complete');

console.log('\n✅ All color system tests passed!');
console.log('SVG files saved to examples/output/');
