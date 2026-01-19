import { ShapesContext } from '../contexts/ShapeContext';
import { BowTieOptions } from './PatternTypes';
/**
 * Create a traditional Bow Tie quilt block pattern.
 * A variation of the Four Patch with corner triangles creating a bow tie shape.
 * Classic quilting block that creates a distinctive tied appearance.
 *
 * @param options - Bow Tie pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const bowTie = pattern.bowTie({
 *   blockSize: 80,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createBowTie(options: BowTieOptions): ShapesContext;
