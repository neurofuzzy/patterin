/**
 * Palette Generator Module
 *
 * A declarative color palette generator with zone-based color distribution.
 * Generates harmonious color palettes with even distribution across specified zones.
 *
 * @example Basic Usage
 * ```typescript
 * const colors = new Palette(6, "reds", "blues").toArray();
 * // Returns 6 colors: 3 reds, 3 blues, evenly distributed
 * ```
 *
 * @example With Modifiers
 * ```typescript
 * const colors = new Palette(8, "reds", "oranges", "yellows")
 *   .muted()
 *   .darkMode()
 *   .toArray();
 * ```
 *
 * @example With Sequence Integration
 * ```typescript
 * const colors = new Palette(6, "blues", "cyans").vibrant().shuffle();
 * element.style.color = colorSeq(); // Cycles through colors in random order
 * ```
 */
import { type SequenceFunction } from '../sequence/sequence';
/**
 * Available color zones on the hue spectrum
 */
type ColorZone = "reds" | "oranges" | "yellows" | "greens" | "cyans" | "blues" | "purples" | "magentas";
/**
 * HSL color representation for internal calculations
 */
interface HSLColor {
    h: number;
    s: number;
    l: number;
}
/**
 * Main Palette class for generating color palettes
 * Implements SequenceFunction interface to be usable directly with .color()
 */
