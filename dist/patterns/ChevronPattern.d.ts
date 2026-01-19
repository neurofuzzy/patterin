import { ShapesContext } from '../contexts/ShapeContext';
import { ChevronOptions } from './PatternTypes';
/**
 * Create a chevron (zigzag/sawtooth) pattern.
 * Generates alternating V-shapes creating a continuous zigzag pattern.
 *
 * @param options - Chevron pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const chevron = createChevron({
 *   stripeWidth: 40,
 *   angle: 45,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createChevron(options: ChevronOptions): ShapesContext;
