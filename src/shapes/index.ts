import {
    CircleContext,
    RectContext,
    SquareContext,
    HexagonContext,
    TriangleContext,
} from '../contexts/ShapeContext';

/**
 * Shape factory - main entry point for creating shapes.
 * 
 * All shapes are centered at the origin (0, 0) by default.
 * Use `.xy(x, y)` to reposition or `.translate(dx, dy)` to move.
 * 
 * @example
 * ```typescript
 * import { shape } from 'patterin';
 * 
 * // Create shapes
 * const circle = shape.circle().radius(50);
 * const rect = shape.rect().size(100, 50);
 * const square = shape.square().size(40);
 * 
 * // Chain operations
 * shape.hexagon()
 *   .radius(30)
 *   .rotate(15)
 *   .xy(100, 100);
 * ```
 */
export const shape = {
    /**
     * Create a circle centered at the origin.
     * 
     * @returns A CircleContext for setting radius and performing operations
     * 
     * @example
     * ```typescript
     * // Simple circle
     * const c = shape.circle().radius(50);
     * 
     * // Concentric circles
     * const rings = shape.circle()
     *   .radius(20)
     *   .offset(10, 5); // 5 rings, each 10 units larger
     * 
     * // Segmented circle (becomes a polygon)
     * const star = shape.circle()
     *   .radius(50)
     *   .numSegments(10);
     * star.points.every(2).expand(20);
     * ```
     */
    circle(): CircleContext {
        return new CircleContext();
    },

    /**
     * Create a rectangle centered at the origin.
     * 
     * @returns A RectContext for setting dimensions and performing operations
     * 
     * @example
     * ```typescript
     * // Rectangle with explicit dimensions
     * const r = shape.rect().size(100, 50);
     * 
     * // Square-like rectangle
     * const sq = shape.rect().size(40);
     * 
     * // Transform rectangle
     * shape.rect()
     *   .size(60, 30)
     *   .rotate(45)
     *   .xy(100, 100);
     * ```
     */
    rect(): RectContext {
        return new RectContext();
    },

    /**
     * Create a square centered at the origin.
     * 
     * @returns A SquareContext for setting size and performing operations
     * 
     * @example
     * ```typescript
     * // Simple square
     * const sq = shape.square().size(50);
     * 
     * // Grid of squares
     * const grid = shape.square()
     *   .size(10)
     *   .clone(5, 20, 0)
     *   .clone(5, 0, 20);
     * 
     * // Transform every other square
     * grid.every(2).scale(2).rotate(45);
     * ```
     */
    square(): SquareContext {
        return new SquareContext();
    },

    /**
     * Create a regular hexagon centered at the origin.
     * 
     * @returns A HexagonContext for setting radius and performing operations
     * 
     * @example
     * ```typescript
     * // Flat-top hexagon
     * const hex = shape.hexagon().radius(30);
     * 
     * // Pointy-top hexagon (rotate 30°)
     * const pointy = shape.hexagon()
     *   .radius(30)
     *   .rotate(30);
     * 
     * // Hexagonal pattern
     * const pattern = shape.hexagon()
     *   .radius(15)
     *   .clone(3, 26, 0)
     *   .clone(3, 13, 22.5);
     * ```
     */
    hexagon(): HexagonContext {
        return new HexagonContext();
    },

    /**
     * Create an equilateral triangle centered at the origin.
     * 
     * @returns A TriangleContext for setting radius and performing operations
     * 
     * @example
     * ```typescript
     * // Simple triangle
     * const tri = shape.triangle().radius(40);
     * 
     * // Upside-down triangle
     * const flipped = shape.triangle()
     *   .radius(40)
     *   .rotate(180);
     * 
     * // Tessellating triangles
     * const pattern = shape.triangle()
     *   .radius(20)
     *   .clone(5, 34.64, 0)
     *   .clone(3, 0, 60);
     * ```
     */
    triangle(): TriangleContext {
        return new TriangleContext();
    },
};

// Also export individual shape creators
export { CircleContext, RectContext, SquareContext, HexagonContext, TriangleContext };
