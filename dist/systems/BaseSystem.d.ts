/**
 * BaseSystem - Abstract base class for all coordinate systems.
 * Consolidates common placement, selection, transform, and rendering logic.
 */
import type { ISystem } from '../interfaces';
import { Shape, Vector2, Vertex, Segment } from '../primitives';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector';
import { ShapeContext, ShapesContext } from '../contexts';
import type { SystemBounds, SVGOptions } from '../types';
/**
 * Placement information for shapes placed at system nodes.
 */
export interface Placement {
    position: Vector2;
    shape: Shape;
    style?: PathStyle;
}
/**
 * Group item for rendering.
 */
export interface GroupItem {
    shape: Shape;
    style?: PathStyle;
}
/**
 * Rendering group for toSVG method.
 */
export interface RenderGroup {
    name: string;
    items: GroupItem[];
    defaultStyle: PathStyle;
}
/**
 * Abstract base class implementing common ISystem functionality.
 * Subclasses must implement system-specific geometry management.
 */
export declare abstract class BaseSystem implements ISystem {
    protected _placements: Placement[];
    protected _traced: boolean;
    /**
     * Get all nodes in the system for placement operations.
     * @returns Array of vertices representing node positions
     */
    protected abstract getNodes(): Vertex[];
    /**
     * Filter system geometry by mask shape.
     * Called by mask() after marking mask as ephemeral.
     * @param shape - Mask shape to filter against
     */
    protected abstract filterByMask(shape: Shape): void;
    /**
     * Scale system-specific geometry (shapes + connections, not placements).
     * Called by scale() after scaling placements.
     * @param factor - Scale factor
     */
    protected abstract scaleGeometry(factor: number): void;
    /**
     * Rotate system-specific geometry (shapes + connections, not placements).
     * Called by rotate() after rotating placements.
     * @param angleRad - Rotation angle in radians
     */
    protected abstract rotateGeometry(angleRad: number): void;
    /**
     * Stamp system-specific geometry (shapes + connections) to collector.
     * Called by stamp() after stamping placements.
     * @param collector - SVGCollector to receive shapes
     * @param style - Optional style override
     */
    protected abstract stampGeometry(collector: SVGCollector, style?: PathStyle): void;
    /**
     * Get render groups for toSVG method.
     * Should return geometry-specific groups (shapes + connections).
     * @returns Array of render groups
     */
    protected abstract getGeometryRenderGroups(): RenderGroup[];
    /**
     * Get bounding box of system-specific geometry (shapes + connections, not placements).
     * Called by getBounds() to combine with placement bounds.
     * @returns Bounding box
     */
    protected abstract getGeometryBounds(): SystemBounds;
    /**
     * Get source shapes for selection operations when no placements exist.
     * Used by every() and slice() to determine fallback source.
     * @returns Array of shapes to select from
     */
    protected abstract getSourceForSelection(): Shape[];
    /**
     * Place a shape at each node in the system.
     * Marks the source shape as ephemeral (construction geometry).
     */
    place(shapeCtx: ShapeContext, style?: PathStyle): this;
    /**
     * Clip system to mask shape boundary.
     * Points outside the mask are removed.
     */
    mask(maskShape: ShapeContext): this;
    /**
     * Return all placement shapes in the system.
     */
    get shapes(): ShapesContext;
    /**
     * Number of shapes in the system.
     * Returns placement count if present, otherwise system-specific count.
     */
    get length(): number;
    /**
     * Select every nth shape for modification.
     * Operates on placements if present, otherwise system-specific shapes.
     */
    every(n: number, offset?: number): ShapesContext;
    /**
     * Select a range of shapes for modification.
     * Operates on placements if present, otherwise system-specific shapes.
     */
    slice(start: number, end?: number): ShapesContext;
    /**
     * Scale all shapes uniformly.
     */
    scale(factor: number): this;
    /**
     * Rotate all shapes by angle.
     */
    rotate(angleDeg: number): this;
    /**
     * Get bounding box of all geometry (shapes + connections + placements).
     */
    getBounds(): SystemBounds;
    /**
     * Make the object concrete (renderable).
     */
    trace(): this;
    /**
     * Render the system to a collector.
     */
    stamp(collector: SVGCollector, style?: PathStyle): void;
    /**
     * Generate SVG output.
     */
    toSVG(options: SVGOptions): string;
    /**
     * Helper: Filter array of edges by midpoint containment.
     * Useful for subclasses that need to filter edges during masking.
     */
    protected filterEdgesByMask(edges: Segment[], mask: Shape): Segment[];
    /**
     * Helper: Compute bounds from array of positions.
     * Useful for subclasses that compute bounds from node positions.
     */
    protected boundsFromPositions(positions: {
        x: number;
        y: number;
    }[]): SystemBounds;
}
