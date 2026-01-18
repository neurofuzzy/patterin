import { ISystem } from '../interfaces.ts';
import { Shape } from '../primitives/Shape.ts';
import { Vector2 } from '../primitives/Vector2.ts';
import { Vertex } from '../primitives/Vertex.ts';
import { Segment } from '../primitives/Segment.ts';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector.ts';
import { renderSystemToSVG } from './SystemUtils.ts';
import { ShapeContext, PointsContext, LinesContext, ShapesContext } from '../contexts/ShapeContext.ts';
import { PathContext } from '../contexts/PathContext.ts';

export interface LSystemOptions {
    axiom: string;
    rules: Record<string, string>;
    iterations: number;
    angle: number;
    length: number;
    origin?: [number, number];
    heading?: number;
}

interface TurtleState {
    x: number;
    y: number;
    dir: number;
}

export class LSystem implements ISystem {
    private _config: LSystemOptions;

    // Geometry storage
    private _segments: Segment[] = [];
    private _nodes: Vertex[] = [];
    private _endpoints: Vertex[] = [];

    // Contexts
    public segments: LinesContext;
    public nodes: PointsContext;
    public endpoints: PointsContext;
    public path: PathContext;

    // Output tracking
    private _traced = false;
    private _placements: { shape: Shape; style?: PathStyle; position: Vector2 }[] = [];

    // Underlying shape for the whole path
    private _shape: Shape;

    private constructor(config: LSystemOptions) {
        this._config = {
            origin: [0, 0],
            heading: 0,
            ...config
        };

        // 1. Rewrite string
        const lstring = this.applyRules(
            this._config.axiom,
            this._config.rules,
            this._config.iterations
        );

        // 2. Interpret as turtle graphics
        const { segments, nodes, endpoints } = this.interpretTurtle(
            lstring,
            this._config.angle,
            this._config.length,
            this._config.origin!,
            this._config.heading!
        );

        this._segments = segments;
        this._nodes = nodes;
        this._endpoints = endpoints;

        // Create a single shape from segments (likely disconnected if 'f' used, but Shape supports list of segments)
        // Note: Shape usually expects a closed loop or connected segments, but we can just store them.
        this._shape = new Shape(this._segments, 'ccw');
        this._shape.ephemeral = true; // Default to ephemeral (construction lines)
        this._shape.open = true;      // L-Systems usually produce open paths

        // 3. Create queryable contexts
        // Use a dummy shape for contexts that don't need the full path shape?
        // Actually, LinesContext usually wraps a Shape.
        this.segments = new LinesContext(this._shape, this._segments);

        // For nodes and endpoints, we need a shape reference.
        this.nodes = new PointsContext(this._shape, this._nodes);
        this.endpoints = new PointsContext(this._shape, this._endpoints);

        // Path context
        this.path = new PathContext(this._shape);
        this.path.ephemeral();
    }

    static create(config: LSystemOptions): LSystem {
        return new LSystem(config);
    }

    private applyRules(axiom: string, rules: Record<string, string>, iterations: number): string {
        let current = axiom;
        for (let i = 0; i < iterations; i++) {
            let next = '';
            for (const char of current) {
                next += rules[char] || char; // apply rule or keep char
            }
            current = next;
        }
        return current;
    }

