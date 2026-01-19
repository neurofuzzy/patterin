/**
 * BaseSystem - Abstract base class for all coordinate systems.
 * Consolidates common placement, selection, transform, and rendering logic.
 */
import { DEFAULT_STYLES } from '../collectors/SVGCollector';
import { ShapesContext } from '../contexts';
import { renderSystemToSVG } from './SystemUtils';
/**
 * Abstract base class implementing common ISystem functionality.
 * Subclasses must implement system-specific geometry management.
 */
export class BaseSystem {
    constructor() {
        // ==================== Common State ====================
        this._placements = [];
        this._traced = false;
    }
    // ==================== Core ISystem Methods ====================
    /**
     * Place a shape at each node in the system.
     * Marks the source shape as ephemeral (construction geometry).
     */
    place(shapeCtx, style) {
        const nodes = this.getNodes();
        for (const node of nodes) {
            const clone = shapeCtx.shape.clone();
            clone.ephemeral = false; // Clones are concrete
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
    mask(maskShape) {
        // Mark mask as ephemeral (construction geometry)
        maskShape.shape.ephemeral = true;
        const shape = maskShape.shape;
        // Filter placements to those inside the mask
        this._placements = this._placements.filter(p => shape.containsPoint(p.position));
        // Let subclass filter its specific geometry
        this.filterByMask(shape);
        return this;
    }
    /**
     * Return all placement shapes in the system.
     */
    get shapes() {
        const shapes = this._placements.map((p) => p.shape.clone());
        return new ShapesContext(shapes);
    }
    /**
     * Number of shapes in the system.
     * Returns placement count if present, otherwise system-specific count.
     */
    get length() {
        return this._placements.length > 0
            ? this._placements.length
            : this.getSourceForSelection().length;
    }
    // ==================== Selection ====================
    /**
     * Select every nth shape for modification.
     * Operates on placements if present, otherwise system-specific shapes.
     */
    every(n, offset = 0) {
        const source = this._placements.length > 0
            ? this._placements.map(p => p.shape)
            : this.getSourceForSelection();
        const selected = [];
        for (let i = offset; i < source.length; i += n) {
            selected.push(source[i]);
        }
        return new ShapesContext(selected);
    }
    /**
     * Select a range of shapes for modification.
     * Operates on placements if present, otherwise system-specific shapes.
     */
    slice(start, end) {
        const source = this._placements.length > 0
            ? this._placements.map(p => p.shape)
            : this.getSourceForSelection();
        return new ShapesContext(source.slice(start, end));
    }
    // ==================== Transform ====================
    /**
     * Scale all shapes uniformly.
     */
    scale(factor) {
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
    rotate(angleDeg) {
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
    getBounds() {
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
    trace() {
        this._traced = true;
        return this;
    }
    /**
     * Render the system to a collector.
     */
    stamp(collector, style) {
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
    toSVG(options) {
        const { width, height, margin = 10 } = options;
        // Get system-specific geometry groups
        const geometryGroups = this.getGeometryRenderGroups();
        // Add placement group
        const placementItems = this._placements.map(p => ({
            shape: p.shape,
            style: p.style
        }));
        const allGroups = [
            ...geometryGroups,
            {
                name: 'placements',
                items: placementItems,
                defaultStyle: DEFAULT_STYLES.placement
            }
        ];
        return renderSystemToSVG(width, height, margin, allGroups);
    }
    // ==================== Helper Methods ====================
    /**
     * Helper: Filter array of edges by midpoint containment.
     * Useful for subclasses that need to filter edges during masking.
     */
    filterEdgesByMask(edges, mask) {
        return edges.filter(edge => mask.containsPoint(edge.midpoint()));
    }
    /**
     * Helper: Compute bounds from array of positions.
     * Useful for subclasses that compute bounds from node positions.
     */
    boundsFromPositions(positions) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for (const pos of positions) {
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x);
            maxY = Math.max(maxY, pos.y);
        }
        return { minX, minY, maxX, maxY };
    }
}
