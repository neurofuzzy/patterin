import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
/**
 * Create a brick pattern with various bond types.
 * Generates brick laying patterns including running bond, stack bond,
 * basket weave, Flemish bond, and a special James Bond pattern.
 *
 * @param options - Brick pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const bricks = createBrick({
 *   type: 'running',
 *   brickWidth: 60,
 *   brickHeight: 30,
 *   mortarWidth: 2,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createBrick(options) {
    const bondType = options.type ?? 'running';
    switch (bondType) {
        case 'running':
            return createRunningBond(options);
        case 'stack':
            return createStackBond(options);
        case 'basket':
            return createBasketWeave(options);
        case 'flemish':
            return createFlemishBond(options);
        default:
            return createRunningBond(options);
    }
}
/**
 * Running Bond - Classic brick pattern where each row is offset by half a brick.
 * This is the most common brick laying pattern.
 */
function createRunningBond(options) {
    const { brickWidth, brickHeight, bounds } = options;
    const mortar = options.mortarWidth ?? 2;
    const shapes = [];
    const totalBrickHeight = brickHeight + mortar;
    const totalBrickWidth = brickWidth + mortar;
    const numRows = Math.ceil(bounds.height / totalBrickHeight) + 1;
    const numCols = Math.ceil(bounds.width / totalBrickWidth) + 2;
    for (let row = 0; row < numRows; row++) {
        const y = row * totalBrickHeight;
        // Offset every other row by half a brick
        const xOffset = (row % 2) * (totalBrickWidth / 2);
        for (let col = 0; col < numCols; col++) {
            const x = col * totalBrickWidth - xOffset;
            const brick = Shape.fromPoints([
                new Vector2(x, y),
                new Vector2(x + brickWidth, y),
                new Vector2(x + brickWidth, y + brickHeight),
                new Vector2(x, y + brickHeight)
            ]);
            brick.group = row % 2 === 0 ? 'brick-even' : 'brick-odd';
            shapes.push(brick);
        }
    }
    return new ShapesContext(shapes);
}
/**
 * Stack Bond - Bricks stacked directly on top of each other in a grid pattern.
 */
function createStackBond(options) {
    const { brickWidth, brickHeight, bounds } = options;
    const mortar = options.mortarWidth ?? 2;
    const shapes = [];
    const totalBrickHeight = brickHeight + mortar;
    const totalBrickWidth = brickWidth + mortar;
    const numRows = Math.ceil(bounds.height / totalBrickHeight) + 1;
    const numCols = Math.ceil(bounds.width / totalBrickWidth) + 1;
    for (let row = 0; row < numRows; row++) {
        const y = row * totalBrickHeight;
        for (let col = 0; col < numCols; col++) {
            const x = col * totalBrickWidth;
            const brick = Shape.fromPoints([
                new Vector2(x, y),
                new Vector2(x + brickWidth, y),
                new Vector2(x + brickWidth, y + brickHeight),
                new Vector2(x, y + brickHeight)
            ]);
            brick.group = (row + col) % 2 === 0 ? 'brick-light' : 'brick-dark';
            shapes.push(brick);
        }
    }
    return new ShapesContext(shapes);
}
/**
 * Basket Weave - Pairs of bricks alternating horizontal/vertical orientation.
 */
function createBasketWeave(options) {
    const { brickWidth, brickHeight, bounds } = options;
    const mortar = options.mortarWidth ?? 2;
    const shapes = [];
    // Unit is 2 bricks side by side
    const unitWidth = brickWidth + mortar;
    const unitHeight = brickWidth + mortar; // Square units
    const numRows = Math.ceil(bounds.height / unitHeight) + 1;
    const numCols = Math.ceil(bounds.width / unitWidth) + 1;
    for (let row = 0; row < numRows; row++) {
        const baseY = row * unitHeight;
        for (let col = 0; col < numCols; col++) {
            const baseX = col * unitWidth;
            const isHorizontal = (row + col) % 2 === 0;
            if (isHorizontal) {
                // Two horizontal bricks stacked
                const brick1 = Shape.fromPoints([
                    new Vector2(baseX, baseY),
                    new Vector2(baseX + brickWidth, baseY),
                    new Vector2(baseX + brickWidth, baseY + brickHeight),
                    new Vector2(baseX, baseY + brickHeight)
                ]);
                brick1.group = 'horizontal';
                shapes.push(brick1);
                const brick2 = Shape.fromPoints([
                    new Vector2(baseX, baseY + brickHeight + mortar),
                    new Vector2(baseX + brickWidth, baseY + brickHeight + mortar),
                    new Vector2(baseX + brickWidth, baseY + brickWidth),
                    new Vector2(baseX, baseY + brickWidth)
                ]);
                brick2.group = 'horizontal';
                shapes.push(brick2);
            }
            else {
                // Two vertical bricks side by side
                const brick1 = Shape.fromPoints([
                    new Vector2(baseX, baseY),
                    new Vector2(baseX + brickHeight, baseY),
                    new Vector2(baseX + brickHeight, baseY + brickWidth),
                    new Vector2(baseX, baseY + brickWidth)
                ]);
                brick1.group = 'vertical';
                shapes.push(brick1);
                const brick2 = Shape.fromPoints([
                    new Vector2(baseX + brickHeight + mortar, baseY),
                    new Vector2(baseX + brickWidth, baseY),
                    new Vector2(baseX + brickWidth, baseY + brickWidth),
                    new Vector2(baseX + brickHeight + mortar, baseY + brickWidth)
                ]);
                brick2.group = 'vertical';
                shapes.push(brick2);
            }
        }
    }
    return new ShapesContext(shapes);
}
/**
 * Flemish Bond - Alternating headers (short end) and stretchers (long side) in each row.
 * Classic European brick pattern.
 */
function createFlemishBond(options) {
    const { brickWidth, brickHeight, bounds } = options;
    const mortar = options.mortarWidth ?? 2;
    const shapes = [];
    const headerWidth = brickHeight; // Header shows the short end
    const stretcherWidth = brickWidth;
    const totalBrickHeight = brickHeight + mortar;
    const numRows = Math.ceil(bounds.height / totalBrickHeight) + 1;
    for (let row = 0; row < numRows; row++) {
        const y = row * totalBrickHeight;
        let x = 0;
        let brickIndex = 0;
        // Offset alternating rows
        if (row % 2 === 1) {
            x = -(headerWidth / 2 + mortar / 2);
        }
        while (x < bounds.width + stretcherWidth) {
            const isHeader = brickIndex % 2 === 0;
            const currentWidth = isHeader ? headerWidth : stretcherWidth;
            const brick = Shape.fromPoints([
                new Vector2(x, y),
                new Vector2(x + currentWidth, y),
                new Vector2(x + currentWidth, y + brickHeight),
                new Vector2(x, y + brickHeight)
            ]);
            brick.group = isHeader ? 'header' : 'stretcher';
            shapes.push(brick);
            x += currentWidth + mortar;
            brickIndex++;
        }
    }
    return new ShapesContext(shapes);
}
