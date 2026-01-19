import { Vertex } from '../primitives';
import { PointsContext, LinesContext, ShapeContext } from '../contexts/ShapeContext';
import { EdgeBasedSystem } from './EdgeBasedSystem';
export type TessellationPattern = 'trihexagonal' | 'penrose' | 'custom';
export interface TessellationOptions {
    size?: number;
    pattern?: TessellationPattern;
    bounds?: {
        width: number;
        height: number;
    };
    seed?: number;
    spacing?: number;
    iterations?: number;
    unit?: ShapeContext;
    arrangement?: 'square' | 'hexagonal' | 'triangular';
}
/**
 * TessellationSystem - creates algorithmic tiling patterns.
 * Unlike GridSystem (regular infinite grids), TessellationSystem
 * handles patterns requiring algorithmic generation or randomization.
 */
export declare class TessellationSystem extends EdgeBasedSystem {
    private _bounds;
    private _pattern;
    private constructor();
    static create(options: TessellationOptions): TessellationSystem;
    private buildTrihexagonal;
    private buildPenrose;
    private buildCustom;
    /**
     * Extract unique edges by connecting adjacent intersection nodes.
     * Uses proximity-based neighbor detection with adaptive threshold.
     * These edges represent the connections in the tessellation geometry.
     */
    private _extractUniqueEdges;
    /**
     * Create a normalized key for an edge segment.
     * Uses fixed precision and orders coordinates consistently for de-duplication.
     */
    private _edgeKey;
    /** Get all nodes as PointsContext */
    get nodes(): PointsContext;
    /** Get all edges as LinesContext */
    get edges(): LinesContext;
    protected getEdgeGroupName(): string;
    protected getNodes(): Vertex[];
}
