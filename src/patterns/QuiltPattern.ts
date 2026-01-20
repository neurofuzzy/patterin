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

// Unused imports removed - templates are pure data structures

// =============================================================================
// Block Rotation Type
// =============================================================================

/**
 * Rotation for any block element (HST, Flying Geese, etc.)
 * 0 = default orientation
 * 90/180/270 = clockwise rotation in degrees
 */
export type BlockRotation = 0 | 90 | 180 | 270;

// =============================================================================
// Cell Types
// =============================================================================

export type CellDefinition =
    | { type: 'square'; group: 'light' | 'dark' }
    | { type: 'hst'; rotation: BlockRotation }
    | { type: 'flyingGeese'; rotation: BlockRotation };

// =============================================================================
// Block Template
// =============================================================================

export interface QuiltBlockTemplate {
    name: string;
    grid: 2 | 3;  // 2=four-patch, 3=nine-patch
    cells: CellDefinition[][];
}

// =============================================================================
// Block Templates
// =============================================================================

/**
 * Pinwheel block (2×2 four-patch)
 * Four HSTs arranged in a spinning pattern with dark meeting at center.
 */
export const pinwheelTemplate: QuiltBlockTemplate = {
    name: 'pinwheel',
    grid: 2,
    cells: [
        [{ type: 'hst', rotation: 90 }, { type: 'hst', rotation: 180 }],
        [{ type: 'hst', rotation: 0 }, { type: 'hst', rotation: 270 }]
    ]
};

/**
 * Broken Dishes block (2×2 four-patch)
 * Four HSTs with dark at outer corners (opposite of pinwheel).
 */
export const brokenDishesTemplate: QuiltBlockTemplate = {
    name: 'brokenDishes',
    grid: 2,
    cells: [
        [{ type: 'hst', rotation: 0 }, { type: 'hst', rotation: 270 }],
        [{ type: 'hst', rotation: 90 }, { type: 'hst', rotation: 180 }]
    ]
};

/**
 * Friendship Star block (3×3 nine-patch)
 * Center square with corner squares and edge HSTs forming star points.
 */
export const friendshipStarTemplate: QuiltBlockTemplate = {
    name: 'friendshipStar',
    grid: 3,
    cells: [
        [{ type: 'square', group: 'light' }, { type: 'hst', rotation: 180 }, { type: 'square', group: 'light' }],
        [{ type: 'hst', rotation: 90 }, { type: 'square', group: 'dark' }, { type: 'hst', rotation: 270 }],
        [{ type: 'square', group: 'light' }, { type: 'hst', rotation: 0 }, { type: 'square', group: 'light' }]
    ]
};

/**
 * Shoo Fly block (3×3 nine-patch)
 * Corner HSTs with center square and plain edge squares.
 */
export const shooFlyTemplate: QuiltBlockTemplate = {
    name: 'shooFly',
    grid: 3,
    cells: [
        [{ type: 'hst', rotation: 180 }, { type: 'square', group: 'light' }, { type: 'hst', rotation: 270 }],
        [{ type: 'square', group: 'light' }, { type: 'square', group: 'dark' }, { type: 'square', group: 'light' }],
        [{ type: 'hst', rotation: 90 }, { type: 'square', group: 'light' }, { type: 'hst', rotation: 0 }]
    ]
};

/**
 * Bow Tie block (2×2 four-patch)
 * Opposing corner HSTs creating a bow tie shape with dark in two opposite corners.
 */
export const bowTieTemplate: QuiltBlockTemplate = {
    name: 'bowTie',
    grid: 2,
    cells: [
        [{ type: 'hst', rotation: 0 }, { type: 'hst', rotation: 0 }],
        [{ type: 'hst', rotation: 180 }, { type: 'hst', rotation: 180 }]
    ]
};

/**
 * Dutchman's Puzzle block (2×2 four-patch of flying geese)
 * Four Flying Geese units arranged in a pinwheel.
 */
export const dutchmansPuzzleTemplate: QuiltBlockTemplate = {
    name: 'dutchmansPuzzle',
    grid: 2,
    cells: [
        [{ type: 'flyingGeese', rotation: 270 }, { type: 'flyingGeese', rotation: 0 }],
        [{ type: 'flyingGeese', rotation: 180 }, { type: 'flyingGeese', rotation: 90 }]
    ]
};

/**
 * Sawtooth Star block (3×3 nine-patch with flying geese points)
 */
export const sawtoothStarTemplate: QuiltBlockTemplate = {
    name: 'sawtoothStar',
    grid: 3,
    cells: [
        [{ type: 'square', group: 'light' }, { type: 'flyingGeese', rotation: 270 }, { type: 'square', group: 'light' }],
        [{ type: 'flyingGeese', rotation: 180 }, { type: 'square', group: 'dark' }, { type: 'flyingGeese', rotation: 0 }],
        [{ type: 'square', group: 'light' }, { type: 'flyingGeese', rotation: 90 }, { type: 'square', group: 'light' }]
    ]
};

// Registry of all templates
export const quiltBlockTemplates: Record<string, QuiltBlockTemplate> = {
    pinwheel: pinwheelTemplate,
    brokenDishes: brokenDishesTemplate,
    friendshipStar: friendshipStarTemplate,
    shooFly: shooFlyTemplate,
    bowTie: bowTieTemplate,
    dutchmansPuzzle: dutchmansPuzzleTemplate,
    sawtoothStar: sawtoothStarTemplate,
};
