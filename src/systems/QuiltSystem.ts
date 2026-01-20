import { Shape, Vector2, Vertex } from '../primitives';
import { ShapeContext, ShapesContext } from '../contexts/ShapeContext';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector';
import { SystemBounds } from '../types';
import { BaseSystem, type RenderGroup, type GroupItem } from './BaseSystem';
import {
    quiltBlockTemplates,
    QuiltBlockTemplate,
    BlockRotation
} from '../patterns/QuiltPattern';

// =============================================================================
// QuiltPatternContext
// =============================================================================

/**
 * QuiltPatternContext - Context for selecting and placing quilt blocks.
 * Similar to PointsContext and LinesContext, provides selection methods
 * that return this for chaining with placeBlock().
 * 
 * @example
 * ```typescript
 * const quilt = system.quilt({ gridSize: [4, 4], blockSize: 100 });
 * quilt.pattern.every(2).placeBlock('BD');
 * quilt.pattern.every(2, 1).placeBlock('FS');
 * ```
 */
export class QuiltPatternContext {
    private _system: QuiltSystem;
    private _placements: QuiltBlockPlacement[];
    private _selectedIndices: number[] = [];

    constructor(system: QuiltSystem, placements: QuiltBlockPlacement[]) {
        this._system = system;
        this._placements = placements;
    }

    /**
     * Select every nth placement.
     * @param n - Select every nth placement
     * @param offset - Starting offset (default 0)
     */
    every(n: number, offset = 0): this {
        this._selectedIndices = this._placements
            .filter((_, i) => (i - offset) % n === 0)
            .map(p => p.index);
        return this;
    }

    /**
     * Select a range of placements.
     * @param start - Start index (inclusive)
     * @param end - End index (exclusive)
     */
    slice(start: number, end?: number): this {
        const sliced = this._placements.slice(start, end);
        this._selectedIndices = sliced.map(p => p.index);
        return this;
    }

    /**
     * Select placements at specific indices.
     */
    at(...indices: number[]): this {
        this._selectedIndices = indices.filter(i => i >= 0 && i < this._placements.length);
        return this;
    }

    /**
     * Clear selection (select all).
     */
    all(): this {
        this._selectedIndices = [];
        return this;
    }

    /**
     * Assign a block template to selected placements.
     * Use full names ('friendshipStar') or shortcuts ('FS').
     * 
     * @param blockName - Block template name or shortcut
     * @returns The parent QuiltSystem for further chaining
     */
    placeBlock(blockName: string): QuiltSystem {
        // Validate block name
        resolveBlockName(blockName);

        const targets = this._selectedIndices.length > 0
            ? this._selectedIndices
            : this._placements.map(p => p.index);

        for (const idx of targets) {
            this._placements[idx].blockName = blockName;
        }

        this._selectedIndices = [];  // Clear selection
        return this._system;
    }
}

// =============================================================================
// Block Name Shortcuts
// =============================================================================

/**
 * Two-character shortcuts for block names.
 * Use full names or shortcuts interchangeably.
 */
export const blockShortcuts: Record<string, string> = {
    // Full names map to themselves
    pinwheel: 'pinwheel',
    brokenDishes: 'brokenDishes',
    friendshipStar: 'friendshipStar',
    shooFly: 'shooFly',
    bowTie: 'bowTie',
    dutchmansPuzzle: 'dutchmansPuzzle',
    sawtoothStar: 'sawtoothStar',

    // Two-character shortcuts
    PW: 'pinwheel',
    BD: 'brokenDishes',
    FS: 'friendshipStar',
    SF: 'shooFly',
    BT: 'bowTie',
    DP: 'dutchmansPuzzle',
    SS: 'sawtoothStar',
};

/**
 * Resolve a block name (full name or shortcut) to a template.
 */
function resolveBlockName(name: string): QuiltBlockTemplate {
    const resolved = blockShortcuts[name] || name;
    const template = quiltBlockTemplates[resolved];
    if (!template) {
        const available = Object.keys(blockShortcuts).join(', ');
        throw new Error(`Unknown block: "${name}". Available: ${available}`);
    }
    return template;
}

// =============================================================================
// Interfaces
// =============================================================================

export interface QuiltBlockPlacement {
    x: number;
    y: number;
    row: number;
    col: number;
    index: number;
    blockName?: string;
}

