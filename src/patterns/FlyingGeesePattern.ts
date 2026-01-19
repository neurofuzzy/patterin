import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
import { FlyingGeeseOptions } from './PatternTypes';

/**
 * Create a traditional Flying Geese quilt pattern.
 * Features a central triangle (the "goose") with two smaller side triangles
 * (the "sky"). The goose is typically darker while the sky pieces are lighter.
 * One of the most versatile and popular traditional quilt units, often used
 * in borders and as building blocks for complex patterns.
 * 
 * @param options - Flying Geese pattern configuration
 * @returns ShapesContext with grouped shapes
 * 
 * @example
 * ```typescript
 * const flyingGeese = pattern.flyingGeese({
 *   unitSize: 60,
 *   direction: 'horizontal',
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createFlyingGeese(options: FlyingGeeseOptions): ShapesContext {
    const { unitSize, bounds } = options;
    const direction = options.direction ?? 'horizontal';
    const shapes: Shape[] = [];

    // For block-based layouts, use square units (1:1 ratio)
    // Traditional 2:1 flying geese work for borders, but blocks need equal subdivision
    const geeseWidth = unitSize;
    const geeseHeight = unitSize;

    if (direction === 'horizontal') {
        const numRows = Math.ceil(bounds.height / geeseHeight);
        const numCols = Math.ceil(bounds.width / geeseWidth);

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const x = col * geeseWidth;
                const y = row * geeseHeight;

                // Goose (large triangle pointing right)
                const goose = Shape.fromPoints([
                    new Vector2(x, y),
                    new Vector2(x + geeseWidth, y + geeseHeight / 2),
                    new Vector2(x, y + geeseHeight)
                ]);
                goose.group = 'goose';
                shapes.push(goose);

                // Top sky triangle
                const skyTop = Shape.fromPoints([
                    new Vector2(x, y),
                    new Vector2(x + geeseWidth, y),
                    new Vector2(x + geeseWidth, y + geeseHeight / 2)
                ]);
                skyTop.group = 'sky';
                shapes.push(skyTop);

                // Bottom sky triangle
                const skyBottom = Shape.fromPoints([
                    new Vector2(x, y + geeseHeight),
                    new Vector2(x + geeseWidth, y + geeseHeight / 2),
                    new Vector2(x + geeseWidth, y + geeseHeight)
                ]);
                skyBottom.group = 'sky';
                shapes.push(skyBottom);
            }
        }
    } else { // vertical
        const numRows = Math.ceil(bounds.height / geeseWidth);
        const numCols = Math.ceil(bounds.width / geeseHeight);

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const x = col * geeseHeight;
                const y = row * geeseWidth;

                // Goose (large triangle pointing down)
                const goose = Shape.fromPoints([
                    new Vector2(x, y),
                    new Vector2(x + geeseHeight, y),
                    new Vector2(x + geeseHeight / 2, y + geeseWidth)
                ]);
                goose.group = 'goose';
                shapes.push(goose);

                // Left sky triangle
                const skyLeft = Shape.fromPoints([
                    new Vector2(x, y),
                    new Vector2(x, y + geeseWidth),
                    new Vector2(x + geeseHeight / 2, y + geeseWidth)
                ]);
                skyLeft.group = 'sky';
                shapes.push(skyLeft);

                // Right sky triangle
                const skyRight = Shape.fromPoints([
                    new Vector2(x + geeseHeight, y),
                    new Vector2(x + geeseHeight / 2, y + geeseWidth),
                    new Vector2(x + geeseHeight, y + geeseWidth)
                ]);
                skyRight.group = 'sky';
                shapes.push(skyRight);
            }
        }
    }

    return new ShapesContext(shapes);
}
