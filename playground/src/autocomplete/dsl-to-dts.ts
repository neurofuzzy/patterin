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
    type GridOptions = { size?: number | [number, number]; count?: number | [number, number]; };
    type TessellationOptions = { size: number; };

    `;

    // 1. Generate Interfaces/Classes
    for (const [name, info] of Object.entries(API_DATA)) {
        if (name === 'shape') continue; // Skip the global object for now

        const typeKeyword = info.type === 'class' ? 'interface' : 'interface'; // Use interface for everything for simplicity
        const extendsClause = info.extends ? `extends ${info.extends}` : '';

        dts += `    ${typeKeyword} ${name} ${extendsClause} {\n`;

        // Static methods (if any)
        if (info.static) {
            // Note: In interfaces, static isn't really expressible this way but we can simulate exports later
        }

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
        tessellation(options: TessellationOptions): TessellationSystem;
        /** Create a system from a shape (vertices → nodes, segments → edges) */
        fromShape(source: ShapeContext | Shape, options?: ShapeSystemOptions): ShapeSystem;
    };

    declare const points: PointsContext;
    declare const lines: LinesContext;
    declare const shapes: ShapesContext;
    
    // Shape system options
    interface ShapeSystemOptions {
        /** Include center point as a node */
        includeCenter?: boolean;
        /** Subdivide edges into n parts */
        subdivide?: number;
    }
    `;

    return dts;
}
