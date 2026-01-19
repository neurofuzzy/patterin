import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
/**
 * Create a traditional Snowball quilt block pattern.
 * A square with its corners cut off (or replaced with triangles), creating
 * an octagonal appearance. Simple yet effective block that creates interesting
 * secondary patterns when blocks are placed together.
 *
 * @param options - Snowball pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const snowball = pattern.snowball({
 *   blockSize: 80,
 *   cornerSize: 20,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createSnowball(options) {
    const { blockSize, bounds } = options;
    const cornerSize = options.cornerSize ?? blockSize / 4;
    const shapes = [];
    const numRows = Math.ceil(bounds.height / blockSize);
    const numCols = Math.ceil(bounds.width / blockSize);
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * blockSize;
            const y = row * blockSize;
            // Main octagon (center of snowball)
            const octagon = Shape.fromPoints([
                new Vector2(x + cornerSize, y), // top edge start
                new Vector2(x + blockSize - cornerSize, y), // top edge end
                new Vector2(x + blockSize, y + cornerSize), // right edge start
                new Vector2(x + blockSize, y + blockSize - cornerSize), // right edge end
                new Vector2(x + blockSize - cornerSize, y + blockSize), // bottom edge start
                new Vector2(x + cornerSize, y + blockSize), // bottom edge end
                new Vector2(x, y + blockSize - cornerSize), // left edge start
                new Vector2(x, y + cornerSize) // left edge end
            ]);
            octagon.group = 'ball';
            shapes.push(octagon);
            // Four corner triangles (background)
            // Top-left corner
            const tlCorner = Shape.fromPoints([
                new Vector2(x, y),
                new Vector2(x + cornerSize, y),
                new Vector2(x, y + cornerSize)
            ]);
            tlCorner.group = 'corner';
            shapes.push(tlCorner);
            // Top-right corner
            const trCorner = Shape.fromPoints([
                new Vector2(x + blockSize - cornerSize, y),
                new Vector2(x + blockSize, y),
                new Vector2(x + blockSize, y + cornerSize)
            ]);
            trCorner.group = 'corner';
            shapes.push(trCorner);
            // Bottom-left corner
            const blCorner = Shape.fromPoints([
                new Vector2(x, y + blockSize - cornerSize),
                new Vector2(x, y + blockSize),
                new Vector2(x + cornerSize, y + blockSize)
            ]);
            blCorner.group = 'corner';
            shapes.push(blCorner);
            // Bottom-right corner
            const brCorner = Shape.fromPoints([
                new Vector2(x + blockSize, y + blockSize - cornerSize),
                new Vector2(x + blockSize - cornerSize, y + blockSize),
                new Vector2(x + blockSize, y + blockSize)
            ]);
            brCorner.group = 'corner';
            shapes.push(brCorner);
        }
    }
    return new ShapesContext(shapes);
}
