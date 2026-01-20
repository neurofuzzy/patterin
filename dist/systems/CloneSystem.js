/**
 * CloneSystem - Creates clones of shapes with offset positioning.
 * Supports nesting for grid patterns.
 */
import { Shape, Segment, Vector2, Vertex } from '../primitives';
import { DEFAULT_STYLES } from '../collectors/SVGCollector';
import { ShapesContext } from '../contexts';
import { BaseSystem } from './BaseSystem';
/**
 * CloneSystem implements ISystem for clone/spread operations.
 *
 * Source can be either:
 * - A Shape (from ShapeContext.clone())
 * - Another CloneSystem (for nested clones)
 *
 * When trace() is called, it computes node positions and path segments connecting them.
 */
export class CloneSystem extends BaseSystem {
    constructor(source, options) {
        super();
        // Computed geometry
        this._shapes = [];
        this._nodes = [];
        this._segments = [];
        this._source = source;
        this._options = options;
        this._ephemeral = false; // When true, this system won't render (it's been cloned)
        this._computeGeometry();
    }
    /**
     * Create a CloneSystem from a shape.
     */
    static fromShape(shape, count, offsetX = 0, offsetY = 0) {
        return new CloneSystem(shape, { count, offsetX, offsetY });
    }
    /**
     * Compute all shapes, nodes, and connection segments.
     */
    _computeGeometry() {
        const offset = new Vector2(this._options.offsetX, this._options.offsetY);
        const count = this._options.count;
        if (this._source instanceof Shape) {
            // Source is a single shape - create count+1 clones (original + n clones)
            for (let i = 0; i <= count; i++) {
                const clone = this._source.clone();
                clone.ephemeral = false; // Ensure clones are renderable
                clone.translate(offset.multiply(i));
                this._shapes.push(clone);
                // Node at center of each shape
                this._nodes.push(new Vertex(clone.centroid().x, clone.centroid().y));
            }
        }
        else {
            // Source is a CloneSystem - clone the ENTIRE system
            const sourceShapes = this._source.shapes;
            // Include original shapes (i=0) and n copies
            for (let i = 0; i <= count; i++) {
                for (const shape of sourceShapes.shapes) {
                    const clone = shape.clone();
                    clone.ephemeral = false; // Ensure clones are renderable
                    clone.translate(offset.multiply(i));
                    this._shapes.push(clone);
                    this._nodes.push(new Vertex(clone.centroid().x, clone.centroid().y));
                }
            }
        }
        // Create path segments connecting sequential nodes
        this._buildPathSegments();
    }
    /**
     * Build path segments connecting nodes in order.
     */
    _buildPathSegments() {
        if (this._source instanceof Shape) {
            // Simple linear path for shape-based clone
            for (let i = 0; i < this._nodes.length - 1; i++) {
                this._segments.push(new Segment(this._nodes[i], this._nodes[i + 1]));
            }
        }
        else {
            // For nested CloneSystem, create grid-like connections
            const sourceShapeCount = this._source.shapes.length;
            const copyCount = this._options.count + 1;
            // Connect within each copy (horizontal lines in grid)
            for (let copy = 0; copy < copyCount; copy++) {
                const baseIdx = copy * sourceShapeCount;
                for (let i = 0; i < sourceShapeCount - 1; i++) {
                    this._segments.push(new Segment(this._nodes[baseIdx + i], this._nodes[baseIdx + i + 1]));
                }
            }
            // Connect between copies (vertical lines in grid)
            for (let i = 0; i < sourceShapeCount; i++) {
                for (let copy = 0; copy < copyCount - 1; copy++) {
                    const fromIdx = copy * sourceShapeCount + i;
                    const toIdx = (copy + 1) * sourceShapeCount + i;
                    this._segments.push(new Segment(this._nodes[fromIdx], this._nodes[toIdx]));
                }
            }
        }
    }
    /**
     * Get number of shapes.
     */
    get length() {
        return this._shapes.length;
    }
    /**
     * Get nodes (centers of shapes) as vertices array.
     */
    get nodes() {
        return this._nodes;
    }
    /**
     * Get path segments connecting nodes.
     */
    get pathSegments() {
        return this._segments;
    }
    get shapes() {
        // Return actual shapes (not clones) so modifications affect this system
        return new ShapesContext(this._shapes);
    }
    /**
     * Make the system concrete (renderable).
     */
    trace() {
        this._traced = true;
        for (const shape of this._shapes) {
            shape.ephemeral = false;
        }
        return this;
    }
    /**
     * Clone this system n times with offset.
     * Returns a new nested CloneSystem.
     * Marks this system as ephemeral (won't render separately).
     */
    clone(n, x = 0, y = 0) {
        // Mark self as ephemeral - only the final nested system should render
        this._ephemeral = true;
        return new CloneSystem(this, { count: n, offsetX: x, offsetY: y });
    }
    /**
     * Spread shapes with linear offset between each.
     * @param x - Horizontal offset between each shape
     * @param y - Vertical offset between each shape
     * @returns This CloneSystem (modified in place)
     */
    spread(x, y) {
        const offset = new Vector2(x, y);
        for (let i = 0; i < this._shapes.length; i++) {
            this._shapes[i].translate(offset.multiply(i));
            // Update node position to match
            if (this._nodes[i]) {
                const center = this._shapes[i].centroid();
                this._nodes[i] = new Vertex(center.x, center.y);
            }
        }
        // Rebuild segments after moving shapes
        this._segments = [];
        this._buildPathSegments();
        return this;
    }
    /**
     * Select every nth shape for modification.
     * Returns a ShapesContext with selected shapes - modifications apply to them.
     * Non-selected shapes remain unchanged and are still rendered.
     * @returns ShapesContext with selected shapes
     */
    every(n, offset = 0) {
        const selected = [];
        for (let i = offset; i < this._shapes.length; i += n) {
            selected.push(this._shapes[i]);
        }
        // Return ShapesContext for modification - no ephemeral marking
        // All shapes (selected and non-selected) will still render via this system
        return new ShapesContext(selected);
    }
    /**
     * Select a range of shapes for modification.
     * @returns ShapesContext with selected shapes
     */
    slice(start, end) {
        const selected = this._shapes.slice(start, end);
        return new ShapesContext(selected);
    }
    /**
     * Distribute shapes radially around a circle.
     * @param radius - Distance from origin
     * @param arc - Optional angle range: undefined = 360°, number = 0 to angle, [start, end] = range
     * @returns This CloneSystem (modified in place)
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
            // Update node position to match
            if (this._nodes[i]) {
                this._nodes[i] = new Vertex(x, y);
            }
        }
        // Rebuild segments after moving shapes
        this._segments = [];
        this._buildPathSegments();
        return this;
    }
    // ==================== Transformation Methods (support sequences) ====================
    /**
     * Helper to resolve a value that might be a number or a SequenceFunction.
     */
    resolveValue(value) {
        return typeof value === 'function' && 'current' in value
            ? value() // Call sequence to advance and get next value
            : value; // Use number as-is
    }
    /**
     * Scale all shapes uniformly (supports sequences).
     * @param factor - Scale factor or sequence
     */
    scale(factor) {
        this.shapes.scale(factor);
        return this;
    }
    /**
     * Scale all shapes along X axis only (supports sequences).
     * @param factor - Scale factor or sequence
     */
    scaleX(factor) {
        this.shapes.scaleX(factor);
        return this;
    }
    /**
     * Scale all shapes along Y axis only (supports sequences).
     * @param factor - Scale factor or sequence
     */
    scaleY(factor) {
        this.shapes.scaleY(factor);
        return this;
    }
    /**
     * Rotate all shapes by angle in degrees (supports sequences).
     * @param angleDeg - Rotation angle in degrees or sequence
     */
    rotate(angleDeg) {
        this.shapes.rotate(angleDeg);
        return this;
    }
    /**
     * Translate all shapes by offset (supports sequences).
     * @param x - X offset or sequence
     * @param y - Y offset or sequence
     */
    translate(x, y) {
        this.shapes.translate(x, y);
        return this;
    }
    /**
     * Set x position for each shape (supports sequences).
     * @param xPos - X position or sequence
     */
    x(xPos) {
        this.shapes.x(xPos);
        return this;
    }
    /**
     * Set y position for each shape (supports sequences).
     * @param yPos - Y position or sequence
     */
    y(yPos) {
        this.shapes.y(yPos);
        return this;
    }
    // ==================== BaseSystem Implementation ====================
    getNodes() {
        return this._nodes;
    }
    filterByMask(shape) {
        // Filter shapes (by centroid)
        this._shapes = this._shapes.filter(s => shape.containsPoint(s.centroid()));
        // Filter nodes
        this._nodes = this._nodes.filter(n => shape.containsPoint(n.position));
        // Filter segments using base class helper
        this._segments = this.filterEdgesByMask(this._segments, shape);
    }
    scaleGeometry(factor) {
        for (const shape of this._shapes) {
            shape.scale(factor);
        }
        // Update nodes to match new centroids
        for (let i = 0; i < this._shapes.length; i++) {
            const c = this._shapes[i].centroid();
            this._nodes[i] = new Vertex(c.x, c.y);
        }
    }
    rotateGeometry(angleRad) {
        for (const shape of this._shapes) {
            shape.rotate(angleRad);
        }
    }
    stampGeometry(collector, style) {
        // Skip rendering if this system was cloned (ephemeral)
        if (this._ephemeral) {
            return;
        }
        const shapeStyle = style ?? DEFAULT_STYLES.shape;
        const pathStyle = style ?? DEFAULT_STYLES.line;
        // Stamp shapes
        collector.beginGroup('clone-shapes');
        for (const shape of this._shapes) {
            if (!shape.ephemeral) {
                collector.addShape(shape, shapeStyle);
            }
        }
        collector.endGroup();
        // Stamp path if traced
        if (this._traced && this._segments.length > 0) {
            collector.beginGroup('clone-path');
            // Stamp each segment as a line
            for (const seg of this._segments) {
                const pathData = `M ${seg.start.x} ${seg.start.y} L ${seg.end.x} ${seg.end.y}`;
                collector.addPath(pathData, pathStyle);
            }
            collector.endGroup();
        }
    }
    getGeometryRenderGroups() {
        if (this._ephemeral) {
            return [];
        }
        const shapeItems = this._shapes
            .filter(s => !s.ephemeral)
            .map(s => ({ shape: s, style: DEFAULT_STYLES.shape }));
        const pathItems = [];
        if (this._traced && this._segments.length > 0) {
            // Create a shape from segments for the path
            const pathShape = new Shape(this._segments, 'ccw');
            pathShape.open = true;
            pathItems.push({ shape: pathShape, style: DEFAULT_STYLES.line });
        }
        return [
            {
                name: 'clone-shapes',
                items: shapeItems,
                defaultStyle: DEFAULT_STYLES.shape
            },
            {
                name: 'clone-path',
                items: pathItems,
                defaultStyle: DEFAULT_STYLES.line
            }
        ];
    }
    getGeometryBounds() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for (const shape of this._shapes) {
            const bbox = shape.boundingBox();
            minX = Math.min(minX, bbox.min.x);
            minY = Math.min(minY, bbox.min.y);
            maxX = Math.max(maxX, bbox.max.x);
            maxY = Math.max(maxY, bbox.max.y);
        }
        return { minX, minY, maxX, maxY };
    }
    getSourceForSelection() {
        return this._shapes;
    }
}
