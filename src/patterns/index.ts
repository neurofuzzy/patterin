import { ShapesContext } from '../contexts/ShapeContext';
import { createChecker } from './CheckerPattern';
import { createChevron } from './ChevronPattern';
import { createGingham } from './GinghamPattern';
import { createHoundstooth } from './HoundstoothPattern';
import { createHerringbone } from './HerringbonePattern';
import { createBrick } from './BrickPattern';
import {
    createQuiltPattern,
    createQuiltPatternFromTemplate,
    quiltBlockTemplates,
    QuiltPatternOptions,
    QuiltBlockTemplate,
    BlockRotation,
    CellDefinition
} from './QuiltPattern';

export * from './PatternTypes';
export { quiltBlockTemplates } from './QuiltPattern';
export type {
    QuiltBlockTemplate,
    BlockRotation,
    CellDefinition,
    QuiltPatternOptions
} from './QuiltPattern';

/**
 * Pattern factory - orchestrates shapes and systems to create visual textile patterns.
 * 
 * Patterns are higher-level constructs that generate complete visual arrangements.
 * All patterns return ShapesContext with shapes tagged by group for color layering.
 * 
 * @example
 * ```typescript
 * import { pattern } from 'patterin';
 * 
 * // Checker pattern
 * const checker = pattern.checker({
 *   size: 20,
 *   bounds: { width: 400, height: 400 }
 * });
 * 
 * // Quilt block pattern
 * const pinwheel = pattern.quilt({
 *   blockName: 'pinwheel',
 *   blockSize: 100,
 *   bounds: { width: 400, height: 400 }
 * });
 * 
 * // Access grouped shapes for styling
 * const lightShapes = pinwheel.shapes.filter(s => s.group === 'light');
 * const darkShapes = pinwheel.shapes.filter(s => s.group === 'dark');
 * ```
 */
