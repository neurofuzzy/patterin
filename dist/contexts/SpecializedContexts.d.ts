import { Shape } from '../primitives/Shape';
import { Vector2 } from '../primitives/Vector2';
import { ShapeContext } from './ShapeContext';
/**
 * Circle context with radius and segments.
 *
 * @example
 * ```typescript
 * const circle = shape.circle().radius(50).numSegments(32);
 * ```
 */
export declare class CircleContext extends ShapeContext {
    private _radius;
    private _segments;
    private _center;
    constructor();
    /** Set circle radius */
    radius(r: number): this;
    /** Set number of segments */
    numSegments(n: number): this;
    /** Set center position */
    setCenter(x: number, y: number): this;
    private rebuild;
}
/**
 * Rectangle context with width and height.
 *
 * @example
 * ```typescript
 * const rect = shape.rect().size(100, 50);
 * ```
 */
export declare class RectContext extends ShapeContext {
    private _width;
    private _height;
    private _center;
    constructor(shape?: Shape, width?: number, height?: number);
    /** Get width */
    get w(): number;
    /** Get height */
    get h(): number;
    /** Set width */
    width(w: number): this;
    /** Set height */
    height(h: number): this;
    /** Set width and height */
    wh(w: number, h: number): this;
    /** Set size (square) */
    size(s: number): this;
    /** Set center position */
    setCenter(x: number, y: number): this;
    private rebuild;
    static createRect(width: number, height: number, center: Vector2): Shape;
}
/**
 * Square context (special case of rectangle).
 *
 * @example
 * ```typescript
 * const square = shape.square().size(40);
 * ```
 */
export declare class SquareContext extends RectContext {
    constructor(size?: number);
    /** Set square size */
    size(s: number): this;
}
/**
 * Hexagon context with radius.
 *
 * @example
 * ```typescript
 * const hex = shape.hexagon().radius(30);
 * ```
 */
export declare class HexagonContext extends ShapeContext {
    private _radius;
    private _center;
    constructor();
    /** Set hexagon radius */
    radius(r: number): this;
    /** Set center position */
    setCenter(x: number, y: number): this;
    private rebuild;
}
/**
 * Triangle context with radius.
 *
 * @example
 * ```typescript
 * const tri = shape.triangle().radius(40);
 * ```
 */
export declare class TriangleContext extends ShapeContext {
    private _radius;
    private _center;
    constructor();
    /** Set triangle radius */
    radius(r: number): this;
    /** Set center position */
    setCenter(x: number, y: number): this;
    private rebuild;
}
