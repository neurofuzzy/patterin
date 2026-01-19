import { Shape, Segment, Vector2, Vertex } from '../primitives';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector';
import { ShapeContext, PointsContext, LinesContext, ShapesContext } from '../contexts';
import { BaseSystem, type RenderGroup } from './BaseSystem';
import type { SystemBounds } from '../types';

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

export class LSystem extends BaseSystem {
    private _config: LSystemOptions;

    // Geometry storage
    private _segments: Segment[] = [];
    private _nodes: Vertex[] = [];
    private _endpoints: Vertex[] = [];

    // Contexts
    public segments: LinesContext;
    public nodes: PointsContext;
    public endpoints: PointsContext;
    public path: ShapeContext;

    // Underlying shape for the whole path
    private _shape: Shape;

    private constructor(config: LSystemOptions) {
        super();
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
        this.path = new ShapeContext(this._shape);
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
        return this;
    }

    // ==================== BaseSystem Implementation ====================

    protected getNodes(): Vertex[] {
        return this._nodes;
    }

    protected filterByMask(shape: Shape): void {
        // Filter nodes
        this._nodes = this._nodes.filter(node => shape.containsPoint(node.position));

        // Filter endpoints
        this._endpoints = this._endpoints.filter(node => shape.containsPoint(node.position));

        // Filter segments (midpoint inside)
        this._segments = this._segments.filter(seg => shape.containsPoint(seg.midpoint()));

        // Update shape segments
        this._shape.segments = this._segments;

        // Update contexts (recreate them with filtered data)
        this.nodes = new PointsContext(this._shape, this._nodes);
        this.endpoints = new PointsContext(this._shape, this._endpoints);
        this.segments = new LinesContext(this._shape, this._segments);
        this.path = new ShapeContext(this._shape);
    }

    protected scaleGeometry(factor: number): void {
        this._shape.scale(factor);
    }

    protected rotateGeometry(angleRad: number): void {
        this._shape.rotate(angleRad);
    }

    protected stampGeometry(collector: SVGCollector, style?: PathStyle): void {
        const shapeStyle = style ?? DEFAULT_STYLES.line;

        // Stamp the path if traced
        if (this._traced && !this._shape.ephemeral) {
            collector.beginGroup('lsystem-path');
            // Use PathContext's stamping logic for better path data optimization
            this.path.stamp(collector, 0, 0, shapeStyle);
            collector.endGroup();
        }
    }

    protected getGeometryRenderGroups(): RenderGroup[] {
        const pathItems: { shape: Shape; style?: PathStyle }[] = [];
        if (this._traced && !this._shape.ephemeral) {
            pathItems.push({ shape: this._shape, style: DEFAULT_STYLES.line });
        }

        return [
            {
                name: 'lsystem-path',
                items: pathItems,
                defaultStyle: DEFAULT_STYLES.line
            }
        ];
    }

    protected getGeometryBounds(): SystemBounds {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const node of this._nodes) {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x);
            maxY = Math.max(maxY, node.y);
        }

        return { minX, minY, maxX, maxY };
    }

    protected getSourceForSelection(): Shape[] {
        // For LSystem, when no placements exist, we don't have individual shapes
        // Return empty array
        return [];
    }
}
