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
 * Main Sequence class that handles all sequence generation logic
 */
class Sequence {
    /**
     * Creates a new Sequence instance
     * @param values - Array of values to sequence through
     * @param mode - The sequencing mode
     * @param seed - Random seed for deterministic shuffle/random modes
     */
    constructor(values, mode = 'repeat', seed = Date.now()) {
        this.values = values;
        this.mode = mode;
        this.index = -1;
        this.direction = 1; // Used for yoyo mode
        this.completed = false; // Used for once mode
        this.accumulator = 0; // Used for additive/multiplicative modes
        this.originalSeed = seed;
        this.prng = this.createPRNG(seed);
        this.shuffled = [...values];
        // Initialize accumulator based on mode
        if (mode === 'additive') {
            this.accumulator = 0;
        }
        else if (mode === 'multiplicative') {
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
    createPRNG(seed) {
        let state = seed;
        return function () {
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
    shuffle(arr) {
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
    getNextIndex() {
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
            }
            else if (this.index <= 0) {
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
                }
                else {
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
    resolveValue(value) {
        return typeof value === 'function' && 'current' in value
            ? value.current
            : value;
    }
    /**
     * Creates the public-facing sequence function with all methods
     * @returns A callable function that also has current, reset, and peek methods
     */
    createFunction() {
        const self = this;
        // Main function: advances and returns new value
        const seq = function () {
            self.getNextIndex();
            // Handle accumulation modes
            if (self.mode === 'additive' || self.mode === 'multiplicative') {
                const currentValue = self.resolveValue(self.values[self.index % self.values.length]);
                if (self.mode === 'additive') {
                    self.accumulator += currentValue;
                }
                else {
                    self.accumulator *= currentValue;
                }
                return self.accumulator;
            }
            // For non-accumulation modes, return current value
            const arr = (self.mode === 'shuffle' || self.mode === 'random')
                ? self.shuffled
                : self.values;
            return self.resolveValue(arr[self.index % arr.length]);
        };
        // current: property that returns the value that will be returned on next call (without advancing)
        Object.defineProperty(seq, 'current', {
            get: function () {
                // For accumulation modes, we need to peek at what the next value would be after accumulation
                if (self.mode === 'additive' || self.mode === 'multiplicative') {
                    // Calculate what the next index will be
                    let peekIndex = self.index + 1;
                    if (peekIndex >= self.values.length) {
                        peekIndex = 0;
                    }
                    const nextValue = self.resolveValue(self.values[peekIndex]);
                    if (self.mode === 'additive') {
                        return self.accumulator + nextValue;
                    }
                    else {
                        return self.accumulator * nextValue;
                    }
                }
                const arr = (self.mode === 'shuffle' || self.mode === 'random')
                    ? self.shuffled
                    : self.values;
                // Return the value that would be returned on the next call
                // This is index + 1 (what getNextIndex will set it to)
                const nextIndex = (self.index + 1) % arr.length;
                return self.resolveValue(arr[nextIndex]);
            },
            enumerable: true
        });
        // reset: resets to initial state
        seq.reset = function () {
            self.index = 0;
            self.direction = 1;
            self.completed = false;
            // Reset accumulator based on mode
            if (self.mode === 'additive') {
                self.accumulator = 0;
            }
            else if (self.mode === 'multiplicative') {
                self.accumulator = 1;
            }
            // Reset PRNG to original seed for deterministic behavior
            self.prng = self.createPRNG(self.originalSeed);
            // Re-shuffle with reset seed
            if (self.mode === 'shuffle' || self.mode === 'random') {
                self.shuffled = self.shuffle(self.values);
            }
            return seq;
        };
        // peek: look ahead without advancing
        seq.peek = function (offset = 0) {
            // For accumulation modes, peek doesn't make as much sense
            // Return what the accumulator would be after 'offset' more steps
            if (self.mode === 'additive' || self.mode === 'multiplicative') {
                let tempAccumulator = self.accumulator;
                let tempIndex = self.index;
                for (let i = 0; i < offset; i++) {
                    tempIndex = (tempIndex + 1) % self.values.length;
                    const value = self.resolveValue(self.values[tempIndex]);
                    if (self.mode === 'additive') {
                        tempAccumulator += value;
                    }
                    else {
                        tempAccumulator *= value;
                    }
                }
                return tempAccumulator;
            }
            const arr = (self.mode === 'shuffle' || self.mode === 'random')
                ? self.shuffled
                : self.values;
            return self.resolveValue(arr[(self.index + offset) % arr.length]);
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
    static repeat(...values) {
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
    static yoyo(...values) {
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
    static once(...values) {
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
    static shuffle(...values) {
        return new Sequence(values, 'shuffle').createFunction();
    }
    static random(seedOrValue, ...values) {
        if (typeof seedOrValue === 'number' && values.length > 0) {
            // First arg is seed, rest are values
            return new Sequence(values, 'random', seedOrValue).createFunction();
        }
        else {
            // All args are values, use default seed
            return new Sequence([seedOrValue, ...values], 'random').createFunction();
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
    static additive(...values) {
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
    static multiplicative(...values) {
        return new Sequence(values, 'multiplicative').createFunction();
    }
}
export { Sequence };
