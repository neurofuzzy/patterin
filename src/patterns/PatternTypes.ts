export type PatternType = 
    | 'checker' 
    | 'chevron' 
    | 'gingham' 
    | 'houndstooth' 
    | 'herringbone'
    | 'brick'
    | 'pinwheel'
    | 'logCabin'
    | 'bowTie'
    | 'brokenDishes'
    | 'friendshipStar'
    | 'shooFly'
    | 'snowball'
    | 'flyingGeese'
    | 'dutchmansPuzzle'
    | 'sawtoothStar'
    | 'eightPointedStar';

export interface PatternBounds {
    width: number;
    height: number;
}

export interface BasePatternOptions {
    bounds: PatternBounds;
}

export interface CheckerOptions extends BasePatternOptions {
    size: number;  // Size of each check
}

export interface ChevronOptions extends BasePatternOptions {
    stripeWidth: number;  // Width of each chevron stripe
    angle?: number;       // Chevron angle (default 45)
}

export interface GinghamOptions extends BasePatternOptions {
    checkSize: number;           // Base unit size
    bands?: number[];            // Band pattern [thin, thick, thin, thick]
}

export interface HoundstoothOptions extends BasePatternOptions {
    size: number;  // Size of each tooth unit
}

export interface HerringboneOptions extends BasePatternOptions {
    brickWidth: number;   // Width of each brick
    brickHeight: number;  // Height of each brick
    angle?: number;       // Herringbone angle (default 45)
}

export type BrickBondType = 'running' | 'stack' | 'basket' | 'flemish';

export interface BrickOptions extends BasePatternOptions {
    type?: BrickBondType;  // Bond pattern (default 'running')
    brickWidth: number;    // Width of each brick
    brickHeight: number;   // Height of each brick
    mortarWidth?: number;  // Gap between bricks (default 2)
}

export interface PinwheelOptions extends BasePatternOptions {
    blockSize: number;     // Size of each pinwheel block (HST-based quilt block)
}

export interface LogCabinOptions extends BasePatternOptions {
    blockSize: number;     // Size of each log cabin block
    stripWidth: number;    // Width of each strip/log
}

export interface BowTieOptions extends BasePatternOptions {
    blockSize: number;     // Size of each bow tie block
}

export interface BrokenDishesOptions extends BasePatternOptions {
    blockSize: number;     // Size of each broken dishes block
}

export interface FriendshipStarOptions extends BasePatternOptions {
    blockSize: number;     // Size of each friendship star block
}

export interface ShooFlyOptions extends BasePatternOptions {
    blockSize: number;     // Size of each shoo fly block
}

export interface SnowballOptions extends BasePatternOptions {
    blockSize: number;     // Size of each snowball block
    cornerSize?: number;   // Size of corner triangles (default: blockSize / 4)
}

export interface FlyingGeeseOptions extends BasePatternOptions {
    unitSize: number;      // Size of each square flying geese unit
    direction?: 'horizontal' | 'vertical';  // Direction of flight (default 'horizontal')
}

export interface DutchmansPuzzleOptions extends BasePatternOptions {
    blockSize: number;     // Size of each Dutchman's Puzzle block
}

export interface SawtoothStarOptions extends BasePatternOptions {
    blockSize: number;     // Size of each sawtooth star block
}

export interface EightPointedStarOptions extends BasePatternOptions {
    blockSize: number;     // Size of each eight-pointed star block
}
