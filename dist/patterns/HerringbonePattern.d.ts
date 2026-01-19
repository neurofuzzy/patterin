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
export declare function createHerringbone(options: HerringboneOptions): ShapesContext;
