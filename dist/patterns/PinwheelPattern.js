import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
/**
 * Create a traditional Pinwheel quilt block pattern.
 * Made from four half-square triangles (HSTs) arranged to create a spinning effect.
 * Classic quilting block dating back to the 1800s.
 *
 * @param options - Pinwheel pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const pinwheel = pattern.pinwheel({
 *   blockSize: 80,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createPinwheel(options) {
    const { blockSize, bounds } = options;
    const shapes = [];
    const numRows = Math.ceil(bounds.height / blockSize);
    const numCols = Math.ceil(bounds.width / blockSize);
    const half = blockSize / 2;
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * blockSize;
            const y = row * blockSize;
            // Create 4 HSTs arranged in a pinwheel
            // Top-left HST (blade pointing up-left)
            const tl1 = Shape.fromPoints([
                new Vector2(x, y),
                new Vector2(x + half, y),
                new Vector2(x, y + half)
            ]);
            tl1.group = 'blade';
            shapes.push(tl1);
            const tl2 = Shape.fromPoints([
                new Vector2(x + half, y),
                new Vector2(x + half, y + half),
                new Vector2(x, y + half)
            ]);
            tl2.group = 'background';
            shapes.push(tl2);
            // Top-right HST (blade pointing up-right)
            const tr1 = Shape.fromPoints([
                new Vector2(x + half, y),
                new Vector2(x + blockSize, y),
                new Vector2(x + half, y + half)
            ]);
            tr1.group = 'background';
            shapes.push(tr1);
            const tr2 = Shape.fromPoints([
                new Vector2(x + blockSize, y),
                new Vector2(x + blockSize, y + half),
                new Vector2(x + half, y + half)
            ]);
            tr2.group = 'blade';
            shapes.push(tr2);
            // Bottom-left HST (blade pointing down-left)
            const bl1 = Shape.fromPoints([
                new Vector2(x, y + half),
                new Vector2(x + half, y + half),
                new Vector2(x, y + blockSize)
            ]);
            bl1.group = 'background';
            shapes.push(bl1);
            const bl2 = Shape.fromPoints([
                new Vector2(x, y + blockSize),
                new Vector2(x + half, y + half),
                new Vector2(x + half, y + blockSize)
            ]);
            bl2.group = 'blade';
            shapes.push(bl2);
            // Bottom-right HST (blade pointing down-right)
            const br1 = Shape.fromPoints([
                new Vector2(x + half, y + half),
                new Vector2(x + blockSize, y + half),
                new Vector2(x + half, y + blockSize)
            ]);
            br1.group = 'blade';
            shapes.push(br1);
            const br2 = Shape.fromPoints([
                new Vector2(x + blockSize, y + half),
                new Vector2(x + blockSize, y + blockSize),
                new Vector2(x + half, y + blockSize)
            ]);
            br2.group = 'background';
            shapes.push(br2);
        }
    }
    return new ShapesContext(shapes);
}
