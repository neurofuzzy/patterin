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
declare class Sequence {
    private readonly values;
    private readonly mode;
    private index;
    private direction;
    private completed;
    private shuffled;
    private accumulator;
    private readonly originalSeed;
    private prng;
    /**
     * Creates a new Sequence instance
     * @param values - Array of values to sequence through
     * @param mode - The sequencing mode
     * @param seed - Random seed for deterministic shuffle/random modes
     */
    constructor(values: SequenceValue[], mode?: SequenceMode, seed?: number);
    /**
     * Creates a seeded pseudo-random number generator (Mulberry32 algorithm)
     * @param seed - Seed value for deterministic random generation
     * @returns A function that generates random numbers between 0 and 1
     */
    private createPRNG;
    /**
     * Fisher-Yates shuffle algorithm using seeded PRNG
     * @param arr - Array to shuffle
     * @returns A new shuffled array
     */
    private shuffle;
    /**
     * Advances the internal index based on the sequence mode
     * @returns The new index value
     */
    private getNextIndex;
    /**
     * Resolves a sequence value to a number (handles nested sequences)
     * @param value - The value to resolve
     * @returns The numeric value
     */
    private resolveValue;
    /**
     * Creates the public-facing sequence function with all methods
     * @returns A callable function that also has current, reset, and peek methods
     */
    createFunction(): SequenceFunction;
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
    static repeat(...values: SequenceValue[]): SequenceFunction;
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
    static yoyo(...values: SequenceValue[]): SequenceFunction;
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
    static once(...values: SequenceValue[]): SequenceFunction;
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
    static shuffle(...values: SequenceValue[]): SequenceFunction;
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
    static additive(...values: SequenceValue[]): SequenceFunction;
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
    static multiplicative(...values: SequenceValue[]): SequenceFunction;
}
export { Sequence, type SequenceFunction, type SequenceValue, type SequenceMode };
