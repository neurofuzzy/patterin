import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';

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
// Primitive Creators
// =============================================================================

/**
 * Create a Half-Square Triangle (HST) unit.
 * Two triangles dividing a square diagonally.
 * 
 * Rotation 0: dark at top-left, light at bottom-right (/ diagonal)
 * Rotation 90: dark at top-right, light at bottom-left
 * Rotation 180: dark at bottom-right, light at top-left
 * Rotation 270: dark at bottom-left, light at top-right
 */
function createHST(
    x: number,
    y: number,
    size: number,
    rotation: BlockRotation
): Shape[] {
    const shapes: Shape[] = [];

    // Define the 4 corners
    const tl = new Vector2(x, y);
    const tr = new Vector2(x + size, y);
    const bl = new Vector2(x, y + size);
    const br = new Vector2(x + size, y + size);

    let darkPoints: Vector2[];
    let lightPoints: Vector2[];

    switch (rotation) {
        case 0:
            // Dark at top-left corner (/ diagonal)
            darkPoints = [tl, tr, bl];
            lightPoints = [tr, br, bl];
            break;
        case 90:
            // Dark at top-right corner
            darkPoints = [tl, tr, br];
            lightPoints = [tl, br, bl];
            break;
        case 180:
            // Dark at bottom-right corner
            darkPoints = [tr, br, bl];
            lightPoints = [tl, tr, bl];
            break;
        case 270:
            // Dark at bottom-left corner
            darkPoints = [tl, br, bl];
            lightPoints = [tl, tr, br];
            break;
    }

    const dark = Shape.fromPoints(darkPoints);
    dark.group = 'dark';
    shapes.push(dark);

    const light = Shape.fromPoints(lightPoints);
    light.group = 'light';
    shapes.push(light);

    return shapes;
}

/**
 * Create a simple square.
 */
function createSquare(
    x: number,
    y: number,
    size: number,
    group: 'light' | 'dark'
): Shape {
    const square = Shape.fromPoints([
        new Vector2(x, y),
        new Vector2(x + size, y),
        new Vector2(x + size, y + size),
        new Vector2(x, y + size)
    ]);
    square.group = group;
    return square;
}

/**
 * Create a Flying Geese unit.
 * A large triangle (goose) with two smaller corner triangles (sky).
 * 
 * Rotation determines the direction the goose points:
 * 0 = pointing right (horizontal, goose tip at right edge)
 * 90 = pointing down (vertical, goose tip at bottom edge)
 * 180 = pointing left (horizontal, goose tip at left edge)
 * 270 = pointing up (vertical, goose tip at top edge)
 */
function createFlyingGeese(
    x: number,
    y: number,
    size: number,
    rotation: BlockRotation
): Shape[] {
    const shapes: Shape[] = [];
    const half = size / 2;

    // Define corners and midpoints
    const tl = new Vector2(x, y);
    const tr = new Vector2(x + size, y);
    const bl = new Vector2(x, y + size);
    const br = new Vector2(x + size, y + size);
    const tm = new Vector2(x + half, y);
    const bm = new Vector2(x + half, y + size);
    const lm = new Vector2(x, y + half);
    const rm = new Vector2(x + size, y + half);

    let goosePoints: Vector2[];
    let sky1Points: Vector2[];
    let sky2Points: Vector2[];

    switch (rotation) {
        case 0:
            // Goose pointing RIGHT (horizontal)
            // Goose: large triangle with tip at right-middle
            goosePoints = [tl, rm, bl];
            // Sky triangles in top-right and bottom-right corners
            sky1Points = [tl, tr, rm];
            sky2Points = [rm, br, bl];
            break;
        case 90:
            // Goose pointing DOWN (vertical)
            // Goose: large triangle with tip at bottom-middle
            goosePoints = [tl, tr, bm];
            // Sky triangles in bottom-left and bottom-right corners
            sky1Points = [tl, bm, bl];
            sky2Points = [tr, br, bm];
            break;
        case 180:
            // Goose pointing LEFT (horizontal)
            // Goose: large triangle with tip at left-middle
            goosePoints = [lm, tr, br];
            // Sky triangles in top-left and bottom-left corners
            sky1Points = [tl, tr, lm];
            sky2Points = [lm, br, bl];
            break;
        case 270:
            // Goose pointing UP (vertical)
            // Goose: large triangle with tip at top-middle
            goosePoints = [tm, bl, br];
            // Sky triangles in top-left and top-right corners
            sky1Points = [tl, tm, bl];
            sky2Points = [tm, tr, br];
            break;
    }

    const goose = Shape.fromPoints(goosePoints);
    goose.group = 'dark';
    shapes.push(goose);

    const sky1 = Shape.fromPoints(sky1Points);
    sky1.group = 'light';
    shapes.push(sky1);

    const sky2 = Shape.fromPoints(sky2Points);
    sky2.group = 'light';
    shapes.push(sky2);

    return shapes;
}

