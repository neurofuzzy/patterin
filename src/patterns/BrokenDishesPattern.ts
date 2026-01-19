import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
import { BrokenDishesOptions } from './PatternTypes';

/**
 * Create a traditional Broken Dishes quilt block pattern.
 * Made from four half-square triangles (HSTs) arranged in a pinwheel-like pattern.
 * Also known as "Yankee Puzzle" or "Hourglass," this classic block creates
 * dynamic movement when repeated.
 * 
 * @param options - Broken Dishes pattern configuration
 * @returns ShapesContext with grouped shapes
 * 
 * @example
 * ```typescript
 * const brokenDishes = pattern.brokenDishes({
 *   blockSize: 80,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createBrokenDishes(options: BrokenDishesOptions): ShapesContext {
    const { blockSize, bounds } = options;
    const shapes: Shape[] = [];

    const numRows = Math.ceil(bounds.height / blockSize);
    const numCols = Math.ceil(bounds.width / blockSize);

    const half = blockSize / 2;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * blockSize;
            const y = row * blockSize;

            // Top-left HST
            const tl1 = Shape.fromPoints([
                new Vector2(x, y),
                new Vector2(x + half, y),
                new Vector2(x, y + half)
            ]);
            tl1.group = 'dark';
            shapes.push(tl1);

            const tl2 = Shape.fromPoints([
                new Vector2(x + half, y),
                new Vector2(x + half, y + half),
                new Vector2(x, y + half)
            ]);
            tl2.group = 'light';
            shapes.push(tl2);

            // Top-right HST
            const tr1 = Shape.fromPoints([
                new Vector2(x + half, y),
                new Vector2(x + blockSize, y),
                new Vector2(x + blockSize, y + half)
            ]);
            tr1.group = 'dark';
            shapes.push(tr1);

            const tr2 = Shape.fromPoints([
                new Vector2(x + half, y),
                new Vector2(x + blockSize, y + half),
                new Vector2(x + half, y + half)
            ]);
            tr2.group = 'light';
            shapes.push(tr2);

            // Bottom-left HST - light at outer corner (bottom-left), dark at inner (top-right)
            const bl1 = Shape.fromPoints([
                new Vector2(x, y + half),
                new Vector2(x, y + blockSize),
                new Vector2(x + half, y + blockSize)
            ]);
            bl1.group = 'dark';
            shapes.push(bl1);

            const bl2 = Shape.fromPoints([
                new Vector2(x, y + half),
                new Vector2(x + half, y + half),
                new Vector2(x + half, y + blockSize)
            ]);
            bl2.group = 'light';
            shapes.push(bl2);

            // Bottom-right HST
            const br1 = Shape.fromPoints([
                new Vector2(x + half, y + half),
                new Vector2(x + blockSize, y + half),
                new Vector2(x + half, y + blockSize)
            ]);
            br1.group = 'light';
            shapes.push(br1);

            const br2 = Shape.fromPoints([
                new Vector2(x + blockSize, y + half),
                new Vector2(x + blockSize, y + blockSize),
                new Vector2(x + half, y + blockSize)
            ]);
            br2.group = 'dark';
            shapes.push(br2);
        }
    }

    return new ShapesContext(shapes);
}
