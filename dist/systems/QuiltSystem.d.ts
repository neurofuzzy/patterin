import { Shape, Vertex } from '../primitives';
import { ShapeContext } from '../contexts/ShapeContext';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector';
import { SystemBounds } from '../types';
import { BaseSystem, type RenderGroup } from './BaseSystem';
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
 * Use every(), slice(), and at() to select placements, then placeBlock() to assign
 * different templates to different positions.
 *
 * @example
 * ```typescript
 * const quilt = system.quilt({ gridSize: [4, 4], blockSize: 100 });
 *
 * // Alternate between two patterns
 * quilt.every(2).placeBlock('BD');        // BrokenDishes on even positions
 * quilt.every(2, 1).placeBlock('FS');     // FriendshipStar on odd positions
 *
 * quilt.stamp(svg);
 * ```
 */
export declare class QuiltSystem extends BaseSystem {
    private _quiltPlacements;
    private _selectedIndices;
    private _blockSize;
    private _defaultBlock;
    private _cols;
    private _rows;
    constructor(options: QuiltOptions);
    /**
     * Select every nth placement.
     * Overrides BaseSystem to return this for placeBlock() chaining.
     * @param n - Select every nth placement
     * @param offset - Starting offset (default 0)
     */
    every(n: number, offset?: number): this;
    /**
     * Select a range of placements.
     * Overrides BaseSystem to return this for placeBlock() chaining.
     * @param start - Start index (inclusive)
     * @param end - End index (exclusive)
     */
    slice(start: number, end?: number): this;
    /**
     * Select placements at specific indices.
     * Note: BaseSystem does not have an at() method, this is quilt-specific.
     */
    at(...indices: number[]): this;
    /**
     * Clear selection (select all).
     * Quilt-specific method for clearing selection.
     */
    all(): this;
    /**
     * Assign a block template to selected placements.
     * Use full names ('friendshipStar') or shortcuts ('FS').
     *
     * @param blockName - Block template name or shortcut
     */
    placeBlock(blockName: string): this;
    /**
     * Place a shape at each selected placement (inherited from BaseSystem).
     * This places a custom shape instead of a block template.
     */
    place(shapeCtx: ShapeContext, style?: PathStyle): this;
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
