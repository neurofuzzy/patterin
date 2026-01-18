/**
 * CloneSystem - Creates clones of shapes with offset positioning.
 * Supports nesting for grid patterns.
 */

import { ISystem } from '../interfaces.ts';
import { Shape } from '../primitives/Shape.ts';
import { Vector2 } from '../primitives/Vector2.ts';
import { Vertex } from '../primitives/Vertex.ts';
import { Segment } from '../primitives/Segment.ts';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector.ts';
import { renderSystemToSVG } from './SystemUtils.ts';
import { ShapesContext } from '../contexts/ShapeContext.ts';

// Avoid circular import - use Shape directly
// ShapeContext is only used for place/mask ISystem methods
type ShapeContextLike = { shape: Shape };

export interface CloneOptions {
    count: number;
    offsetX: number;
    offsetY: number;
}

/**
 * CloneSystem implements ISystem for clone/spread operations.
 * 
 * Source can be either:
 * - A Shape (from ShapeContext.clone())
 * - Another CloneSystem (for nested clones)
 * 
 * When trace() is called, it computes node positions and path segments connecting them.
 */
export class CloneSystem implements ISystem {
    private _source: Shape | CloneSystem;
    private _options: CloneOptions;
    private _traced = false;
    private _ephemeral = false;  // When true, this system won't render (it's been cloned)

    // Computed geometry
    private _shapes: Shape[] = [];
    private _nodes: Vertex[] = [];
    private _segments: Segment[] = [];
    private _placements: { shape: Shape; style?: PathStyle; position: Vector2 }[] = [];

    constructor(source: Shape | CloneSystem, options: CloneOptions) {
        this._source = source;
        this._options = options;
        this._computeGeometry();
    }

    /**
     * Create a CloneSystem from a shape.
     */
    static fromShape(shape: Shape, count: number, offsetX: number = 0, offsetY: number = 0): CloneSystem {
        return new CloneSystem(shape, { count, offsetX, offsetY });
    }

