import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
import { ChevronOptions } from './PatternTypes';

/**
 * Create a chevron (zigzag/sawtooth) pattern.
 * Generates alternating V-shapes creating a continuous zigzag pattern.
 * 
 * @param options - Chevron pattern configuration
 * @returns ShapesContext with grouped shapes
 * 
 * @example
 * ```typescript
 * const chevron = createChevron({
 *   stripeWidth: 40,
 *   angle: 45,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createChevron(options: ChevronOptions): ShapesContext {
    const { stripeWidth, bounds } = options;
    const angle = options.angle ?? 45;
    
    const shapes: Shape[] = [];
    
    // Calculate chevron height - each stripe is this tall
    const chevronHeight = stripeWidth;
    
    // Calculate how many chevron rows we need (×2 because we alternate)
    const numRows = Math.ceil(bounds.height / chevronHeight) + 1;
    
    for (let row = 0; row < numRows; row++) {
        const baseY = row * chevronHeight;
        const isPointingDown = row % 2 === 0;
        
        if (isPointingDown) {
            // V shape pointing down (peak at bottom)
            // Left stripe descends from top-left to center-bottom
            const leftStripePoints = [
                new Vector2(0, baseY),
                new Vector2(bounds.width / 2, baseY + chevronHeight),
                new Vector2(bounds.width / 2 + stripeWidth, baseY + chevronHeight),
                new Vector2(stripeWidth, baseY)
            ];
            
            const leftStripe = Shape.fromPoints(leftStripePoints);
            leftStripe.group = 'stripe1';
            shapes.push(leftStripe);
            
            // Right stripe descends from center-bottom to top-right
            const rightStripePoints = [
                new Vector2(bounds.width / 2, baseY + chevronHeight),
                new Vector2(bounds.width, baseY),
                new Vector2(bounds.width - stripeWidth, baseY),
                new Vector2(bounds.width / 2 - stripeWidth, baseY + chevronHeight)
            ];
            
            const rightStripe = Shape.fromPoints(rightStripePoints);
            rightStripe.group = 'stripe1';
            shapes.push(rightStripe);
        } else {
            // Inverted V (^) shape pointing up (peak at top)
            // Left stripe ascends from bottom-left to center-top
            const leftStripePoints = [
                new Vector2(0, baseY + chevronHeight),
                new Vector2(stripeWidth, baseY + chevronHeight),
                new Vector2(bounds.width / 2 + stripeWidth, baseY),
                new Vector2(bounds.width / 2, baseY)
            ];
            
            const leftStripe = Shape.fromPoints(leftStripePoints);
            leftStripe.group = 'stripe2';
            shapes.push(leftStripe);
            
            // Right stripe ascends from center-top to bottom-right
            const rightStripePoints = [
                new Vector2(bounds.width / 2, baseY),
                new Vector2(bounds.width / 2 - stripeWidth, baseY),
                new Vector2(bounds.width - stripeWidth, baseY + chevronHeight),
                new Vector2(bounds.width, baseY + chevronHeight)
            ];
            
            const rightStripe = Shape.fromPoints(rightStripePoints);
            rightStripe.group = 'stripe2';
            shapes.push(rightStripe);
        }
    }
    
    return new ShapesContext(shapes);
}
