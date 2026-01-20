import { BoundingBox, Shape, Vector2, Vertex } from '../primitives';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector';
import { ShapeContext, PointsContext, LinesContext } from '../contexts/ShapeContext';
import { PointContext } from '../contexts/PointContext';
import { BaseSystem, type RenderGroup } from './BaseSystem';
import type { SystemBounds } from '../types';
export interface ShapeSystemOptions {
    /** Include center point as a node */
    includeCenter?: boolean;
    /** Subdivide edges into n parts (creates additional nodes along edges) */
    subdivide?: number;
}
/**
 * ShapeSystem - Converts a shape into a node/edge graph structure.
 *
 * Treats shape vertices as nodes and segments as edges.
 * Useful for creating radial patterns, star scaffolds, etc.
 */
export declare class ShapeSystem extends BaseSystem {
    private _nodes;
    private _edges;
    private _centerNode;
    private _sourceShape;
    constructor(source: ShapeContext | Shape, options?: ShapeSystemOptions);
    private buildEdges;
    /**
     * Static factory method
     */
    static create(source: ShapeContext | Shape, options?: ShapeSystemOptions): ShapeSystem;
    /**
     * Make structure concrete (renderable)
     */
    trace(): this;
    /**
     * Get all nodes as PointsContext
     */
    get nodes(): ShapePointsContext;
    /**
     * Get all edges as LinesContext
     */
    get edges(): LinesContext;
    /**
     * Get center point (if includeCenter was true)
     */
    get center(): PointContext | null;
    /**
     * Get bounding box
     */
    bbox(): BoundingBox;
    /**
     * Add a placement
     */
    addPlacement(position: Vector2, shape: Shape, style?: PathStyle): void;
    protected getNodes(): Vertex[];
    protected filterByMask(shape: Shape): void;
    protected scaleGeometry(factor: number): void;
    protected rotateGeometry(angleRad: number): void;
    protected stampGeometry(collector: SVGCollector, style?: PathStyle): void;
    protected getGeometryRenderGroups(): RenderGroup[];
    protected getGeometryBounds(): SystemBounds;
    protected getSourceForSelection(): Shape[];
}
/**
 * ShapeSystem-specific PointsContext with place() support.
 */
declare class ShapePointsContext extends PointsContext {
    private _system;
    constructor(_system: ShapeSystem, vertices: Vertex[]);
    /** Place a shape at each selected node */
    place(shapeCtx: ShapeContext, style?: PathStyle): this;
    /** Select every nth node */
    every(n: number, offset?: number): ShapePointsContext;
    /** Select nodes at specific indices */
    at(...indices: number[]): ShapePointsContext;
}
export {};
