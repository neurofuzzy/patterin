// Primitives
export { Vector2 } from './primitives/Vector2.ts';
export { Vertex } from './primitives/Vertex.ts';
export { Segment, type Winding } from './primitives/Segment.ts';
export { Shape, type BoundingBox } from './primitives/Shape.ts';

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
} from './contexts/index.ts';

// Shape Factory
export { shape } from './shapes/index.ts';

// Collectors
export { SVGCollector, type PathStyle } from './collectors/index.ts';

// Systems
export { GridSystem, type GridOptions } from './systems/index.ts';
