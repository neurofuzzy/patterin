/**
 * Sequence Generator Module
 * 
 * A flexible sequence generator that can be passed as a number to any function.
 * Supports multiple modes: repeat, yoyo, once, shuffle, and random.
 * 
 * @example Basic Usage
 * ```typescript
 * const s = Sequence.repeat(1, 2, 3);
 * console.log(s + 0);  // 1 (current value, doesn't advance)
 * console.log(s());    // 2 (advances and returns new value)
 * console.log(s());    // 3
 * console.log(s());    // 1 (cycles back)
 * ```
 * 
 * @example Nested Sequences
 * ```typescript
 * const inner = Sequence.repeat(10, 20);
 * const outer = Sequence.repeat(1, inner, 3);
 * console.log(outer());  // 1
 * console.log(outer());  // 10 (from inner sequence)
 * console.log(outer());  // 3
 * ```
 */

/**
 * Available sequence modes
 */
type SequenceMode = 'repeat' | 'yoyo' | 'once' | 'shuffle' | 'random' | 'additive' | 'multiplicative';

/**
 * A value in a sequence - can be a number or another sequence
 */
type SequenceValue = number | SequenceFunction;

/**
 * A sequence function that can be called to advance or accessed via .current property
 */
interface SequenceFunction {
  /** Advances to the next value and returns it */
  (): number;
  
  /** Returns the current value without advancing */
  readonly current: number;
  
  /** Resets the sequence to its initial state (including PRNG seed if applicable) */
  reset(): SequenceFunction;
  
  /** 
   * Peek at a value without advancing the sequence
   * @param offset - Number of steps ahead to look (default: 0 for current)
   */
  peek(offset?: number): number;
}

/**
 * Main Sequence class that handles all sequence generation logic
 */
class Sequence {
  private index: number = 0;
  private direction: number = 1; // Used for yoyo mode
  private completed: boolean = false; // Used for once mode
  private shuffled: SequenceValue[]; // Used for shuffle/random modes
  private accumulator: number = 0; // Used for additive/multiplicative modes
  private readonly originalSeed: number;
  private prng: () => number;

  /**
   * Creates a new Sequence instance
   * @param values - Array of values to sequence through
   * @param mode - The sequencing mode
   * @param seed - Random seed for deterministic shuffle/random modes
   */
  constructor(
    private readonly values: SequenceValue[],
    private readonly mode: SequenceMode = 'repeat',
    seed: number = Date.now()
  ) {
    this.originalSeed = seed;
    this.prng = this.createPRNG(seed);
    this.shuffled = [...values];

    // Initialize accumulator based on mode
    if (mode === 'additive') {
      this.accumulator = 0;
    } else if (mode === 'multiplicative') {
      this.accumulator = 1;
    }

    // Pre-shuffle if in shuffle mode
    if (mode === 'shuffle') {
      this.shuffled = this.shuffle(values);
    }
  }

