export type PatternType =
    | 'checker'
    | 'chevron'
    | 'gingham'
    | 'houndstooth'
    | 'herringbone'
    | 'brick'
    | 'quilt';

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
