import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
import { FriendshipStarOptions } from './PatternTypes';

/**
 * Create a traditional Friendship Star quilt block pattern.
 * A nine-patch variation featuring a center square, four corner squares,
 * and four half-square triangle units forming star points.
 * One of the most beloved traditional quilt blocks.
 * 
 * @param options - Friendship Star pattern configuration
 * @returns ShapesContext with grouped shapes
 * 
 * @example
 * ```typescript
 * const friendshipStar = pattern.friendshipStar({
 *   blockSize: 90,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createFriendshipStar(options: FriendshipStarOptions): ShapesContext {
    const { blockSize, bounds } = options;
    const shapes: Shape[] = [];

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
            center.group = 'star';
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

            // Four HST star points (top, right, bottom, left)
            // Top point - star triangle in lower-right of cell, pointing toward center
            const topStar = Shape.fromPoints([
                new Vector2(x + 2 * third, y),
                new Vector2(x + 2 * third, y + third),
                new Vector2(x + third, y + third)
            ]);
            topStar.group = 'star';
            shapes.push(topStar);

            const topBg = Shape.fromPoints([
                new Vector2(x + third, y),
                new Vector2(x + 2 * third, y),
                new Vector2(x + third, y + third)
            ]);
            topBg.group = 'background';
            shapes.push(topBg);

            // Right point - star triangle in lower-left of cell, pointing toward center
            const rightStar = Shape.fromPoints([
                new Vector2(x + 2 * third, y + third),
                new Vector2(x + 2 * third, y + 2 * third),
                new Vector2(x + blockSize, y + 2 * third)
            ]);
            rightStar.group = 'star';
            shapes.push(rightStar);

            const rightBg = Shape.fromPoints([
                new Vector2(x + 2 * third, y + third),
                new Vector2(x + blockSize, y + third),
                new Vector2(x + blockSize, y + 2 * third)
            ]);
            rightBg.group = 'background';
            shapes.push(rightBg);

            // Bottom point - star triangle in upper-left of cell, pointing toward center
            const bottomStar = Shape.fromPoints([
                new Vector2(x + third, y + 2 * third),
                new Vector2(x + 2 * third, y + 2 * third),
                new Vector2(x + third, y + blockSize)
            ]);
            bottomStar.group = 'star';
            shapes.push(bottomStar);

            const bottomBg = Shape.fromPoints([
                new Vector2(x + 2 * third, y + 2 * third),
                new Vector2(x + 2 * third, y + blockSize),
                new Vector2(x + third, y + blockSize)
            ]);
            bottomBg.group = 'background';
            shapes.push(bottomBg);

            // Left point - star triangle in upper-right of cell, pointing toward center
            const leftStar = Shape.fromPoints([
                new Vector2(x, y + third),
                new Vector2(x + third, y + third),
                new Vector2(x + third, y + 2 * third)
            ]);
            leftStar.group = 'star';
            shapes.push(leftStar);

            const leftBg = Shape.fromPoints([
                new Vector2(x, y + third),
                new Vector2(x + third, y + 2 * third),
                new Vector2(x, y + 2 * third)
            ]);
            leftBg.group = 'background';
            shapes.push(leftBg);
        }
    }

    return new ShapesContext(shapes);
}
