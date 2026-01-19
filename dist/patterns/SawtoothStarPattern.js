import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
/**
 * Create a traditional Sawtooth Star quilt block pattern.
 * Features a center square with four Flying Geese star points and four corner squares.
 * The "sawtooth" edges of the star points give this classic block its distinctive name.
 * Very popular traditional block that creates striking quilts.
 *
 * @param options - Sawtooth Star pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const sawtoothStar = pattern.sawtoothStar({
 *   blockSize: 120,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createSawtoothStar(options) {
    const { blockSize, bounds } = options;
    const shapes = [];
    const numRows = Math.ceil(bounds.height / blockSize);
    const numCols = Math.ceil(bounds.width / blockSize);
    const third = blockSize / 3;
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * blockSize;
            const y = row * blockSize;
            // Center square (star center)
            const center = Shape.fromPoints([
                new Vector2(x + third, y + third),
                new Vector2(x + 2 * third, y + third),
                new Vector2(x + 2 * third, y + 2 * third),
                new Vector2(x + third, y + 2 * third)
            ]);
            center.group = 'star-center';
            shapes.push(center);
            // Four corner squares (background)
            const corners = [
                [0, 0], [2, 0], [0, 2], [2, 2]
            ];
            corners.forEach(([cx, cy]) => {
                const corner = Shape.fromPoints([
                    new Vector2(x + cx * third, y + cy * third),
                    new Vector2(x + (cx + 1) * third, y + cy * third),
                    new Vector2(x + (cx + 1) * third, y + (cy + 1) * third),
                    new Vector2(x + cx * third, y + (cy + 1) * third)
                ]);
                corner.group = 'background';
                shapes.push(corner);
            });
            // Four Flying Geese star points
            // Top point (pointing up)
            const topGoose = Shape.fromPoints([
                new Vector2(x + third, y + third),
                new Vector2(x + 1.5 * third, y),
                new Vector2(x + 2 * third, y + third)
            ]);
            topGoose.group = 'star-point';
            shapes.push(topGoose);
            const topSkyLeft = Shape.fromPoints([
                new Vector2(x + third, y),
                new Vector2(x + 1.5 * third, y),
                new Vector2(x + third, y + third)
            ]);
            topSkyLeft.group = 'background';
            shapes.push(topSkyLeft);
            const topSkyRight = Shape.fromPoints([
                new Vector2(x + 1.5 * third, y),
                new Vector2(x + 2 * third, y),
                new Vector2(x + 2 * third, y + third)
            ]);
            topSkyRight.group = 'background';
            shapes.push(topSkyRight);
            // Right point (pointing right)
            const rightGoose = Shape.fromPoints([
                new Vector2(x + 2 * third, y + third),
                new Vector2(x + blockSize, y + 1.5 * third),
                new Vector2(x + 2 * third, y + 2 * third)
            ]);
            rightGoose.group = 'star-point';
            shapes.push(rightGoose);
            const rightSkyTop = Shape.fromPoints([
                new Vector2(x + 2 * third, y + third),
                new Vector2(x + blockSize, y + third),
                new Vector2(x + blockSize, y + 1.5 * third)
            ]);
            rightSkyTop.group = 'background';
            shapes.push(rightSkyTop);
            const rightSkyBottom = Shape.fromPoints([
                new Vector2(x + blockSize, y + 1.5 * third),
                new Vector2(x + blockSize, y + 2 * third),
                new Vector2(x + 2 * third, y + 2 * third)
            ]);
            rightSkyBottom.group = 'background';
            shapes.push(rightSkyBottom);
            // Bottom point (pointing down)
            const bottomGoose = Shape.fromPoints([
                new Vector2(x + third, y + 2 * third),
                new Vector2(x + 2 * third, y + 2 * third),
                new Vector2(x + 1.5 * third, y + blockSize)
            ]);
            bottomGoose.group = 'star-point';
            shapes.push(bottomGoose);
            const bottomSkyLeft = Shape.fromPoints([
                new Vector2(x + third, y + 2 * third),
                new Vector2(x + 1.5 * third, y + blockSize),
                new Vector2(x + third, y + blockSize)
            ]);
            bottomSkyLeft.group = 'background';
            shapes.push(bottomSkyLeft);
            const bottomSkyRight = Shape.fromPoints([
                new Vector2(x + 1.5 * third, y + blockSize),
                new Vector2(x + 2 * third, y + 2 * third),
                new Vector2(x + 2 * third, y + blockSize)
            ]);
            bottomSkyRight.group = 'background';
            shapes.push(bottomSkyRight);
            // Left point (pointing left)
            const leftGoose = Shape.fromPoints([
                new Vector2(x, y + 1.5 * third),
                new Vector2(x + third, y + 2 * third),
                new Vector2(x + third, y + third)
            ]);
            leftGoose.group = 'star-point';
            shapes.push(leftGoose);
            const leftSkyTop = Shape.fromPoints([
                new Vector2(x, y + third),
                new Vector2(x, y + 1.5 * third),
                new Vector2(x + third, y + third)
            ]);
            leftSkyTop.group = 'background';
            shapes.push(leftSkyTop);
            const leftSkyBottom = Shape.fromPoints([
                new Vector2(x, y + 1.5 * third),
                new Vector2(x, y + 2 * third),
                new Vector2(x + third, y + 2 * third)
            ]);
            leftSkyBottom.group = 'background';
            shapes.push(leftSkyBottom);
        }
    }
    return new ShapesContext(shapes);
}
