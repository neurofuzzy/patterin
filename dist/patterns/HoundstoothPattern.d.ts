import { ShapesContext } from '../contexts/ShapeContext';
import { HoundstoothOptions } from './PatternTypes';
/**
 * Create a houndstooth pattern.
 * Generates the classic jagged check pattern with distinctive tooth shapes.
 *
 * @param options - Houndstooth pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const houndstooth = createHoundstooth({
 *   size: 40,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createHoundstooth(options: HoundstoothOptions): ShapesContext;
