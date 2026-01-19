/**
 * BaseSystem - Abstract base class for all coordinate systems.
 * Consolidates common placement, selection, transform, and rendering logic.
 */

import type { ISystem } from '../interfaces';
import { Shape, Vector2, Vertex } from '../primitives';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector';
import { ShapeContext, ShapesContext } from '../contexts';
import { renderSystemToSVG } from './SystemUtils';
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
export abstract class BaseSystem implements ISystem {
    // ==================== Common State ====================

    protected _placements: Placement[] = [];
    protected _traced = false;

    // ==================== Abstract Methods ====================

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

    // ==================== Core ISystem Methods ====================

    /**
     * Place a shape at each node in the system.
     * Marks the source shape as ephemeral (construction geometry).
     */
    place(shapeCtx: ShapeContext, style?: PathStyle): this {
        const nodes = this.getNodes();
        
        for (const node of nodes) {
            const clone = shapeCtx.shape.clone();
            clone.ephemeral = false;  // Clones are concrete
            clone.moveTo(node.position);
            this._placements.push({ 
                position: node.position, 
                shape: clone, 
                style 
            });
        }

        // Mark source shape as ephemeral AFTER cloning (construction geometry)
        shapeCtx.shape.ephemeral = true;

        return this;
    }

    /**
     * Clip system to mask shape boundary.
     * Points outside the mask are removed.
     */
    mask(maskShape: ShapeContext): this {
        // Mark mask as ephemeral (construction geometry)
        maskShape.shape.ephemeral = true;

        const shape = maskShape.shape;

        // Filter placements to those inside the mask
        this._placements = this._placements.filter(p =>
            shape.containsPoint(p.position)
        );

        // Let subclass filter its specific geometry
        this.filterByMask(shape);

        return this;
    }

    /**
     * Return all placement shapes in the system.
     */
    get shapes(): ShapesContext {
        const shapes = this._placements.map((p) => p.shape.clone());
        return new ShapesContext(shapes);
    }

    /**
     * Number of shapes in the system.
     * Returns placement count if present, otherwise system-specific count.
     */
    get length(): number {
        return this._placements.length > 0 
            ? this._placements.length 
            : this.getSourceForSelection().length;
    }

    // ==================== Selection ====================

    /**
     * Select every nth shape for modification.
     * Operates on placements if present, otherwise system-specific shapes.
     */
    every(n: number, offset = 0): ShapesContext {
        const source = this._placements.length > 0
            ? this._placements.map(p => p.shape)
            : this.getSourceForSelection();

        const selected: Shape[] = [];
        for (let i = offset; i < source.length; i += n) {
            selected.push(source[i]);
        }
        return new ShapesContext(selected);
    }

    /**
     * Select a range of shapes for modification.
     * Operates on placements if present, otherwise system-specific shapes.
     */
    slice(start: number, end?: number): ShapesContext {
        const source = this._placements.length > 0
            ? this._placements.map(p => p.shape)
            : this.getSourceForSelection();

        return new ShapesContext(source.slice(start, end));
    }

    // ==================== Transform ====================

    /**
     * Scale all shapes uniformly.
     */
    scale(factor: number): this {
        // Scale placements
        for (const p of this._placements) {
            p.shape.scale(factor);
        }
        
        // Let subclass scale its geometry
        this.scaleGeometry(factor);
        
        return this;
    }

    /**
     * Rotate all shapes by angle.
     */
    rotate(angleDeg: number): this {
        const angleRad = angleDeg * Math.PI / 180;
        
        // Rotate placements
        for (const p of this._placements) {
            p.shape.rotate(angleRad);
        }
        
        // Let subclass rotate its geometry
        this.rotateGeometry(angleRad);
        
        return this;
    }

    // ==================== Info ====================

    /**
     * Get bounding box of all geometry (shapes + connections + placements).
     */
    getBounds(): SystemBounds {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        // Include system-specific geometry bounds (shapes + connections)
        const geomBounds = this.getGeometryBounds();
        minX = Math.min(minX, geomBounds.minX);
        minY = Math.min(minY, geomBounds.minY);
        maxX = Math.max(maxX, geomBounds.maxX);
        maxY = Math.max(maxY, geomBounds.maxY);

        // Include placement bounds
        for (const p of this._placements) {
            const bbox = p.shape.boundingBox();
            minX = Math.min(minX, bbox.min.x);
            minY = Math.min(minY, bbox.min.y);
            maxX = Math.max(maxX, bbox.max.x);
            maxY = Math.max(maxY, bbox.max.y);
        }

        return { minX, minY, maxX, maxY };
    }

    // ==================== Rendering ====================

    /**
     * Make the object concrete (renderable).
     */
    trace(): this {
        this._traced = true;
        return this;
    }

    /**
     * Render the system to a collector.
     */
    stamp(collector: SVGCollector, style?: PathStyle): void {
        const placementStyle = style ?? DEFAULT_STYLES.placement;

        // Stamp system-specific geometry
        this.stampGeometry(collector, style);

        // Stamp placements in their own group
        if (this._placements.length > 0) {
            collector.beginGroup('placements');
            for (const p of this._placements) {
                collector.addShape(p.shape, p.style ?? placementStyle);
            }
            collector.endGroup();
        }
    }

    /**
     * Generate SVG output.
     */
    toSVG(options: SVGOptions): string {
        const { width, height, margin = 10 } = options;

        // Get system-specific geometry groups
        const geometryGroups = this.getGeometryRenderGroups();

        // Add placement group
        const placementItems = this._placements.map(p => ({
            shape: p.shape,
            style: p.style
        }));

        const allGroups: RenderGroup[] = [
            ...geometryGroups,
            {
                name: 'placements',
                items: placementItems,
                defaultStyle: DEFAULT_STYLES.placement
            }
        ];

        return renderSystemToSVG(width, height, margin, allGroups);
    }
}
