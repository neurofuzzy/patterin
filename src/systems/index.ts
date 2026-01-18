import { GridSystem, GridOptions } from './GridSystem.ts';
import { TessellationSystem, TessellationOptions } from './TessellationSystem.ts';
import { ShapeSystem, ShapeSystemOptions } from './ShapeSystem.ts';
import { ShapeContext } from '../contexts/ShapeContext.ts';
import { Shape } from '../primitives/Shape.ts';
import { LSystem, LSystemOptions } from './LSystem.ts';
import { CloneSystem, CloneOptions } from './CloneSystem.ts';

export { GridSystem, type GridOptions, type GridType } from './GridSystem.ts';
export { TessellationSystem, type TessellationOptions, type TessellationPattern } from './TessellationSystem.ts';
export { ShapeSystem, type ShapeSystemOptions } from './ShapeSystem.ts';
export { LSystem, type LSystemOptions } from './LSystem.ts';
export { CloneSystem, type CloneOptions } from './CloneSystem.ts';


/**
 * System factory - main entry point for creating systems.
 */
export const system = {
    /** Create a grid system */
    grid(options: GridOptions): GridSystem {
        return GridSystem.create(options);
    },

    /** Create a tessellation system */
    tessellation(options: TessellationOptions): TessellationSystem {
        return TessellationSystem.create(options);
    },

    /** Create a system from a shape (vertices → nodes, segments → edges) */
    fromShape(source: ShapeContext | Shape, options?: ShapeSystemOptions): ShapeSystem {
        return new ShapeSystem(source, options);
    },

    /** Create an L-System */
    lsystem(options: LSystemOptions): LSystem {
        return LSystem.create(options);
    },
};
