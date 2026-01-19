import { renderSystemToSVG } from './SystemUtils';
import { Shape, Segment, Vector2, Vertex } from '../primitives';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector';
import { ShapeContext, PointsContext, LinesContext, ShapesContext } from '../contexts';
import type { ISystem } from '../interfaces';

export type GridType = 'square' | 'hexagonal' | 'triangular' | 'brick';

export interface GridOptions {
    type?: GridType;
    // Simple API
    count?: number | [number, number];  // Grid count (rows x cols)
    size?: number | [number, number];   // Cell size (spacing)
    // Detailed API (takes precedence over simple API)
    rows?: number;
    cols?: number;
    spacing?: number | { x: number; y: number };
    offset?: [number, number];
    // Hexagonal-specific
    orientation?: 'pointy' | 'flat';
    // Brick-specific
    brickOffset?: number;  // 0-1, default 0.5
}

interface GridNode {
    x: number;
    y: number;
    row: number;
    col: number;
}

interface GridCell {
    shape: Shape;
    row: number;
    col: number;
}

interface Placement {
    position: Vector2;
    shape: Shape;
    style?: PathStyle;
}

/**
 * GridSystem - creates various grid structures.
 * Supports: square (default), hexagonal, triangular, brick.
 */
export class GridSystem implements ISystem {
    private _nodes: GridNode[] = [];
    private _cells: GridCell[] = [];
    private _rows: number;
    private _cols: number;
    private _spacingX: number;
    private _spacingY: number;
    private _offsetX: number;
    private _offsetY: number;
    private _placements: Placement[] = [];
    private _type: GridType;
    private _orientation: 'pointy' | 'flat';
    private _brickOffset: number;
    private _traced = false;

    private constructor(options: GridOptions = {}) {
        this._type = options.type ?? 'square';

        // Support both simple (count/size) and detailed (rows/cols/spacing) APIs
        // Detailed API takes precedence
        if (options.rows !== undefined || options.cols !== undefined) {
            this._rows = options.rows ?? 3;
            this._cols = options.cols ?? 3;
        } else if (options.count !== undefined) {
            if (typeof options.count === 'number') {
                this._rows = options.count;
                this._cols = options.count;
            } else {
                this._rows = options.count[0];
                this._cols = options.count[1];
            }
        } else {
            this._rows = 3;
            this._cols = 3;
        }

        this._orientation = options.orientation ?? 'pointy';
        this._brickOffset = options.brickOffset ?? 0.5;

        // Support both size and spacing
        const spacing = options.spacing ?? options.size ?? 40;
        if (typeof spacing === 'number') {
            this._spacingX = spacing;
            this._spacingY = spacing;
        } else if (Array.isArray(spacing)) {
            this._spacingX = spacing[0];
            this._spacingY = spacing[1];
        } else {
            this._spacingX = spacing.x;
            this._spacingY = spacing.y;
        }


        this._offsetX = options.offset?.[0] ?? 0;
        this._offsetY = options.offset?.[1] ?? 0;

        this.buildGrid();
    }

    static create(options: GridOptions): GridSystem {
        return new GridSystem(options);
    }

    private buildGrid(): void {
        switch (this._type) {
            case 'hexagonal':
                this.buildHexGrid();
                break;
            case 'triangular':
                this.buildTriangularGrid();
                break;
            case 'brick':
                this.buildBrickGrid();
                break;
            default:
                this.buildSquareGrid();
        }
    }