// =============================================================================
// Block Builder
// =============================================================================

/**
 * Build shapes for a single quilt block from a template.
 */
function buildBlock(
    template: QuiltBlockTemplate,
    x: number,
    y: number,
    blockSize: number
): Shape[] {
    const shapes: Shape[] = [];
    const cellSize = blockSize / template.grid;

    for (let row = 0; row < template.grid; row++) {
        for (let col = 0; col < template.grid; col++) {
            const cellX = x + col * cellSize;
            const cellY = y + row * cellSize;
            const cell = template.cells[row][col];

            switch (cell.type) {
                case 'square':
                    shapes.push(createSquare(cellX, cellY, cellSize, cell.group));
                    break;
                case 'hst':
                    shapes.push(...createHST(cellX, cellY, cellSize, cell.rotation));
                    break;
                case 'flyingGeese':
                    shapes.push(...createFlyingGeese(cellX, cellY, cellSize, cell.rotation));
                    break;
            }
        }
    }

    return shapes;
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

// =============================================================================
// Pattern Options
// =============================================================================

export interface QuiltPatternOptions {
    blockName: string;
    blockSize: number;
    bounds: { width: number; height: number };
}

// =============================================================================
// Main Pattern Creator
// =============================================================================

/**
 * Create a quilt pattern from a named block template.
 * 
 * @param options - Pattern configuration
 * @returns ShapesContext with all pattern shapes
 * 
 * @example
 * ```typescript
 * const pinwheel = pattern.quilt({
 *   blockName: 'pinwheel',
 *   blockSize: 100,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createQuiltPattern(options: QuiltPatternOptions): ShapesContext {
    const { blockName, blockSize, bounds } = options;

    const template = quiltBlockTemplates[blockName];
    if (!template) {
        throw new Error(`Unknown quilt block: ${blockName}. Available: ${Object.keys(quiltBlockTemplates).join(', ')}`);
    }

    const shapes: Shape[] = [];
    const numRows = Math.ceil(bounds.height / blockSize);
    const numCols = Math.ceil(bounds.width / blockSize);

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * blockSize;
            const y = row * blockSize;
            shapes.push(...buildBlock(template, x, y, blockSize));
        }
    }

    return new ShapesContext(shapes);
}

/**
 * Create a quilt pattern from a custom block template.
 * 
 * @param template - Custom block template
 * @param blockSize - Size of each block
 * @param bounds - Pattern bounds
 * @returns ShapesContext with all pattern shapes
 */
export function createQuiltPatternFromTemplate(
    template: QuiltBlockTemplate,
    blockSize: number,
    bounds: { width: number; height: number }
): ShapesContext {
    const shapes: Shape[] = [];
    const numRows = Math.ceil(bounds.height / blockSize);
    const numCols = Math.ceil(bounds.width / blockSize);

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const x = col * blockSize;
            const y = row * blockSize;
            shapes.push(...buildBlock(template, x, y, blockSize));
        }
    }

    return new ShapesContext(shapes);
}
