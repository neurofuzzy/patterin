import { ShapesContext } from '../contexts/ShapeContext';
import { ShooFlyOptions } from './PatternTypes';
/**
 * Create a traditional Shoo Fly quilt block pattern.
 * Similar to Friendship Star, this nine-patch block features corner HSTs
 * with a center square, creating an X pattern. One of the simplest and
 * most popular traditional quilt blocks, dating back to pioneer times.
 *
 * @param options - Shoo Fly pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const shooFly = pattern.shooFly({
 *   blockSize: 90,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createShooFly(options: ShooFlyOptions): ShapesContext;
