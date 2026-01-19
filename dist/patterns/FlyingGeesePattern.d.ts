import { ShapesContext } from '../contexts/ShapeContext';
import { FlyingGeeseOptions } from './PatternTypes';
/**
 * Create a traditional Flying Geese quilt pattern.
 * Features a central triangle (the "goose") with two smaller side triangles
 * (the "sky"). The goose is typically darker while the sky pieces are lighter.
 * One of the most versatile and popular traditional quilt units, often used
 * in borders and as building blocks for complex patterns.
 *
 * @param options - Flying Geese pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const flyingGeese = pattern.flyingGeese({
 *   unitSize: 60,
 *   direction: 'horizontal',
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createFlyingGeese(options: FlyingGeeseOptions): ShapesContext;
