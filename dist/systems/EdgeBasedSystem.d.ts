/**
 * EdgeBasedSystem - Abstract base class for systems that manage nodes and edges.
 * Provides common implementations for node/edge operations like scaling, rotation,
 * filtering, and rendering.
 */
import { BaseSystem, type RenderGroup } from './BaseSystem';
import { Shape, Segment, Vector2 } from '../primitives';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector';
import type { SystemBounds } from '../types';
/**
 * Abstract base class for edge-based systems (GridSystem, TessellationSystem).
 * Consolidates common node and edge geometry management.
 */
export declare abstract class EdgeBasedSystem extends BaseSystem {
    protected _nodes: Vector2[];
    protected _edges: Segment[];
    /**
     * Get the group name for traced edges (e.g., 'grid-edges', 'tessellation-edges').
     * Subclasses must implement this to provide their specific group name.
     */
    protected abstract getEdgeGroupName(): string;
    protected filterByMask(shape: Shape): void;
    protected scaleGeometry(factor: number): void;
    protected rotateGeometry(angleRad: number): void;
    protected stampGeometry(collector: SVGCollector, style?: PathStyle): void;
    protected getGeometryRenderGroups(): RenderGroup[];
    protected getGeometryBounds(): SystemBounds;
    protected getSourceForSelection(): Shape[];
}
