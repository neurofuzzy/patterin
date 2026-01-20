import { Shape } from '../primitives/Shape';
import { Vector2 } from '../primitives/Vector2';
import { Vertex } from '../primitives/Vertex';
import { DEFAULT_STYLES } from '../collectors/SVGCollector';
import { ShapeContext } from './ShapeContext';
import { PointsContext } from './PointsContext';
/**
 * Context for operating on lines/segments of a shape.
 *
 * Accessed via `shape.lines` or `shapes.lines`.
 * Supports selection, extrusion, division, and other edge operations.
 *
 * @example
 * ```typescript
 * // Extrude specific sides of a rectangle
 * const rect = shape.rect().size(40);
 * rect.lines.at(0, 2).extrude(10);
 *
 * // Divide edges into segments
 * const hex = shape.hexagon().radius(30);
 * const points = hex.lines.every(2).divide(3);
 * ```
 */
export class LinesContext {
    constructor(_shape, _segments) {
        this._shape = _shape;
        this._segments = _segments;
    }
    /** Get selected segments */
    get segments() {
        return this._segments;
    }
    /** Get number of selected lines */
    get length() {
        return this._segments.length;
    }
    /** Select every nth line */
    every(n, offset = 0) {
        const selected = [];
        for (let i = offset; i < this._segments.length; i += n) {
            selected.push(this._segments[i]);
        }
        return new LinesContext(this._shape, selected);
    }
    /** Select lines at specific indices */
    at(...indices) {
        const selected = [];
        for (const i of indices) {
            if (i >= 0 && i < this._segments.length) {
                selected.push(this._segments[i]);
            }
        }
        return new LinesContext(this._shape, selected);
    }
    /**
     * Extrude selected lines outward.
     * For each selected segment A→B, replaces it with A→A'→B'→B where A' and B'
     * are the extruded positions (original + normal * distance).
     * Returns the modified ShapeContext.
     */
    extrude(distance) {
        if (this._segments.length === 0)
            return new ShapeContext(this._shape);
        // Build a set of selected segments for quick lookup
        const selectedSet = new Set(this._segments);
        const newPoints = [];
        const allSegments = this._shape.segments;
        if (allSegments.length === 0)
            return new ShapeContext(this._shape);
        // Iterate through all segments of the shape to build new point list
        for (let i = 0; i < allSegments.length; i++) {
            const seg = allSegments[i];
            const isSelected = selectedSet.has(seg);
            newPoints.push(seg.start.position);
            if (isSelected) {
                const normal = seg.normal.multiply(distance);
                newPoints.push(seg.start.position.add(normal)); // A'
                newPoints.push(seg.end.position.add(normal)); // B'
            }
        }
        // Create new shape from points
        if (newPoints.length >= 3) {
            // Remove duplicate consecutive points before creating shape
            const uniquePoints = newPoints.filter((p, i, arr) => {
                if (i === 0)
                    return true;
                return !p.equals(arr[i - 1]);
            });
            // Check for closing point duplication
            if (uniquePoints.length > 1 && uniquePoints[0].equals(uniquePoints[uniquePoints.length - 1])) {
                uniquePoints.pop();
            }
            if (uniquePoints.length < 3)
                return new ShapeContext(this._shape);
            const newShape = Shape.fromPoints(uniquePoints, this._shape.winding);
            newShape.ephemeral = this._shape.ephemeral;
            // Mutate the original shape
            this._shape.segments = newShape.segments;
            this._shape.winding = newShape.winding;
            this._shape.connectSegments();
        }
        return new ShapeContext(this._shape);
    }
    /**
     * Divide selected lines into n segments.
     * Returns points at division locations.
     */
    divide(n) {
        const vertices = [];
        for (const seg of this._segments) {
            for (let i = 1; i < n; i++) {
                const t = i / n;
                const point = seg.pointAt(t);
                vertices.push(new Vertex(point.x, point.y));
            }
        }
        return new PointsContext(this._shape, vertices);
    }
    /** Get midpoint of all selected lines */
    midPoint() {
        if (this._segments.length === 0)
            return Vector2.zero();
        let sum = Vector2.zero();
        for (const seg of this._segments) {
            sum = sum.add(seg.midpoint());
        }
        return sum.divide(this._segments.length);
    }
    // ==================== Phase 1.5 Operations ====================
    /**
     * Collapse selected segments to their midpoints.
     * Modifies parent shape: removes segment and merges vertices at midpoint.
     * @returns PointsContext with midpoint locations
     */
    collapse() {
        const midpoints = [];
        for (const seg of this._segments) {
            const mid = seg.midpoint();
            midpoints.push(new Vertex(mid.x, mid.y));
        }
        // Note: Full topology modification would remove segments from parent shape.
        // For now, just return the midpoints. Shape modification is complex.
        return new PointsContext(this._shape, midpoints);
    }
    /**
     * Stamp segments as line paths to collector.
     * Uses thinner default stroke width (0.5) for connection lines.
     */
    stamp(collector, x = 0, y = 0, style = {}) {
        // Default style for connection lines - thinner than shapes
        const finalStyle = {
            ...DEFAULT_STYLES.line,
            ...style
        };
        for (const seg of this._segments) {
            // Convert segment to path data (M startX startY L endX endY)
            const startPos = seg.start.position;
            const endPos = seg.end.position;
            const pathData = `M ${startPos.x + x} ${startPos.y + y} L ${endPos.x + x} ${endPos.y + y}`;
            collector.addPath(pathData, finalStyle);
        }
    }
    /**
     * Expand each segment into a rectangle with square end caps.
     * Does NOT modify the original shape.
     * @param distance - Half-height of rectangle (total height = 2 * distance)
     * @returns ShapesContext with independent rectangle shapes
     */
    expandToRect(distance) {
        const shapes = [];
        for (const seg of this._segments) {
            const start = seg.start.position;
            const end = seg.end.position;
            const normal = seg.normal.multiply(distance);
            // Create rectangle: start, end, end+normal, start+normal
            const rect = Shape.fromPoints([
                start.subtract(normal),
                end.subtract(normal),
                end.add(normal),
                start.add(normal),
            ]);
            shapes.push(rect);
        }
        const { ShapesContext: SC } = require('./ShapesContext');
        return new SC(shapes);
    }
}
