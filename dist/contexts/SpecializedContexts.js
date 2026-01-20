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
export class CircleContext extends ShapeContext {
    constructor() {
        super(Shape.regularPolygon(32, 10));
        this._radius = 10;
        this._segments = 32;
        this._center = Vector2.zero();
    }
    /** Set circle radius */
    radius(r) {
        this._radius = r;
        this.rebuild();
        return this;
    }
    /** Set number of segments */
    numSegments(n) {
        this._segments = Math.max(3, n);
        this.rebuild();
        return this;
    }
    /** Set center position */
    setCenter(x, y) {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }
    rebuild() {
        this._shape = Shape.regularPolygon(this._segments, this._radius, this._center);
    }
}
/**
 * Rectangle context with width and height.
 *
 * @example
 * ```typescript
 * const rect = shape.rect().size(100, 50);
 * ```
 */
export class RectContext extends ShapeContext {
    constructor(shape, width = 10, height = 10) {
        super(shape ?? RectContext.createRect(width, height, Vector2.zero()));
        this._center = Vector2.zero();
        this._width = width;
        this._height = height;
    }
    /** Get width */
    get w() { return this._width; }
    /** Get height */
    get h() { return this._height; }
    /** Set width */
    width(w) {
        this._width = w;
        this.rebuild();
        return this;
    }
    /** Set height */
    height(h) {
        this._height = h;
        this.rebuild();
        return this;
    }
    /** Set width and height */
    wh(w, h) {
        this._width = w;
        this._height = h;
        this.rebuild();
        return this;
    }
    /** Set size (square) */
    size(s) {
        return this.wh(s, s);
    }
    /** Set center position */
    setCenter(x, y) {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }
    rebuild() {
        this._shape = RectContext.createRect(this._width, this._height, this._center);
    }
    static createRect(width, height, center) {
        const hw = width / 2;
        const hh = height / 2;
        return Shape.fromPoints([
            new Vector2(center.x - hw, center.y - hh),
            new Vector2(center.x + hw, center.y - hh),
            new Vector2(center.x + hw, center.y + hh),
            new Vector2(center.x - hw, center.y + hh),
        ]);
    }
}
/**
 * Square context (special case of rectangle).
 *
 * @example
 * ```typescript
 * const square = shape.square().size(40);
 * ```
 */
export class SquareContext extends RectContext {
    constructor(size = 10) {
        super(undefined, size, size);
    }
    /** Set square size */
    size(s) {
        return this.wh(s, s);
    }
}
/**
 * Hexagon context with radius.
 *
 * @example
 * ```typescript
 * const hex = shape.hexagon().radius(30);
 * ```
 */
export class HexagonContext extends ShapeContext {
    constructor() {
        // 6 segments, rotated 30° so flat edge is at bottom
        super(Shape.regularPolygon(6, 10, Vector2.zero(), Math.PI / 6));
        this._radius = 10;
        this._center = Vector2.zero();
    }
    /** Set hexagon radius */
    radius(r) {
        this._radius = r;
        this.rebuild();
        return this;
    }
    /** Set center position */
    setCenter(x, y) {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }
    rebuild() {
        this._shape = Shape.regularPolygon(6, this._radius, this._center, Math.PI / 6);
    }
}
/**
 * Triangle context with radius.
 *
 * @example
 * ```typescript
 * const tri = shape.triangle().radius(40);
 * ```
 */
export class TriangleContext extends ShapeContext {
    constructor() {
        // 3 segments, rotated so one vertex points up
        super(Shape.regularPolygon(3, 10, Vector2.zero(), -Math.PI / 2));
        this._radius = 10;
        this._center = Vector2.zero();
    }
    /** Set triangle radius */
    radius(r) {
        this._radius = r;
        this.rebuild();
        return this;
    }
    /** Set center position */
    setCenter(x, y) {
        this._center = new Vector2(x, y);
        this.rebuild();
        return this;
    }
    rebuild() {
        this._shape = Shape.regularPolygon(3, this._radius, this._center, -Math.PI / 2);
    }
}
