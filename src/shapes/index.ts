import {
    CircleContext,
    RectContext,
    SquareContext,
    HexagonContext,
    TriangleContext,
} from '../contexts/ShapeContext.ts';

/**
 * Shape factory - main entry point for creating shapes.
 */
export const shape = {
    /** Create a circle */
    circle(): CircleContext {
        return new CircleContext();
    },

    /** Create a rectangle */
    rect(): RectContext {
        return new RectContext();
    },

    /** Create a square */
    square(): SquareContext {
        return new SquareContext();
    },

    /** Create a hexagon */
    hexagon(): HexagonContext {
        return new HexagonContext();
    },

    /** Create a triangle */
    triangle(): TriangleContext {
        return new TriangleContext();
    },
};

// Also export individual shape creators
export { CircleContext, RectContext, SquareContext, HexagonContext, TriangleContext };
