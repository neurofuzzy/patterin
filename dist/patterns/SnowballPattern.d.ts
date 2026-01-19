import { ShapesContext } from '../contexts/ShapeContext';
import { SnowballOptions } from './PatternTypes';
/**
 * Create a traditional Snowball quilt block pattern.
 * A square with its corners cut off (or replaced with triangles), creating
 * an octagonal appearance. Simple yet effective block that creates interesting
 * secondary patterns when blocks are placed together.
 *
 * @param options - Snowball pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const snowball = pattern.snowball({
 *   blockSize: 80,
 *   cornerSize: 20,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createSnowball(options: SnowballOptions): ShapesContext;
