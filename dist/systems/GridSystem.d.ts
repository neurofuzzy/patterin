import { Shape, Vector2, Vertex } from '../primitives';
import { PathStyle } from '../collectors/SVGCollector';
import { ShapeContext, PointsContext, LinesContext } from '../contexts';
import { EdgeBasedSystem } from './EdgeBasedSystem';
export type GridType = 'square' | 'hexagonal' | 'triangular';
export interface GridOptions {
    type?: GridType;
    count?: number | [number, number];
    size?: number | [number, number];
    rows?: number;
    cols?: number;
    spacing?: number | {
        x: number;
        y: number;
    };
    offset?: [number, number];
    orientation?: 'pointy' | 'flat';
}
interface GridNode {
    x: number;
    y: number;
    row: number;
    col: number;
}
/**
 * GridSystem - creates various grid structures.
 * Supports: square (default), hexagonal, triangular.
 */
export declare class GridSystem extends EdgeBasedSystem {
    private _gridNodes;
    private _rows;
    private _cols;
    private _spacingX;
    private _spacingY;
    private _offsetX;
    private _offsetY;
    private _type;
    private _orientation;
    private constructor();
    static create(options: GridOptions): GridSystem;
    private buildGrid;
    private buildSquareGrid;
    private buildHexGrid;
    private buildTriangularGrid;
    /**
     * Build grid edges by connecting adjacent intersection nodes.
     * Uses proximity-based neighbor detection with de-duplication.
     * These edges represent the connections between adjacent grid nodes.
     */
    private _buildGridEdges;
    /** Get all grid nodes as PointsContext */
    get nodes(): GridPointsContext;
    protected getEdgeGroupName(): string;
    protected getNodes(): Vertex[];
    protected filterByMask(shape: Shape): void;
    /** Get row lines (more horizontal edges) */
    get rows(): LinesContext;
    /** Get column lines (more vertical edges) */
    get columns(): LinesContext;
    /** Add a placement */
    addPlacement(position: Vector2, shape: Shape, style?: PathStyle): void;
}
/**
 * Grid-specific PointsContext with place() support.
 */
declare class GridPointsContext extends PointsContext {
    private _grid;
    private _gridNodes;
    constructor(_grid: GridSystem, vertices: Vertex[], _gridNodes: GridNode[]);
    /** Place a shape at each selected node */
    place(shapeCtx: ShapeContext, style?: PathStyle): this;
    /** Select every nth node */
    every(n: number, offset?: number): GridPointsContext;
    /** Select nodes at specific indices */
    at(...indices: number[]): GridPointsContext;
}
export {};
