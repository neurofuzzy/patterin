import { ShapesContext } from '../contexts/ShapeContext';
import { CheckerOptions } from './PatternTypes';
/**
 * Create a checker/checkerboard pattern.
 * Generates alternating squares tagged as 'light' and 'dark'.
 *
 * @param options - Checker pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const checker = createChecker({
 *   size: 30,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createChecker(options: CheckerOptions): ShapesContext;
