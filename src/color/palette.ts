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

import { sequence, type SequenceFunction } from '../sequence/sequence';

/**
 * Available color zones on the hue spectrum
 */
type ColorZone = 
  | "reds"      // 0-30°
  | "oranges"   // 30-60°
  | "yellows"   // 60-90°
  | "greens"    // 90-150°
  | "cyans"     // 150-210°
  | "blues"     // 210-270°
  | "purples"   // 270-300°
  | "magentas"; // 300-360°

/**
 * HSL color representation for internal calculations
 */
interface HSLColor {
  h: number; // Hue: 0-360
  s: number; // Saturation: 0-100
  l: number; // Lightness: 0-100
}

/**
 * Zone definition with hue range
 */
interface ZoneDefinition {
  name: ColorZone;
  hueStart: number;
  hueEnd: number;
}

/**
 * Modifier effect to apply to colors
 */
interface ModifierEffect {
  type: 'saturation' | 'lightness';
  delta: number; // Percentage change
}

/**
 * Main Palette class for generating color palettes
 * Implements SequenceFunction interface to be usable directly with .color()
 */
class Palette {
  private readonly zones: ColorZone[];
  private readonly totalColors: number;
  private readonly modifiers: ModifierEffect[] = [];
  
  // Default HSL values
  private readonly defaultSaturation = 70;
  private readonly defaultLightness = 50;
  
  // Sequence functionality
  private _cachedColors: string[] | null = null;
  private _index = 0;

  // Zone definitions mapping to hue ranges
  private static readonly ZONE_DEFINITIONS: Record<ColorZone, ZoneDefinition> = {
    reds:     { name: "reds",     hueStart: 0,   hueEnd: 30 },
    oranges:  { name: "oranges",  hueStart: 30,  hueEnd: 60 },
    yellows:  { name: "yellows",  hueStart: 60,  hueEnd: 90 },
    greens:   { name: "greens",   hueStart: 90,  hueEnd: 150 },
    cyans:    { name: "cyans",    hueStart: 150, hueEnd: 210 },
    blues:    { name: "blues",    hueStart: 210, hueEnd: 270 },
    purples:  { name: "purples",  hueStart: 270, hueEnd: 300 },
    magentas: { name: "magentas", hueStart: 300, hueEnd: 360 },
  };

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
  constructor(count: number, ...zones: ColorZone[]) {
    if (count <= 0) {
      throw new Error("Color count must be positive");
    }
    if (zones.length === 0) {
      throw new Error("At least one zone must be specified");
    }

    this.totalColors = count;
    this.zones = zones;
  }

  /**
   * Checks if two zones are adjacent on the color wheel
   */
  private areZonesAdjacent(zone1: ColorZone, zone2: ColorZone): boolean {
    const def1 = Palette.ZONE_DEFINITIONS[zone1];
    const def2 = Palette.ZONE_DEFINITIONS[zone2];
    
    // Check if zones touch or overlap
    return (def1.hueEnd === def2.hueStart) || 
           (def2.hueEnd === def1.hueStart) ||
           // Handle wrap-around (magentas → reds)
           (def1.hueEnd === 360 && def2.hueStart === 0) ||
           (def2.hueEnd === 360 && def1.hueStart === 0);
  }

