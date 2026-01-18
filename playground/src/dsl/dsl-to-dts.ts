import { API_DATA } from './api-data';

/**
 * Generate a .d.ts string from the API registry.
 * This allows Monaco to provide intelligent autocomplete and type checking
 * for line 1 of the playground.
 */
export function generateDSLTypeDefinition(): string {
    let dts = `
    // Basic types
    type Winding = 'CW' | 'CCW';
    type PathStyle = { stroke?: string; fill?: string; strokeWidth?: number; };
    type GridType = 'square' | 'hexagonal' | 'triangular' | 'brick';
    type TessellationPattern = 'truchet' | 'trihexagonal' | 'penrose' | 'custom';
    type TruchetVariant = 'quarter-circles' | 'diagonal' | 'triangles';

    /** Grid system options */
    interface GridOptions {
        /** Grid type - square (default), hexagonal, triangular, or brick */
        type?: GridType;
        /** Simple: Grid count (rows x cols) - number or [rows, cols] */
        count?: number | [number, number];
        /** Simple: Cell size (spacing) - number or [x, y] */
        size?: number | [number, number];
        /** Detailed: Number of rows */
        rows?: number;
        /** Detailed: Number of columns */
        cols?: number;
        /** Detailed: Spacing - number or {x, y} */
        spacing?: number | { x: number; y: number };
        /** Grid offset as [x, y] */
        offset?: [number, number];
        /** Hexagonal orientation - pointy or flat */
        orientation?: 'pointy' | 'flat';
        /** Brick offset ratio (0-1, default 0.5) */
        brickOffset?: number;
    }

    /** Tessellation system options */
    interface TessellationOptions {
        /** Simple: Tile size (default 40) */
        size?: number;
        /** Pattern type - truchet (default), trihexagonal, penrose, or custom */
        pattern?: TessellationPattern;
        /** Bounds - { width, height } */
        bounds?: { width: number; height: number };
        /** Random seed for reproducible patterns */
        seed?: number;
        /** Truchet: Tile size (if different from size) */
        tileSize?: number;
        /** Truchet: Variant - quarter-circles, diagonal, or triangles */
        variant?: TruchetVariant;
        /** Trihexagonal: Spacing between tiles */
        spacing?: number;
        /** Penrose: Subdivision iterations (default 4) */
        iterations?: number;
    }

    /** Shape system options */
    interface ShapeSystemOptions {
        /** Include center point as a node */
        includeCenter?: boolean;
        /** Subdivide edges into n parts */
        subdivide?: number;
    }

    /** L-System options */
    interface LSystemOptions {
        /** Initial axiom string (e.g. "F+F+F+F") */
        axiom: string;
        /** Production rules (e.g. { "F": "F+F-F-F+F" }) */
        rules: Record<string, string>;
        /** Number of iterations */
        iterations: number;
        /** Turn angle in degrees */
        angle: number;
        /** Step length */
        length: number;
        /** Starting position [x, y] (default [0, 0]) */
        origin?: [number, number];
        /** Initial heading in degrees (default 0) */
        heading?: number;
    }

    /** Shared interface for drawable objects */
    interface IDrawable {
        /** Make object concrete (renderable) */
        trace(): this;
        /** Render to collector */
        stamp(collector: SVGCollector, style?: PathStyle): void;
    }

    /** System interface - all coordinate systems implement this */
    interface ISystem extends IDrawable {
        /** Place a shape at each node */
        place(shapeCtx: ShapeContext, style?: PathStyle): this;
        /** Clip system to mask shape boundary */
        mask(maskShape: ShapeContext): this;
        /** Generate SVG output */
        toSVG(options: { width: number; height: number; margin?: number }): string;
    }

    `;

    // 1. Generate Interfaces/Classes
    for (const [name, info] of Object.entries(API_DATA)) {
        if (name === 'shape' || name === 'system') continue; // Skip globals

        const typeKeyword = info.type === 'class' ? 'interface' : 'interface';
        const extendsClause = info.extends ? `extends ${info.extends}` : '';

        dts += `    ${typeKeyword} ${name} ${extendsClause} {\n`;

        // Getters
        if (info.getters) {
            for (const [prop, getter] of Object.entries(info.getters)) {
                dts += `        /** ${getter.doc} */\n`;
                dts += `        readonly ${prop}: ${getter.returns};\n`;
            }
        }

        // Methods
        if (info.methods) {
            for (const [method, methodInfo] of Object.entries(info.methods)) {
                const params = (methodInfo.params || []).join(', ');
                dts += `        /** ${methodInfo.doc} */\n`;
                dts += `        ${method}(${params}): ${methodInfo.returns};\n`;
            }
        }

        dts += `    }\n\n`;

        // Handle 'static' side of classes
        if (info.static) {
            dts += `    const ${name}: {\n`;
            for (const [method, methodInfo] of Object.entries(info.static)) {
                const params = (methodInfo.params || []).join(', ');
                dts += `        /** ${methodInfo.doc} */\n`;
                dts += `        ${method}(${params}): ${methodInfo.returns};\n`;
            }
            dts += `    };\n\n`;
        }
    }

    // 2. Generate Globals
    dts += `
    // Globals
    declare const shape: {
        /** Create a circle */
        circle(radius?: number): CircleContext;
        /** Create a rectangle */
        rect(width?: number, height?: number): RectContext;
        /** Create a square */
        square(size?: number): SquareContext;
        /** Create a hexagon */
        hexagon(radius?: number): HexagonContext;
        /** Create a triangle */
        triangle(radius?: number): TriangleContext;
    };

    declare const system: {
        /** Create a grid system */
        grid(options?: GridOptions): GridSystem;
        /** Create a tessellation system */
        tessellation(options?: TessellationOptions): TessellationSystem;
        /** Create a system from a shape (vertices → nodes, segments → edges) */
        fromShape(source: ShapeContext | Shape, options?: ShapeSystemOptions): ShapeSystem;
        /** Create an L-System */
        lsystem(options: LSystemOptions): LSystem;
    };

    declare const points: PointsContext;
    declare const lines: LinesContext;
    declare const shapes: ShapesContext;
    `;

    return dts;
}
