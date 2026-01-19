/**
 * Utility functions for examples
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Save SVG output to the examples/output directory
 * @param svg SVG content as string
 * @param filename Output filename (e.g., 'circle.svg')
 */
export function saveOutput(svg: string, filename: string): void {
  const outputDir = join(__dirname, 'output');
  
  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = join(outputDir, filename);
  writeFileSync(outputPath, svg);
  
  console.log(`✓ Generated: examples/output/${filename}`);
}
