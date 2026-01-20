import { Shape, Segment, Vertex } from '../primitives';
import { DEFAULT_STYLES } from '../collectors/SVGCollector';
import { ShapeContext, PointsContext, LinesContext } from '../contexts';
import { BaseSystem } from './BaseSystem';
export class LSystem extends BaseSystem {
    constructor(config) {
        super();
        // Geometry storage
        this._segments = [];
        this._nodes = [];
        this._endpoints = [];
        this._config = {
            origin: [0, 0],
            heading: 0,
            ...config
        };
        // 1. Rewrite string
        const lstring = this.applyRules(this._config.axiom, this._config.rules, this._config.iterations);
        // 2. Interpret as turtle graphics
        const { segments, nodes, endpoints } = this.interpretTurtle(lstring, this._config.angle, this._config.length, this._config.origin, this._config.heading);
        this._segments = segments;
        this._nodes = nodes;
        this._endpoints = endpoints;
        // Create a single shape from segments (likely disconnected if 'f' used, but Shape supports list of segments)
        // Note: Shape usually expects a closed loop or connected segments, but we can just store them.
        this._shape = new Shape(this._segments, 'ccw');
        this._shape.ephemeral = true; // Default to ephemeral (construction lines)
        this._shape.open = true; // L-Systems usually produce open paths
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
    static create(config) {
        return new LSystem(config);
    }
    applyRules(axiom, rules, iterations) {
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
    interpretTurtle(lstring, angleDeg, len, origin, headingDeg) {
        const segments = [];
        const nodes = [];
        const endpoints = [];
        const stack = [];
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
                        const state = stack.pop();
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
        const distToStart = Math.sqrt(Math.pow(x - origin[0], 2) + Math.pow(y - origin[1], 2));
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
    trace() {
        this._traced = true;
        this._shape.ephemeral = false;
        return this;
    }
    // ==================== BaseSystem Implementation ====================
    getNodes() {
        return this._nodes;
    }
    filterByMask(shape) {
        // Filter nodes
        this._nodes = this._nodes.filter(node => shape.containsPoint(node.position));
        // Filter endpoints
        this._endpoints = this._endpoints.filter(node => shape.containsPoint(node.position));
        // Filter segments using base class helper
        this._segments = this.filterEdgesByMask(this._segments, shape);
        // Update shape segments
        this._shape.segments = this._segments;
        // Update contexts (recreate them with filtered data)
        this.nodes = new PointsContext(this._shape, this._nodes);
        this.endpoints = new PointsContext(this._shape, this._endpoints);
        this.segments = new LinesContext(this._shape, this._segments);
        this.path = new ShapeContext(this._shape);
    }
    scaleGeometry(factor) {
        this._shape.scale(factor);
    }
    rotateGeometry(angleRad) {
        this._shape.rotate(angleRad);
    }
    stampGeometry(collector, style) {
        const shapeStyle = style ?? DEFAULT_STYLES.line;
        // Stamp the path if traced
        if (this._traced && !this._shape.ephemeral) {
            collector.beginGroup('lsystem-path');
            // Use PathContext's stamping logic for better path data optimization
            this.path.stamp(collector, 0, 0, shapeStyle);
            collector.endGroup();
        }
    }
    getGeometryRenderGroups() {
        const pathItems = [];
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
    getGeometryBounds() {
        return this.boundsFromPositions(this._nodes);
    }
    getSourceForSelection() {
        // For LSystem, when no placements exist, we don't have individual shapes
        // Return empty array
        return [];
    }
}
