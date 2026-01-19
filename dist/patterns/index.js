import { createChecker } from './CheckerPattern';
import { createChevron } from './ChevronPattern';
import { createGingham } from './GinghamPattern';
import { createHoundstooth } from './HoundstoothPattern';
import { createHerringbone } from './HerringbonePattern';
import { createBrick } from './BrickPattern';
import { createPinwheel } from './PinwheelPattern';
import { createLogCabin } from './LogCabinPattern';
import { createBowTie } from './BowTiePattern';
import { createBrokenDishes } from './BrokenDishesPattern';
import { createFriendshipStar } from './FriendshipStarPattern';
import { createShooFly } from './ShooFlyPattern';
import { createSnowball } from './SnowballPattern';
import { createFlyingGeese } from './FlyingGeesePattern';
import { createDutchmansPuzzle } from './DutchmansPuzzlePattern';
import { createSawtoothStar } from './SawtoothStarPattern';
import { createEightPointedStar } from './EightPointedStarPattern';
export * from './PatternTypes';
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
 * // Access grouped shapes for styling
 * const lightChecks = checker.shapes.filter(s => s.group === 'light');
 * const darkChecks = checker.shapes.filter(s => s.group === 'dark');
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
    checker(options) {
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
    chevron(options) {
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
    gingham(options) {
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
    houndstooth(options) {
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
    herringbone(options) {
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
    brick(options) {
        return createBrick(options);
    },
    /**
     * Create a traditional Pinwheel quilt block pattern.
     * Made from four half-square triangles arranged to create a spinning effect.
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
    pinwheel(options) {
        return createPinwheel(options);
    },
    /**
     * Create a traditional Log Cabin quilt block pattern.
     * Strips arranged around a center square with light and dark sides.
     *
     * @param options - Log Cabin pattern configuration
     * @returns ShapesContext with grouped shapes
     */
    logCabin(options) {
        return createLogCabin(options);
    },
    /**
     * Create a traditional Bow Tie quilt block pattern.
     * Four patch with corner triangles creating a bow tie shape.
     *
     * @param options - Bow Tie pattern configuration
     * @returns ShapesContext with grouped shapes
     */
    bowTie(options) {
        return createBowTie(options);
    },
    /**
     * Create a traditional Broken Dishes quilt block pattern.
     * Four half-square triangles in a pinwheel-like arrangement.
     *
     * @param options - Broken Dishes pattern configuration
     * @returns ShapesContext with grouped shapes
     */
    brokenDishes(options) {
        return createBrokenDishes(options);
    },
    /**
     * Create a traditional Friendship Star quilt block pattern.
     * Nine-patch with center square, corner squares, and HST star points.
     *
     * @param options - Friendship Star pattern configuration
     * @returns ShapesContext with grouped shapes
     */
    friendshipStar(options) {
        return createFriendshipStar(options);
    },
    /**
     * Create a traditional Shoo Fly quilt block pattern.
     * Nine-patch with corner HSTs creating an X pattern.
     *
     * @param options - Shoo Fly pattern configuration
     * @returns ShapesContext with grouped shapes
     */
    shooFly(options) {
        return createShooFly(options);
    },
    /**
     * Create a traditional Snowball quilt block pattern.
     * Square with cut corners creating an octagonal appearance.
     *
     * @param options - Snowball pattern configuration
     * @returns ShapesContext with grouped shapes
     */
    snowball(options) {
        return createSnowball(options);
    },
    /**
     * Create a traditional Flying Geese quilt pattern.
     * Central triangle (goose) with two smaller side triangles (sky).
     *
     * @param options - Flying Geese pattern configuration
     * @returns ShapesContext with grouped shapes
     */
    flyingGeese(options) {
        return createFlyingGeese(options);
    },
    /**
     * Create a traditional Dutchman's Puzzle quilt block pattern.
     * Four Flying Geese units arranged around a center.
     *
     * @param options - Dutchman's Puzzle pattern configuration
     * @returns ShapesContext with grouped shapes
     */
    dutchmansPuzzle(options) {
        return createDutchmansPuzzle(options);
    },
    /**
     * Create a traditional Sawtooth Star quilt block pattern.
     * Center square with four Flying Geese star points and corner squares.
     *
     * @param options - Sawtooth Star pattern configuration
     * @returns ShapesContext with grouped shapes
     */
    sawtoothStar(options) {
        return createSawtoothStar(options);
    },
    /**
     * Create a traditional Eight-Pointed Star quilt block pattern.
     * Also known as LeMoyne Star, featuring 8 diamond points radiating from center.
     *
     * @param options - Eight-Pointed Star pattern configuration
     * @returns ShapesContext with grouped shapes
     */
    eightPointedStar(options) {
        return createEightPointedStar(options);
    },
};
