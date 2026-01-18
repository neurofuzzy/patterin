/**
 * Complete Patterin API Data Registry
 * 
 * This is the single source of truth for autocomplete, documentation,
 * and type information for the entire patterin DSL.
 */

export interface MethodInfo {
    params?: string[];
    returns: string;
    doc: string;
}

export interface GetterInfo {
    returns: string;
    doc: string;
}

export interface TypeInfo {
    type: 'object' | 'class';
    extends?: string;
    doc?: string;
    static?: Record<string, MethodInfo>;
    methods?: Record<string, MethodInfo>;
    getters?: Record<string, GetterInfo>;
}

/**
 * Complete API registry organized by type
 */
export const API_DATA: Record<string, TypeInfo> = {
    // ═══════════════════════════════════════════════════════════════════════════
    // ENTRY POINTS
    // ═══════════════════════════════════════════════════════════════════════════

    'shape': {
        type: 'object',
        doc: 'Shape factory - main entry point for creating shapes',
        methods: {
            'circle': { returns: 'CircleContext', doc: 'Create a circle' },
            'rect': { returns: 'RectContext', doc: 'Create a rectangle' },
            'square': { returns: 'SquareContext', doc: 'Create a square' },
            'hexagon': { returns: 'HexagonContext', doc: 'Create a hexagon' },
            'triangle': { returns: 'TriangleContext', doc: 'Create a triangle' },
        },
    },

    'system': {
        type: 'object',
        doc: 'System factory - entry point for creating grid and tessellation systems',
        methods: {
            'grid': { params: ['options: GridOptions'], returns: 'GridSystem', doc: 'Create a grid system' },
            'tessellation': { params: ['options: TessellationOptions'], returns: 'TessellationSystem', doc: 'Create a tessellation system' },
            'fromShape': { params: ['source: ShapeContext | Shape', 'options?: ShapeSystemOptions'], returns: 'ShapeSystem', doc: 'Create system from shape (vertices → nodes, segments → edges)' },
        },
    },


    // ═══════════════════════════════════════════════════════════════════════════
    // SHAPE CONTEXTS
    // ═══════════════════════════════════════════════════════════════════════════

    'ShapeContext': {
        type: 'class',
        doc: 'Base context for all shape operations',
        methods: {
            'shape': { returns: 'Shape', doc: 'Get underlying Shape primitive' },
            'center': { returns: 'Vector2', doc: 'Get centroid position' },
            'centroid': { returns: 'Vector2', doc: 'Get centroid position' },
            'centerPoint': { returns: 'Vector2', doc: 'Get center as Vector2' },
            'bbox': { returns: 'RectContext', doc: 'Get bounding box as RectContext' },
            'clone': { params: ['n: number'], returns: 'ShapesContext', doc: 'Clone shape n times' },
            'scale': { params: ['factor: number'], returns: 'this', doc: 'Scale by factor around center' },
            'rotate': { params: ['angle: number'], returns: 'this', doc: 'Rotate by angle in radians' },
            'rotateDeg': { params: ['degrees: number'], returns: 'this', doc: 'Rotate by angle in degrees' },
            'moveTo': { params: ['x: number', 'y: number'], returns: 'this', doc: 'Move center to position' },
            'offset': { params: ['x: number', 'y: number'], returns: 'this', doc: 'Translate by delta' },
            'translate': { params: ['x: number', 'y: number'], returns: 'this', doc: 'Translate by delta (alias for offset)' },
            'x': { params: ['xPos: number'], returns: 'this', doc: 'Set x position (moves centroid)' },
            'y': { params: ['yPos: number'], returns: 'this', doc: 'Set y position (moves centroid)' },
            'xy': { params: ['x: number', 'y: number'], returns: 'this', doc: 'Set x and y position (moves centroid)' },
            'reverse': { returns: 'this', doc: 'Reverse winding direction' },
            'trace': { returns: 'this', doc: 'Make shape concrete (renderable)' },
            'ephemeral': { returns: 'this', doc: 'Mark as construction geometry' },
            'stamp': { params: ['collector: SVGCollector', 'x?: number', 'y?: number', 'style?: PathStyle'], returns: 'void', doc: 'Render to SVG collector' },
            'explode': { returns: 'LinesContext', doc: 'Break into independent segments' },
            'collapse': { returns: 'PointContext', doc: 'Reduce to centroid point' },
            'offsetShape': { params: ['distance: number', 'miterLimit?: number'], returns: 'ShapeContext', doc: 'Inset/outset outline' },
        },
        getters: {
            'vertices': { returns: 'Vertex[]', doc: 'All vertices of the shape' },
            'segments': { returns: 'Segment[]', doc: 'All segments of the shape' },
            'winding': { returns: 'Winding', doc: 'Winding direction (CW or CCW)' },
            'points': { returns: 'PointsContext', doc: 'Access vertex operations' },
            'lines': { returns: 'LinesContext', doc: 'Access segment operations' },
        },
    },

    'CircleContext': {
        type: 'class',
        extends: 'ShapeContext',
        doc: 'Circle with radius and segments',
        methods: {
            'radius': { params: ['r: number'], returns: 'this', doc: 'Set circle radius' },
            'numSegments': { params: ['n: number'], returns: 'this', doc: 'Set number of segments' },
            'setCenter': { params: ['x: number', 'y: number'], returns: 'this', doc: 'Set center position' },
        },
    },

    'RectContext': {
        type: 'class',
        extends: 'ShapeContext',
        doc: 'Rectangle with width and height',
        methods: {
            'width': { params: ['w: number'], returns: 'this', doc: 'Set width' },
            'height': { params: ['h: number'], returns: 'this', doc: 'Set height' },
            'wh': { params: ['w: number', 'h: number'], returns: 'this', doc: 'Set width and height' },
            'size': { params: ['s: number'], returns: 'this', doc: 'Set both dimensions (square)' },
            'setCenter': { params: ['x: number', 'y: number'], returns: 'this', doc: 'Set center position' },
        },
    },

    'SquareContext': {
        type: 'class',
        extends: 'RectContext',
        doc: 'Square (equal width and height)',
        methods: {
            'size': { params: ['s: number'], returns: 'this', doc: 'Set size' },
        },
    },

    'HexagonContext': {
        type: 'class',
        extends: 'ShapeContext',
        doc: 'Regular hexagon',
        methods: {
            'radius': { params: ['r: number'], returns: 'this', doc: 'Set hexagon radius' },
            'setCenter': { params: ['x: number', 'y: number'], returns: 'this', doc: 'Set center position' },
        },
    },

    'TriangleContext': {
        type: 'class',
        extends: 'ShapeContext',
        doc: 'Equilateral triangle',
        methods: {
            'radius': { params: ['r: number'], returns: 'this', doc: 'Set triangle radius' },
            'setCenter': { params: ['x: number', 'y: number'], returns: 'this', doc: 'Set center position' },
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SELECTION CONTEXTS
    // ═══════════════════════════════════════════════════════════════════════════

    'PointsContext': {
        type: 'class',
        doc: 'Context for vertex/point operations',
        methods: {
            'every': { params: ['n: number', 'offset?: number'], returns: 'PointsContext', doc: 'Select every nth point' },
            'at': { params: ['...indices: number[]'], returns: 'PointsContext', doc: 'Select points at indices' },
            'expand': { params: ['distance: number'], returns: 'ShapeContext', doc: 'Push points outward along normals' },
            'inset': { params: ['distance: number'], returns: 'ShapeContext', doc: 'Pull points inward along normals' },
            'move': { params: ['x: number', 'y: number'], returns: 'PointsContext', doc: 'Translate selected points' },
            'midPoint': { returns: 'Vector2', doc: 'Get average position of selected points' },
            'bbox': { returns: 'BoundingBox', doc: 'Get bounding box of selected points' },
            'expandToCircles': { params: ['radius: number', 'segments?: number'], returns: 'ShapesContext', doc: 'Create circles at each point' },
            'raycast': { params: ['distance: number', "direction: number | 'outward' | 'inward'"], returns: 'PointsContext', doc: 'Cast rays from each point' },
        },
        getters: {
            'vertices': { returns: 'Vertex[]', doc: 'Selected vertices' },
            'length': { returns: 'number', doc: 'Number of selected points' },
        },
    },

    'LinesContext': {
        type: 'class',
        doc: 'Context for segment/line operations',
        methods: {
            'every': { params: ['n: number', 'offset?: number'], returns: 'LinesContext', doc: 'Select every nth line' },
            'at': { params: ['...indices: number[]'], returns: 'LinesContext', doc: 'Select lines at indices' },
            'extrude': { params: ['distance: number'], returns: 'ShapeContext', doc: 'Extrude lines outward' },
            'divide': { params: ['n: number'], returns: 'PointsContext', doc: 'Subdivide lines, return division points' },
            'midPoint': { returns: 'Vector2', doc: 'Get average midpoint of selected lines' },
            'collapse': { returns: 'PointsContext', doc: 'Reduce segments to midpoints' },
            'expandToRect': { params: ['distance: number'], returns: 'ShapesContext', doc: 'Create rectangles from segments' },
        },
        getters: {
            'segments': { returns: 'Segment[]', doc: 'Selected segments' },
            'length': { returns: 'number', doc: 'Number of selected lines' },
        },
    },

    'ShapesContext': {
        type: 'class',
        doc: 'Context for multiple shape operations',
        methods: {
            'every': { params: ['n: number', 'offset?: number'], returns: 'ShapesContext', doc: 'Select every nth shape' },
            'at': { params: ['...indices: number[]'], returns: 'ShapesContext', doc: 'Select shapes at indices' },
            'slice': { params: ['start: number', 'end?: number'], returns: 'ShapesContext', doc: 'Select range of shapes' },
            'spread': { params: ['x: number', 'y: number'], returns: 'ShapesContext', doc: 'Offset each shape incrementally' },
            'clone': { params: ['n: number'], returns: 'ShapesContext', doc: 'Clone each shape n times' },
            'trace': { returns: 'ShapesContext', doc: 'Make all shapes concrete' },
            'stamp': { params: ['collector: SVGCollector', 'x?: number', 'y?: number', 'style?: PathStyle'], returns: 'void', doc: 'Render all shapes' },
            'spreadPolar': { params: ['radius: number', 'arc?: number | [number, number]'], returns: 'this', doc: 'Distribute shapes radially' },
        },
        getters: {
            'shapes': { returns: 'Shape[]', doc: 'All shapes in context' },
            'length': { returns: 'number', doc: 'Number of shapes' },
            'points': { returns: 'PointsContext', doc: 'All vertices from all shapes' },
            'lines': { returns: 'LinesContext', doc: 'All segments from all shapes' },
        },
    },

    'PointContext': {
        type: 'class',
        doc: 'Single point context (from collapse)',
        methods: {
            'expand': { params: ['radius: number', 'segments?: number'], returns: 'Shape', doc: 'Expand to circle' },
            'raycast': { params: ['distance: number', "direction: number | 'outward' | 'inward'"], returns: 'PointContext', doc: 'Cast ray from point' },
        },
        getters: {
            'position': { returns: 'Vector2', doc: 'Point position' },
            'x': { returns: 'number', doc: 'X coordinate' },
            'y': { returns: 'number', doc: 'Y coordinate' },
            'isOrphan': { returns: 'boolean', doc: 'True if no parent shape' },
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SYSTEMS
    // ═══════════════════════════════════════════════════════════════════════════

    'GridSystem': {
        type: 'class',
        doc: 'Grid system for regular grid structures',
        static: {
            'create': { params: ['options: GridOptions'], returns: 'GridSystem', doc: 'Create a grid system' },
        },
        methods: {
            'trace': { returns: 'this', doc: 'Make grid cells concrete' },
            'nodes': { returns: 'GridPointsContext', doc: 'Get grid nodes' },
            'cells': { returns: 'GridShapesContext', doc: 'Get grid cells' },
            'rows': { returns: 'LinesContext', doc: 'Get horizontal row lines' },
            'columns': { returns: 'LinesContext', doc: 'Get vertical column lines' },
            'place': { params: ['shapeCtx: ShapeContext', 'style?: PathStyle'], returns: 'this', doc: 'Place shape at each node' },
            'addPlacement': { params: ['position: Vector2', 'shape: Shape', 'style?: PathStyle'], returns: 'void', doc: 'Add shape at position' },
            'getBounds': { returns: '{ minX, minY, maxX, maxY }', doc: 'Get grid bounds' },
            'toSVG': { params: ['options: { width, height, margin? }'], returns: 'string', doc: 'Render to SVG string' },
            'stamp': { params: ['collector: SVGCollector', 'style?: PathStyle'], returns: 'void', doc: 'Render system to collector' },
        },
    },

    'GridPointsContext': {
        type: 'class',
        extends: 'PointsContext',
        doc: 'Grid nodes with placement support',
        methods: {
            'place': { params: ['shapeCtx: ShapeContext', 'style?: PathStyle'], returns: 'this', doc: 'Place shape at each node' },
            'every': { params: ['n: number', 'offset?: number'], returns: 'GridPointsContext', doc: 'Select every nth node' },
            'at': { params: ['...indices: number[]'], returns: 'GridPointsContext', doc: 'Select nodes at indices' },
        },
    },

    'GridShapesContext': {
        type: 'class',
        extends: 'ShapesContext',
        doc: 'Grid cells with placement support',
        methods: {
            'place': { params: ['shapeCtx: ShapeContext', 'style?: PathStyle'], returns: 'this', doc: 'Place shape at each cell center' },
        },
    },

    'TessellationSystem': {
        type: 'class',
        doc: 'Tessellation system for algorithmic tiling patterns',
        static: {
            'create': { params: ['options: TessellationOptions'], returns: 'TessellationSystem', doc: 'Create a tessellation' },
        },
        methods: {
            'trace': { returns: 'this', doc: 'Make tiles concrete' },
            'tiles': { returns: 'ShapesContext', doc: 'Get all tiles' },
            'nodes': { returns: 'PointsContext', doc: 'Get all tile vertices' },
            'edges': { returns: 'LinesContext', doc: 'Get all tile edges' },
            'kites': { returns: 'ShapesContext', doc: 'Get Penrose kites' },
            'darts': { returns: 'ShapesContext', doc: 'Get Penrose darts' },
            'triangles': { returns: 'ShapesContext', doc: 'Get triangle tiles' },
            'hexagons': { returns: 'ShapesContext', doc: 'Get hexagon tiles' },
            'toSVG': { params: ['options: { width, height, margin? }'], returns: 'string', doc: 'Render to SVG string' },
            'stamp': { params: ['collector: SVGCollector', 'style?: PathStyle'], returns: 'void', doc: 'Render system to collector' },
        },
    },

    'ShapeSystem': {
        type: 'class',
        doc: 'System created from a shape - treats vertices as nodes and segments as edges',
        static: {
            'create': { params: ['source: ShapeContext | Shape', 'options?: ShapeSystemOptions'], returns: 'ShapeSystem', doc: 'Create a shape system' },
        },
        methods: {
            'trace': { returns: 'this', doc: 'Make system concrete' },
            'nodes': { returns: 'PointsContext', doc: 'Get all nodes (vertices)' },
            'edges': { returns: 'LinesContext', doc: 'Get all edges (segments)' },
            'center': { returns: 'PointContext | null', doc: 'Get center point (if includeCenter was set)' },
            'bbox': { returns: 'BoundingBox', doc: 'Get bounding box' },
            'place': { params: ['shapeCtx: ShapeContext', 'style?: PathStyle'], returns: 'this', doc: 'Place shape at each node' },
            'stamp': { params: ['collector: SVGCollector', 'style?: PathStyle'], returns: 'void', doc: 'Render to collector' },
            'toSVG': { params: ['options: { width, height, margin? }'], returns: 'string', doc: 'Render to SVG string' },
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // COLLECTORS
    // ═══════════════════════════════════════════════════════════════════════════

    'SVGCollector': {
        type: 'class',
        doc: 'Collects shapes and outputs SVG',
        methods: {
            'addShape': { params: ['shape: Shape', 'style?: PathStyle'], returns: 'void', doc: 'Add a shape' },
            'addPath': { params: ['d: string', 'style?: PathStyle'], returns: 'void', doc: 'Add raw path data' },
            'toString': { params: ['options?: { width?, height?, margin?, background? }'], returns: 'string', doc: 'Generate SVG string' },
            'clear': { returns: 'void', doc: 'Clear all paths' },
            'getBounds': { params: ['margin?: number'], returns: '{ x, y, width, height }', doc: 'Get computed bounds' },
        },
        getters: {
            'length': { returns: 'number', doc: 'Number of paths collected' },
        },
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // PRIMITIVES
    // ═══════════════════════════════════════════════════════════════════════════

    'Vector2': {
        type: 'class',
        doc: 'Immutable 2D vector',
        static: {
            'zero': { returns: 'Vector2', doc: 'Zero vector (0, 0)' },
            'one': { returns: 'Vector2', doc: 'Unit vector (1, 1)' },
            'up': { returns: 'Vector2', doc: 'Up vector (0, -1)' },
            'down': { returns: 'Vector2', doc: 'Down vector (0, 1)' },
            'left': { returns: 'Vector2', doc: 'Left vector (-1, 0)' },
            'right': { returns: 'Vector2', doc: 'Right vector (1, 0)' },
            'fromAngle': { params: ['angle: number'], returns: 'Vector2', doc: 'Create from angle in radians' },
        },
        methods: {
            'add': { params: ['other: Vector2'], returns: 'Vector2', doc: 'Add vectors' },
            'subtract': { params: ['other: Vector2'], returns: 'Vector2', doc: 'Subtract vectors' },
            'multiply': { params: ['scalar: number'], returns: 'Vector2', doc: 'Multiply by scalar' },
            'divide': { params: ['scalar: number'], returns: 'Vector2', doc: 'Divide by scalar' },
            'normalize': { returns: 'Vector2', doc: 'Normalize to unit length' },
            'dot': { params: ['other: Vector2'], returns: 'number', doc: 'Dot product' },
            'cross': { params: ['other: Vector2'], returns: 'number', doc: 'Cross product (z-component)' },
            'length': { returns: 'number', doc: 'Vector length' },
            'lengthSquared': { returns: 'number', doc: 'Squared length (faster)' },
            'angle': { returns: 'number', doc: 'Angle in radians from +x axis' },
            'distanceTo': { params: ['other: Vector2'], returns: 'number', doc: 'Distance to another point' },
            'rotate': { params: ['angle: number'], returns: 'Vector2', doc: 'Rotate by angle in radians' },
            'perpendicular': { returns: 'Vector2', doc: 'Perpendicular vector (90° CCW)' },
            'perpendicularCW': { returns: 'Vector2', doc: 'Perpendicular vector (90° CW)' },
            'lerp': { params: ['other: Vector2', 't: number'], returns: 'Vector2', doc: 'Linear interpolation' },
            'equals': { params: ['other: Vector2', 'epsilon?: number'], returns: 'boolean', doc: 'Check equality' },
            'negate': { returns: 'Vector2', doc: 'Negate vector' },
            'clone': { returns: 'Vector2', doc: 'Clone vector' },
            'toString': { returns: 'string', doc: 'String representation' },
        },
        getters: {
            'x': { returns: 'number', doc: 'X component' },
            'y': { returns: 'number', doc: 'Y component' },
        },
    },

    'Shape': {
        type: 'class',
        doc: 'Shape primitive with vertices and segments',
        static: {
            'fromPoints': { params: ['points: Vector2[]', 'winding?: Winding'], returns: 'Shape', doc: 'Create from point array' },
            'regularPolygon': { params: ['sides: number', 'radius: number', 'center?: Vector2', 'rotation?: number'], returns: 'Shape', doc: 'Create regular polygon' },
        },
        methods: {
            'centroid': { returns: 'Vector2', doc: 'Get centroid' },
            'boundingBox': { returns: 'BoundingBox', doc: 'Get bounding box' },
            'moveTo': { params: ['position: Vector2'], returns: 'void', doc: 'Move shape to position' },
            'scale': { params: ['factor: number', 'center?: Vector2'], returns: 'void', doc: 'Scale shape' },
            'rotate': { params: ['angle: number', 'center?: Vector2'], returns: 'void', doc: 'Rotate shape' },
            'toPathData': { returns: 'string', doc: 'Convert to SVG path data' },
            'connectSegments': { returns: 'void', doc: 'Reconnect segment chain' },
        },
        getters: {
            'vertices': { returns: 'Vertex[]', doc: 'All vertices' },
            'segments': { returns: 'Segment[]', doc: 'All segments' },
            'winding': { returns: 'Winding', doc: 'Winding direction' },
            'ephemeral': { returns: 'boolean', doc: 'Is construction geometry' },
        },
    },

    'Segment': {
        type: 'class',
        doc: 'Line segment between two vertices',
        methods: {
            'midpoint': { returns: 'Vector2', doc: 'Get segment midpoint' },
            'length': { returns: 'number', doc: 'Get segment length' },
            'direction': { returns: 'Vector2', doc: 'Get unit direction vector' },
            'divide': { params: ['n: number'], returns: 'Vector2[]', doc: 'Get n-1 division points' },
            'intersects': { params: ['other: Segment'], returns: 'Vector2 | null', doc: 'Get intersection point' },
            'closestPoint': { params: ['point: Vector2'], returns: 'Vector2', doc: 'Closest point on segment' },
            'distanceToPoint': { params: ['point: Vector2'], returns: 'number', doc: 'Distance to point' },
            'invalidateNormal': { returns: 'void', doc: 'Recompute normal' },
        },
        getters: {
            'start': { returns: 'Vertex', doc: 'Start vertex' },
            'end': { returns: 'Vertex', doc: 'End vertex' },
            'normal': { returns: 'Vector2', doc: 'Outward normal vector' },
        },
    },

    'Vertex': {
        type: 'class',
        doc: 'Shape vertex with position and connectivity',
        methods: {
            'moveAlongNormal': { params: ['distance: number'], returns: 'void', doc: 'Move along vertex normal' },
            'distanceTo': { params: ['other: Vertex'], returns: 'number', doc: 'Distance to another vertex' },
        },
        getters: {
            'position': { returns: 'Vector2', doc: 'Vertex position' },
            'x': { returns: 'number', doc: 'X coordinate' },
            'y': { returns: 'number', doc: 'Y coordinate' },
            'normal': { returns: 'Vector2', doc: 'Averaged outward normal' },
            'prev': { returns: 'Segment | undefined', doc: 'Previous segment' },
            'next': { returns: 'Segment | undefined', doc: 'Next segment' },
        },
    },
};

/**
 * Get all methods for a type, including inherited ones
 */
export function getAllMethods(typeName: string): Record<string, MethodInfo> {
    const typeInfo = API_DATA[typeName];
    if (!typeInfo) return {};

    let methods = { ...typeInfo.methods };

    // Include inherited methods
    if (typeInfo.extends) {
        const parentMethods = getAllMethods(typeInfo.extends);
        methods = { ...parentMethods, ...methods };
    }

    return methods;
}

/**
 * Get all getters for a type, including inherited ones
 */
export function getAllGetters(typeName: string): Record<string, GetterInfo> {
    const typeInfo = API_DATA[typeName];
    if (!typeInfo) return {};

    let getters = { ...typeInfo.getters };

    // Include inherited getters
    if (typeInfo.extends) {
        const parentGetters = getAllGetters(typeInfo.extends);
        getters = { ...parentGetters, ...getters };
    }

    return getters;
}

/**
 * Get return type of a method or getter
 */
export function getReturnType(typeName: string, memberName: string): string | null {
    const methods = getAllMethods(typeName);
    if (methods[memberName]) return methods[memberName].returns;

    const getters = getAllGetters(typeName);
    if (getters[memberName]) return getters[memberName].returns;

    const typeInfo = API_DATA[typeName];
    if (typeInfo?.static?.[memberName]) return typeInfo.static[memberName].returns;

    return null;
}
