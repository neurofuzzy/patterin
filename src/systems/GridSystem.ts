import { Vector2 } from '../primitives/Vector2.ts';
import { Vertex } from '../primitives/Vertex.ts';
import { Segment } from '../primitives/Segment.ts';
import { Shape } from '../primitives/Shape.ts';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector.ts';
import { ShapeContext, PointsContext, LinesContext, ShapesContext } from '../contexts/ShapeContext.ts';

export interface GridOptions {
    rows: number;
    cols: number;
    spacing: number | { x: number; y: number };
    offset?: [number, number];
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
 * GridSystem - creates orthogonal grid structure.
 */
export class GridSystem {
    private _nodes: GridNode[] = [];
    private _cells: GridCell[] = [];
    private _rows: number;
    private _cols: number;
    private _spacingX: number;
    private _spacingY: number;
    private _offsetX: number;
    private _offsetY: number;
    private _placements: Placement[] = [];

    private constructor(options: GridOptions) {
        this._rows = options.rows;
        this._cols = options.cols;

        if (typeof options.spacing === 'number') {
            this._spacingX = options.spacing;
            this._spacingY = options.spacing;
        } else {
            this._spacingX = options.spacing.x;
            this._spacingY = options.spacing.y;
        }

        this._offsetX = options.offset?.[0] ?? 0;
        this._offsetY = options.offset?.[1] ?? 0;

        this.buildGrid();
    }

    static create(options: GridOptions): GridSystem {
        return new GridSystem(options);
    }

    private buildGrid(): void {
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

                this._cells.push({ shape: cellShape, row, col });
            }
        }
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

    /** Get row lines */
    get rows(): LinesContext {
        const segments: Segment[] = [];
        const refShape = this._cells[0]?.shape ?? Shape.regularPolygon(3, 1);

        for (let row = 0; row <= this._rows; row++) {
            const y = this._offsetY + row * this._spacingY;
            const startX = this._offsetX;
            const endX = this._offsetX + this._cols * this._spacingX;

            const start = new Vertex(startX, y);
            const end = new Vertex(endX, y);
            segments.push(new Segment(start, end));
        }

        return new LinesContext(refShape, segments);
    }

    /** Get column lines */
    get columns(): LinesContext {
        const segments: Segment[] = [];
        const refShape = this._cells[0]?.shape ?? Shape.regularPolygon(3, 1);

        for (let col = 0; col <= this._cols; col++) {
            const x = this._offsetX + col * this._spacingX;
            const startY = this._offsetY;
            const endY = this._offsetY + this._rows * this._spacingY;

            const start = new Vertex(x, startY);
            const end = new Vertex(x, endY);
            segments.push(new Segment(start, end));
        }

        return new LinesContext(refShape, segments);
    }

    /** Add a placement */
    addPlacement(position: Vector2, shape: Shape, style?: PathStyle): void {
        this._placements.push({ position, shape, style });
    }

    /** Get computed bounds */
    getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
        let minX = Infinity,
            minY = Infinity;
        let maxX = -Infinity,
            maxY = -Infinity;

        for (const node of this._nodes) {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x);
            maxY = Math.max(maxY, node.y);
        }

        // Also include placements
        for (const p of this._placements) {
            const bbox = p.shape.boundingBox();
            minX = Math.min(minX, p.position.x + bbox.min.x);
            minY = Math.min(minY, p.position.y + bbox.min.y);
            maxX = Math.max(maxX, p.position.x + bbox.max.x);
            maxY = Math.max(maxY, p.position.y + bbox.max.y);
        }

        return { minX, minY, maxX, maxY };
    }

    /** Generate SVG output - only renders placed shapes, scaled to fit */
    toSVG(options: {
        width: number;
        height: number;
        margin?: number;
    }): string {
        const { width, height, margin = 10 } = options;
        const collector = new SVGCollector();

        if (this._placements.length === 0) {
            return collector.toString({ width, height });
        }

        // Compute bounds from placed shapes only
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const p of this._placements) {
            const bbox = p.shape.boundingBox();
            const cx = p.shape.centroid();
            minX = Math.min(minX, cx.x + bbox.min.x - cx.x);
            minY = Math.min(minY, cx.y + bbox.min.y - cx.y);
            maxX = Math.max(maxX, cx.x + bbox.max.x - cx.x);
            maxY = Math.max(maxY, cx.y + bbox.max.y - cx.y);
        }

        const contentWidth = maxX - minX || 1;
        const contentHeight = maxY - minY || 1;

        // Scale to fit
        const availW = width - margin * 2;
        const availH = height - margin * 2;
        const scale = Math.min(availW / contentWidth, availH / contentHeight);

        // Center offset
        const offsetX = margin + (availW - contentWidth * scale) / 2 - minX * scale;
        const offsetY = margin + (availH - contentHeight * scale) / 2 - minY * scale;

        // Draw only placements
        for (const placement of this._placements) {
            const clone = placement.shape.clone();
            const cx = clone.centroid();

            // Scale around centroid then translate
            clone.scale(scale, cx);
            clone.translate(new Vector2(
                cx.x * (scale - 1) + offsetX,
                cx.y * (scale - 1) + offsetY
            ));
            collector.addShape(clone, placement.style);
        }

        return collector.toString({ width, height });
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
        for (const v of this._vertices) {
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
        for (let i = offset; i < this._vertices.length; i += n) {
            selected.push(this._vertices[i]);
            selectedNodes.push(this._gridNodes[i]);
        }
        return new GridPointsContext(this._grid, selected, selectedNodes);
    }

    /** Select nodes at specific indices */
    at(...indices: number[]): GridPointsContext {
        const selected: Vertex[] = [];
        const selectedNodes: GridNode[] = [];
        for (const i of indices) {
            if (i >= 0 && i < this._vertices.length) {
                selected.push(this._vertices[i]);
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
        for (const cellShape of this._shapes) {
            const center = cellShape.centroid();
            const clone = shapeCtx.shape.clone();
            clone.moveTo(center);
            this._grid.addPlacement(center, clone, style);
        }
        return this;
    }
}
