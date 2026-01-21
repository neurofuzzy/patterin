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
    type GridType = 'square' | 'hexagonal' | 'triangular';
    type TessellationPattern = 'truchet' | 'trihexagonal' | 'penrose' | 'custom';
    type TruchetVariant = 'quarter-circles' | 'diagonal' | 'triangles';
    type ColorZone = 'reds' | 'oranges' | 'yellows' | 'greens' | 'cyans' | 'blues' | 'purples' | 'magentas';
    type RenderMode = 'fill' | 'stroke' | 'glass';

    /** Sequence value - can be a number or another sequence */
    type SequenceValue = number | SequenceFunction;

    /** Sequence function that can be called to advance or accessed via .current property */
    interface SequenceFunction {
        /** Advances to the next value and returns it */
        (): number;
        /** Returns the current value without advancing */
        readonly current: number;
        /** Resets the sequence to its initial state */
        reset(): SequenceFunction;
        /** Peek at a value without advancing the sequence */
        peek(offset?: number): number;
    }

    /** Color palette generator */
    declare class Palette {
        constructor(count: number, ...zones: ColorZone[]);
        /** Increase saturation (default: 0.2) */
        vibrant(intensity?: number): this;
        /** Decrease saturation (default: 0.2) */
        muted(intensity?: number): this;
        /** Increase lightness for dark backgrounds (default: 0.3) */
        darkMode(intensity?: number): this;
        /** Decrease lightness for light backgrounds (default: 0.3) */
        lightMode(intensity?: number): this;
        /** Get palette as array of hex colors */
        toArray(): string[];
        /** Get palette as object with semantic names */
        toObject(): Record<string, string>;
        /** Generate CSS custom properties */
        toCss(prefix?: string): string;
        /** Convert palette to shuffled sequence */
        shuffle(): SequenceFunction;
        /** Convert palette to yoyo sequence (bounces back and forth) */
        yoyo(): SequenceFunction;
        /** Convert palette to random sequence (optional seed for determinism) */
        random(seed?: number): SequenceFunction;
        /** Get current color without advancing */
        readonly current: string;
        /** Peek at a color value without advancing */
        peek(offset?: number): string;
        /** Reset to first color */
        reset(): this;
        /** Advance to next color and return it */
        next(): string;
    }

    /** Sequence generator (uppercase class) */
    declare const Sequence: {
        /** Cycle through values indefinitely */
        repeat(...values: SequenceValue[]): SequenceFunction;
        /** Bounce back and forth through values */
        yoyo(...values: SequenceValue[]): SequenceFunction;
        /** Play once then stop at last value */
        once(...values: SequenceValue[]): SequenceFunction;
        /** Shuffled order (shuffles once at creation) */
        shuffle(...values: SequenceValue[]): SequenceFunction;
        /** Random with seed (reshuffles on cycle) */
        random(seed: number, ...values: SequenceValue[]): SequenceFunction;
        /** Random without seed */
        random(...values: SequenceValue[]): SequenceFunction;
        /** Running total of values */
        additive(...values: SequenceValue[]): SequenceFunction;
        /** Running product of values */
        multiplicative(...values: SequenceValue[]): SequenceFunction;
    };

    /** Grid system options */
    interface GridOptions {
        /** Grid type - square (default), hexagonal, or triangular */
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

    declare const palette: {
        /** Create a color palette */
        create(count: number, ...zones: ColorZone[]): Palette;
    };

    declare const sequence: {
        /** Cycle through values indefinitely */
        repeat(...values: SequenceValue[]): SequenceFunction;
        /** Bounce back and forth through values */
        yoyo(...values: SequenceValue[]): SequenceFunction;
        /** Play once then stop at last value */
        once(...values: SequenceValue[]): SequenceFunction;
        /** Shuffled order (shuffles once at creation) */
        shuffle(...values: SequenceValue[]): SequenceFunction;
        /** Random with seed (reshuffles on cycle) */
        random(seed: number, ...values: SequenceValue[]): SequenceFunction;
        /** Running total of values */
        additive(...values: SequenceValue[]): SequenceFunction;
        /** Running product of values */
        multiplicative(...values: SequenceValue[]): SequenceFunction;
    };

    declare const points: PointsContext;
    declare const lines: LinesContext;
    declare const shapes: ShapesContext;

    // Core JavaScript globals
    declare const Math: {
        readonly PI: number;
        readonly E: number;
        readonly LN2: number;
        readonly LN10: number;
        readonly LOG2E: number;
        readonly LOG10E: number;
        readonly SQRT2: number;
        readonly SQRT1_2: number;
        abs(x: number): number;
        acos(x: number): number;
        asin(x: number): number;
        atan(x: number): number;
        atan2(y: number, x: number): number;
        ceil(x: number): number;
        cos(x: number): number;
        exp(x: number): number;
        floor(x: number): number;
        log(x: number): number;
        max(...values: number[]): number;
        min(...values: number[]): number;
        pow(x: number, y: number): number;
        random(): number;
        round(x: number): number;
        sin(x: number): number;
        sqrt(x: number): number;
        tan(x: number): number;
        hypot(...values: number[]): number;
        sign(x: number): number;
        trunc(x: number): number;
    };

    declare const console: {
        log(...data: any[]): void;
        warn(...data: any[]): void;
        error(...data: any[]): void;
    };

    // Core Array methods are available via lib.es5.d.ts
    interface Array<T> {
        length: number;
        push(...items: T[]): number;
        pop(): T | undefined;
        shift(): T | undefined;
        unshift(...items: T[]): number;
        slice(start?: number, end?: number): T[];
        splice(start: number, deleteCount?: number, ...items: T[]): T[];
        concat(...items: (T | T[])[]): T[];
        join(separator?: string): string;
        indexOf(searchElement: T, fromIndex?: number): number;
        includes(searchElement: T, fromIndex?: number): boolean;
        find(predicate: (value: T, index: number, obj: T[]) => boolean): T | undefined;
        findIndex(predicate: (value: T, index: number, obj: T[]) => boolean): number;
        filter(predicate: (value: T, index: number, array: T[]) => boolean): T[];
        map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[];
        forEach(callbackfn: (value: T, index: number, array: T[]) => void): void;
        reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
        every(predicate: (value: T, index: number, array: T[]) => boolean): boolean;
        some(predicate: (value: T, index: number, array: T[]) => boolean): boolean;
        reverse(): T[];
        sort(compareFn?: (a: T, b: T) => number): T[];
        flat<D extends number = 1>(depth?: D): T[];
        flatMap<U>(callback: (value: T, index: number, array: T[]) => U | U[]): U[];
        fill(value: T, start?: number, end?: number): T[];
    }

    interface String {
        length: number;
        charAt(pos: number): string;
        charCodeAt(index: number): number;
        concat(...strings: string[]): string;
        indexOf(searchString: string, position?: number): number;
        lastIndexOf(searchString: string, position?: number): number;
        includes(searchString: string, position?: number): boolean;
        startsWith(searchString: string, position?: number): boolean;
        endsWith(searchString: string, endPosition?: number): boolean;
        slice(start?: number, end?: number): string;
        substring(start: number, end?: number): string;
        toLowerCase(): string;
        toUpperCase(): string;
        trim(): string;
        trimStart(): string;
        trimEnd(): string;
        split(separator: string | RegExp, limit?: number): string[];
        replace(searchValue: string | RegExp, replaceValue: string): string;
        repeat(count: number): string;
        padStart(maxLength: number, fillString?: string): string;
        padEnd(maxLength: number, fillString?: string): string;
    }

    interface Number {
        toFixed(fractionDigits?: number): string;
        toPrecision(precision?: number): string;
        toString(radix?: number): string;
    }

    interface Boolean {
        toString(): string;
    }
    `;

    return dts;
}
