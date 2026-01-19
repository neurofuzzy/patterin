import { ShapesContext } from '../contexts/ShapeContext';
import { PinwheelOptions } from './PatternTypes';
/**
 * Create a traditional Pinwheel quilt block pattern.
 * Made from four half-square triangles (HSTs) arranged to create a spinning effect.
 * Classic quilting block dating back to the 1800s.
 *
 * @param options - Pinwheel pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const pinwheel = pattern.pinwheel({
 *   blockSize: 80,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createPinwheel(options: PinwheelOptions): ShapesContext;
