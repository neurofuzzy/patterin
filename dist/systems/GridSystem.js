import { Shape, Segment, Vector2, Vertex } from '../primitives';
import { PointsContext, LinesContext } from '../contexts';
import { EdgeBasedSystem } from './EdgeBasedSystem';
/**
 * GridSystem - creates various grid structures.
 * Supports: square (default), hexagonal, triangular.
 */
export class GridSystem extends EdgeBasedSystem {
    constructor(options = {}) {
        super();
        this._gridNodes = [];
        this._type = options.type ?? 'square';
        // Support both simple (count/size) and detailed (rows/cols/spacing) APIs
        // Detailed API takes precedence
        if (options.rows !== undefined || options.cols !== undefined) {
            this._rows = options.rows ?? 3;
            this._cols = options.cols ?? 3;
        }
        else if (options.count !== undefined) {
            if (typeof options.count === 'number') {
                this._rows = options.count;
                this._cols = options.count;
            }
            else {
                this._rows = options.count[0];
                this._cols = options.count[1];
            }
        }
        else {
            this._rows = 3;
            this._cols = 3;
        }
        this._orientation = options.orientation ?? 'pointy';
        // Support both size and spacing
        const spacing = options.spacing ?? options.size ?? 40;
        if (typeof spacing === 'number') {
            this._spacingX = spacing;
            this._spacingY = spacing;
        }
        else if (Array.isArray(spacing)) {
            this._spacingX = spacing[0];
            this._spacingY = spacing[1];
        }
        else {
            this._spacingX = spacing.x;
            this._spacingY = spacing.y;
        }
        this._offsetX = options.offset?.[0] ?? 0;
        this._offsetY = options.offset?.[1] ?? 0;
        this.buildGrid();
        this._buildGridEdges();
    }
    static create(options) {
        return new GridSystem(options);
    }
    buildGrid() {
        switch (this._type) {
            case 'hexagonal':
                this.buildHexGrid();
                break;
            case 'triangular':
                this.buildTriangularGrid();
                break;
            default:
                this.buildSquareGrid();
        }
    }
    buildSquareGrid() {
        // Create nodes (grid intersections)
        for (let row = 0; row <= this._rows; row++) {
            for (let col = 0; col <= this._cols; col++) {
                const x = this._offsetX + col * this._spacingX;
                const y = this._offsetY + row * this._spacingY;
                // Store metadata
                this._gridNodes.push({ x, y, row, col });
                // Store position for base class
                this._nodes.push(new Vector2(x, y));
            }
        }
    }
    buildHexGrid() {
        const spacing = this._spacingX;
        // Hex dimensions based on orientation
        const hexWidth = this._orientation === 'pointy'
            ? spacing * Math.sqrt(3)
            : spacing * 2;
        const hexHeight = this._orientation === 'pointy'
            ? spacing * 2
            : spacing * Math.sqrt(3);
        const vertSpacing = this._orientation === 'pointy' ? hexHeight * 0.75 : hexHeight;
        const horizSpacing = this._orientation === 'pointy' ? hexWidth : hexWidth * 0.75;
        // Use Map for de-duplication
        const nodeMap = new Map();
        const nodeKey = (x, y) => {
            return `${x.toFixed(6)},${y.toFixed(6)}`;
        };
        let nodeIndex = 0;
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                let centerX, centerY;
                if (this._orientation === 'pointy') {
                    // Offset every other row
                    const xOffset = (row % 2) * hexWidth / 2;
                    centerX = this._offsetX + col * horizSpacing + xOffset;
                    centerY = this._offsetY + row * vertSpacing;
                }
                else {
                    // Offset every other column
                    const yOffset = (col % 2) * hexHeight / 2;
                    centerX = this._offsetX + col * horizSpacing;
                    centerY = this._offsetY + row * vertSpacing + yOffset;
                }
                // Generate all 6 hex vertices
                const rotation = this._orientation === 'pointy' ? Math.PI / 6 : 0;
                for (let i = 0; i < 6; i++) {
                    const angle = rotation + (i * Math.PI / 3);
                    const vx = centerX + spacing * Math.cos(angle);
                    const vy = centerY + spacing * Math.sin(angle);
                    const key = nodeKey(vx, vy);
                    if (!nodeMap.has(key)) {
                        nodeMap.set(key, { x: vx, y: vy, row: nodeIndex, col: 0 });
                        nodeIndex++;
                    }
                }
            }
        }
        // Convert to arrays
        this._gridNodes = Array.from(nodeMap.values());
        this._nodes = this._gridNodes.map(n => new Vector2(n.x, n.y));
    }
    buildTriangularGrid() {
        const spacing = this._spacingX;
        const height = spacing * Math.sqrt(3) / 2;
        // Use Map for de-duplication
        const nodeMap = new Map();
        const nodeKey = (x, y) => {
            return `${x.toFixed(6)},${y.toFixed(6)}`;
        };
        let nodeIndex = 0;
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                const x = this._offsetX + col * spacing / 2;
                const y = this._offsetY + row * height;
                // Alternate up/down triangles
                const pointsUp = (row + col) % 2 === 0;
                let vertices;
                if (pointsUp) {
                    // △ vertices: bottom-left, bottom-right, top
                    vertices = [
                        new Vector2(x, y + height),
                        new Vector2(x + spacing, y + height),
                        new Vector2(x + spacing / 2, y),
                    ];
                }
                else {
                    // ▽ vertices: top-left, top-right, bottom
                    vertices = [
                        new Vector2(x, y),
                        new Vector2(x + spacing, y),
                        new Vector2(x + spacing / 2, y + height),
                    ];
                }
                // Add all 3 vertices
                for (const v of vertices) {
                    const key = nodeKey(v.x, v.y);
                    if (!nodeMap.has(key)) {
                        nodeMap.set(key, { x: v.x, y: v.y, row: nodeIndex, col: 0 });
                        nodeIndex++;
                    }
                }
            }
        }
        // Convert to arrays
        this._gridNodes = Array.from(nodeMap.values());
        this._nodes = this._gridNodes.map(n => new Vector2(n.x, n.y));
    }
    /**
     * Build grid edges by connecting adjacent intersection nodes.
     * Uses proximity-based neighbor detection with de-duplication.
     * These edges represent the connections between adjacent grid nodes.
     */
    _buildGridEdges() {
        this._edges = [];
        if (this._type === 'square') {
            // Square grid: simple horizontal and vertical lines
            for (let row = 0; row <= this._rows; row++) {
                const y = this._offsetY + row * this._spacingY;
                const startX = this._offsetX;
                const endX = this._offsetX + this._cols * this._spacingX;
                this._edges.push(new Segment(new Vertex(startX, y), new Vertex(endX, y)));
            }
            for (let col = 0; col <= this._cols; col++) {
                const x = this._offsetX + col * this._spacingX;
                const startY = this._offsetY;
                const endY = this._offsetY + this._rows * this._spacingY;
                this._edges.push(new Segment(new Vertex(x, startY), new Vertex(x, endY)));
            }
        }
        else {
            // For hex/triangular: connect adjacent nodes by proximity
            // Determine connection distance threshold based on grid type
            const threshold = Math.max(this._spacingX, this._spacingY) * 1.1; // Slightly larger than max spacing
            // Use edge-key map for de-duplication
            const edgeMap = new Map();
            const edgeKey = (v1, v2) => {
                const x1 = v1.x.toFixed(6), y1 = v1.y.toFixed(6);
                const x2 = v2.x.toFixed(6), y2 = v2.y.toFixed(6);
                // Sort to ensure consistent key regardless of order
                return x1 < x2 || (x1 === x2 && y1 < y2)
                    ? `${x1},${y1}-${x2},${y2}`
                    : `${x2},${y2}-${x1},${y1}`;
            };
            // Find neighbors for each node
            for (let i = 0; i < this._nodes.length; i++) {
                const n1 = this._nodes[i];
                for (let j = i + 1; j < this._nodes.length; j++) {
                    const n2 = this._nodes[j];
                    const dx = n2.x - n1.x;
                    const dy = n2.y - n1.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < threshold) {
                        const key = edgeKey(n1, n2);
                        if (!edgeMap.has(key)) {
                            edgeMap.set(key, new Segment(new Vertex(n1.x, n1.y), new Vertex(n2.x, n2.y)));
                        }
                    }
                }
            }
            this._edges = Array.from(edgeMap.values());
        }
    }
    /** Get all grid nodes as PointsContext */
    get nodes() {
        const vertices = this._nodes.map((n) => new Vertex(n.x, n.y));
        return new GridPointsContext(this, vertices, this._gridNodes);
    }
    // ==================== EdgeBasedSystem Implementation ====================
    getEdgeGroupName() {
        return 'grid-edges';
    }
    getNodes() {
        return this._nodes.map((n) => new Vertex(n.x, n.y));
    }
    filterByMask(shape) {
        // Filter GridNode metadata
        this._gridNodes = this._gridNodes.filter(node => shape.containsPoint(new Vector2(node.x, node.y)));
        // Call parent to filter _nodes and _edges
        super.filterByMask(shape);
    }
    /** Get row lines (more horizontal edges) */
    get rows() {
        const segments = [];
        const refShape = Shape.regularPolygon(3, 1);
        if (this._type === 'square') {
            for (let row = 0; row <= this._rows; row++) {
                const y = this._offsetY + row * this._spacingY;
                const startX = this._offsetX;
                const endX = this._offsetX + this._cols * this._spacingX;
                segments.push(new Segment(new Vertex(startX, y), new Vertex(endX, y)));
            }
        }
        else {
            // For other grid types, filter edges that are more horizontal
            for (const edge of this._edges) {
                const dx = Math.abs(edge.end.x - edge.start.x);
                const dy = Math.abs(edge.end.y - edge.start.y);
                if (dx >= dy) { // More horizontal than vertical
                    segments.push(edge);
                }
            }
        }
        return new LinesContext(refShape, segments);
    }
    /** Get column lines (more vertical edges) */
    get columns() {
        const segments = [];
        const refShape = Shape.regularPolygon(3, 1);
        if (this._type === 'square') {
            for (let col = 0; col <= this._cols; col++) {
                const x = this._offsetX + col * this._spacingX;
                const startY = this._offsetY;
                const endY = this._offsetY + this._rows * this._spacingY;
                segments.push(new Segment(new Vertex(x, startY), new Vertex(x, endY)));
            }
        }
        else {
            // For other grid types, filter edges that are more vertical
            for (const edge of this._edges) {
                const dx = Math.abs(edge.end.x - edge.start.x);
                const dy = Math.abs(edge.end.y - edge.start.y);
                if (dy > dx) { // More vertical than horizontal
                    segments.push(edge);
                }
            }
        }
        return new LinesContext(refShape, segments);
    }
    /** Add a placement */
    addPlacement(position, shape, style) {
        this._placements.push({ position, shape, style });
    }
}
/**
 * Grid-specific PointsContext with place() support.
 */
class GridPointsContext extends PointsContext {
    constructor(_grid, vertices, _gridNodes) {
        super(Shape.regularPolygon(3, 1), vertices);
        this._grid = _grid;
        this._gridNodes = _gridNodes;
    }
    /** Place a shape at each selected node */
    place(shapeCtx, style) {
        for (const v of this._items) {
            const clone = shapeCtx.shape.clone();
            clone.moveTo(v.position);
            this._grid.addPlacement(v.position, clone, style);
        }
        return this;
    }
    /** Select every nth node */
    every(n, offset = 0) {
        const selected = [];
        const selectedNodes = [];
        for (let i = offset; i < this._items.length; i += n) {
            selected.push(this._items[i]);
            selectedNodes.push(this._gridNodes[i]);
        }
        return new GridPointsContext(this._grid, selected, selectedNodes);
    }
    /** Select nodes at specific indices */
    at(...indices) {
        const selected = [];
        const selectedNodes = [];
        for (const i of indices) {
            if (i >= 0 && i < this._items.length) {
                selected.push(this._items[i]);
                selectedNodes.push(this._gridNodes[i]);
            }
        }
        return new GridPointsContext(this._grid, selected, selectedNodes);
    }
}
