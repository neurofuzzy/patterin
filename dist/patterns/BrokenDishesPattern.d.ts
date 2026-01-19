import { ShapesContext } from '../contexts/ShapeContext';
import { BrokenDishesOptions } from './PatternTypes';
/**
 * Create a traditional Broken Dishes quilt block pattern.
 * Made from four half-square triangles (HSTs) arranged in a pinwheel-like pattern.
 * Also known as "Yankee Puzzle" or "Hourglass," this classic block creates
 * dynamic movement when repeated.
 *
 * @param options - Broken Dishes pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const brokenDishes = pattern.brokenDishes({
 *   blockSize: 80,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createBrokenDishes(options: BrokenDishesOptions): ShapesContext;
