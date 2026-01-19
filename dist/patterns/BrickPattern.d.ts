import { ShapesContext } from '../contexts/ShapeContext';
import { BrickOptions } from './PatternTypes';
/**
 * Create a brick pattern with various bond types.
 * Generates brick laying patterns including running bond, stack bond,
 * basket weave, Flemish bond, and a special James Bond pattern.
 *
 * @param options - Brick pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const bricks = createBrick({
 *   type: 'running',
 *   brickWidth: 60,
 *   brickHeight: 30,
 *   mortarWidth: 2,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createBrick(options: BrickOptions): ShapesContext;