export interface QuiltOptions {
    gridSize: [number, number];  // [cols, rows]
    blockSize: number;
    defaultBlock?: string;       // Default block template (default: 'pinwheel')
}

// =============================================================================
// QuiltSystem
// =============================================================================

/**
 * QuiltSystem - Creates a grid of quilt block placements with selection support.
 * 
 * Use .pattern to access block selection and placement methods.
 * 
 * @example
 * ```typescript
 * const quilt = system.quilt({ gridSize: [4, 4], blockSize: 100 });
 * 
 * // Alternate between two patterns
 * quilt.pattern.every(2).placeBlock('BD');        // BrokenDishes on even positions
 * quilt.pattern.every(2, 1).placeBlock('FS');     // FriendshipStar on odd positions
 * 
 * quilt.trace();
 * quilt.stamp(svg);
 * ```
 */
export class QuiltSystem extends BaseSystem {
    private _quiltPlacements: QuiltBlockPlacement[] = [];
    private _blockSize: number;
    private _defaultBlock: string;
    private _cols: number;
    private _rows: number;

    constructor(options: QuiltOptions) {
        super();
        const { gridSize, blockSize, defaultBlock = 'pinwheel' } = options;

        this._cols = gridSize[0];
        this._rows = gridSize[1];
        this._blockSize = blockSize;
        this._defaultBlock = defaultBlock;

        // Build placements grid
        let index = 0;
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                this._quiltPlacements.push({
                    x: col * blockSize,
                    y: row * blockSize,
                    row,
                    col,
                    index,
                    blockName: undefined
                });
                index++;
            }
        }
    }

    // =========================================================================
    // Pattern Context Access
    // =========================================================================

    /**
     * Access pattern selection and block placement methods.
     * Returns a QuiltPatternContext for selecting placements and assigning blocks.
     */
    get pattern(): QuiltPatternContext {
        return new QuiltPatternContext(this, this._quiltPlacements);
    }

    /**
     * Get all generated quilt block shapes.
     * Overrides BaseSystem to return quilt blocks instead of placements.
     */
    get shapes(): ShapesContext {
        const blockShapes = this.getSourceForSelection();
        const allShapes = [...blockShapes, ...this._placements.map(p => p.shape)];
        return new ShapesContext(allShapes);
    }

    /**
     * Get the number of quilt block placements (not individual shapes).
     * Overrides BaseSystem to return placement count instead of shape count.
     */
    get length(): number {
        return this._quiltPlacements.length;
    }

    // Inherited place() method from BaseSystem works for custom shapes

    // =========================================================================
    // Build Shapes
    // =========================================================================

    /**
     * Build shapes for a single quilt block.
     */
    private _buildBlock(template: QuiltBlockTemplate, x: number, y: number): Shape[] {
        const shapes: Shape[] = [];
        const cellSize = this._blockSize / template.grid;

        for (let row = 0; row < template.grid; row++) {
            for (let col = 0; col < template.grid; col++) {
                const cellX = x + col * cellSize;
                const cellY = y + row * cellSize;
                const cell = template.cells[row][col];

                switch (cell.type) {
                    case 'square':
                        shapes.push(this._createSquare(cellX, cellY, cellSize, cell.group));
                        break;
                    case 'hst':
                        shapes.push(...this._createHST(cellX, cellY, cellSize, cell.rotation));
                        break;
                    case 'flyingGeese':
                        shapes.push(...this._createFlyingGeese(cellX, cellY, cellSize, cell.rotation));
                        break;
                }
            }
        }

        return shapes;
    }

    private _createSquare(x: number, y: number, size: number, group: 'light' | 'dark'): Shape {
        const square = Shape.fromPoints([
            new Vector2(x, y),
            new Vector2(x + size, y),
            new Vector2(x + size, y + size),
            new Vector2(x, y + size)
        ]);
        square.group = group;
        return square;
    }

    private _createHST(x: number, y: number, size: number, rotation: BlockRotation): Shape[] {
        const shapes: Shape[] = [];
        const tl = new Vector2(x, y);
        const tr = new Vector2(x + size, y);
        const bl = new Vector2(x, y + size);
        const br = new Vector2(x + size, y + size);

        let darkPoints: Vector2[];
        let lightPoints: Vector2[];

        switch (rotation) {
            case 0:
                darkPoints = [tl, tr, bl];
                lightPoints = [tr, br, bl];
                break;
            case 90:
                darkPoints = [tl, tr, br];
                lightPoints = [tl, br, bl];
                break;
            case 180:
                darkPoints = [tr, br, bl];
                lightPoints = [tl, tr, bl];
                break;
            case 270:
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

    private _createFlyingGeese(x: number, y: number, size: number, rotation: BlockRotation): Shape[] {
        const shapes: Shape[] = [];
        const half = size / 2;

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
            case 0: // Pointing right
                goosePoints = [tl, rm, bl];
                sky1Points = [tl, tr, rm];
                sky2Points = [rm, br, bl];
                break;
            case 90: // Pointing down
                goosePoints = [tl, tr, bm];
                sky1Points = [tl, bm, bl];
                sky2Points = [tr, br, bm];
                break;
            case 180: // Pointing left
                goosePoints = [lm, tr, br];
                sky1Points = [tl, tr, lm];
                sky2Points = [lm, br, bl];
                break;
            case 270: // Pointing up
                goosePoints = [tm, bl, br];
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

    // =========================================================================
    // BaseSystem Implementation
    // =========================================================================

    protected getNodes(): Vertex[] {
        return this._quiltPlacements.map(p => 
            new Vertex(p.x + this._blockSize / 2, p.y + this._blockSize / 2)
        );
    }

    protected filterByMask(shape: Shape): void {
        this._quiltPlacements = this._quiltPlacements.filter(p => {
            const centerX = p.x + this._blockSize / 2;
            const centerY = p.y + this._blockSize / 2;
            return shape.containsPoint(new Vector2(centerX, centerY));
        });
        // Re-index
        this._quiltPlacements.forEach((p, i) => p.index = i);
    }

    protected scaleGeometry(factor: number): void {
        // Scale block positions and sizes
        this._blockSize *= factor;
        this._quiltPlacements.forEach(p => {
            p.x *= factor;
            p.y *= factor;
        });
    }

    protected rotateGeometry(angleRad: number): void {
        const center = this._getCenter();
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        
        this._quiltPlacements.forEach(p => {
            const relX = p.x - center.x;
            const relY = p.y - center.y;
            p.x = center.x + (relX * cos - relY * sin);
            p.y = center.y + (relX * sin + relY * cos);
        });
    }

    protected stampGeometry(collector: SVGCollector, style?: PathStyle): void {
        if (!this._traced) return;
        
        collector.beginGroup('quilt-blocks');
        for (const placement of this._quiltPlacements) {
            const blockName = placement.blockName ?? this._defaultBlock;
            const template = resolveBlockName(blockName);
            const shapes = this._buildBlock(template, placement.x, placement.y);
            
            for (const shape of shapes) {
                const color = shape.group === 'dark' ? style?.fill ?? DEFAULT_STYLES.shape.fill : '#ecf0f1';
                collector.addShape(shape, { ...style, fill: color });
            }
        }
        collector.endGroup();
    }

    protected getGeometryRenderGroups(): RenderGroup[] {
        if (!this._traced) return [];

        const items: GroupItem[] = [];
        
        for (const placement of this._quiltPlacements) {
            const blockName = placement.blockName ?? this._defaultBlock;
            const template = resolveBlockName(blockName);
            const shapes = this._buildBlock(template, placement.x, placement.y);
            items.push(...shapes.map(shape => ({ shape })));
        }
        
        return [{
            name: 'quilt-blocks',
            items,
            defaultStyle: DEFAULT_STYLES.shape
        }];
    }

    protected getGeometryBounds(): SystemBounds {
        if (this._quiltPlacements.length === 0) {
            return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const p of this._quiltPlacements) {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x + this._blockSize);
            maxY = Math.max(maxY, p.y + this._blockSize);
        }

        return { minX, minY, maxX, maxY };
    }

    protected getSourceForSelection(): Shape[] {
        // Generate all block shapes for selection
        const shapes: Shape[] = [];
        for (const placement of this._quiltPlacements) {
            const blockName = placement.blockName ?? this._defaultBlock;
            const template = resolveBlockName(blockName);
            shapes.push(...this._buildBlock(template, placement.x, placement.y));
        }
        return shapes;
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================

    private _getCenter(): Vector2 {
        const bounds = this.getBounds();
        return new Vector2(
            bounds.minX + (bounds.maxX - bounds.minX) / 2,
            bounds.minY + (bounds.maxY - bounds.minY) / 2
        );
    }
}
