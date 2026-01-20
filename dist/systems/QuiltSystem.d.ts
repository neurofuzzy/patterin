import { Shape, Vertex } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector';
import { SystemBounds } from '../types';
import { BaseSystem, type RenderGroup } from './BaseSystem';
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
export declare class QuiltPatternContext {
    private _system;
    private _placements;
    private _selectedIndices;
    constructor(system: QuiltSystem, placements: QuiltBlockPlacement[]);
    /**
     * Select every nth placement.
     * @param n - Select every nth placement
     * @param offset - Starting offset (default 0)
     */
    every(n: number, offset?: number): this;
    /**
     * Select a range of placements.
     * @param start - Start index (inclusive)
     * @param end - End index (exclusive)
     */
    slice(start: number, end?: number): this;
    /**
     * Select placements at specific indices.
     */
    at(...indices: number[]): this;
    /**
     * Clear selection (select all).
     */
    all(): this;
    /**
     * Assign a block template to selected placements.
     * Use full names ('friendshipStar') or shortcuts ('FS').
     *
     * @param blockName - Block template name or shortcut
     * @returns The parent QuiltSystem for further chaining
     */
    placeBlock(blockName: string): QuiltSystem;
}
/**
 * Two-character shortcuts for block names.
 * Use full names or shortcuts interchangeably.
 */
export declare const blockShortcuts: Record<string, string>;
export interface QuiltBlockPlacement {
    x: number;
    y: number;
    row: number;
    col: number;
    index: number;
    blockName?: string;
}
export interface QuiltOptions {
    gridSize: [number, number];
    blockSize: number;
    defaultBlock?: string;
}
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
export declare class QuiltSystem extends BaseSystem {
    private _quiltPlacements;
    private _blockSize;
    private _defaultBlock;
    private _cols;
    private _rows;
    constructor(options: QuiltOptions);
    /**
     * Access pattern selection and block placement methods.
     * Returns a QuiltPatternContext for selecting placements and assigning blocks.
     */
    get pattern(): QuiltPatternContext;
    /**
     * Get all generated quilt block shapes.
     * Overrides BaseSystem to return quilt blocks instead of placements.
     */
    get shapes(): ShapesContext;
    /**
     * Get the number of quilt block placements (not individual shapes).
     * Overrides BaseSystem to return placement count instead of shape count.
     */
    get length(): number;
    /**
     * Build shapes for a single quilt block.
     */
    private _buildBlock;
    private _createSquare;
    private _createHST;
    private _createFlyingGeese;
    protected getNodes(): Vertex[];
    protected filterByMask(shape: Shape): void;
    protected scaleGeometry(factor: number): void;
    protected rotateGeometry(angleRad: number): void;
    protected stampGeometry(collector: SVGCollector, style?: PathStyle): void;
    protected getGeometryRenderGroups(): RenderGroup[];
    protected getGeometryBounds(): SystemBounds;
    protected getSourceForSelection(): Shape[];
    private _getCenter;
}