    /**
     * Compute all shapes, nodes, and connection segments.
     */
    private _computeGeometry(): void {
        const offset = new Vector2(this._options.offsetX, this._options.offsetY);
        const count = this._options.count;

        if (this._source instanceof Shape) {
            // Source is a single shape - create count+1 clones (original + n clones)
            for (let i = 0; i <= count; i++) {
                const clone = this._source.clone();
                clone.ephemeral = false;  // Ensure clones are renderable
                clone.translate(offset.multiply(i));
                this._shapes.push(clone);

                // Node at center of each shape
                this._nodes.push(new Vertex(clone.centroid().x, clone.centroid().y));
            }
        } else {
            // Source is a CloneSystem - clone the ENTIRE system
            const sourceShapes = this._source.shapes;

            // Include original shapes (i=0) and n copies
            for (let i = 0; i <= count; i++) {
                for (const shape of sourceShapes.shapes) {
                    const clone = shape.clone();
                    clone.ephemeral = false;  // Ensure clones are renderable
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
    private _buildPathSegments(): void {
        if (this._source instanceof Shape) {
            // Simple linear path for shape-based clone
            for (let i = 0; i < this._nodes.length - 1; i++) {
                this._segments.push(new Segment(this._nodes[i], this._nodes[i + 1]));
            }
        } else {
            // For nested CloneSystem, create grid-like connections
            const sourceShapeCount = this._source.shapes.length;
            const copyCount = this._options.count + 1;

            // Connect within each copy (horizontal lines in grid)
            for (let copy = 0; copy < copyCount; copy++) {
                const baseIdx = copy * sourceShapeCount;
                for (let i = 0; i < sourceShapeCount - 1; i++) {
                    this._segments.push(new Segment(
                        this._nodes[baseIdx + i],
                        this._nodes[baseIdx + i + 1]
                    ));
                }
            }

            // Connect between copies (vertical lines in grid)
            for (let i = 0; i < sourceShapeCount; i++) {
                for (let copy = 0; copy < copyCount - 1; copy++) {
                    const fromIdx = copy * sourceShapeCount + i;
                    const toIdx = (copy + 1) * sourceShapeCount + i;
                    this._segments.push(new Segment(
                        this._nodes[fromIdx],
                        this._nodes[toIdx]
                    ));
                }
            }
        }
    }

    /**
     * Get number of shapes.
     */
    get length(): number {
        return this._shapes.length;
    }

    /**
     * Get nodes (centers of shapes) as vertices array.
     */
    get nodes(): Vertex[] {
        return this._nodes;
    }

    /**
     * Get path segments connecting nodes.
     */
    get pathSegments(): Segment[] {
        return this._segments;
    }

    get shapes(): ShapesContext {
        // Return actual shapes (not clones) so modifications affect this system
        return new ShapesContext(this._shapes);
    }

    /**
     * Make the system concrete (renderable).
     */
    trace(): this {
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
    clone(n: number, x: number = 0, y: number = 0): CloneSystem {
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
    spread(x: number, y: number): this {
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
     * Select every nth shape.
     * Marks non-selected shapes as ephemeral.
     * @returns New CloneSystem with selected shapes
     */
    every(n: number, offset = 0): CloneSystem {
        const selected: Shape[] = [];
        const selectedIndices = new Set<number>();

        for (let i = offset; i < this._shapes.length; i += n) {
            selected.push(this._shapes[i]);
            selectedIndices.add(i);
        }

        // Mark non-selected shapes as ephemeral
        for (let i = 0; i < this._shapes.length; i++) {
            if (!selectedIndices.has(i)) {
                this._shapes[i].ephemeral = true;
            }
        }

        // Create a new CloneSystem from selected shapes
        // Use count=0 to just wrap existing shapes without cloning
        const result = new CloneSystem(selected[0] ?? Shape.regularPolygon(3, 1), { count: 0, offsetX: 0, offsetY: 0 });
        result._shapes = selected;
        result._nodes = selected.map(s => {
            const c = s.centroid();
            return new Vertex(c.x, c.y);
        });
        result._buildPathSegments();
        return result;
    }

    /**
     * Scale all shapes uniformly.
     * @param factor - Scale factor
     * @returns This CloneSystem (modified in place)
     */
    scale(factor: number): this {
        for (const shape of this._shapes) {
            shape.scale(factor);
        }
        // Update nodes to match new centroids
        for (let i = 0; i < this._shapes.length; i++) {
            const c = this._shapes[i].centroid();
            this._nodes[i] = new Vertex(c.x, c.y);
        }
        return this;
    }

    /**
     * Rotate all shapes by angle.
     * @param angleDeg - Angle in degrees
     * @returns This CloneSystem (modified in place)
     */
    rotate(angleDeg: number): this {
        const angleRad = angleDeg * Math.PI / 180;
        for (const shape of this._shapes) {
            shape.rotate(angleRad);
        }
        return this;
    }

    /**
     * Select a range of shapes.
     * @returns New CloneSystem with selected shapes
     */
    slice(start: number, end?: number): CloneSystem {
        const selected = this._shapes.slice(start, end);

        const result = new CloneSystem(selected[0] ?? Shape.regularPolygon(3, 1), { count: 0, offsetX: 0, offsetY: 0 });
        result._shapes = selected;
        result._nodes = selected.map(s => {
            const c = s.centroid();
            return new Vertex(c.x, c.y);
        });
        result._buildPathSegments();
        return result;
    }

    /**
     * Distribute shapes radially around a circle.
     * @param radius - Distance from origin
     * @param arc - Optional angle range: undefined = 360°, number = 0 to angle, [start, end] = range
     * @returns This CloneSystem (modified in place)
     */
    spreadPolar(radius: number, arc?: number | [number, number]): this {
        let startAngle = 0;
        let endAngle = 360;

        if (arc !== undefined) {
            if (typeof arc === 'number') {
                endAngle = arc;
            } else {
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

    /**
     * Place a shape at each node in the system.
     */
    place(shapeCtx: ShapeContextLike, style?: PathStyle): this {
        const sourceShape = shapeCtx.shape;
        sourceShape.ephemeral = true;

        for (const node of this._nodes) {
            const clone = sourceShape.clone();
            clone.ephemeral = false;
            clone.moveTo(node.position);
            this._placements.push({
                shape: clone,
                style,
                position: node.position
            });
        }

        return this;
    }

    /**
     * Clip system to mask shape boundary.
     */
    mask(maskShape: ShapeContextLike): this {
        maskShape.shape.ephemeral = true;
        const shape = maskShape.shape;

        // Filter shapes (by centroid)
        this._shapes = this._shapes.filter(s => shape.containsPoint(s.centroid()));

        // Filter nodes
        this._nodes = this._nodes.filter(n => shape.containsPoint(n.position));

        // Filter placements
        this._placements = this._placements.filter(p => shape.containsPoint(p.position));

        // Rebuild segments based on remaining nodes
        this._segments = this._segments.filter(seg =>
            shape.containsPoint(seg.midpoint())
        );

        return this;
    }

    /**
     * Render the system to a collector.
     */
    stamp(collector: SVGCollector, style?: PathStyle): void {
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

        // Stamp placements
        if (this._placements.length > 0) {
            collector.beginGroup('clone-placements');
            for (const p of this._placements) {
                collector.addShape(p.shape, p.style ?? shapeStyle);
            }
            collector.endGroup();
        }
    }

    /**
     * Generate SVG output.
     */
    toSVG(options: { width: number; height: number; margin?: number }): string {
        const { width, height, margin = 10 } = options;

        const shapeItems = this._shapes
            .filter(s => !s.ephemeral)
            .map(s => ({ shape: s, style: DEFAULT_STYLES.shape }));

        const pathItems: { shape: Shape; style?: PathStyle }[] = [];
        if (this._traced && this._segments.length > 0) {
            // Create a shape from segments for the path
            const pathShape = new Shape(this._segments, 'ccw');
            pathShape.open = true;
            pathItems.push({ shape: pathShape, style: DEFAULT_STYLES.line });
        }

        const placementItems = this._placements.map(p => ({
            shape: p.shape,
            style: p.style
        }));

        return renderSystemToSVG(width, height, margin, [
            {
                name: 'clone-shapes',
                items: shapeItems,
                defaultStyle: DEFAULT_STYLES.shape
            },
            {
                name: 'clone-path',
                items: pathItems,
                defaultStyle: DEFAULT_STYLES.line
            },
            {
                name: 'clone-placements',
                items: placementItems,
                defaultStyle: DEFAULT_STYLES.placement
            }
        ]);
    }
}