declare class Palette {
    private readonly zones;
    private readonly totalColors;
    private readonly modifiers;
    private readonly defaultSaturation;
    private readonly defaultLightness;
    private _cachedColors;
    private _index;
    private static readonly ZONE_DEFINITIONS;
    /**
     * Creates a new Palette instance
     * @param count - Total number of colors to generate
     * @param zones - Color zones to distribute colors across
     *
     * @example
     * ```typescript
     * const palette = new Palette(6, "reds", "blues");
     * const palette = new Palette(9, "reds", "oranges", "yellows");
     * ```
     */
    constructor(count: number, ...zones: ColorZone[]);
    /**
     * Checks if two zones are adjacent on the color wheel
     */
    private areZonesAdjacent;
    /**
     * Checks if all zones form a continuous range
     */
    private areAllZonesAdjacent;
    /**
     * Gets the full hue range when zones are adjacent
     */
    private getBlendedHueRange;
    /**
     * Generates hue values for colors
     */
    private generateHues;
    /**
     * Applies accumulated modifiers to an HSL color
     */
    private applyModifiers;
    /**
     * Converts HSL to hex color string
     */
    private hslToHex;
    /**
     * Reduces saturation (makes colors more muted/desaturated)
     * @param intensity - Strength of the effect (default: 0.2 = 20% reduction)
     * @returns This palette instance for chaining
     *
     * @example
     * ```typescript
     * palette.muted()      // -20% saturation
     * palette.muted(0.5)   // -50% saturation
     * palette.muted().muted() // Cumulative: -40% saturation
     * ```
     */
    muted(intensity?: number): this;
    /**
     * Increases saturation (makes colors more vibrant/vivid)
     * @param intensity - Strength of the effect (default: 0.2 = 20% increase)
     * @returns This palette instance for chaining
     *
     * @example
     * ```typescript
     * palette.vibrant()      // +20% saturation
     * palette.vibrant(0.5)   // +50% saturation
     * ```
     */
    vibrant(intensity?: number): this;
    /**
     * Increases lightness for use on dark backgrounds
     * @param intensity - Strength of the effect (default: 0.3 = 30% increase)
     * @returns This palette instance for chaining
     *
     * @example
     * ```typescript
     * palette.darkMode()      // +30% lightness
     * palette.darkMode(0.5)   // +50% lightness
     * ```
     */
    darkMode(intensity?: number): this;
    /**
     * Decreases lightness for use on light backgrounds
     * @param intensity - Strength of the effect (default: 0.3 = 30% decrease)
     * @returns This palette instance for chaining
     *
     * @example
     * ```typescript
     * palette.lightMode()      // -30% lightness
     * palette.lightMode(0.5)   // -50% lightness
     * ```
     */
    lightMode(intensity?: number): this;
    /**
     * Generates and returns the color palette as an array of hex strings
     * @returns Array of hex color strings (e.g., ['#ff5733', '#3498db'])
     *
     * @example
     * ```typescript
     * const colors = new Palette(6, "reds", "blues")
     *   .muted()
     *   .darkMode()
     *   .toArray();
     *
     * // Use with Sequence
     * const seq = Sequence.repeat(...colors);
     * ```
     */
    toArray(): string[];
    /**
     * Generates colors and returns as an object with semantic names
     * @returns Object with color roles (primary, secondary, etc.)
     *
     * @example
     * ```typescript
     * const colors = new Palette(4, "blues").toObject();
     * // { primary: '#...', secondary: '#...', tertiary: '#...', quaternary: '#...' }
     * ```
     */
    toObject(): Record<string, string>;
    /**
     * Generates CSS custom properties string
     * @param prefix - Prefix for CSS variable names (default: 'color')
     * @returns CSS custom properties string
     *
     * @example
     * ```typescript
     * const css = new Palette(3, "blues").toCss();
     * // "--color-1: #...; --color-2: #...; --color-3: #...;"
     *
     * const css = new Palette(3, "blues").toCss('theme');
     * // "--theme-1: #...; --theme-2: #...; --theme-3: #...;"
     * ```
     */
    toCss(prefix?: string): string;
    /**
     * Get cached colors (generates once, reuses thereafter)
     */
    private getColors;
    /**
     * Get current color value without advancing
     */
    get current(): string;
    /**
     * Peek at a color value without advancing the sequence
     * @param offset - Number of steps ahead to look (default: 0 for current)
     */
    peek(offset?: number): string;
    /**
     * Reset the sequence to the first color
     */
    reset(): this;
    /**
     * Advance to next color and return it
     * This makes Palette work like a SequenceFunction
     */
    next(): string;
    /**
     * Create a shuffled sequence from this palette.
     * Returns a SequenceFunction that cycles through colors in random order.
     *
     * @param seed - Optional seed for deterministic shuffling
     * @returns SequenceFunction that shuffles colors
     *
     * @example Without seed
     * ```typescript
     * const colors = palette.create(6, "blues", "cyans").vibrant();
     * circles.color(colors.shuffle());  // Random shuffle each run
     * ```
     *
     * @example With seed (deterministic)
     * ```typescript
     * const colors = palette.create(6, "blues", "cyans").vibrant();
     * circles.color(colors.shuffle(42));  // Same shuffle every run
     * ```
     */
    shuffle(seed?: number): SequenceFunction;
    /**
     * Create a yoyo sequence from this palette.
     * Returns a SequenceFunction that bounces back and forth through colors.
     *
     * @returns SequenceFunction that yoyos through colors
     *
     * @example
     * ```typescript
     * const colors = palette.create(6, "reds", "oranges").vibrant();
     * circles.color(colors.yoyo());  // Smooth gradient back and forth
     * ```
     */
    yoyo(): SequenceFunction;
    /**
     * Create a random sequence from this palette.
     * Returns a SequenceFunction that picks random colors.
     *
     * @param seed - Optional random seed for deterministic randomness. If omitted, uses default seed.
     * @returns SequenceFunction that randomly picks colors
     *
     * @example
     * ```typescript
     * const colors = palette.create(4, "greens").muted();
     *
     * // Deterministic random with seed
     * circles.color(colors.random(42));
     *
     * // Random with default seed
     * circles.color(colors.random());
     * ```
     */
    random(seed?: number): SequenceFunction;
}
/**
 * Palette factory - main entry point for creating color palettes.
 * Follows the same pattern as shape.* and system.* factories.
 *
 * @example
 * ```typescript
 * import { palette } from 'patterin';
 *
 * // Create a palette with 6 colors across blues and cyans
 * const colors = palette.create(6, "blues", "cyans").vibrant();
 *
 * // Use directly with shapes
 * circles.color(colors);
 * ```
 */
export declare const palette: {
    /**
     * Create a new Palette instance
     * @param count - Total number of colors to generate
     * @param zones - Color zones to distribute colors across
     * @returns A new Palette instance
     */
    create(count: number, ...zones: ColorZone[]): Palette;
};
export { Palette, type ColorZone, type HSLColor };
