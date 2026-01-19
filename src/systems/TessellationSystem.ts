import { Shape, Segment, Vector2, Vertex } from '../primitives';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector';
import { PointsContext, LinesContext, ShapesContext, ShapeContext } from '../contexts/ShapeContext';
import { BaseSystem, type RenderGroup } from './BaseSystem';
import type { SystemBounds } from '../types';

export type TessellationPattern = 'truchet' | 'trihexagonal' | 'penrose' | 'custom';

export interface TessellationOptions {
    // Simple API
    size?: number;  // Tile size (default 40)
    // Detailed API (takes precedence)
    pattern?: TessellationPattern;
    bounds?: { width: number; height: number };
    seed?: number;
    // Truchet-specific
    tileSize?: number;
    variant?: 'quarter-circles' | 'diagonal' | 'triangles';
    // Trihexagonal-specific
    spacing?: number;
    // Penrose-specific
    iterations?: number;
    // Custom-specific
    unit?: ShapeContext;
    arrangement?: 'square' | 'hexagonal' | 'triangular';
}

/**
 * TessellationSystem - creates algorithmic tiling patterns.
 * Unlike GridSystem (regular infinite grids), TessellationSystem
 * handles patterns requiring algorithmic generation or randomization.
 */
export class TessellationSystem extends BaseSystem {
    private _nodes: Vector2[] = [];
    private _edges: Segment[] = [];
    private _bounds: { width: number; height: number };
    private _pattern: TessellationPattern;

    private constructor(options: TessellationOptions = {}) {
        super();
        // Support simple size API with defaults
        const pattern = options.pattern ?? 'truchet';
        const bounds = options.bounds ?? { width: 400, height: 400 };
        const tileSize = options.tileSize ?? options.size ?? 40;

        this._bounds = bounds;
        this._pattern = pattern;

        switch (pattern) {
            case 'truchet':
                this.buildTruchet({ ...options, pattern, bounds, tileSize });
                break;
            case 'trihexagonal':
                this.buildTrihexagonal({ ...options, pattern, bounds });
                break;
            case 'penrose':
                this.buildPenrose({ ...options, pattern, bounds });
                break;
            case 'custom':
                this.buildCustom({ ...options, pattern, bounds });
                break;
        }

        // Extract unique edges after nodes are built (if not already extracted)
        // Penrose extracts edges during build, others use proximity detection
        if (this._edges.length === 0) {
            this._extractUniqueEdges();
        }
    }

    static create(options: TessellationOptions): TessellationSystem {
        return new TessellationSystem(options);
    }

    // ==================== Seeded Random ====================

    private seededRandom(seed: number): () => number {
        let state = seed;
        return () => {
            state = (state * 1103515245 + 12345) & 0x7fffffff;
            return state / 0x7fffffff;
        };
    }

    // ==================== Truchet Pattern ====================

    private buildTruchet(options: TessellationOptions): void {
        const tileSize = options.tileSize ?? 20;
        const cols = Math.ceil(this._bounds.width / tileSize);
        const rows = Math.ceil(this._bounds.height / tileSize);

        // Use Map for de-duplication of vertices
        const nodeMap = new Map<string, Vector2>();
        const nodeKey = (x: number, y: number): string => {
            return `${x.toFixed(6)},${y.toFixed(6)}`;
        };

        // Generate vertices at tile corners (square grid of vertices)
        for (let row = 0; row <= rows; row++) {
            for (let col = 0; col <= cols; col++) {
                const x = col * tileSize;
                const y = row * tileSize;
                
                const key = nodeKey(x, y);
                if (!nodeMap.has(key)) {
                    nodeMap.set(key, new Vector2(x, y));
                }
            }
        }

        this._nodes = Array.from(nodeMap.values());
    }

