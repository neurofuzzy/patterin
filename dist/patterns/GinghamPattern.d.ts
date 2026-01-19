import { ShapesContext } from '../contexts/ShapeContext';
import { GinghamOptions } from './PatternTypes';
/**
 * Create a gingham pattern.
 * Generates overlapping horizontal and vertical bands creating a woven appearance.
 *
 * @param options - Gingham pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const gingham = createGingham({
 *   checkSize: 20,
 *   bands: [1, 3, 1, 3],  // Thin-thick-thin-thick pattern
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createGingham(options: GinghamOptions): ShapesContext;
