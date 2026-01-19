import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
/**
 * Create a traditional Bow Tie quilt block pattern.
 * A variation of the Four Patch with corner triangles creating a bow tie shape.
 * Classic quilting block that creates a distinctive tied appearance.
 *
 * @param options - Bow Tie pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const bowTie = pattern.bowTie({
 *   blockSize: 80,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createBowTie(options) {
    const { blockSize, bounds } = options;
    const shapes = [];
    const numRows = Math.ceil(bounds.height / blockSize);
    const numCols = Math.ceil(bounds.width / blockSize);
    const half = blockSize / 2;
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * blockSize;
            const y = row * blockSize;
            // Bow Tie as a 2x2 Four-Patch with corner HSTs
            // Top-left quadrant
            const tlCorner = Shape.fromPoints([
                new Vector2(x, y),
                new Vector2(x + half, y),
                new Vector2(x, y + half)
            ]);
            tlCorner.group = 'tie';
            shapes.push(tlCorner);
            const tlBg = Shape.fromPoints([
                new Vector2(x + half, y),
                new Vector2(x + half, y + half),
                new Vector2(x, y + half)
            ]);
            tlBg.group = 'background';
            shapes.push(tlBg);
            // Top-right quadrant
            const trCorner = Shape.fromPoints([
                new Vector2(x + half, y),
                new Vector2(x + blockSize, y),
                new Vector2(x + blockSize, y + half)
            ]);
            trCorner.group = 'tie';
            shapes.push(trCorner);
            const trBg = Shape.fromPoints([
                new Vector2(x + half, y),
                new Vector2(x + blockSize, y + half),
                new Vector2(x + half, y + half)
            ]);
            trBg.group = 'background';
            shapes.push(trBg);
            // Bottom-left quadrant
            const blCorner = Shape.fromPoints([
                new Vector2(x, y + half),
                new Vector2(x + half, y + blockSize),
                new Vector2(x, y + blockSize)
            ]);
            blCorner.group = 'tie';
            shapes.push(blCorner);
            const blBg = Shape.fromPoints([
                new Vector2(x, y + half),
                new Vector2(x + half, y + half),
                new Vector2(x + half, y + blockSize)
            ]);
            blBg.group = 'background';
            shapes.push(blBg);
            // Bottom-right quadrant
            const brCorner = Shape.fromPoints([
                new Vector2(x + blockSize, y + half),
                new Vector2(x + blockSize, y + blockSize),
                new Vector2(x + half, y + blockSize)
            ]);
            brCorner.group = 'tie';
            shapes.push(brCorner);
            const brBg = Shape.fromPoints([
                new Vector2(x + half, y + half),
                new Vector2(x + blockSize, y + half),
                new Vector2(x + half, y + blockSize)
            ]);
            brBg.group = 'background';
            shapes.push(brBg);
        }
    }
    return new ShapesContext(shapes);
}
