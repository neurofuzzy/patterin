/**
 * EdgeBasedSystem - Abstract base class for systems that manage nodes and edges.
 * Provides common implementations for node/edge operations like scaling, rotation,
 * filtering, and rendering.
 */

import { BaseSystem, type RenderGroup } from './BaseSystem';
import { Shape, Segment, Vector2 } from '../primitives';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector';
import type { SystemBounds } from '../types';

/**
 * Abstract base class for edge-based systems (GridSystem, TessellationSystem).
 * Consolidates common node and edge geometry management.
 */
export abstract class EdgeBasedSystem extends BaseSystem {
    protected _nodes: Vector2[] = [];
    protected _edges: Segment[] = [];

    /**
     * Get the group name for traced edges (e.g., 'grid-edges', 'tessellation-edges').
     * Subclasses must implement this to provide their specific group name.
     */
    protected abstract getEdgeGroupName(): string;

    // ==================== BaseSystem Implementation ====================

    protected filterByMask(shape: Shape): void {
        // Filter nodes to those inside the mask
        this._nodes = this._nodes.filter(node =>
            shape.containsPoint(node)
        );

        // Filter edges to those with midpoints inside mask
        this._edges = this._edges.filter(edge =>
            shape.containsPoint(edge.midpoint())
        );
    }

    protected scaleGeometry(factor: number): void {
        // Scale nodes
        for (const node of this._nodes) {
            node.x *= factor;
            node.y *= factor;
        }
        // Scale edges
        for (const edge of this._edges) {
            edge.start.x *= factor;
            edge.start.y *= factor;
            edge.end.x *= factor;
            edge.end.y *= factor;
        }
    }

    protected rotateGeometry(angleRad: number): void {
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        
        // Rotate nodes
        for (const node of this._nodes) {
            const x = node.x * cos - node.y * sin;
            const y = node.x * sin + node.y * cos;
            node.x = x;
            node.y = y;
        }
        // Rotate edges
        for (const edge of this._edges) {
            let x = edge.start.x * cos - edge.start.y * sin;
            let y = edge.start.x * sin + edge.start.y * cos;
            edge.start.x = x;
            edge.start.y = y;
            
            x = edge.end.x * cos - edge.end.y * sin;
            y = edge.end.x * sin + edge.end.y * cos;
            edge.end.x = x;
            edge.end.y = y;
        }
    }

    protected stampGeometry(collector: SVGCollector, style?: PathStyle): void {
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

    protected getGeometryRenderGroups(): RenderGroup[] {
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

    protected getGeometryBounds(): SystemBounds {
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

    protected getSourceForSelection(): Shape[] {
        // No source shapes needed for node-based selection
        return [];
    }
}