export const pattern = {
    /**
     * Create a checker/checkerboard pattern.
     * Alternating squares tagged as 'light' and 'dark'.
     * 
     * @param options - Checker pattern configuration
     * @returns ShapesContext with grouped shapes
     * 
     * @example
     * ```typescript
     * const checker = pattern.checker({
     *   size: 30,
     *   bounds: { width: 400, height: 400 }
     * });
     * ```
     */
    checker(options: import('./PatternTypes').CheckerOptions): ShapesContext {
        return createChecker(options);
    },

    /**
     * Create a chevron (zigzag) pattern.
     * Diagonal stripes forming V-shapes tagged as 'stripe1' and 'stripe2'.
     * 
     * @param options - Chevron pattern configuration
     * @returns ShapesContext with grouped shapes
     * 
     * @example
     * ```typescript
     * const chevron = pattern.chevron({
     *   stripeWidth: 40,
     *   angle: 45,
     *   bounds: { width: 400, height: 400 }
     * });
     * ```
     */
    chevron(options: import('./PatternTypes').ChevronOptions): ShapesContext {
        return createChevron(options);
    },

    /**
     * Create a gingham pattern.
     * Overlapping horizontal and vertical bands creating a woven appearance.
     * Tagged with 'horizontal-light', 'horizontal-dark', 'vertical-light', 
     * 'vertical-dark', 'intersection-light', and 'intersection-dark'.
     * 
     * @param options - Gingham pattern configuration
     * @returns ShapesContext with grouped shapes
     * 
     * @example
     * ```typescript
     * const gingham = pattern.gingham({
     *   checkSize: 20,
     *   bands: [1, 3, 1, 3],
     *   bounds: { width: 400, height: 400 }
     * });
     * ```
     */
    gingham(options: import('./PatternTypes').GinghamOptions): ShapesContext {
        return createGingham(options);
    },

    /**
     * Create a houndstooth pattern.
     * Classic jagged check pattern tagged as 'light' and 'dark'.
     * 
     * @param options - Houndstooth pattern configuration
     * @returns ShapesContext with grouped shapes
     * 
     * @example
     * ```typescript
     * const houndstooth = pattern.houndstooth({
     *   size: 40,
     *   bounds: { width: 400, height: 400 }
     * });
     * ```
     */
    houndstooth(options: import('./PatternTypes').HoundstoothOptions): ShapesContext {
        return createHoundstooth(options);
    },

    /**
     * Create a herringbone pattern.
     * V-shaped weaving arrangement of rectangles tagged as 'angle1' and 'angle2'.
     * 
     * @param options - Herringbone pattern configuration
     * @returns ShapesContext with grouped shapes
     * 
     * @example
     * ```typescript
     * const herringbone = pattern.herringbone({
     *   brickWidth: 60,
     *   brickHeight: 20,
     *   angle: 45,
     *   bounds: { width: 400, height: 400 }
     * });
     * ```
     */
    herringbone(options: import('./PatternTypes').HerringboneOptions): ShapesContext {
        return createHerringbone(options);
    },

    /**
     * Create a brick pattern with various bond types.
     * Supports running bond, stack bond, basket weave, and Flemish bond.
     * 
     * @param options - Brick pattern configuration
     * @returns ShapesContext with grouped shapes
     * 
     * @example
     * ```typescript
     * // Running bond (classic offset)
     * const running = pattern.brick({
     *   type: 'running',
     *   brickWidth: 60,
     *   brickHeight: 30,
     *   mortarWidth: 2,
     *   bounds: { width: 400, height: 400 }
     * });
     * 
     * // Basket weave
     * const basket = pattern.brick({
     *   type: 'basket',
     *   brickWidth: 60,
     *   brickHeight: 30,
     *   bounds: { width: 400, height: 400 }
     * });
     * ```
     */
    brick(options: import('./PatternTypes').BrickOptions): ShapesContext {
        return createBrick(options);
    },

    /**
     * Create a quilt block pattern from a named template.
     * 
     * Available blocks:
     * - `pinwheel` - Four HSTs in a spinning pattern
     * - `brokenDishes` - Four HSTs with dark at outer corners
     * - `friendshipStar` - Nine-patch with HST star points
     * - `shooFly` - Nine-patch with corner HSTs
     * - `bowTie` - Four HSTs creating a bow tie shape
     * - `dutchmansPuzzle` - Four Flying Geese in a pinwheel
     * - `sawtoothStar` - Nine-patch with Flying Geese points
     * 
     * All shapes are tagged as 'light' or 'dark' for easy styling.
     * 
     * @param options - Quilt pattern configuration
     * @returns ShapesContext with grouped shapes
     * 
     * @example
     * ```typescript
     * const pinwheel = pattern.quilt({
     *   blockName: 'pinwheel',
     *   blockSize: 100,
     *   bounds: { width: 400, height: 400 }
     * });
     * 
     * // Style by group
     * pinwheel.shapes.forEach(shape => {
     *   const color = shape.group === 'dark' ? '#3498db' : '#ecf0f1';
     *   svg.addShape(shape, { fill: color });
     * });
     * ```
     */
    quilt(options: QuiltPatternOptions): ShapesContext {
        return createQuiltPattern(options);
    },

    /**
     * Create a quilt pattern from a custom block template.
     * 
     * @param template - Custom block template
     * @param blockSize - Size of each block
     * @param bounds - Pattern bounds
     * @returns ShapesContext with grouped shapes
     * 
     * @example
     * ```typescript
     * const customBlock: QuiltBlockTemplate = {
     *   name: 'custom',
     *   grid: 2,
     *   cells: [
     *     [{ type: 'hst', rotation: 0 }, { type: 'square', group: 'dark' }],
     *     [{ type: 'square', group: 'light' }, { type: 'hst', rotation: 180 }]
     *   ]
     * };
     * 
     * const custom = pattern.quiltFromTemplate(
     *   customBlock,
     *   100,
     *   { width: 400, height: 400 }
     * );
     * ```
     */
    quiltFromTemplate(
        template: QuiltBlockTemplate,
        blockSize: number,
        bounds: { width: number; height: number }
    ): ShapesContext {
        return createQuiltPatternFromTemplate(template, blockSize, bounds);
    },
};
