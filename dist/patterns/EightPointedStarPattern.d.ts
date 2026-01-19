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
export declare function createEightPointedStar(options: EightPointedStarOptions): ShapesContext;
