import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
import { HerringboneOptions } from './PatternTypes';

/**
 * Create a herringbone pattern.
 * Generates V-shaped weaving arrangement of rectangular bricks.
 * 
 * @param options - Herringbone pattern configuration
 * @returns ShapesContext with grouped shapes
 * 
 * @example
 * ```typescript
 * const herringbone = createHerringbone({
 *   brickWidth: 60,
 *   brickHeight: 20,
 *   angle: 45,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createHerringbone(options: HerringboneOptions): ShapesContext {
    const { brickWidth, brickHeight, bounds } = options;
    const angle = options.angle ?? 45;
    const angleRad = (angle * Math.PI) / 180;
    
    const shapes: Shape[] = [];
    
    // Calculate the diagonal span of a brick
    const diagWidth = brickWidth * Math.cos(angleRad);
    const diagHeight = brickWidth * Math.sin(angleRad);
    
    // Herringbone alternates brick direction in a V-pattern
    // Each row has two orientations creating the chevron effect
    const rowHeight = Math.max(diagHeight, brickHeight) * 2;
    const numRows = Math.ceil(bounds.height / rowHeight) + 2;
    const numCols = Math.ceil(bounds.width / diagWidth) + 2;
    
    for (let row = 0; row < numRows; row++) {
        const baseY = row * rowHeight;
        
        for (let col = 0; col < numCols; col++) {
            const baseX = col * diagWidth;
            
            // First orientation (ascending from left to right)
            const brick1Center = new Vector2(baseX, baseY);
            const brick1 = createRotatedRect(
                brick1Center,
                brickWidth,
                brickHeight,
                angle
            );
            brick1.group = 'angle1';
            shapes.push(brick1);
            
            // Second orientation (descending from left to right) - forms V with first
            const brick2Center = new Vector2(
                baseX + diagWidth / 2,
                baseY + diagHeight
            );
            const brick2 = createRotatedRect(
                brick2Center,
                brickWidth,
                brickHeight,
                -angle
            );
            brick2.group = 'angle2';
            shapes.push(brick2);
        }
    }
    
    return new ShapesContext(shapes);
}

/**
 * Helper function to create a rotated rectangle
 */
function createRotatedRect(
    center: Vector2,
    width: number,
    height: number,
    angleDeg: number
): Shape {
    const angleRad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    // Create rectangle points centered at origin
    const halfW = width / 2;
    const halfH = height / 2;
    
    const localPoints = [
        new Vector2(-halfW, -halfH),
        new Vector2(halfW, -halfH),
        new Vector2(halfW, halfH),
        new Vector2(-halfW, halfH)
    ];
    
    // Rotate and translate points
    const points = localPoints.map(p => {
        const rotatedX = p.x * cos - p.y * sin;
        const rotatedY = p.x * sin + p.y * cos;
        return new Vector2(
            center.x + rotatedX,
            center.y + rotatedY
        );
    });
    
    return Shape.fromPoints(points);
}
