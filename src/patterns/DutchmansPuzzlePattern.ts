import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
import { DutchmansPuzzleOptions } from './PatternTypes';

/**
 * Create a traditional Dutchman's Puzzle quilt block pattern.
 * Composed of four Flying Geese units arranged around a center, creating
 * a pinwheel-like effect with triangular elements. This block creates
 * wonderful secondary patterns when repeated.
 * 
 * @param options - Dutchman's Puzzle pattern configuration
 * @returns ShapesContext with grouped shapes
 * 
 * @example
 * ```typescript
 * const dutchmansPuzzle = pattern.dutchmansPuzzle({
 *   blockSize: 120,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createDutchmansPuzzle(options: DutchmansPuzzleOptions): ShapesContext {
    const { blockSize, bounds } = options;
    const shapes: Shape[] = [];
    
    const numRows = Math.ceil(bounds.height / blockSize);
    const numCols = Math.ceil(bounds.width / blockSize);
    
    const half = blockSize / 2;
    
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * blockSize;
            const y = row * blockSize;
            const cx = x + half;  // center x
            const cy = y + half;  // center y
            
            // Top Flying Geese (pointing up)
            const topGoose = Shape.fromPoints([
                new Vector2(x, cy),
                new Vector2(cx, y),
                new Vector2(x + blockSize, cy)
            ]);
            topGoose.group = 'goose';
            shapes.push(topGoose);
            
            const topSkyLeft = Shape.fromPoints([
                new Vector2(x, cy),
                new Vector2(x, y),
                new Vector2(cx, y)
            ]);
            topSkyLeft.group = 'sky';
            shapes.push(topSkyLeft);
            
            const topSkyRight = Shape.fromPoints([
                new Vector2(cx, y),
                new Vector2(x + blockSize, y),
                new Vector2(x + blockSize, cy)
            ]);
            topSkyRight.group = 'sky';
            shapes.push(topSkyRight);
            
            // Right Flying Geese (pointing right)
            const rightGoose = Shape.fromPoints([
                new Vector2(cx, y),
                new Vector2(x + blockSize, cy),
                new Vector2(cx, y + blockSize)
            ]);
            rightGoose.group = 'goose';
            shapes.push(rightGoose);
            
            const rightSkyTop = Shape.fromPoints([
                new Vector2(cx, y),
                new Vector2(x + blockSize, y),
                new Vector2(x + blockSize, cy)
            ]);
            rightSkyTop.group = 'sky';
            shapes.push(rightSkyTop);
            
            const rightSkyBottom = Shape.fromPoints([
                new Vector2(x + blockSize, cy),
                new Vector2(x + blockSize, y + blockSize),
                new Vector2(cx, y + blockSize)
            ]);
            rightSkyBottom.group = 'sky';
            shapes.push(rightSkyBottom);
            
            // Bottom Flying Geese (pointing down)
            const bottomGoose = Shape.fromPoints([
                new Vector2(x, cy),
                new Vector2(x + blockSize, cy),
                new Vector2(cx, y + blockSize)
            ]);
            bottomGoose.group = 'goose';
            shapes.push(bottomGoose);
            
            const bottomSkyLeft = Shape.fromPoints([
                new Vector2(x, cy),
                new Vector2(cx, y + blockSize),
                new Vector2(x, y + blockSize)
            ]);
            bottomSkyLeft.group = 'sky';
            shapes.push(bottomSkyLeft);
            
            const bottomSkyRight = Shape.fromPoints([
                new Vector2(cx, y + blockSize),
                new Vector2(x + blockSize, cy),
                new Vector2(x + blockSize, y + blockSize)
            ]);
            bottomSkyRight.group = 'sky';
            shapes.push(bottomSkyRight);
            
            // Left Flying Geese (pointing left)
            const leftGoose = Shape.fromPoints([
                new Vector2(x, cy),
                new Vector2(cx, y + blockSize),
                new Vector2(cx, y)
            ]);
            leftGoose.group = 'goose';
            shapes.push(leftGoose);
            
            const leftSkyTop = Shape.fromPoints([
                new Vector2(x, y),
                new Vector2(x, cy),
                new Vector2(cx, y)
            ]);
            leftSkyTop.group = 'sky';
            shapes.push(leftSkyTop);
            
            const leftSkyBottom = Shape.fromPoints([
                new Vector2(x, cy),
                new Vector2(x, y + blockSize),
                new Vector2(cx, y + blockSize)
            ]);
            leftSkyBottom.group = 'sky';
            shapes.push(leftSkyBottom);
        }
    }
    
    return new ShapesContext(shapes);
}