    private createTruchetTile(
        variant: string,
        size: number,
        x: number,
        y: number,
        rotation: number
    ): Shape {
        const center = new Vector2(x + size / 2, y + size / 2);
        let shape: Shape;

        switch (variant) {
            case 'diagonal': {
                // Thin diagonal strip across tile
                const thickness = size * 0.1;
                const dx = thickness / Math.sqrt(2);
                shape = Shape.fromPoints([
                    new Vector2(x - dx, y + dx),
                    new Vector2(x + dx, y - dx),
                    new Vector2(x + size + dx, y + size - dx),
                    new Vector2(x + size - dx, y + size + dx),
                ]);
                break;
            }

            case 'triangles':
                // Half-square triangle
                shape = Shape.fromPoints([
                    new Vector2(x, y),
                    new Vector2(x + size, y),
                    new Vector2(x, y + size),
                ]);
                break;

            case 'quarter-circles':
            default: {
                // Approximate quarter circles with arcs
                const segments = 8;
                const points: Vector2[] = [];
                const r = size / 2;

                // Arc from top-left corner
                for (let i = 0; i <= segments; i++) {
                    const angle = (i / segments) * (Math.PI / 2);
                    points.push(new Vector2(
                        x + Math.cos(angle) * r,
                        y + Math.sin(angle) * r
                    ));
                }
                // Arc from bottom-right corner
                for (let i = 0; i <= segments; i++) {
                    const angle = Math.PI + (i / segments) * (Math.PI / 2);
                    points.push(new Vector2(
                        x + size + Math.cos(angle) * r,
                        y + size + Math.sin(angle) * r
                    ));
                }

                shape = Shape.fromPoints(points);
                break;
            }
        }

        // Apply rotation around center
        if (rotation !== 0) {
            shape.rotate(rotation * Math.PI / 180, center);
        }

        return shape;
    }

    // ==================== Trihexagonal Pattern ====================