    private interpretTurtle(
        lstring: string,
        angleDeg: number,
        len: number,
        origin: [number, number],
        headingDeg: number
    ): { segments: Segment[], nodes: Vertex[], endpoints: Vertex[] } {
        const segments: Segment[] = [];
        const nodes: Vertex[] = [];
        const endpoints: Vertex[] = [];
        const stack: TurtleState[] = [];

        let x = origin[0];
        let y = origin[1];
        // Convert to radians. 0 degrees = East/Right.
        // Spec: 0° = right, 90° = up. Standard math.
        let dir = headingDeg * Math.PI / 180;
        const angleRad = angleDeg * Math.PI / 180;

        // Record start node
        nodes.push(new Vertex(x, y));

        for (const char of lstring) {
            switch (char) {
                case 'F':
                case 'G': { // Draw forward
                    const newX = x + Math.cos(dir) * len;
                    const newY = y + Math.sin(dir) * len;

                    const startV = new Vertex(x, y);
                    const endV = new Vertex(newX, newY);

                    segments.push(new Segment(startV, endV));
                    nodes.push(endV);

                    x = newX;
                    y = newY;
                    break;
                }
                case 'f': { // Move forward (no draw)
                    x += Math.cos(dir) * len;
                    y += Math.sin(dir) * len;
                    nodes.push(new Vertex(x, y)); // Should we record nodes for moves? Spec says "Vertices where segments meet". Maybe just skipping?
                    // "Each forward (F) command creates a segment". "Verticies where segments meet".
                    // If we move, we might start a new segment elsewhere.
                    break;
                }
                case '+': // Turn right (spec says strictly +angle)
                    // Wait, standard turtle: + is usually right or left depending on convention.
                    // Spec: `+` | Turn right | Rotate by `+angle`
                    // In standard Cartesian (X right, Y up), +angle is Counter-Clockwise (Left).
                    // In screen coords (X right, Y down), +angle is Clockwise (Right).
                    // Patterin seems to use standard Cartesian (Y up)? 
                    // Let's check a file... Shape.ts uses standard math.
                    // "Rotate by +angle".
                    dir += angleRad;
                    break;
                case '-': // Turn left
                    dir -= angleRad;
                    break;
                case '|': // Turn around
                    dir += Math.PI;
                    break;
                case '[': // Push
                    stack.push({ x, y, dir });
                    break;
                case ']': // Pop
                    // Current position is an endpoint if we detect it?
                    // Spec: "Terminal points (dead ends)... endpoints.push(new Vertex(x, y))"
                    endpoints.push(new Vertex(x, y));

                    if (stack.length > 0) {
                        const state = stack.pop()!;
                        x = state.x;
                        y = state.y;
                        dir = state.dir;
                    }
                    break;
                default:
                    // Ignore other characters (A, B, X, Y, etc.)
                    break;
            }
        }

        // Add final connecting segment if path returns to start (within tolerance)
        // This fixes visual gaps in closed L-systems like Koch Snowflake
        const epsilon = len * 0.01; // 1% of step length tolerance
        const distToStart = Math.sqrt(
            Math.pow(x - origin[0], 2) + Math.pow(y - origin[1], 2)
        );

        if (distToStart < epsilon && distToStart > 0 && segments.length > 0) {
            // Add segment from final position back to start
            const finalV = new Vertex(x, y);
            const startV = new Vertex(origin[0], origin[1]);
            segments.push(new Segment(finalV, startV));
            nodes.push(startV);
        }

        // Final position is also an endpoint
        endpoints.push(new Vertex(x, y));

        return { segments, nodes, endpoints };
    }

    /**
     * Make the object concrete (renderable).
     */
    trace(): this {
        this._traced = true;
        this._shape.ephemeral = false;
        // Make contexts non-ephemeral if needed, but they just reference the shape
        // and have their own ephemeral flags usually defaulting to true?
        // ShapeContext.ts: trace() sets _shape.ephemeral = false.
        // Paths are ephemeral by default in spec.
        return this;
    }

    /**
     * Render the object to a collector.
     */
    stamp(collector: SVGCollector, style?: PathStyle): void {
        const shapeStyle = style ?? DEFAULT_STYLES.line;
        const placementStyle = style ?? DEFAULT_STYLES.placement;

        // Stamp the path if traced
        if (this._traced && !this._shape.ephemeral) {
            collector.beginGroup('lsystem-path');
            // Use PathContext's stamping logic for better path data optimization
            this.path.stamp(collector, 0, 0, shapeStyle);
            collector.endGroup();
        }

        // Stamp placements
        if (this._placements.length > 0) {
            collector.beginGroup('lsystem-placements');
            for (const p of this._placements) {
                collector.addShape(p.shape, p.style ?? placementStyle);
            }
            collector.endGroup();
        }
    }

    /**
     * Place a shape at each node in the system.
     */
    place(shapeCtx: ShapeContext, style?: PathStyle): this {
        // Place at all nodes by default
        for (const node of this._nodes) {
            const clone = shapeCtx.shape.clone();
            clone.ephemeral = false;
            clone.moveTo(node.position);
            this._placements.push({
                shape: clone,
                style,
                position: node.position
            });
        }

        // Mark source as ephemeral
        shapeCtx.shape.ephemeral = true;

        return this;
    }

