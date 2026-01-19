import { BoundingBox, Shape, Segment, Vector2, Vertex } from '../primitives';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector';
import { ShapeContext, PointsContext, LinesContext, ShapesContext } from '../contexts/ShapeContext';
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
export class ShapeSystem extends BaseSystem {
    private _nodes: Vertex[] = [];
    private _edges: Segment[] = [];
    private _centerNode: Vertex | null = null;
    private _sourceShape: Shape;

    constructor(source: ShapeContext | Shape, options: ShapeSystemOptions = {}) {
        super();
        // Extract the Shape from ShapeContext if needed
        // Mark the original source as ephemeral since it's now construction geometry
        if (source instanceof ShapeContext) {
            source.shape.ephemeral = true;  // Original becomes construction geometry
            this._sourceShape = source.shape.clone();
        } else {
            source.ephemeral = true;  // Original becomes construction geometry
            this._sourceShape = source.clone();
        }

        this._sourceShape.ephemeral = true;

        const { includeCenter = false, subdivide } = options;

        // Convert vertices to nodes
        if (subdivide && subdivide > 1) {
            // Subdivide edges and create nodes at division points
            for (const seg of this._sourceShape.segments) {
                this._nodes.push(new Vertex(seg.start.x, seg.start.y));

                // Add subdivision points
                for (let i = 1; i < subdivide; i++) {
                    const t = i / subdivide;
                    const point = seg.start.position.lerp(seg.end.position, t);
                    this._nodes.push(new Vertex(point.x, point.y));
                }
            }
        } else {
            // Just use the original vertices
            for (const v of this._sourceShape.vertices) {
                this._nodes.push(new Vertex(v.x, v.y));
            }
        }

        // Add center node if requested
        if (includeCenter) {
            const center = this._sourceShape.centroid();
            this._centerNode = new Vertex(center.x, center.y);
        }

        // Create edges from nodes
        this.buildEdges(subdivide);
    }

    private buildEdges(subdivide?: number): void {
        // Create edge segments connecting consecutive nodes
        const n = this._nodes.length;
        if (n < 2) return;

        for (let i = 0; i < n; i++) {
            const start = this._nodes[i];
            const end = this._nodes[(i + 1) % n];
            this._edges.push(new Segment(start, end));
        }
    }

    /**
     * Static factory method
     */
    static create(source: ShapeContext | Shape, options: ShapeSystemOptions = {}): ShapeSystem {
        return new ShapeSystem(source, options);
    }

    /**
     * Make structure concrete (renderable)
     */
    trace(): this {
        this._traced = true;
        this._sourceShape.ephemeral = false;
        return this;
    }

    /**
     * Get all nodes as PointsContext
     */
    get nodes(): ShapePointsContext {
        // Include center node if present
        const allNodes = this._centerNode
            ? [...this._nodes, this._centerNode]
            : [...this._nodes];
        return new ShapePointsContext(this, allNodes);
    }

    /**
     * Get all edges as LinesContext
     */
    get edges(): LinesContext {
        return new LinesContext(this._sourceShape, [...this._edges]);
    }

    /**
     * Get center point (if includeCenter was true)
     */
    get center(): PointContext | null {
        if (!this._centerNode) return null;
        return new PointContext(this._centerNode.position, this._sourceShape);
    }

    /**
     * Get bounding box
     */
    bbox(): BoundingBox {
        return this._sourceShape.boundingBox();
    }

    /**
     * Add a placement
     */
    addPlacement(position: Vector2, shape: Shape, style?: PathStyle): void {
        this._placements.push({ position, shape, style });
    }

    // ==================== BaseSystem Implementation ====================

    protected getNodes(): Vertex[] {
        // Include center node if present
        return this._centerNode
            ? [...this._nodes, this._centerNode]
            : [...this._nodes];
    }

    protected filterByMask(shape: Shape): void {
        // Filter nodes to those inside the mask
        this._nodes = this._nodes.filter(node =>
            shape.containsPoint(node.position)
        );

        // Filter center node if outside mask
        if (this._centerNode && !shape.containsPoint(this._centerNode.position)) {
            this._centerNode = null;
        }

        // Filter edges - for now, filter by midpoint being inside
        // TODO: Clip edges at mask boundary for partial edges
        this._edges = this._edges.filter(edge =>
            shape.containsPoint(edge.midpoint())
        );
    }

    protected scaleGeometry(factor: number): void {
        this._sourceShape.scale(factor);
    }

    protected rotateGeometry(angleRad: number): void {
        this._sourceShape.rotate(angleRad);
    }

    protected stampGeometry(collector: SVGCollector, style?: PathStyle): void {
        const shapeStyle = style ?? DEFAULT_STYLES.connection;

        // Add traced source shape in its own group
        if (this._traced && !this._sourceShape.ephemeral) {
            collector.beginGroup('shape');
            collector.addShape(this._sourceShape, shapeStyle);
            collector.endGroup();
        }
    }

    protected getGeometryRenderGroups(): RenderGroup[] {
        const shapeItems: { shape: Shape; style?: PathStyle }[] = [];
        if (this._traced && !this._sourceShape.ephemeral) {
            shapeItems.push({ shape: this._sourceShape });
        }

        return [
            {
                name: 'shape',
                items: shapeItems,
                defaultStyle: DEFAULT_STYLES.connection
            }
        ];
    }

    protected getGeometryBounds(): SystemBounds {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const node of this._nodes) {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x);
            maxY = Math.max(maxY, node.y);
        }

        if (this._centerNode) {
            minX = Math.min(minX, this._centerNode.x);
            minY = Math.min(minY, this._centerNode.y);
            maxX = Math.max(maxX, this._centerNode.x);
            maxY = Math.max(maxY, this._centerNode.y);
        }

        return { minX, minY, maxX, maxY };
    }

    protected getSourceForSelection(): Shape[] {
        // For ShapeSystem, when no placements exist, we don't have a fallback
        // Return empty array
        return [];
    }

}

/**
 * ShapeSystem-specific PointsContext with place() support.
 */
class ShapePointsContext extends PointsContext {
    constructor(
        private _system: ShapeSystem,
        vertices: Vertex[]
    ) {
        super(Shape.regularPolygon(3, 1), vertices);
    }

    /** Place a shape at each selected node */
    place(shapeCtx: ShapeContext, style?: PathStyle): this {
        for (const v of this._items) {
            const clone = shapeCtx.shape.clone();
            clone.moveTo(v.position);
            this._system.addPlacement(v.position, clone, style);
        }
        return this;
    }

    /** Select every nth node */
    every(n: number, offset = 0): ShapePointsContext {
        const selected: Vertex[] = [];
        for (let i = offset; i < this._items.length; i += n) {
            selected.push(this._items[i]);
        }
        return new ShapePointsContext(this._system, selected);
    }

    /** Select nodes at specific indices */
    at(...indices: number[]): ShapePointsContext {
        const selected: Vertex[] = [];
        for (const i of indices) {
            if (i >= 0 && i < this._items.length) {
                selected.push(this._items[i]);
            }
        }
        return new ShapePointsContext(this._system, selected);
    }
}
