import { ShapesContext } from '../contexts/ShapeContext';
import { LogCabinOptions } from './PatternTypes';
/**
 * Create a traditional Log Cabin quilt block pattern.
 * One of the most iconic and popular quilt blocks, featuring strips (logs) arranged
 * around a center square, traditionally with light and dark sides.
 * Dates back to the 1800s and was especially popular with pioneer women.
 *
 * @param options - Log Cabin pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const logCabin = pattern.logCabin({
 *   blockSize: 120,
 *   stripWidth: 15,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createLogCabin(options: LogCabinOptions): ShapesContext;
