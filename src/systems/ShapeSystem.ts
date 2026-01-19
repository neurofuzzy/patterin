import { renderSystemToSVG } from './SystemUtils';
import { BoundingBox, Shape, Segment, Vector2, Vertex } from '../primitives';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector';
import { ShapeContext, PointsContext, LinesContext, ShapesContext } from '../contexts/ShapeContext';
import { PointContext } from '../contexts/PointContext';
import type { ISystem } from '../interfaces';

export interface ShapeSystemOptions {
    /** Include center point as a node */
    includeCenter?: boolean;
    /** Subdivide edges into n parts (creates additional nodes along edges) */
    subdivide?: number;
}

interface Placement {
    position: Vector2;
    shape: Shape;
    style?: PathStyle;
}

/**
 * ShapeSystem - Converts a shape into a node/edge graph structure.
 * 
 * Treats shape vertices as nodes and segments as edges.
 * Useful for creating radial patterns, star scaffolds, etc.
 */
export class ShapeSystem implements ISystem {
    private _nodes: Vertex[] = [];
    private _edges: Segment[] = [];
    private _centerNode: Vertex | null = null;
    private _sourceShape: Shape;
    private _placements: Placement[] = [];
    private _traced = false;

    constructor(source: ShapeContext | Shape, options: ShapeSystemOptions = {}) {
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

    /**
     * Place a shape at each node in the system
     */
    place(shapeCtx: ShapeContext, style?: PathStyle): this {
        // Include center node if present
        const allNodes = this._centerNode
            ? [...this._nodes, this._centerNode]
            : [...this._nodes];

        for (const node of allNodes) {
            const clone = shapeCtx.shape.clone();
            clone.ephemeral = false;  // Clones are concrete
            clone.moveTo(node.position);
            this._placements.push({ position: node.position, shape: clone, style });
        }

        // Mark source shape as ephemeral AFTER cloning (construction geometry)
        shapeCtx.shape.ephemeral = true;

        return this;
    }

    /**
     * Clip system to mask shape boundary
     */
    mask(maskShape: ShapeContext): this {
        // Mark mask as ephemeral (construction geometry)
        maskShape.shape.ephemeral = true;

        const shape = maskShape.shape;

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

        // Filter placements to those inside the mask
        this._placements = this._placements.filter(p =>
            shape.containsPoint(p.position)
        );

        return this;
    }

    get shapes(): ShapesContext {
        const shapes = this._placements.map((p) => p.shape.clone());
        return new ShapesContext(shapes);
    }

    /** Number of nodes/placements in the system */
    get length(): number {
        return this._placements.length > 0 ? this._placements.length : this._nodes.length;
    }

    // ==================== Selection ====================

    /**
     * Select every nth shape for modification.
     */
    every(n: number, offset = 0): ShapesContext {
        const source = this._placements.map(p => p.shape);

        const selected: Shape[] = [];
        for (let i = offset; i < source.length; i += n) {
            selected.push(source[i]);
        }
        return new ShapesContext(selected);
    }

    /**
     * Select a range of shapes for modification.
     */
    slice(start: number, end?: number): ShapesContext {
        const source = this._placements.map(p => p.shape);
        return new ShapesContext(source.slice(start, end));
    }

    // ==================== Transform ====================

    /**
     * Scale all shapes uniformly.
     */
    scale(factor: number): this {
        this._sourceShape.scale(factor);
        for (const p of this._placements) {
            p.shape.scale(factor);
        }
        return this;
    }

    /**
     * Rotate all shapes by angle.
     */
    rotate(angleDeg: number): this {
        const angleRad = angleDeg * Math.PI / 180;
        this._sourceShape.rotate(angleRad);
        for (const p of this._placements) {
            p.shape.rotate(angleRad);
        }
        return this;
    }

    /**

     * Get computed bounds
     */
    getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
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

        for (const p of this._placements) {
            const bbox = p.shape.boundingBox();
            minX = Math.min(minX, p.position.x + bbox.min.x);
            minY = Math.min(minY, p.position.y + bbox.min.y);
            maxX = Math.max(maxX, p.position.x + bbox.max.x);
            maxY = Math.max(maxY, p.position.y + bbox.max.y);
        }

        return { minX, minY, maxX, maxY };
    }

    /**
     * Stamp system to collector (for auto-rendering)
     */
    stamp(collector: SVGCollector, style?: PathStyle): void {
        const shapeStyle = style ?? DEFAULT_STYLES.connection;
        const placementStyle = style ?? DEFAULT_STYLES.placement;

        // Add traced source shape in its own group
        if (this._traced && !this._sourceShape.ephemeral) {
            collector.beginGroup('shape');
            collector.addShape(this._sourceShape, shapeStyle);
            collector.endGroup();
        }

        // Add placements in their own group
        if (this._placements.length > 0) {
            collector.beginGroup('placements');
            for (const p of this._placements) {
                collector.addShape(p.shape, p.style ?? placementStyle);
            }
            collector.endGroup();
        }
    }

    /**
     * Generate SVG output
     */
    /** Generate SVG output */
    toSVG(options: {
        width: number;
        height: number;
        margin?: number;
    }): string {
        const { width, height, margin = 10 } = options;

        const shapeItems: { shape: Shape; style?: PathStyle }[] = [];
        if (this._traced && !this._sourceShape.ephemeral) {
            shapeItems.push({ shape: this._sourceShape });
        }

        const placementItems = this._placements.map(p => ({
            shape: p.shape,
            style: p.style
        }));

        return renderSystemToSVG(width, height, margin, [
            {
                name: 'shape',
                items: shapeItems,
                defaultStyle: DEFAULT_STYLES.connection
            },
            {
                name: 'placements',
                items: placementItems,
                defaultStyle: DEFAULT_STYLES.placement
            }
        ]);
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
        for (const v of this._vertices) {
            const clone = shapeCtx.shape.clone();
            clone.moveTo(v.position);
            this._system.addPlacement(v.position, clone, style);
        }
        return this;
    }

    /** Select every nth node */
    every(n: number, offset = 0): ShapePointsContext {
        const selected: Vertex[] = [];
        for (let i = offset; i < this._vertices.length; i += n) {
            selected.push(this._vertices[i]);
        }
        return new ShapePointsContext(this._system, selected);
    }

    /** Select nodes at specific indices */
    at(...indices: number[]): ShapePointsContext {
        const selected: Vertex[] = [];
        for (const i of indices) {
            if (i >= 0 && i < this._vertices.length) {
                selected.push(this._vertices[i]);
            }
        }
        return new ShapePointsContext(this._system, selected);
    }
}