  /**
   * Creates a seeded pseudo-random number generator (Mulberry32 algorithm)
   * @param seed - Seed value for deterministic random generation
   * @returns A function that generates random numbers between 0 and 1
   */
  private createPRNG(seed: number): () => number {
    let state = seed;
    return function() {
      state |= 0;
      state = state + 0x6D2B79F5 | 0;
      let t = Math.imul(state ^ state >>> 15, 1 | state);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /**
   * Fisher-Yates shuffle algorithm using seeded PRNG
   * @param arr - Array to shuffle
   * @returns A new shuffled array
   */
  private shuffle(arr: SequenceValue[]): SequenceValue[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.prng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Advances the internal index based on the sequence mode
   * @returns The new index value
   */
  private getNextIndex(): number {
    // Once mode: stop advancing after completion
    if (this.mode === 'once' && this.completed) {
      return this.index;
    }

    // Accumulation modes: always advance through sequence
    if (this.mode === 'additive' || this.mode === 'multiplicative') {
      this.index++;
      if (this.index >= this.values.length) {
        this.index = 0;
      }
      return this.index;
    }

    // Yoyo mode: bounce back and forth
    if (this.mode === 'yoyo') {
      this.index += this.direction;
      if (this.index >= this.values.length - 1) {
        this.direction = -1;
      } else if (this.index <= 0) {
        this.direction = 1;
      }
    } 
    // Random mode: reshuffle on cycle completion
    else if (this.mode === 'random') {
      this.index++;
      if (this.index >= this.shuffled.length) {
        this.shuffled = this.shuffle(this.values);
        this.index = 0;
      }
    } 
    // Repeat, shuffle, and once modes
    else {
      this.index++;
      if (this.index >= this.values.length) {
        if (this.mode === 'once') {
          this.completed = true;
          this.index = this.values.length - 1;
        } else {
          this.index = 0;
        }
      }
    }
    return this.index;
  }

  /**
   * Resolves a sequence value to a number (handles nested sequences)
   * @param value - The value to resolve
   * @returns The numeric value
   */
  private resolveValue(value: SequenceValue): number {
    return typeof value === 'function' && 'current' in value 
      ? value.current 
      : value as number;
  }

  /**
   * Creates the public-facing sequence function with all methods
   * @returns A callable function that also has current, reset, and peek methods
   */
  public createFunction(): SequenceFunction {
    // Main function: returns current value, then advances
    const seq = (() => {
      // Handle accumulation modes
      if (this.mode === 'additive' || this.mode === 'multiplicative') {
        const currentValue = this.resolveValue(this.values[this.index % this.values.length]);
        
        if (this.mode === 'additive') {
          this.accumulator += currentValue;
        } else {
          this.accumulator *= currentValue;
        }
        
        const result = this.accumulator;
        this.getNextIndex(); // Advance after getting value
        return result;
      }
      
      // For non-accumulation modes, get current value then advance
      const arr = (this.mode === 'shuffle' || this.mode === 'random') 
        ? this.shuffled 
        : this.values;
      const result = this.resolveValue(arr[this.index % arr.length]);
      this.getNextIndex(); // Advance after getting value
      return result;
    }).bind(this) as SequenceFunction;

    // current: property that returns the current value (without advancing)
    Object.defineProperty(seq, 'current', {
      get: (): number => {
        // For accumulation modes, return current accumulator
        if (this.mode === 'additive' || this.mode === 'multiplicative') {
          return this.accumulator;
        }
        
        const arr = (this.mode === 'shuffle' || this.mode === 'random') 
          ? this.shuffled 
          : this.values;
        
        // Return the value at the current index
        return this.resolveValue(arr[this.index % arr.length]);
      },
      enumerable: true
    });

    // reset: resets to initial state
    seq.reset = (): SequenceFunction => {
      this.index = 0;
      this.direction = 1;
      this.completed = false;

      // Reset accumulator based on mode
      if (this.mode === 'additive') {
        this.accumulator = 0;
      } else if (this.mode === 'multiplicative') {
        this.accumulator = 1;
      }

      // Reset PRNG to original seed for deterministic behavior
      this.prng = this.createPRNG(this.originalSeed);

      // Re-shuffle with reset seed
      if (this.mode === 'shuffle' || this.mode === 'random') {
        this.shuffled = this.shuffle(this.values);
      }

      return seq;
    };

    // peek: look ahead without advancing
    seq.peek = (offset: number = 0): number => {
      // For accumulation modes, peek doesn't make as much sense
      // Return what the accumulator would be after 'offset' more steps
      if (this.mode === 'additive' || this.mode === 'multiplicative') {
        let tempAccumulator = this.accumulator;
        let tempIndex = this.index;
        
        for (let i = 0; i < offset; i++) {
          tempIndex = (tempIndex + 1) % this.values.length;
          const value = this.resolveValue(this.values[tempIndex]);
          
          if (this.mode === 'additive') {
            tempAccumulator += value;
          } else {
            tempAccumulator *= value;
          }
        }
        
        return tempAccumulator;
      }
      
      const arr = (this.mode === 'shuffle' || this.mode === 'random') 
        ? this.shuffled 
        : this.values;
      return this.resolveValue(arr[(this.index + offset) % arr.length]);
    };

    return seq;
  }

  /**
   * Creates a repeating sequence that cycles forever
   * @param values - Values to cycle through
   * @returns A sequence function
   * 
   * @example
   * ```typescript
   * const s = Sequence.repeat(1, 2, 3);
   * console.log([s(), s(), s(), s()]); // [2, 3, 1, 2]
   * ```
   */
  static repeat(...values: SequenceValue[]): SequenceFunction {
    return new Sequence(values, 'repeat').createFunction();
  }

  /**
   * Creates a yoyo sequence that bounces back and forth
   * @param values - Values to bounce through
   * @returns A sequence function
   * 
   * @example
   * ```typescript
   * const s = Sequence.yoyo(1, 2, 3);
   * console.log([s(), s(), s(), s(), s()]); // [2, 3, 2, 1, 2]
   * ```
   */
  static yoyo(...values: SequenceValue[]): SequenceFunction {
    return new Sequence(values, 'yoyo').createFunction();
  }

  /**
   * Creates a sequence that plays once then stops at the last value
   * @param values - Values to play through
   * @returns A sequence function
   * 
   * @example
   * ```typescript
   * const s = Sequence.once(1, 2, 3);
   * console.log([s(), s(), s(), s()]); // [2, 3, 3, 3]
   * ```
   */
  static once(...values: SequenceValue[]): SequenceFunction {
    return new Sequence(values, 'once').createFunction();
  }

  /**
   * Creates a shuffled sequence (shuffles once at creation)
   * @param values - Values to shuffle
   * @returns A sequence function
   * 
   * @example
   * ```typescript
   * const s = Sequence.shuffle(1, 2, 3, 4);
   * console.log([s(), s(), s(), s()]); // e.g., [3, 1, 4, 2]
   * ```
   */
  static shuffle(...values: SequenceValue[]): SequenceFunction {
    return new Sequence(values, 'shuffle').createFunction();
  }

  /**
   * Creates a random sequence (reshuffles on each cycle completion)
   * @param seed - Optional seed for deterministic randomness
   * @param values - Values to randomize
   * @returns A sequence function
   * 
   * @example With seed (deterministic)
   * ```typescript
   * const s = Sequence.random(42, 1, 2, 3);
   * console.log([s(), s(), s()]); // e.g., [2, 3, 1]
   * s.reset();
   * console.log([s(), s(), s()]); // Same: [2, 3, 1]
   * ```
   * 
   * @example Without seed (non-deterministic)
   * ```typescript
   * const s = Sequence.random(1, 2, 3);
   * console.log([s(), s(), s()]); // Random order
   * ```
   */
  static random(seed: number, ...values: SequenceValue[]): SequenceFunction;
  static random(...values: SequenceValue[]): SequenceFunction;
  static random(seedOrValue: number | SequenceValue, ...values: SequenceValue[]): SequenceFunction {
    if (typeof seedOrValue === 'number' && values.length > 0) {
      // First arg is seed, rest are values
      return new Sequence(values, 'random', seedOrValue).createFunction();
    } else {
      // All args are values, use default seed
      return new Sequence([seedOrValue as SequenceValue, ...values], 'random').createFunction();
    }
  }

  /**
   * Creates an additive sequence where each call adds the next value to a running total
   * @param values - Values to add cumulatively
   * @returns A sequence function
   * 
   * @example
   * ```typescript
   * const s = Sequence.additive(1, 2, 3);
   * console.log(s + 0);  // 0 (initial accumulator)
   * console.log(s());    // 1 (0 + 1)
   * console.log(s());    // 3 (1 + 2)
   * console.log(s());    // 6 (3 + 3)
   * console.log(s());    // 7 (6 + 1, cycles back)
   * ```
   */
  static additive(...values: SequenceValue[]): SequenceFunction {
    return new Sequence(values, 'additive').createFunction();
  }

  /**
   * Creates a multiplicative sequence where each call multiplies the running total by the next value
   * @param values - Values to multiply cumulatively
   * @returns A sequence function
   * 
   * @example
   * ```typescript
   * const s = Sequence.multiplicative(2, 3, 4);
   * console.log(s + 0);  // 1 (initial accumulator)
   * console.log(s());    // 2 (1 * 2)
   * console.log(s());    // 6 (2 * 3)
   * console.log(s());    // 24 (6 * 4)
   * console.log(s());    // 48 (24 * 2, cycles back)
   * ```
   */
  static multiplicative(...values: SequenceValue[]): SequenceFunction {
    return new Sequence(values, 'multiplicative').createFunction();
  }
}

export { Sequence, type SequenceFunction, type SequenceValue, type SequenceMode };