  /**
   * Checks if all zones form a continuous range
   */
  private areAllZonesAdjacent(): boolean {
    if (this.zones.length <= 1) return true;
    
    // Sort zones by hue start
    const sortedZones = [...this.zones].sort((a, b) => {
      return Palette.ZONE_DEFINITIONS[a].hueStart - Palette.ZONE_DEFINITIONS[b].hueStart;
    });

    // Check if each consecutive pair is adjacent
    for (let i = 0; i < sortedZones.length - 1; i++) {
      if (!this.areZonesAdjacent(sortedZones[i], sortedZones[i + 1])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the full hue range when zones are adjacent
   */
  private getBlendedHueRange(): { start: number; end: number } {
    const defs = this.zones.map(z => Palette.ZONE_DEFINITIONS[z]);
    const starts = defs.map(d => d.hueStart);
    const ends = defs.map(d => d.hueEnd);
    
    return {
      start: Math.min(...starts),
      end: Math.max(...ends),
    };
  }

  /**
   * Generates hue values for colors
   */
  private generateHues(): number[] {
    const hues: number[] = [];
    
    // If all zones are adjacent, blend them into one continuous range
    if (this.areAllZonesAdjacent()) {
      const range = this.getBlendedHueRange();
      const span = range.end - range.start;
      
      // Evenly distribute colors across the blended range with padding
      const padding = span * 0.1; // 10% padding on each side
      const usableSpan = span - (2 * padding);
      const step = usableSpan / (this.totalColors - 1 || 1);
      
      for (let i = 0; i < this.totalColors; i++) {
        const hue = range.start + padding + (step * i);
        hues.push(hue % 360);
      }
    } 
    // Non-adjacent zones: distribute colors per zone
    else {
      const colorsPerZone = Math.floor(this.totalColors / this.zones.length);
      const remainder = this.totalColors % this.zones.length;
      
      for (let zoneIdx = 0; zoneIdx < this.zones.length; zoneIdx++) {
        const zone = this.zones[zoneIdx];
        const def = Palette.ZONE_DEFINITIONS[zone];
        
        // Give extra colors to first zones if there's a remainder
        const count = colorsPerZone + (zoneIdx < remainder ? 1 : 0);
        
        const span = def.hueEnd - def.hueStart;
        const padding = span * 0.1;
        const usableSpan = span - (2 * padding);
        const step = count > 1 ? usableSpan / (count - 1) : 0;
        
        for (let i = 0; i < count; i++) {
          const hue = def.hueStart + padding + (step * i);
          hues.push(hue % 360);
        }
      }
    }
    
    return hues;
  }

  /**
   * Applies accumulated modifiers to an HSL color
   */
  private applyModifiers(color: HSLColor): HSLColor {
    let { h, s, l } = color;
    
    // Apply each modifier cumulatively
    for (const modifier of this.modifiers) {
      if (modifier.type === 'saturation') {
        s = Math.max(0, Math.min(100, s + modifier.delta));
      } else if (modifier.type === 'lightness') {
        l = Math.max(0, Math.min(100, l + modifier.delta));
      }
    }
    
    return { h, s, l };
  }

  /**
   * Converts HSL to hex color string
   */
  private hslToHex(hsl: HSLColor): string {
    const { h, s, l } = hsl;
    const sNorm = s / 100;
    const lNorm = l / 100;
    
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    const toHex = (n: number) => {
      const val = Math.round((n + m) * 255);
      return val.toString(16).padStart(2, '0');
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

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
  muted(intensity: number = 0.2): this {
    this.modifiers.push({
      type: 'saturation',
      delta: -intensity * 100,
    });
    return this;
  }

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
  vibrant(intensity: number = 0.2): this {
    this.modifiers.push({
      type: 'saturation',
      delta: intensity * 100,
    });
    return this;
  }

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
  darkMode(intensity: number = 0.3): this {
    this.modifiers.push({
      type: 'lightness',
      delta: intensity * 100,
    });
    return this;
  }

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
  lightMode(intensity: number = 0.3): this {
    this.modifiers.push({
      type: 'lightness',
      delta: -intensity * 100,
    });
    return this;
  }

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
  toArray(): string[] {
    const hues = this.generateHues();
    
    return hues.map(h => {
      // Create base HSL color
      const baseColor: HSLColor = {
        h,
        s: this.defaultSaturation,
        l: this.defaultLightness,
      };
      
      // Apply all modifiers
      const modifiedColor = this.applyModifiers(baseColor);
      
      // Convert to hex
      return this.hslToHex(modifiedColor);
    });
  }

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
  toObject(): Record<string, string> {
    const colors = this.toArray();
    const names = ['primary', 'secondary', 'tertiary', 'quaternary', 'quinary', 'senary'];
    
    const result: Record<string, string> = {};
    colors.forEach((color, i) => {
      const name = i < names.length ? names[i] : `color${i + 1}`;
      result[name] = color;
    });
    
    return result;
  }

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
  toCss(prefix: string = 'color'): string {
    const colors = this.toArray();
    return colors
      .map((color, i) => `--${prefix}-${i + 1}: ${color};`)
      .join(' ');
  }

  // ============================================================================
  // Sequence Interface - Makes Palette usable directly with .color()
  // ============================================================================

  /**
   * Get cached colors (generates once, reuses thereafter)
   */
  private getColors(): string[] {
    if (!this._cachedColors) {
      this._cachedColors = this.toArray();
    }
    return this._cachedColors;
  }

  /**
   * Get current color value without advancing
   */
  get current(): string {
    const colors = this.getColors();
    return colors[this._index];
  }

  /**
   * Peek at a color value without advancing the sequence
   * @param offset - Number of steps ahead to look (default: 0 for current)
   */
  peek(offset: number = 0): string {
    const colors = this.getColors();
    const peekIndex = (this._index + offset) % colors.length;
    return colors[peekIndex];
  }

  /**
   * Reset the sequence to the first color
   */
  reset(): this {
    this._index = 0;
    return this;
  }

  /**
   * Advance to next color and return it
   * This makes Palette work like a SequenceFunction
   */
  next(): string {
    const colors = this.getColors();
    const value = colors[this._index];
    this._index = (this._index + 1) % colors.length;
    return value;
  }

  // ============================================================================
  // Sequence Mode Methods - Convert palette to different sequence types
  // ============================================================================

  /**
   * Create a shuffled sequence from this palette.
   * Returns a SequenceFunction that cycles through colors in random order.
   * 
   * @returns SequenceFunction that shuffles colors
   * 
   * @example
   * ```typescript
   * const colors = palette.create(6, "blues", "cyans").vibrant();
   * circles.color(colors.shuffle());  // Each circle gets random color
   * ```
   */
  shuffle(): SequenceFunction {
    return sequence.shuffle(...(this.toArray() as any));
  }

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
  yoyo(): SequenceFunction {
    return sequence.yoyo(...(this.toArray() as any));
  }

  /**
   * Create a random sequence from this palette with a seed.
   * Returns a SequenceFunction that picks random colors (deterministic with seed).
   * 
   * @param seed - Random seed for deterministic randomness
   * @returns SequenceFunction that randomly picks colors
   * 
   * @example
   * ```typescript
   * const colors = palette.create(4, "greens").muted();
   * circles.color(colors.random(42));  // Deterministic random colors
   * ```
   */
  random(seed: number): SequenceFunction {
    return sequence.random(seed, ...(this.toArray() as any));
  }
}

/*
// ============================================================================
// Usage Examples
// ============================================================================

// Example 1: Basic palette with even distribution
const basic = new Palette(6, "reds", "blues").toArray();
console.log("Basic:", basic);
// → 3 reds, 3 blues, evenly spaced

// Example 2: Adjacent zones blend smoothly
const blended = new Palette(9, "reds", "oranges", "yellows").toArray();
console.log("Blended:", blended);
// → Smooth gradient from red through orange to yellow

// Example 3: Modifiers stack cumulatively
const modified = new Palette(4, "cyans")
  .muted()      // -20% saturation
  .muted()      // -20% more saturation
  .darkMode()   // +30% lightness
  .toArray();
console.log("Modified:", modified);

// Example 4: Custom intensity
const custom = new Palette(5, "purples")
  .vibrant(0.5)    // +50% saturation
  .lightMode(0.2)  // -20% lightness
  .toArray();
console.log("Custom intensity:", custom);

// Example 5: Non-adjacent zones stay distinct
const distinct = new Palette(8, "reds", "greens", "blues").toArray();
console.log("Distinct zones:", distinct);
// → Colors grouped by zone, not blended

// Example 6: Integration with Sequence (conceptual)
const paletteColors = new Palette(6, "blues", "cyans")
  .vibrant()
  .darkMode()
  .toArray();
console.log("For Sequence:", paletteColors);
// const colorSeq = Sequence.repeat(...paletteColors);
// element.style.color = colorSeq();

// Example 7: CSS output
const cssVars = new Palette(4, "greens").muted().toCss('theme');
console.log("CSS:", cssVars);

// Example 8: Object output
const colorObj = new Palette(3, "magentas").vibrant().toObject();
console.log("Object:", colorObj);


*/

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
export const palette = {
  /**
   * Create a new Palette instance
   * @param count - Total number of colors to generate
   * @param zones - Color zones to distribute colors across
   * @returns A new Palette instance
   */
  create(count: number, ...zones: ColorZone[]): Palette {
    return new Palette(count, ...zones);
  }
};

export { Palette, type ColorZone, type HSLColor };