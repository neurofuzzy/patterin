import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
import { EightPointedStarOptions } from './PatternTypes';

/**
 * Create a traditional Eight-Pointed Star quilt block pattern.
 * Also known as LeMoyne Star or Star of LeMoyne, this classic block features
 * 8 diamond-shaped points radiating from the center, with corner squares and
 * edge triangles filling the block. One of the most iconic star patterns in quilting.
 * 
 * @param options - Eight-Pointed Star pattern configuration
 * @returns ShapesContext with grouped shapes
 * 
 * @example
 * ```typescript
 * const eightPointedStar = pattern.eightPointedStar({
 *   blockSize: 120,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createEightPointedStar(options: EightPointedStarOptions): ShapesContext {
    const { blockSize, bounds } = options;
    const shapes: Shape[] = [];
    
    const numRows = Math.ceil(bounds.height / blockSize);
    const numCols = Math.ceil(bounds.width / blockSize);
    
    const half = blockSize / 2;
    const quarter = blockSize / 4;
    
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * blockSize;
            const y = row * blockSize;
            const cx = x + half;  // center x
            const cy = y + half;  // center y
            
            // Create 8 diamond points
            // Each diamond is defined by 4 points
            
            // Top point (12 o'clock)
            const topDiamond = Shape.fromPoints([
                new Vector2(cx, cy),                           // center
                new Vector2(cx - quarter, cy - quarter),       // left
                new Vector2(cx, cy - half),                    // top
                new Vector2(cx + quarter, cy - quarter)        // right
            ]);
            topDiamond.group = 'star-point';
            shapes.push(topDiamond);
            
            // Top-right point (1:30)
            const trDiamond = Shape.fromPoints([
                new Vector2(cx, cy),                           // center
                new Vector2(cx + quarter, cy - quarter),       // top
                new Vector2(cx + half, cy),                    // right
                new Vector2(cx + quarter, cy + quarter)        // bottom
            ]);
            trDiamond.group = 'star-point';
            shapes.push(trDiamond);
            
            // Right point (3 o'clock)
            const rightDiamond = Shape.fromPoints([
                new Vector2(cx, cy),                           // center
                new Vector2(cx + quarter, cy - quarter),       // top
                new Vector2(cx + half, cy),                    // right
                new Vector2(cx + quarter, cy + quarter)        // bottom
            ]);
            rightDiamond.group = 'star-point';
            shapes.push(rightDiamond);
            
            // Bottom-right point (4:30)
            const brDiamond = Shape.fromPoints([
                new Vector2(cx, cy),                           // center
                new Vector2(cx + quarter, cy + quarter),       // top
                new Vector2(cx + half, cy),                    // right
                new Vector2(cx + quarter, cy + half)           // bottom (adjusted)
            ]);
            brDiamond.group = 'star-point';
            shapes.push(brDiamond);
            
            // Bottom point (6 o'clock)
            const bottomDiamond = Shape.fromPoints([
                new Vector2(cx, cy),                           // center
                new Vector2(cx + quarter, cy + quarter),       // right
                new Vector2(cx, cy + half),                    // bottom
                new Vector2(cx - quarter, cy + quarter)        // left
            ]);
            bottomDiamond.group = 'star-point';
            shapes.push(bottomDiamond);
            
            // Bottom-left point (7:30)
            const blDiamond = Shape.fromPoints([
                new Vector2(cx, cy),                           // center
                new Vector2(cx - quarter, cy + quarter),       // top
                new Vector2(cx - half, cy),                    // left
                new Vector2(cx - quarter, cy + half)           // bottom (adjusted)
            ]);
            blDiamond.group = 'star-point';
            shapes.push(blDiamond);
            
            // Left point (9 o'clock)
            const leftDiamond = Shape.fromPoints([
                new Vector2(cx, cy),                           // center
                new Vector2(cx - quarter, cy + quarter),       // bottom
                new Vector2(cx - half, cy),                    // left
                new Vector2(cx - quarter, cy - quarter)        // top
            ]);
            leftDiamond.group = 'star-point';
            shapes.push(leftDiamond);
            
            // Top-left point (10:30)
            const tlDiamond = Shape.fromPoints([
                new Vector2(cx, cy),                           // center
                new Vector2(cx - quarter, cy - quarter),       // bottom
                new Vector2(cx - half, cy),                    // left
                new Vector2(cx - quarter, cy - half)           // top (adjusted)
            ]);
            tlDiamond.group = 'star-point';
            shapes.push(tlDiamond);
            
            // Four corner squares
            const tlCorner = Shape.fromPoints([
                new Vector2(x, y),
                new Vector2(x + quarter, y),
                new Vector2(x + quarter, y + quarter),
                new Vector2(x, y + quarter)
            ]);
            tlCorner.group = 'corner';
            shapes.push(tlCorner);
            
            const trCorner = Shape.fromPoints([
                new Vector2(x + blockSize - quarter, y),
                new Vector2(x + blockSize, y),
                new Vector2(x + blockSize, y + quarter),
                new Vector2(x + blockSize - quarter, y + quarter)
            ]);
            trCorner.group = 'corner';
            shapes.push(trCorner);
            
            const blCorner = Shape.fromPoints([
                new Vector2(x, y + blockSize - quarter),
                new Vector2(x + quarter, y + blockSize - quarter),
                new Vector2(x + quarter, y + blockSize),
                new Vector2(x, y + blockSize)
            ]);
            blCorner.group = 'corner';
            shapes.push(blCorner);
            
            const brCorner = Shape.fromPoints([
                new Vector2(x + blockSize - quarter, y + blockSize - quarter),
                new Vector2(x + blockSize, y + blockSize - quarter),
                new Vector2(x + blockSize, y + blockSize),
                new Vector2(x + blockSize - quarter, y + blockSize)
            ]);
            brCorner.group = 'corner';
            shapes.push(brCorner);
            
            // Four edge triangles (background)
            // Top edge
            const topTriangle = Shape.fromPoints([
                new Vector2(x + quarter, y),
                new Vector2(x + blockSize - quarter, y),
                new Vector2(cx + quarter, cy - quarter),
                new Vector2(cx, cy - half),
                new Vector2(cx - quarter, cy - quarter)
            ]);
            topTriangle.group = 'background';
            shapes.push(topTriangle);
            
            // Right edge
            const rightTriangle = Shape.fromPoints([
                new Vector2(x + blockSize, y + quarter),
                new Vector2(x + blockSize, y + blockSize - quarter),
                new Vector2(cx + quarter, cy + quarter),
                new Vector2(cx + half, cy),
                new Vector2(cx + quarter, cy - quarter)
            ]);
            rightTriangle.group = 'background';
            shapes.push(rightTriangle);
            
            // Bottom edge
            const bottomTriangle = Shape.fromPoints([
                new Vector2(x + blockSize - quarter, y + blockSize),
                new Vector2(x + quarter, y + blockSize),
                new Vector2(cx - quarter, cy + quarter),
                new Vector2(cx, cy + half),
                new Vector2(cx + quarter, cy + quarter)
            ]);
            bottomTriangle.group = 'background';
            shapes.push(bottomTriangle);
            
            // Left edge
            const leftTriangle = Shape.fromPoints([
                new Vector2(x, y + blockSize - quarter),
                new Vector2(x, y + quarter),
                new Vector2(cx - quarter, cy - quarter),
                new Vector2(cx - half, cy),
                new Vector2(cx - quarter, cy + quarter)
            ]);
            leftTriangle.group = 'background';
            shapes.push(leftTriangle);
        }
    }
    
    return new ShapesContext(shapes);
}
