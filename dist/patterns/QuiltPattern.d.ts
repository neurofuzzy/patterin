/**
 * Quilt Block Templates and Primitives
 *
 * This module provides quilt block templates and primitive functions for
 * creating individual blocks. For grid repetition, use system.quilt().
 *
 * @example
 * ```typescript
 * // Use system.quilt() for quilts:
 * const quilt = system.quilt({ gridSize: [4, 4], blockSize: 100 });
 * quilt.every(2).placeBlock('BD');
 * quilt.every(2, 1).placeBlock('FS');
 * ```
 */
/**
 * Rotation for any block element (HST, Flying Geese, etc.)
 * 0 = default orientation
 * 90/180/270 = clockwise rotation in degrees
 */
export type BlockRotation = 0 | 90 | 180 | 270;
export type CellDefinition = {
    type: 'square';
    group: 'light' | 'dark';
} | {
    type: 'hst';
    rotation: BlockRotation;
} | {
    type: 'flyingGeese';
    rotation: BlockRotation;
};
export interface QuiltBlockTemplate {
    name: string;
    grid: 2 | 3;
    cells: CellDefinition[][];
}
/**
 * Pinwheel block (2×2 four-patch)
 * Four HSTs arranged in a spinning pattern with dark meeting at center.
 */
export declare const pinwheelTemplate: QuiltBlockTemplate;
/**
 * Broken Dishes block (2×2 four-patch)
 * Four HSTs with dark at outer corners (opposite of pinwheel).
 */
export declare const brokenDishesTemplate: QuiltBlockTemplate;
/**
 * Friendship Star block (3×3 nine-patch)
 * Center square with corner squares and edge HSTs forming star points.
 */
export declare const friendshipStarTemplate: QuiltBlockTemplate;
/**
 * Shoo Fly block (3×3 nine-patch)
 * Corner HSTs with center square and plain edge squares.
 */
export declare const shooFlyTemplate: QuiltBlockTemplate;
/**
 * Bow Tie block (2×2 four-patch)
 * Opposing corner HSTs creating a bow tie shape with dark in two opposite corners.
 */
export declare const bowTieTemplate: QuiltBlockTemplate;
/**
 * Dutchman's Puzzle block (2×2 four-patch of flying geese)
 * Four Flying Geese units arranged in a pinwheel.
 */
export declare const dutchmansPuzzleTemplate: QuiltBlockTemplate;
/**
 * Sawtooth Star block (3×3 nine-patch with flying geese points)
 */
export declare const sawtoothStarTemplate: QuiltBlockTemplate;
export declare const quiltBlockTemplates: Record<string, QuiltBlockTemplate>;
