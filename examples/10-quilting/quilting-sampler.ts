/**
 * Quilting Sampler Example
 * 
 * Demonstrates all available quilt block templates using system.quilt().
 */

import { system, SVGCollector, Vector2 } from '../../src/index';
import { saveOutput } from '../utils';

const svg = new SVGCollector();

// Block colors for each position
const blockConfigs = [
  { block: 'PW', dark: '#3498db', light: '#ecf0f1' },      // Pinwheel (blue)
  { block: 'BD', dark: '#1abc9c', light: '#16a085' },      // Broken Dishes (teal)
  { block: 'FS', dark: '#e74c3c', light: '#ecf0f1' },      // Friendship Star (red)
  { block: 'SF', dark: '#9b59b6', light: '#ecf0f1' },      // Shoo Fly (purple)
  { block: 'BT', dark: '#34495e', light: '#ecf0f1' },      // Bow Tie (grey)
  { block: 'DP', dark: '#e67e22', light: '#ecf0f1' },      // Dutchman's Puzzle (orange)
  { block: 'SS', dark: '#f39c12', light: '#ecf0f1' },      // Sawtooth Star (yellow)
  { block: 'BD', dark: '#27ae60', light: '#ecf0f1' },      // Broken Dishes (green)
  { block: 'PW', dark: '#c0392b', light: '#f1c40f' },      // Pinwheel (red/yellow)
];

const blockSize = 120;
const spacing = 10;
const cols = 3;

// Create 9 individual 1x1 quilts for the sampler grid
blockConfigs.forEach((config, index) => {
  const row = Math.floor(index / cols);
  const col = index % cols;

  const quilt = system.quilt({
    gridSize: [1, 1],
    blockSize
  });
  quilt.pattern.placeBlock(config.block);

  // Offset and add to SVG
  const offsetX = col * (blockSize + spacing);
  const offsetY = row * (blockSize + spacing);

  quilt.shapes.shapes.forEach(shape => {
    const color = shape.group === 'dark' ? config.dark : config.light;
    const translated = shape.clone();
    translated.translate(new Vector2(offsetX, offsetY));
    svg.addShape(translated, { fill: color, stroke: '#000', strokeWidth: 1 });
  });
});

const width = cols * (blockSize + spacing) + 20;
const height = 3 * (blockSize + spacing) + 20;
saveOutput(svg.toString({ width, height, margin: 10 }), 'quilting-sampler.svg');
console.log('✓ Generated: examples/output/quilting-sampler.svg');