    /**
     * Clip system to mask shape boundary.
     */
    mask(maskShape: ShapeContext): this {
        maskShape.shape.ephemeral = true;
        const shape = maskShape.shape;

        // Filter nodes
        this._nodes = this._nodes.filter(node => shape.containsPoint(node.position));

        // Filter endpoints
        this._endpoints = this._endpoints.filter(node => shape.containsPoint(node.position));

        // Filter placements
        this._placements = this._placements.filter(p => shape.containsPoint(p.position));

        // Filter segments (centroid inside)
        this._segments = this._segments.filter(seg => shape.containsPoint(seg.midpoint()));

        // Update shape segments
        this._shape.segments = this._segments;

        // Update contexts
        // Note: We need to update the internal arrays of the contexts
        // But the contexts were created with the INITIAL arrays.
        // We probably need to recreate contexts or Contexts should support updates.
        // PointsContext constructor takes `protected _vertices: Vertex[]`.
        // We can just construct new contexts, but the user might hold a reference to the old one.
        // Ideally contexts are just views.
        // For this version (Phase 1.8), I'll recreate the public properties.
        this.nodes = new PointsContext(this._shape, this._nodes);
        this.endpoints = new PointsContext(this._shape, this._endpoints);
        this.segments = new LinesContext(this._shape, this._segments);
        this.path = new PathContext(this._shape);

        return this;
    }

    get shapes(): ShapesContext {
        const shapes = this._placements.map((p) => p.shape.clone());
        return new ShapesContext(shapes);
    }

    /** Number of nodes/placements in the system */
    get length(): number {
        return this._placements.length > 0 ? this._placements.length : this._nodes.length;
    }

    // ==================== Selection ====================

    /**
     * Select every nth shape for modification.
     */
    every(n: number, offset = 0): ShapesContext {
        const source = this._placements.map(p => p.shape);

        const selected: Shape[] = [];
        for (let i = offset; i < source.length; i += n) {
            selected.push(source[i]);
        }
        return new ShapesContext(selected);
    }

    /**
     * Select a range of shapes for modification.
     */
    slice(start: number, end?: number): ShapesContext {
        const source = this._placements.map(p => p.shape);
        return new ShapesContext(source.slice(start, end));
    }

    // ==================== Transform ====================

    /**
     * Scale all shapes uniformly.
     */
    scale(factor: number): this {
        this._shape.scale(factor);
        for (const p of this._placements) {
            p.shape.scale(factor);
        }
        return this;
    }

    /**
     * Rotate all shapes by angle.
     */
    rotate(angleDeg: number): this {
        const angleRad = angleDeg * Math.PI / 180;
        this._shape.rotate(angleRad);
        for (const p of this._placements) {
            p.shape.rotate(angleRad);
        }
        return this;
    }

    /** Get bounding box of all geometry */
    getBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const node of this._nodes) {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x);
            maxY = Math.max(maxY, node.y);
        }

        for (const p of this._placements) {
            const bbox = p.shape.boundingBox();
            minX = Math.min(minX, bbox.min.x);
            minY = Math.min(minY, bbox.min.y);
            maxX = Math.max(maxX, bbox.max.x);
            maxY = Math.max(maxY, bbox.max.y);
        }

        return { minX, minY, maxX, maxY };
    }

    /**
     * Generate SVG output.
     */
    toSVG(options: { width: number; height: number; margin?: number }): string {
        const { width, height, margin = 10 } = options;

        const pathItems: { shape: Shape; style?: PathStyle }[] = [];
        if (this._traced && !this._shape.ephemeral) {
            pathItems.push({ shape: this._shape, style: DEFAULT_STYLES.line });
        }

        const placementItems = this._placements.map(p => ({
            shape: p.shape,
            style: p.style
        }));

        return renderSystemToSVG(width, height, margin, [
            {
                name: 'lsystem-path',
                items: pathItems,
                defaultStyle: DEFAULT_STYLES.line
            },
            {
                name: 'lsystem-placements',
                items: placementItems,
                defaultStyle: DEFAULT_STYLES.placement
            }
        ]);
    }
}
