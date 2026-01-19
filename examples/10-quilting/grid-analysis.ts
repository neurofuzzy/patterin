/**
 * Grid Analysis - Show the underlying grid structure of each pattern
 */

import { pattern, SVGCollector, Shape, Vector2 } from '../../src/index';
import { saveOutput } from '../utils';

const blockSize = 120;

function analyzeBlock(name: string, shapes: Shape[]) {
  console.log(`\n${name}:`);
  console.log(`  Total shapes: ${shapes.length}`);
  console.log(`  Groups: ${[...new Set(shapes.map(s => s.group))].join(', ')}`);
  
  // Check if all vertices are on expected grid points
  const vertices = shapes.flatMap(s => s.vertices.map(v => v.position));
  const uniqueX = [...new Set(vertices.map(v => Math.round(v.x)))].sort((a,b) => a-b);
  const uniqueY = [...new Set(vertices.map(v => Math.round(v.y)))].sort((a,b) => a-b);
  
  console.log(`  X coords: ${uniqueX.slice(0, 10).join(', ')}${uniqueX.length > 10 ? '...' : ''}`);
  console.log(`  Y coords: ${uniqueY.slice(0, 10).join(', ')}${uniqueY.length > 10 ? '...' : ''}`);
  
  // Determine grid type
  if (uniqueX.length === 4 && uniqueY.length === 4) {
    console.log(`  Grid: 3x3 (Nine-Patch)`);
  } else if (uniqueX.length === 3 && uniqueY.length === 3) {
    console.log(`  Grid: 2x2 (Four-Patch)`);
  } else {
    console.log(`  Grid: Custom (${uniqueX.length-1}x${uniqueY.length-1})`);
  }
}

// Nine-Patch blocks (3x3)
analyzeBlock('Friendship Star', pattern.friendshipStar({ blockSize, bounds: { width: blockSize, height: blockSize }}).shapes);
analyzeBlock('Shoo Fly', pattern.shooFly({ blockSize, bounds: { width: blockSize, height: blockSize }}).shapes);
analyzeBlock('Sawtooth Star', pattern.sawtoothStar({ blockSize, bounds: { width: blockSize, height: blockSize }}).shapes);

// Four-Patch blocks (2x2)
analyzeBlock('Pinwheel', pattern.pinwheel({ blockSize, bounds: { width: blockSize, height: blockSize }}).shapes);
analyzeBlock('Broken Dishes', pattern.brokenDishes({ blockSize, bounds: { width: blockSize, height: blockSize }}).shapes);
analyzeBlock('Bow Tie', pattern.bowTie({ blockSize, bounds: { width: blockSize, height: blockSize }}).shapes);

// Other blocks
analyzeBlock('Snowball', pattern.snowball({ blockSize, cornerSize: blockSize/4, bounds: { width: blockSize, height: blockSize }}).shapes);
analyzeBlock('Dutchman\'s Puzzle', pattern.dutchmansPuzzle({ blockSize, bounds: { width: blockSize, height: blockSize }}).shapes);
analyzeBlock('Eight-Pointed Star', pattern.eightPointedStar({ blockSize, bounds: { width: blockSize, height: blockSize }}).shapes);
analyzeBlock('Log Cabin', pattern.logCabin({ blockSize, stripWidth: 15, bounds: { width: blockSize, height: blockSize }}).shapes);