    private buildSquareGrid(): void {
        // Create nodes (grid intersections)
        for (let row = 0; row <= this._rows; row++) {
            for (let col = 0; col <= this._cols; col++) {
                this._nodes.push({
                    x: this._offsetX + col * this._spacingX,
                    y: this._offsetY + row * this._spacingY,
                    row,
                    col,
                });
            }
        }

        // Create cells (rectangular regions)
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                const x = this._offsetX + col * this._spacingX;
                const y = this._offsetY + row * this._spacingY;

                const cellShape = Shape.fromPoints([
                    new Vector2(x, y),
                    new Vector2(x + this._spacingX, y),
                    new Vector2(x + this._spacingX, y + this._spacingY),
                    new Vector2(x, y + this._spacingY),
                ]);
                cellShape.ephemeral = true;

                this._cells.push({ shape: cellShape, row, col });
            }
        }
    }

    private buildHexGrid(): void {
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

        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                let x: number, y: number;

                if (this._orientation === 'pointy') {
                    // Offset every other row
                    const xOffset = (row % 2) * hexWidth / 2;
                    x = this._offsetX + col * horizSpacing + xOffset;
                    y = this._offsetY + row * vertSpacing;
                } else {
                    // Offset every other column
                    const yOffset = (col % 2) * hexHeight / 2;
                    x = this._offsetX + col * horizSpacing;
                    y = this._offsetY + row * vertSpacing + yOffset;
                }

                // Create node at hex center
                this._nodes.push({ x, y, row, col });

                // Create hexagon cell
                const rotation = this._orientation === 'pointy' ? Math.PI / 6 : 0;
                const hexShape = Shape.regularPolygon(6, spacing, new Vector2(x, y), rotation);
                hexShape.ephemeral = true;

                this._cells.push({ shape: hexShape, row, col });
            }
        }
    }

    private buildTriangularGrid(): void {
        const spacing = this._spacingX;
        const height = spacing * Math.sqrt(3) / 2;

        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                const x = this._offsetX + col * spacing / 2;
                const y = this._offsetY + row * height;

                // Alternate up/down triangles
                const pointsUp = (row + col) % 2 === 0;

                let triShape: Shape;
                if (pointsUp) {
                    // △ vertices: bottom-left, bottom-right, top
                    triShape = Shape.fromPoints([
                        new Vector2(x, y + height),
                        new Vector2(x + spacing, y + height),
                        new Vector2(x + spacing / 2, y),
                    ]);
                } else {
                    // ▽ vertices: top-left, top-right, bottom
                    triShape = Shape.fromPoints([
                        new Vector2(x, y),
                        new Vector2(x + spacing, y),
                        new Vector2(x + spacing / 2, y + height),
                    ]);
                }
                triShape.ephemeral = true;

                // Node at triangle center
                const center = triShape.centroid();
                this._nodes.push({ x: center.x, y: center.y, row, col });

                this._cells.push({ shape: triShape, row, col });
            }
        }
    }

    private buildBrickGrid(): void {
        const cellWidth = this._spacingX;
        const cellHeight = this._spacingY;

        for (let row = 0; row < this._rows; row++) {
            const xOffset = (row % 2) * cellWidth * this._brickOffset;

            for (let col = 0; col < this._cols; col++) {
                const x = this._offsetX + col * cellWidth + xOffset;
                const y = this._offsetY + row * cellHeight;

                const cellShape = Shape.fromPoints([
                    new Vector2(x, y),
                    new Vector2(x + cellWidth, y),
                    new Vector2(x + cellWidth, y + cellHeight),
                    new Vector2(x, y + cellHeight),
                ]);
                cellShape.ephemeral = true;

                // Node at brick center
                const cx = x + cellWidth / 2;
                const cy = y + cellHeight / 2;
                this._nodes.push({ x: cx, y: cy, row, col });

                this._cells.push({ shape: cellShape, row, col });
            }
        }
    }

    /** Make structure concrete (renderable) */
    trace(): this {
        this._traced = true;
        for (const cell of this._cells) {
            cell.shape.ephemeral = false;
        }
        return this;
    }

    /** Get all grid nodes as PointsContext */
    get nodes(): GridPointsContext {
        const vertices = this._nodes.map((n) => new Vertex(n.x, n.y));
        return new GridPointsContext(this, vertices, this._nodes);
    }

    /** Get all grid cells as ShapesContext */
    get cells(): GridShapesContext {
        const shapes = this._cells.map((c) => c.shape.clone());
        return new GridShapesContext(this, shapes);
    }

    /** Alias for cells() - consistent with TessellationSystem.tiles */
    get tiles(): GridShapesContext {
        return this.cells;
    }

    get shapes(): ShapesContext {
        const shapes = this._placements.map((p) => p.shape.clone());
        return new ShapesContext(shapes);
    }

    /** Number of cells/placements in the system */
    get length(): number {
        return this._placements.length > 0 ? this._placements.length : this._cells.length;
    }

    // ==================== Selection ====================

    /**
     * Select every nth shape for modification.
     * Operates on placements if present, otherwise cells.
     */
    every(n: number, offset = 0): ShapesContext {
        const source = this._placements.length > 0
            ? this._placements.map(p => p.shape)
            : this._cells.map(c => c.shape);

        const selected: Shape[] = [];
        for (let i = offset; i < source.length; i += n) {
            selected.push(source[i]);
        }
        return new ShapesContext(selected);
    }

    /**
     * Select a range of shapes for modification.
     * Operates on placements if present, otherwise cells.
     */
    slice(start: number, end?: number): ShapesContext {
        const source = this._placements.length > 0
            ? this._placements.map(p => p.shape)
            : this._cells.map(c => c.shape);

        return new ShapesContext(source.slice(start, end));
    }

    // ==================== Transform ====================

    /**
     * Scale all shapes uniformly.
     */
    scale(factor: number): this {
        for (const cell of this._cells) {
            cell.shape.scale(factor);
        }
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
        for (const cell of this._cells) {
            cell.shape.rotate(angleRad);
        }
        for (const p of this._placements) {
            p.shape.rotate(angleRad);
        }
        return this;
    }

    /** Get row lines */
    get rows(): LinesContext {
        const segments: Segment[] = [];
        const refShape = this._cells[0]?.shape ?? Shape.regularPolygon(3, 1);

        if (this._type === 'square' || this._type === 'brick') {
            for (let row = 0; row <= this._rows; row++) {
                const y = this._offsetY + row * this._spacingY;
                const startX = this._offsetX;
                const endX = this._offsetX + this._cols * this._spacingX;

                const start = new Vertex(startX, y);
                const end = new Vertex(endX, y);
                segments.push(new Segment(start, end));
            }
        } else {
            // For hex/triangular, connect centers horizontally
            const nodesByRow = new Map<number, GridNode[]>();
            for (const node of this._nodes) {
                if (!nodesByRow.has(node.row)) nodesByRow.set(node.row, []);
                nodesByRow.get(node.row)!.push(node);
            }
            for (const nodes of nodesByRow.values()) {
                nodes.sort((a, b) => a.x - b.x);
                for (let i = 0; i < nodes.length - 1; i++) {
                    const start = new Vertex(nodes[i].x, nodes[i].y);
                    const end = new Vertex(nodes[i + 1].x, nodes[i + 1].y);
                    segments.push(new Segment(start, end));
                }
            }
        }

        return new LinesContext(refShape, segments);
    }

    /** Get column lines */
    get columns(): LinesContext {
        const segments: Segment[] = [];
        const refShape = this._cells[0]?.shape ?? Shape.regularPolygon(3, 1);

        if (this._type === 'square') {
            for (let col = 0; col <= this._cols; col++) {
                const x = this._offsetX + col * this._spacingX;
                const startY = this._offsetY;
                const endY = this._offsetY + this._rows * this._spacingY;

                const start = new Vertex(x, startY);
                const end = new Vertex(x, endY);
                segments.push(new Segment(start, end));
            }
        } else {
            // For hex/triangular/brick, connect centers vertically
            const nodesByCol = new Map<number, GridNode[]>();
            for (const node of this._nodes) {
                if (!nodesByCol.has(node.col)) nodesByCol.set(node.col, []);
                nodesByCol.get(node.col)!.push(node);
            }
            for (const nodes of nodesByCol.values()) {
                nodes.sort((a, b) => a.y - b.y);
                for (let i = 0; i < nodes.length - 1; i++) {
                    const start = new Vertex(nodes[i].x, nodes[i].y);
                    const end = new Vertex(nodes[i + 1].x, nodes[i + 1].y);
                    segments.push(new Segment(start, end));
                }
            }
        }

        return new LinesContext(refShape, segments);
    }

    /** Add a placement */
    addPlacement(position: Vector2, shape: Shape, style?: PathStyle): void {
        this._placements.push({ position, shape, style });
    }

    /** Place a shape at each node in the system */
    place(shapeCtx: ShapeContext, style?: PathStyle): this {
        for (const node of this._nodes) {
            const clone = shapeCtx.shape.clone();
            clone.ephemeral = false;  // Clones are concrete
            clone.moveTo(new Vector2(node.x, node.y));
            this._placements.push({ position: new Vector2(node.x, node.y), shape: clone, style });
        }

        // Mark source shape as ephemeral AFTER cloning (construction geometry)
        shapeCtx.shape.ephemeral = true;

        return this;
    }

    /** Clip system to mask shape boundary */
    mask(maskShape: ShapeContext): this {
        // Mark mask as ephemeral (construction geometry)
        maskShape.shape.ephemeral = true;

        const shape = maskShape.shape;

        // Filter nodes to those inside the mask
        this._nodes = this._nodes.filter(node =>
            shape.containsPoint(new Vector2(node.x, node.y))
        );

        // Filter cells to those with centroids inside the mask
        this._cells = this._cells.filter(cell =>
            shape.containsPoint(cell.shape.centroid())
        );

        // Filter placements to those inside the mask
        this._placements = this._placements.filter(p =>
            shape.containsPoint(p.position)
        );

        return this;
    }





    /** Get computed bounds */
    getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const node of this._nodes) {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x);
            maxY = Math.max(maxY, node.y);
        }

        for (const cell of this._cells) {
            const bbox = cell.shape.boundingBox();
            minX = Math.min(minX, bbox.min.x);
            minY = Math.min(minY, bbox.min.y);
            maxX = Math.max(maxX, bbox.max.x);
            maxY = Math.max(maxY, bbox.max.y);
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

    /** Stamp system to collector (for auto-rendering) */
    stamp(collector: SVGCollector, style?: PathStyle): void {
        const cellStyle = style ?? DEFAULT_STYLES.connection;
        const placementStyle = style ?? DEFAULT_STYLES.placement;

        // Add traced cells in their own group
        if (this._traced) {
            collector.beginGroup('cells');
            for (const cell of this._cells) {
                if (!cell.shape.ephemeral) {
                    collector.addShape(cell.shape, cellStyle);
                }
            }
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


    /** Generate SVG output */
    /** Generate SVG output */
    toSVG(options: {
        width: number;
        height: number;
        margin?: number;
    }): string {
        const { width, height, margin = 10 } = options;

        const cellItems = this._traced
            ? this._cells
                .filter(c => !c.shape.ephemeral)
                .map(c => ({ shape: c.shape }))
            : [];

        const placementItems = this._placements.map(p => ({
            shape: p.shape,
            style: p.style
        }));

        return renderSystemToSVG(width, height, margin, [
            {
                name: 'cells',
                items: cellItems,
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
 * Grid-specific PointsContext with place() support.
 */
class GridPointsContext extends PointsContext {
    constructor(
        private _grid: GridSystem,
        vertices: Vertex[],
        private _gridNodes: GridNode[]
    ) {
        super(Shape.regularPolygon(3, 1), vertices);
    }

    /** Place a shape at each selected node */
    place(shapeCtx: ShapeContext, style?: PathStyle): this {
        for (const v of this._items) {
            const clone = shapeCtx.shape.clone();
            clone.moveTo(v.position);
            this._grid.addPlacement(v.position, clone, style);
        }
        return this;
    }

    /** Select every nth node */
    every(n: number, offset = 0): GridPointsContext {
        const selected: Vertex[] = [];
        const selectedNodes: GridNode[] = [];
        for (let i = offset; i < this._items.length; i += n) {
            selected.push(this._items[i]);
            selectedNodes.push(this._gridNodes[i]);
        }
        return new GridPointsContext(this._grid, selected, selectedNodes);
    }

    /** Select nodes at specific indices */
    at(...indices: number[]): GridPointsContext {
        const selected: Vertex[] = [];
        const selectedNodes: GridNode[] = [];
        for (const i of indices) {
            if (i >= 0 && i < this._items.length) {
                selected.push(this._items[i]);
                selectedNodes.push(this._gridNodes[i]);
            }
        }
        return new GridPointsContext(this._grid, selected, selectedNodes);
    }
}

/**
 * Grid-specific ShapesContext with place() support.
 */
class GridShapesContext extends ShapesContext {
    constructor(
        private _grid: GridSystem,
        shapes: Shape[]
    ) {
        super(shapes);
    }

    /** Place a shape at each cell center */
    place(shapeCtx: ShapeContext, style?: PathStyle): this {
        for (const cellShape of this._items) {
            const center = cellShape.centroid();
            const clone = shapeCtx.shape.clone();
            clone.moveTo(center);
            this._grid.addPlacement(center, clone, style);
        }
        return this;
    }
}
