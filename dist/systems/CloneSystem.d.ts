/**
 * CloneSystem - Creates clones of shapes with offset positioning.
 * Supports nesting for grid patterns.
 */
import { Shape, Segment, Vertex } from '../primitives';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector';
import { ShapesContext } from '../contexts';
import { BaseSystem, type RenderGroup } from './BaseSystem';
import type { SystemBounds } from '../types';
export interface CloneOptions {
    count: number;
    offsetX: number;
    offsetY: number;
}
/**
 * CloneSystem implements ISystem for clone/spread operations.
 *
 * Source can be either:
 * - A Shape (from ShapeContext.clone())
 * - Another CloneSystem (for nested clones)
 *
 * When trace() is called, it computes node positions and path segments connecting them.
 */
export declare class CloneSystem extends BaseSystem {
    private _source;
    private _options;
    private _ephemeral;
    private _shapes;
    private _nodes;
    private _segments;
    constructor(source: Shape | CloneSystem, options: CloneOptions);
    /**
     * Create a CloneSystem from a shape.
     */
    static fromShape(shape: Shape, count: number, offsetX?: number, offsetY?: number): CloneSystem;
    /**
     * Compute all shapes, nodes, and connection segments.
     */
    private _computeGeometry;
    /**
     * Build path segments connecting nodes in order.
     */
    private _buildPathSegments;
    /**
     * Get number of shapes.
     */
    get length(): number;
    /**
     * Get nodes (centers of shapes) as vertices array.
     */
    get nodes(): Vertex[];
    /**
     * Get path segments connecting nodes.
     */
    get pathSegments(): Segment[];
    get shapes(): ShapesContext;
    /**
     * Make the system concrete (renderable).
     */
    trace(): this;
    /**
     * Clone this system n times with offset.
     * Returns a new nested CloneSystem.
     * Marks this system as ephemeral (won't render separately).
     */
    clone(n: number, x?: number, y?: number): CloneSystem;
    /**
     * Spread shapes with linear offset between each.
     * @param x - Horizontal offset between each shape
     * @param y - Vertical offset between each shape
     * @returns This CloneSystem (modified in place)
     */
    spread(x: number, y: number): this;
    /**
     * Select every nth shape for modification.
     * Returns a ShapesContext with selected shapes - modifications apply to them.
     * Non-selected shapes remain unchanged and are still rendered.
     * @returns ShapesContext with selected shapes
     */
    every(n: number, offset?: number): ShapesContext;
    /**
     * Select a range of shapes for modification.
     * @returns ShapesContext with selected shapes
     */
    slice(start: number, end?: number): ShapesContext;
    /**
     * Distribute shapes radially around a circle.
     * @param radius - Distance from origin
     * @param arc - Optional angle range: undefined = 360°, number = 0 to angle, [start, end] = range
     * @returns This CloneSystem (modified in place)
     */
    spreadPolar(radius: number, arc?: number | [number, number]): this;
    protected getNodes(): Vertex[];
    protected filterByMask(shape: Shape): void;
    protected scaleGeometry(factor: number): void;
    protected rotateGeometry(angleRad: number): void;
    protected stampGeometry(collector: SVGCollector, style?: PathStyle): void;
    protected getGeometryRenderGroups(): RenderGroup[];
    protected getGeometryBounds(): SystemBounds;
    protected getSourceForSelection(): Shape[];
}
