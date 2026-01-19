import { Shape, Segment, Vector2, Vertex } from '../primitives';
import { PointsContext, LinesContext } from '../contexts/ShapeContext';
import { EdgeBasedSystem } from './EdgeBasedSystem';
/**
 * TessellationSystem - creates algorithmic tiling patterns.
 * Unlike GridSystem (regular infinite grids), TessellationSystem
 * handles patterns requiring algorithmic generation or randomization.
 */
export class TessellationSystem extends EdgeBasedSystem {
    constructor(options = {}) {
        super();
        // Support simple size API with defaults
        const pattern = options.pattern ?? 'penrose';
        const bounds = options.bounds ?? { width: 400, height: 400 };
        this._bounds = bounds;
        this._pattern = pattern;
        switch (pattern) {
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
    static create(options) {
        return new TessellationSystem(options);
    }
    // ==================== Trihexagonal Pattern ====================
    buildTrihexagonal(options) {
        const spacing = options.spacing ?? 30;
        const hexRadius = spacing / 2;
        const triSide = hexRadius;
        // Hexagonal grid spacing
        const horizSpacing = spacing * Math.sqrt(3);
        const vertSpacing = spacing * 1.5;
        const cols = Math.ceil(this._bounds.width / horizSpacing) + 1;
        const rows = Math.ceil(this._bounds.height / vertSpacing) + 1;
        // Use Map for de-duplication of vertices
        const nodeMap = new Map();
        const nodeKey = (x, y) => {
            return `${x.toFixed(6)},${y.toFixed(6)}`;
        };
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const xOffset = (row % 2) * horizSpacing / 2;
                const cx = col * horizSpacing + xOffset;
                const cy = row * vertSpacing;
                // Skip if outside bounds
                if (cx < -spacing || cx > this._bounds.width + spacing)
                    continue;
                if (cy < -spacing || cy > this._bounds.height + spacing)
                    continue;
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
    buildPenrose(options) {
        const iterations = options.iterations ?? 4;
        // Golden ratio
        const PHI = (1 + Math.sqrt(5)) / 2;
        const cx = this._bounds.width / 2;
        const cy = this._bounds.height / 2;
        const radius = Math.max(this._bounds.width, this._bounds.height) * 0.6;
        // Create wheel of 10 red triangles around the origin (Preshing method)
        let triangles = [];
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
            const newTriangles = [];
            for (const tri of triangles) {
                if (tri.color === 0) {
                    // Subdivide red triangle (36° apex) into 1 red + 1 blue
                    // P = A + (B - A) / goldenRatio
                    const p = tri.a.add(tri.b.subtract(tri.a).divide(PHI));
                    newTriangles.push({ color: 0, a: tri.c, b: p, c: tri.b });
                    newTriangles.push({ color: 1, a: p, b: tri.c, c: tri.a });
                }
                else {
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
        const nodeMap = new Map();
        const edgeMap = new Map();
        const nodeKey = (x, y) => {
            return `${x.toFixed(6)},${y.toFixed(6)}`;
        };
        const edgeKey = (v1, v2) => {
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
            if (center.x < 0 || center.x > this._bounds.width)
                continue;
            if (center.y < 0 || center.y > this._bounds.height)
                continue;
            // Add all 3 vertices
            for (const v of [tri.a, tri.b, tri.c]) {
                const key = nodeKey(v.x, v.y);
                if (!nodeMap.has(key)) {
                    nodeMap.set(key, new Vector2(v.x, v.y));
                }
            }
            // Add all 3 edges of the triangle
            const edges = [
                [tri.a, tri.b],
                [tri.b, tri.c],
                [tri.c, tri.a]
            ];
            for (const [v1, v2] of edges) {
                const key = edgeKey(v1, v2);
                if (!edgeMap.has(key)) {
                    edgeMap.set(key, new Segment(new Vertex(v1.x, v1.y), new Vertex(v2.x, v2.y)));
                }
            }
        }
        this._nodes = Array.from(nodeMap.values());
        this._edges = Array.from(edgeMap.values());
    }
    // ==================== Custom Pattern ====================
    buildCustom(options) {
        if (!options.unit) {
            throw new Error('Custom tessellation requires a unit shape');
        }
        const spacing = options.spacing ?? 40;
        const arrangement = options.arrangement ?? 'square';
        const unit = options.unit.shape;
        // Use Map for de-duplication of vertices
        const nodeMap = new Map();
        const nodeKey = (x, y) => {
            return `${x.toFixed(6)},${y.toFixed(6)}`;
        };
        // Use grid arrangement
        const cols = Math.ceil(this._bounds.width / spacing) + 1;
        const rows = Math.ceil(this._bounds.height / spacing) + 1;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let x, y;
                if (arrangement === 'hexagonal') {
                    const horizSpacing = spacing * Math.sqrt(3);
                    const xOffset = (row % 2) * horizSpacing / 2;
                    x = col * horizSpacing + xOffset;
                    y = row * spacing * 0.75;
                }
                else if (arrangement === 'triangular') {
                    const height = spacing * Math.sqrt(3) / 2;
                    x = col * spacing / 2;
                    y = row * height;
                }
                else {
                    x = col * spacing;
                    y = row * spacing;
                }
                if (x > this._bounds.width + spacing || y > this._bounds.height + spacing)
                    continue;
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
    _extractUniqueEdges() {
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
                if (i === j)
                    continue;
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
        const edgeMap = new Map();
        // Connect adjacent nodes
        for (let i = 0; i < this._nodes.length; i++) {
            const n1 = this._nodes[i];
            for (let j = i + 1; j < this._nodes.length; j++) {
                const n2 = this._nodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < threshold) {
                    const seg = new Segment(new Vertex(n1.x, n1.y), new Vertex(n2.x, n2.y));
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
    _edgeKey(seg) {
        // Get both endpoints
        const p1x = seg.start.x;
        const p1y = seg.start.y;
        const p2x = seg.end.x;
        const p2y = seg.end.y;
        // Normalize: always put point with smaller x first (or smaller y if x is equal)
        let x1, y1, x2, y2;
        if (p1x < p2x || (p1x === p2x && p1y < p2y)) {
            x1 = p1x;
            y1 = p1y;
            x2 = p2x;
            y2 = p2y;
        }
        else {
            x1 = p2x;
            y1 = p2y;
            x2 = p1x;
            y2 = p1y;
        }
        return `${x1.toFixed(6)},${y1.toFixed(6)}-${x2.toFixed(6)},${y2.toFixed(6)}`;
    }
    // ==================== Getters ====================
    /** Get all nodes as PointsContext */
    get nodes() {
        const vertices = this._nodes.map(n => new Vertex(n.x, n.y));
        const refShape = Shape.regularPolygon(3, 1);
        return new PointsContext(refShape, vertices);
    }
    /** Get all edges as LinesContext */
    get edges() {
        const refShape = Shape.regularPolygon(3, 1);
        return new LinesContext(refShape, this._edges);
    }
    // ==================== EdgeBasedSystem Implementation ====================
    getEdgeGroupName() {
        return 'tessellation-edges';
    }
    getNodes() {
        return this._nodes.map(n => new Vertex(n.x, n.y));
    }
}
