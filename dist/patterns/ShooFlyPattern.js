import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
/**
 * Create a traditional Shoo Fly quilt block pattern.
 * Similar to Friendship Star, this nine-patch block features corner HSTs
 * with a center square, creating an X pattern. One of the simplest and
 * most popular traditional quilt blocks, dating back to pioneer times.
 *
 * @param options - Shoo Fly pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const shooFly = pattern.shooFly({
 *   blockSize: 90,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createShooFly(options) {
    const { blockSize, bounds } = options;
    const shapes = [];
    const numRows = Math.ceil(bounds.height / blockSize);
    const numCols = Math.ceil(bounds.width / blockSize);
    const third = blockSize / 3;
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * blockSize;
            const y = row * blockSize;
            // Center square
            const center = Shape.fromPoints([
                new Vector2(x + third, y + third),
                new Vector2(x + 2 * third, y + third),
                new Vector2(x + 2 * third, y + 2 * third),
                new Vector2(x + third, y + 2 * third)
            ]);
            center.group = 'center';
            shapes.push(center);
            // Four side squares (plain background)
            const sides = [
                [1, 0], [2, 1], [1, 2], [0, 1] // top, right, bottom, left
            ];
            sides.forEach(([sx, sy]) => {
                const side = Shape.fromPoints([
                    new Vector2(x + sx * third, y + sy * third),
                    new Vector2(x + (sx + 1) * third, y + sy * third),
                    new Vector2(x + (sx + 1) * third, y + (sy + 1) * third),
                    new Vector2(x + sx * third, y + (sy + 1) * third)
                ]);
                side.group = 'background';
                shapes.push(side);
            });
            // Four corner HSTs
            // Top-left corner - dark triangle should be in bottom-right (toward center)
            const tlLight = Shape.fromPoints([
                new Vector2(x, y),
                new Vector2(x + third, y),
                new Vector2(x, y + third)
            ]);
            tlLight.group = 'light';
            shapes.push(tlLight);
            const tlDark = Shape.fromPoints([
                new Vector2(x + third, y),
                new Vector2(x + third, y + third),
                new Vector2(x, y + third)
            ]);
            tlDark.group = 'dark';
            shapes.push(tlDark);
            // Top-right corner - dark triangle should be in bottom-left (toward center)
            const trLight = Shape.fromPoints([
                new Vector2(x + 2 * third, y),
                new Vector2(x + blockSize, y),
                new Vector2(x + blockSize, y + third)
            ]);
            trLight.group = 'light';
            shapes.push(trLight);
            const trDark = Shape.fromPoints([
                new Vector2(x + 2 * third, y),
                new Vector2(x + blockSize, y + third),
                new Vector2(x + 2 * third, y + third)
            ]);
            trDark.group = 'dark';
            shapes.push(trDark);
            // Bottom-left corner - dark triangle should be in top-right (toward center)
            const blLight = Shape.fromPoints([
                new Vector2(x, y + 2 * third),
                new Vector2(x + third, y + blockSize),
                new Vector2(x, y + blockSize)
            ]);
            blLight.group = 'light';
            shapes.push(blLight);
            const blDark = Shape.fromPoints([
                new Vector2(x, y + 2 * third),
                new Vector2(x + third, y + 2 * third),
                new Vector2(x + third, y + blockSize)
            ]);
            blDark.group = 'dark';
            shapes.push(blDark);
            // Bottom-right corner - dark triangle should be in top-left (toward center)
            const brLight = Shape.fromPoints([
                new Vector2(x + blockSize, y + 2 * third),
                new Vector2(x + blockSize, y + blockSize),
                new Vector2(x + 2 * third, y + blockSize)
            ]);
            brLight.group = 'light';
            shapes.push(brLight);
            const brDark = Shape.fromPoints([
                new Vector2(x + 2 * third, y + 2 * third),
                new Vector2(x + blockSize, y + 2 * third),
                new Vector2(x + 2 * third, y + blockSize)
            ]);
            brDark.group = 'dark';
            shapes.push(brDark);
        }
    }
    return new ShapesContext(shapes);
}
