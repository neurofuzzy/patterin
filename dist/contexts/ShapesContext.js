import { Shape } from '../primitives/Shape';
import { Vector2 } from '../primitives/Vector2';
import { DEFAULT_STYLES } from '../collectors/SVGCollector';
import { ShapeContext } from './ShapeContext';
import { PointsContext } from './PointsContext';
import { LinesContext } from './LinesContext';
/**
 * Context for operating on multiple shapes as a collection.
 *
 * Returned by generative operations (`offset` with count > 0), `.clone()`,
 * system methods, and when selecting subsets of shapes.
 *
 * Supports selection, bulk transformations, and collective operations.
 *
 * @example
 * ```typescript
 * // Create concentric circles
 * const rings = shape.circle()
 *   .radius(20)
 *   .offset(10, 5); // Returns ShapesContext with 5 rings
 *
 * // Transform every other shape
 * const grid = shape.rect()
 *   .clone(5, 30, 0)
 *   .clone(5, 0, 30);
 * grid.every(2).scale(1.5).rotate(45);
 *
 * // Select and transform subset
 * const subset = grid.slice(0, 10);
 * subset.translate(100, 0);
 * ```
 */
export class ShapesContext {
    constructor(_shapes) {
        this._shapes = _shapes;
    }
    /** Get all shapes */
    get shapes() {
        return this._shapes;
    }
    /** Get number of shapes */
    get length() {
        return this._shapes.length;
    }
    /**
     * Select every nth shape.
     *
     * @param n - Select every nth shape (1 = all, 2 = every other, etc.)
     * @param offset - Starting offset (default 0)
     * @returns A new ShapesContext with the selected shapes
     *
     * @example
     * ```typescript
     * // Transform alternating shapes in a grid
     * const grid = shape.square()
     *   .size(10)
     *   .clone(10, 20, 0)
     *   .clone(10, 0, 20);
     * grid.every(2).scale(2).rotate(45);
     * ```
     */
    every(n, offset = 0) {
        const selected = [];
        for (let i = offset; i < this._shapes.length; i += n) {
            selected.push(this._shapes[i]);
        }
        return new ShapesContext(selected);
    }
    /**
     * Select shapes at specific indices.
     *
     * @param indices - Zero-based indices of shapes to select
     * @returns A new ShapesContext with the selected shapes
     *
     * @example
     * ```typescript
     * // Scale first and last shape only
     * const shapes = shape.circle().radius(10).offset(5, 5);
     * shapes.at(0, 4).scale(2);
     * ```
     */
    at(...indices) {
        const selected = [];
        for (const i of indices) {
            if (i >= 0 && i < this._shapes.length) {
                selected.push(this._shapes[i]);
            }
        }
        return new ShapesContext(selected);
    }
    /**
     * Select a range of shapes (similar to Array.slice).
     *
     * @param start - Starting index (inclusive)
     * @param end - Ending index (exclusive), or undefined for all remaining
     * @returns A new ShapesContext with the selected range
     *
     * @example
     * ```typescript
     * const all = shape.rect().size(20).offset(5, 10);
     * const first5 = all.slice(0, 5);
     * const last5 = all.slice(5);
     * ```
     */
    slice(start, end) {
        return new ShapesContext(this._shapes.slice(start, end));
    }
    /**
     * Spread shapes by adding cumulative offset to each.
     *
     * @param x - Horizontal offset per shape
     * @param y - Vertical offset per shape
     * @returns This ShapesContext for chaining
     *
     * @example
     * ```typescript
     * // Create diagonal line of circles
     * const circles = shape.circle()
     *   .radius(10)
     *   .clone(5); // 6 circles at origin
     * circles.spread(30, 30); // Spread diagonally
     * ```
     */
    spread(x, y) {
        const offset = new Vector2(x, y);
        for (let i = 0; i < this._shapes.length; i++) {
            this._shapes[i].translate(offset.multiply(i));
        }
        return this;
    }
    /**
     * Clone the entire selection n times with optional offset.
     * Each copy of the ENTIRE selection is offset by (x*i, y*i).
     * Returns originals + (n * selection.length) new shapes.
     * @param n - Number of copies to create
     * @param x - Horizontal offset between each copy (default 0)
     * @param y - Vertical offset between each copy (default 0)
     */
    clone(n, x = 0, y = 0) {
        const offset = new Vector2(x, y);
        const newShapes = [...this._shapes]; // Include originals
        // Create n copies of the entire selection
        for (let copyNum = 1; copyNum <= n; copyNum++) {
            for (const shape of this._shapes) {
                const clone = shape.clone();
                clone.translate(offset.multiply(copyNum));
                newShapes.push(clone);
            }
        }
        return new ShapesContext(newShapes);
    }
    /** Get all points from all shapes */
    get points() {
        const allVertices = [];
        for (const shape of this._shapes) {
            allVertices.push(...shape.vertices);
        }
        // Use first shape as reference (may be empty)
        const refShape = this._shapes[0] ?? Shape.fromPoints([
            Vector2.zero(),
            new Vector2(1, 0),
            new Vector2(0, 1),
        ]);
        return new PointsContext(refShape, allVertices);
    }
    /** Get all lines from all shapes */
    get lines() {
        const allSegments = [];
        for (const shape of this._shapes) {
            allSegments.push(...shape.segments);
        }
        const refShape = this._shapes[0] ?? Shape.fromPoints([
            Vector2.zero(),
            new Vector2(1, 0),
            new Vector2(0, 1),
        ]);
        return new LinesContext(refShape, allSegments);
    }
    /** Make all shapes concrete */
    trace() {
        for (const shape of this._shapes) {
            shape.ephemeral = false;
        }
        return this;
    }
    /** Scale all shapes uniformly */
    scale(factor) {
        for (const shape of this._shapes) {
            shape.scale(factor);
        }
        return this;
    }
    /** Rotate all shapes by angle (degrees) */
    rotate(angleDeg) {
        const angleRad = angleDeg * Math.PI / 180;
        for (const shape of this._shapes) {
            shape.rotate(angleRad);
        }
        return this;
    }
    /** Translate all shapes by delta */
    translate(x, y) {
        const delta = new Vector2(x, y);
        for (const shape of this._shapes) {
            shape.translate(delta);
        }
        return this;
    }
    /**
     * Offset (inset/outset) all shape outlines.
     * @param distance - Offset distance
     * @param count - Number of copies per shape. 0 = in-place. >0 = returns offset copies.
     * @param miterLimit - Miter limit
     * @param includeOriginal - When count > 0, include original shapes in result (default false)
     */
    offset(distance, count = 0, miterLimit = 4, includeOriginal = false) {
        if (count > 0) {
            const newShapes = [];
            for (const shape of this._shapes) {
                if (includeOriginal) {
                    newShapes.push(shape); // Original
                }
                let current = shape;
                for (let i = 0; i < count; i++) {
                    const ctx = new ShapeContext(current);
                    const offsetCtx = ctx.offsetShape(distance, miterLimit);
                    newShapes.push(offsetCtx.shape);
                    current = offsetCtx.shape;
                }
            }
            return new ShapesContext(newShapes);
        }
        for (let i = 0; i < this._shapes.length; i++) {
            const shape = this._shapes[i];
            const ctx = new ShapeContext(shape);
            const offsetCtx = ctx.offsetShape(distance, miterLimit);
            // Copy offset geometry back to original shape
            shape.segments = offsetCtx.shape.segments;
            shape.winding = offsetCtx.shape.winding;
            shape.connectSegments();
        }
        return this;
    }
    /** Expand all shapes */
    expand(distance, count = 0, miterLimit = 4, includeOriginal = false) {
        return this.offset(Math.abs(distance), count, miterLimit, includeOriginal);
    }
    /** Inset all shapes */
    inset(distance, count = 0, miterLimit = 4) {
        return this.offset(-Math.abs(distance), count, miterLimit);
    }
    /** Move all shapes so their collective center is at position */
    moveTo(x, y) {
        const bounds = this.getBounds();
        const currentCenter = new Vector2((bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2);
        const delta = new Vector2(x, y).subtract(currentCenter);
        return this.translate(delta.x, delta.y);
    }
    /** Set x position of collective center */
    x(xPos) {
        const bounds = this.getBounds();
        const currentX = (bounds.minX + bounds.maxX) / 2;
        return this.translate(xPos - currentX, 0);
    }
    /** Set y position of collective center */
    y(yPos) {
        const bounds = this.getBounds();
        const currentY = (bounds.minY + bounds.maxY) / 2;
        return this.translate(0, yPos - currentY);
    }
    /** Set x and y position of collective center */
    xy(xPos, yPos) {
        return this.moveTo(xPos, yPos);
    }
    /** Get bounds of all shapes */
    getBounds() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for (const shape of this._shapes) {
            for (const v of shape.vertices) {
                minX = Math.min(minX, v.x);
                minY = Math.min(minY, v.y);
                maxX = Math.max(maxX, v.x);
                maxY = Math.max(maxY, v.y);
            }
        }
        return { minX, minY, maxX, maxY };
    }
    /** Get all vertices from all shapes (flattened) */
    get vertices() {
        const all = [];
        for (const shape of this._shapes) {
            all.push(...shape.vertices);
        }
        return all;
    }
    /** Get all segments from all shapes (flattened) */
    get segments() {
        const all = [];
        for (const shape of this._shapes) {
            all.push(...shape.segments);
        }
        return all;
    }
    /** Get center of all shapes */
    get center() {
        const bounds = this.getBounds();
        return new Vector2((bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2);
    }
    /** Stamp all shapes to collector */
    stamp(collector, x = 0, y = 0, style = {}) {
        // Default style
        const finalStyle = {
            ...DEFAULT_STYLES.shape,
            ...style
        };
        for (const shape of this._shapes) {
            if (shape.ephemeral)
                continue;
            const clone = shape.clone();
            if (x !== 0 || y !== 0) {
                clone.translate(new Vector2(x, y));
            }
            collector.addShape(clone, finalStyle);
        }
    }
    // ==================== Phase 1.5 Operations ====================
    /**
     * Distribute shapes radially around a circle.
     * @param radius - Distance from origin
     * @param arc - Optional angle range: undefined = 360°, number = 0 to angle, [start, end] = range
     * @returns This ShapesContext (modified in place)
     */
    spreadPolar(radius, arc) {
        let startAngle = 0;
        let endAngle = 360;
        if (arc !== undefined) {
            if (typeof arc === 'number') {
                endAngle = arc;
            }
            else {
                startAngle = arc[0];
                endAngle = arc[1];
            }
        }
        const angleRange = endAngle - startAngle;
        const n = this._shapes.length;
        // For full circle, don't put last shape on top of first
        const step = angleRange === 360
            ? angleRange / n
            : angleRange / Math.max(1, n - 1);
        for (let i = 0; i < n; i++) {
            const angleDeg = startAngle + step * i;
            const angleRad = angleDeg * Math.PI / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            this._shapes[i].moveTo(new Vector2(x, y));
        }
        return this;
    }
}
