import { ShapesContext } from '../contexts/ShapeContext';
import { SawtoothStarOptions } from './PatternTypes';
/**
 * Create a traditional Sawtooth Star quilt block pattern.
 * Features a center square with four Flying Geese star points and four corner squares.
 * The "sawtooth" edges of the star points give this classic block its distinctive name.
 * Very popular traditional block that creates striking quilts.
 *
 * @param options - Sawtooth Star pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const sawtoothStar = pattern.sawtoothStar({
 *   blockSize: 120,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createSawtoothStar(options: SawtoothStarOptions): ShapesContext;
