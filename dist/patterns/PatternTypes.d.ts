export type PatternType = 'checker' | 'chevron' | 'gingham' | 'houndstooth' | 'herringbone' | 'brick' | 'pinwheel' | 'logCabin' | 'bowTie' | 'brokenDishes' | 'friendshipStar' | 'shooFly' | 'snowball' | 'flyingGeese' | 'dutchmansPuzzle' | 'sawtoothStar' | 'eightPointedStar';
export interface PatternBounds {
    width: number;
    height: number;
}
export interface BasePatternOptions {
    bounds: PatternBounds;
}
export interface CheckerOptions extends BasePatternOptions {
    size: number;
}
export interface ChevronOptions extends BasePatternOptions {
    stripeWidth: number;
    angle?: number;
}
export interface GinghamOptions extends BasePatternOptions {
    checkSize: number;
    bands?: number[];
}
export interface HoundstoothOptions extends BasePatternOptions {
    size: number;
}
export interface HerringboneOptions extends BasePatternOptions {
    brickWidth: number;
    brickHeight: number;
    angle?: number;
}
export type BrickBondType = 'running' | 'stack' | 'basket' | 'flemish';
export interface BrickOptions extends BasePatternOptions {
    type?: BrickBondType;
    brickWidth: number;
    brickHeight: number;
    mortarWidth?: number;
}
export interface PinwheelOptions extends BasePatternOptions {
    blockSize: number;
}
export interface LogCabinOptions extends BasePatternOptions {
    blockSize: number;
    stripWidth: number;
}
export interface BowTieOptions extends BasePatternOptions {
    blockSize: number;
}
export interface BrokenDishesOptions extends BasePatternOptions {
    blockSize: number;
}
export interface FriendshipStarOptions extends BasePatternOptions {
    blockSize: number;
}
export interface ShooFlyOptions extends BasePatternOptions {
    blockSize: number;
}
export interface SnowballOptions extends BasePatternOptions {
    blockSize: number;
    cornerSize?: number;
}
export interface FlyingGeeseOptions extends BasePatternOptions {
    unitSize: number;
    direction?: 'horizontal' | 'vertical';
}
export interface DutchmansPuzzleOptions extends BasePatternOptions {
    blockSize: number;
}
export interface SawtoothStarOptions extends BasePatternOptions {
    blockSize: number;
}
export interface EightPointedStarOptions extends BasePatternOptions {
    blockSize: number;
}
