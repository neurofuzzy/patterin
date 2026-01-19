import { ShapesContext } from '../contexts/ShapeContext';
import { DutchmansPuzzleOptions } from './PatternTypes';
/**
 * Create a traditional Dutchman's Puzzle quilt block pattern.
 * Composed of four Flying Geese units arranged around a center, creating
 * a pinwheel-like effect with triangular elements. This block creates
 * wonderful secondary patterns when repeated.
 *
 * @param options - Dutchman's Puzzle pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const dutchmansPuzzle = pattern.dutchmansPuzzle({
 *   blockSize: 120,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createDutchmansPuzzle(options: DutchmansPuzzleOptions): ShapesContext;
