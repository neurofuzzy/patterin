// Primitives
export { Vector2 } from './primitives/Vector2.ts';
export { Vertex } from './primitives/Vertex.ts';
export { Segment, type Winding } from './primitives/Segment.ts';
export { Shape, type BoundingBox } from './primitives/Shape.ts';

// Interfaces
export type { IDrawable, ISystem } from './interfaces.ts';

// Contexts
export {
    ShapeContext,
    PointsContext,
    LinesContext,
    ShapesContext,
    CircleContext,
    RectContext,
    SquareContext,
    HexagonContext,
    TriangleContext,
    PathContext,
} from './contexts/index.ts';

// Shape Factory
export { shape } from './shapes/index.ts';

// Collectors
export { SVGCollector, type PathStyle } from './collectors/index.ts';

// Systems
export { GridSystem, type GridOptions, type GridType } from './systems/index.ts';
export { TessellationSystem, type TessellationOptions, type TessellationPattern } from './systems/index.ts';
export { ShapeSystem, type ShapeSystemOptions } from './systems/index.ts';
export { LSystem, type LSystemOptions } from './systems/index.ts';

// System Factory
export { system } from './systems/index.ts';