    private buildTrihexagonal(options: TessellationOptions): void {
        const spacing = options.spacing ?? 30;
        const hexRadius = spacing / 2;
        const triSide = hexRadius;

        // Hexagonal grid spacing
        const horizSpacing = spacing * Math.sqrt(3);
        const vertSpacing = spacing * 1.5;

        const cols = Math.ceil(this._bounds.width / horizSpacing) + 1;
        const rows = Math.ceil(this._bounds.height / vertSpacing) + 1;

        // Use Map for de-duplication of vertices
        const nodeMap = new Map<string, Vector2>();
        const nodeKey = (x: number, y: number): string => {
            return `${x.toFixed(6)},${y.toFixed(6)}`;
        };

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const xOffset = (row % 2) * horizSpacing / 2;
                const cx = col * horizSpacing + xOffset;
                const cy = row * vertSpacing;

                // Skip if outside bounds
                if (cx < -spacing || cx > this._bounds.width + spacing) continue;
                if (cy < -spacing || cy > this._bounds.height + spacing) continue;

                // Generate hexagon vertices
                const hex = Shape.regularPolygon(6, hexRadius, new Vector2(cx, cy), Math.PI / 6);
                const hexVertices = hex.vertices;
                
                for (const v of hexVertices) {
                    const key = nodeKey(v.position.x, v.position.y);
                    if (!nodeMap.has(key)) {
                        nodeMap.set(key, new Vector2(v.position.x, v.position.y));
                    }
                }

                // Generate triangle vertices (peaks)
                for (let i = 0; i < 6; i++) {
                    const v1 = hexVertices[i].position;
                    const v2 = hexVertices[(i + 1) % 6].position;

                    // Triangle pointing outward
                    const outDir = v1.add(v2).divide(2).subtract(new Vector2(cx, cy)).normalize();
                    const triPeak = v1.add(v2).divide(2).add(outDir.multiply(triSide * 0.866));

                    const key = nodeKey(triPeak.x, triPeak.y);
                    if (!nodeMap.has(key)) {
                        nodeMap.set(key, new Vector2(triPeak.x, triPeak.y));
                    }
                }
            }
        }

        this._nodes = Array.from(nodeMap.values());
    }

    // ==================== Penrose Pattern ====================

    private buildPenrose(options: TessellationOptions): void {
        const iterations = options.iterations ?? 4;

        // Golden ratio
        const PHI = (1 + Math.sqrt(5)) / 2;

        // Robinson triangle: color 0 = red (36° apex), color 1 = blue (108° apex)
        interface Triangle {
            color: 0 | 1;  // 0 = red, 1 = blue
            a: Vector2;   // apex
            b: Vector2;   // base left
            c: Vector2;   // base right
        }

        const cx = this._bounds.width / 2;
        const cy = this._bounds.height / 2;
        const radius = Math.max(this._bounds.width, this._bounds.height) * 0.6;

        // Create wheel of 10 red triangles around the origin (Preshing method)
        let triangles: Triangle[] = [];
        for (let i = 0; i < 10; i++) {
            const angle1 = (2 * i - 1) * Math.PI / 10;
            const angle2 = (2 * i + 1) * Math.PI / 10;

            let b = new Vector2(cx + Math.cos(angle1) * radius, cy + Math.sin(angle1) * radius);
            let c = new Vector2(cx + Math.cos(angle2) * radius, cy + Math.sin(angle2) * radius);

            // Mirror every second triangle
            if (i % 2 === 0) {
                [b, c] = [c, b];
            }

            triangles.push({ color: 0, a: new Vector2(cx, cy), b, c });
        }

        // Deflation (subdivision) - following Preshing's algorithm
        for (let iter = 0; iter < iterations; iter++) {
            const newTriangles: Triangle[] = [];

            for (const tri of triangles) {
                if (tri.color === 0) {
                    // Subdivide red triangle (36° apex) into 1 red + 1 blue
                    // P = A + (B - A) / goldenRatio
                    const p = tri.a.add(tri.b.subtract(tri.a).divide(PHI));

                    newTriangles.push({ color: 0, a: tri.c, b: p, c: tri.b });
                    newTriangles.push({ color: 1, a: p, b: tri.c, c: tri.a });
                } else {
                    // Subdivide blue triangle (108° apex) into 2 blue + 1 red
                    // Q = B + (A - B) / goldenRatio
                    // R = B + (C - B) / goldenRatio
                    const q = tri.b.add(tri.a.subtract(tri.b).divide(PHI));
                    const r = tri.b.add(tri.c.subtract(tri.b).divide(PHI));

                    newTriangles.push({ color: 1, a: r, b: tri.c, c: tri.a });
                    newTriangles.push({ color: 1, a: q, b: r, c: tri.b });
                    newTriangles.push({ color: 0, a: r, b: q, c: tri.a });
                }
            }

            triangles = newTriangles;
        }

        // Extract vertices and edges from triangles
        const nodeMap = new Map<string, Vector2>();
        const edgeMap = new Map<string, Segment>();
        
        const nodeKey = (x: number, y: number): string => {
            return `${x.toFixed(6)},${y.toFixed(6)}`;
        };
        
        const edgeKey = (v1: Vector2, v2: Vector2): string => {
            const x1 = v1.x.toFixed(6), y1 = v1.y.toFixed(6);
            const x2 = v2.x.toFixed(6), y2 = v2.y.toFixed(6);
            // Sort to ensure consistent key regardless of order
            return x1 < x2 || (x1 === x2 && y1 < y2) 
                ? `${x1},${y1}-${x2},${y2}`
                : `${x2},${y2}-${x1},${y1}`;
        };

        for (const tri of triangles) {
            // Clip to bounds
            const center = tri.a.add(tri.b).add(tri.c).divide(3);
            if (center.x < 0 || center.x > this._bounds.width) continue;
            if (center.y < 0 || center.y > this._bounds.height) continue;

            // Add all 3 vertices
            for (const v of [tri.a, tri.b, tri.c]) {
                const key = nodeKey(v.x, v.y);
                if (!nodeMap.has(key)) {
                    nodeMap.set(key, new Vector2(v.x, v.y));
                }
            }
            
            // Add all 3 edges of the triangle
            const edges: [Vector2, Vector2][] = [
                [tri.a, tri.b],
                [tri.b, tri.c],
                [tri.c, tri.a]
            ];
            
            for (const [v1, v2] of edges) {
                const key = edgeKey(v1, v2);
                if (!edgeMap.has(key)) {
                    edgeMap.set(key, new Segment(
                        new Vertex(v1.x, v1.y),
                        new Vertex(v2.x, v2.y)
                    ));
                }
            }
        }

        this._nodes = Array.from(nodeMap.values());
        this._edges = Array.from(edgeMap.values());
    }

    // ==================== Custom Pattern ====================

    private buildCustom(options: TessellationOptions): void {
        if (!options.unit) {
            throw new Error('Custom tessellation requires a unit shape');
        }

        const spacing = options.spacing ?? 40;
        const arrangement = options.arrangement ?? 'square';
        const unit = options.unit.shape;

        // Use Map for de-duplication of vertices
        const nodeMap = new Map<string, Vector2>();
        const nodeKey = (x: number, y: number): string => {
            return `${x.toFixed(6)},${y.toFixed(6)}`;
        };

        // Use grid arrangement
        const cols = Math.ceil(this._bounds.width / spacing) + 1;
        const rows = Math.ceil(this._bounds.height / spacing) + 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let x: number, y: number;

                if (arrangement === 'hexagonal') {
                    const horizSpacing = spacing * Math.sqrt(3);
                    const xOffset = (row % 2) * horizSpacing / 2;
                    x = col * horizSpacing + xOffset;
                    y = row * spacing * 0.75;
                } else if (arrangement === 'triangular') {
                    const height = spacing * Math.sqrt(3) / 2;
                    x = col * spacing / 2;
                    y = row * height;
                } else {
                    x = col * spacing;
                    y = row * spacing;
                }

                if (x > this._bounds.width + spacing || y > this._bounds.height + spacing) continue;

                // Extract vertices from unit shape at this position
                const clone = unit.clone();
                clone.moveTo(new Vector2(x, y));
                
                for (const v of clone.vertices) {
                    const key = nodeKey(v.position.x, v.position.y);
                    if (!nodeMap.has(key)) {
                        nodeMap.set(key, new Vector2(v.position.x, v.position.y));
                    }
                }
            }
        }

        this._nodes = Array.from(nodeMap.values());
    }

    /**
     * Extract unique edges by connecting adjacent intersection nodes.
     * Uses proximity-based neighbor detection with adaptive threshold.
     * These edges represent the connections in the tessellation geometry.
     */
    private _extractUniqueEdges(): void {
        if (this._nodes.length === 0) {
            this._edges = [];
            return;
        }

        // Estimate typical edge length by sampling nearby nodes
        let totalDist = 0;
        let sampleCount = 0;
        const maxSamples = Math.min(10, this._nodes.length);
        
        for (let i = 0; i < maxSamples && i < this._nodes.length; i++) {
            const n1 = this._nodes[i];
            let minDist = Infinity;
            
            for (let j = 0; j < this._nodes.length; j++) {
                if (i === j) continue;
                const n2 = this._nodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    minDist = dist;
                }
            }
            
            if (minDist !== Infinity) {
                totalDist += minDist;
                sampleCount++;
            }
        }
        
        const avgDist = sampleCount > 0 ? totalDist / sampleCount : 50;
        const threshold = avgDist * 1.5; // Allow some tolerance

        // Use edge-key map for de-duplication
        const edgeMap = new Map<string, Segment>();

        // Connect adjacent nodes
        for (let i = 0; i < this._nodes.length; i++) {
            const n1 = this._nodes[i];
            for (let j = i + 1; j < this._nodes.length; j++) {
                const n2 = this._nodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < threshold) {
                    const seg = new Segment(
                        new Vertex(n1.x, n1.y),
                        new Vertex(n2.x, n2.y)
                    );
                    const key = this._edgeKey(seg);
                    if (!edgeMap.has(key)) {
                        edgeMap.set(key, seg);
                    }
                }
            }
        }

        this._edges = Array.from(edgeMap.values());
    }

    /**
     * Create a normalized key for an edge segment.
     * Uses fixed precision and orders coordinates consistently for de-duplication.
     */
    private _edgeKey(seg: Segment): string {
        // Get both endpoints
        const p1x = seg.start.x;
        const p1y = seg.start.y;
        const p2x = seg.end.x;
        const p2y = seg.end.y;

        // Normalize: always put point with smaller x first (or smaller y if x is equal)
        let x1, y1, x2, y2;
        if (p1x < p2x || (p1x === p2x && p1y < p2y)) {
            x1 = p1x; y1 = p1y; x2 = p2x; y2 = p2y;
        } else {
            x1 = p2x; y1 = p2y; x2 = p1x; y2 = p1y;
        }

        return `${x1.toFixed(6)},${y1.toFixed(6)}-${x2.toFixed(6)},${y2.toFixed(6)}`;
    }

    // ==================== Getters ====================

    /** Get all nodes as PointsContext */
    get nodes(): PointsContext {
        const vertices = this._nodes.map(n => new Vertex(n.x, n.y));
        const refShape = Shape.regularPolygon(3, 1);
        return new PointsContext(refShape, vertices);
    }

    /** Get all edges as LinesContext */
    get edges(): LinesContext {
        const refShape = Shape.regularPolygon(3, 1);
        return new LinesContext(refShape, this._edges);
    }

    // ==================== BaseSystem Implementation ====================

    protected getNodes(): Vertex[] {
        return this._nodes.map(n => new Vertex(n.x, n.y));
    }

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
            collector.beginGroup('tessellation-edges');
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
                name: 'tessellation-edges',
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
