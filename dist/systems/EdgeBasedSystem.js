/**
 * EdgeBasedSystem - Abstract base class for systems that manage nodes and edges.
 * Provides common implementations for node/edge operations like scaling, rotation,
 * filtering, and rendering.
 */
import { BaseSystem } from './BaseSystem';
import { Shape, Segment, Vector2, Vertex } from '../primitives';
import { DEFAULT_STYLES } from '../collectors/SVGCollector';
/**
 * Abstract base class for edge-based systems (GridSystem, TessellationSystem).
 * Consolidates common node and edge geometry management.
 */
export class EdgeBasedSystem extends BaseSystem {
    constructor() {
        super(...arguments);
        this._nodes = [];
        this._edges = [];
    }
    // ==================== BaseSystem Implementation ====================
    filterByMask(shape) {
        // Filter nodes to those inside the mask
        this._nodes = this._nodes.filter(node => shape.containsPoint(node));
        // Filter edges to those with midpoints inside mask
        this._edges = this._edges.filter(edge => shape.containsPoint(edge.midpoint()));
    }
    scaleGeometry(factor) {
        // Scale nodes (Vector2 is immutable, so create new instances)
        this._nodes = this._nodes.map(node => new Vector2(node.x * factor, node.y * factor));
        // Scale edges (create new Segments with scaled Vertices)
        this._edges = this._edges.map(edge => {
            const scaledStart = new Vertex(edge.start.x * factor, edge.start.y * factor);
            const scaledEnd = new Vertex(edge.end.x * factor, edge.end.y * factor);
            return new Segment(scaledStart, scaledEnd);
        });
    }
    rotateGeometry(angleRad) {
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        // Rotate nodes (Vector2 is immutable, so create new instances)
        this._nodes = this._nodes.map(node => {
            const x = node.x * cos - node.y * sin;
            const y = node.x * sin + node.y * cos;
            return new Vector2(x, y);
        });
        // Rotate edges (create new Segments with rotated Vertices)
        this._edges = this._edges.map(edge => {
            const startX = edge.start.x * cos - edge.start.y * sin;
            const startY = edge.start.x * sin + edge.start.y * cos;
            const endX = edge.end.x * cos - edge.end.y * sin;
            const endY = edge.end.x * sin + edge.end.y * cos;
            return new Segment(new Vertex(startX, startY), new Vertex(endX, endY));
        });
    }
    stampGeometry(collector, style) {
        const edgeStyle = style ?? DEFAULT_STYLES.connection;
        // Add traced edges in their own group
        if (this._traced && this._edges.length > 0) {
            collector.beginGroup(this.getEdgeGroupName());
            // Stamp each edge segment as a line
            for (const seg of this._edges) {
                const pathData = `M ${seg.start.x} ${seg.start.y} L ${seg.end.x} ${seg.end.y}`;
                collector.addPath(pathData, edgeStyle);
            }
            collector.endGroup();
        }
    }
    getGeometryRenderGroups() {
        if (!this._traced || this._edges.length === 0) {
            return [];
        }
        // Create a shape from edges for rendering
        const edgeShape = new Shape(this._edges, 'ccw');
        edgeShape.open = true;
        return [
            {
                name: this.getEdgeGroupName(),
                items: [{ shape: edgeShape, style: DEFAULT_STYLES.connection }],
                defaultStyle: DEFAULT_STYLES.connection
            }
        ];
    }
    getGeometryBounds() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for (const node of this._nodes) {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x);
            maxY = Math.max(maxY, node.y);
        }
        return { minX, minY, maxX, maxY };
    }
    getSourceForSelection() {
        // No source shapes needed for node-based selection
        return [];
    }
}
