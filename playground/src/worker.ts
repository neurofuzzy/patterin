/**
 * Web Worker for DSL Execution
 * Handles CPU-intensive pattern generation off the main thread.
 */

import * as patterin from 'patterin';

// Define message types
export type WorkerMessage = {
    type: 'execute';
    code: string;
};

export type WorkerResponse = {
    type: 'success';
    svg: string;
    stats: { shapes: number; segments: number } | null;
} | {
    type: 'error';
    error: string;
    line?: number;
    column?: number;
};

/**
 * Create auto-collecting shape factory.
 * Every shape created through this factory is tracked and auto-rendered.
 */
function createAutoCollectContext() {
    const createdShapes: patterin.ShapeContext[] = [];
    const createdSystems: (patterin.GridSystem | patterin.TessellationSystem | patterin.ShapeSystem)[] = [];

    // Wrap shape factory to track created shapes
    const autoShape = {
        circle: () => {
            const ctx = new patterin.CircleContext();
            createdShapes.push(ctx);
            return ctx;
        },
        rect: () => {
            const ctx = new patterin.RectContext();
            createdShapes.push(ctx);
            return ctx;
        },
        square: () => {
            const ctx = new patterin.SquareContext();
            createdShapes.push(ctx);
            return ctx;
        },
        hexagon: () => {
            const ctx = new patterin.HexagonContext();
            createdShapes.push(ctx);
            return ctx;
        },
        triangle: () => {
            const ctx = new patterin.TriangleContext();
            createdShapes.push(ctx);
            return ctx;
        },
    };

    // Wrap system factory to track created systems
    const autoSystem = {
        grid: (options: patterin.GridOptions) => {
            const sys = patterin.GridSystem.create(options);
            createdSystems.push(sys);
            return sys;
        },
        tessellation: (options: patterin.TessellationOptions) => {
            const sys = patterin.TessellationSystem.create(options);
            createdSystems.push(sys);
            return sys;
        },
        fromShape: (source: patterin.ShapeContext | patterin.Shape, options?: patterin.ShapeSystemOptions) => {
            const sys = new patterin.ShapeSystem(source, options);
            createdSystems.push(sys);
            return sys;
        },
        lsystem: (options: patterin.LSystemOptions) => {
            const sys = patterin.LSystem.create(options);
            createdSystems.push(sys);
            return sys;
        },
    };

    return { autoShape, autoSystem, createdShapes, createdSystems };
}

/**
 * Parse an error to extract line/column information
 */
function parseError(err: unknown): { message: string; line?: number; column?: number } {
    const message = err instanceof Error ? err.message : String(err);

    if (err instanceof Error && err.stack) {
        // Pattern 1: <anonymous>:LINE:COL (Chrome)
        const anonMatch = err.stack.match(/<anonymous>:(\d+):(\d+)/);
        if (anonMatch) {
            return {
                message,
                line: parseInt(anonMatch[1], 10),
                column: parseInt(anonMatch[2], 10),
            };
        }

        // Pattern 2: eval code:LINE:COL (Firefox)
        const evalCodeMatch = err.stack.match(/eval code:(\d+):(\d+)/);
        if (evalCodeMatch) {
            return {
                message,
                line: parseInt(evalCodeMatch[1], 10),
                column: parseInt(evalCodeMatch[2], 10),
            };
        }

        // Pattern 3: Function:LINE:COL
        const fnMatch = err.stack.match(/Function:(\d+):(\d+)/);
        if (fnMatch) {
            return {
                message,
                line: parseInt(fnMatch[1], 10),
                column: parseInt(fnMatch[2], 10),
            };
        }

        // Pattern 4: Just :LINE:COL anywhere (generic fallback)
        const genericMatch = err.stack.match(/:(\d+):(\d+)/);
        if (genericMatch) {
            const lineNum = parseInt(genericMatch[1], 10);
            // Sanity check - line numbers in user code should be reasonable
            if (lineNum > 0 && lineNum < 1000) {
                return {
                    message,
                    line: lineNum,
                    column: parseInt(genericMatch[2], 10),
                };
            }
        }
    }

    // Fallback: just the message, line 1
    return { message, line: 1 };
}

// Handle incoming messages
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const { type, code } = e.data;

    if (type === 'execute') {
        try {
            // Create fresh auto-collect context for this run
            const { autoShape, autoSystem, createdShapes, createdSystems } = createAutoCollectContext();

            // Create collector for this run
            const collector = new patterin.SVGCollector();

            // Track if render() was called explicitly
            let renderCalled = false;
            let resultSVG = '';
            let resultStats: { shapes: number; segments: number } | null = null;

            // Build sandbox context
            const sandboxContext = {
                ...patterin,
                shape: autoShape,    // Override shape with auto-collecting version
                system: autoSystem,  // Override system with auto-collecting version
                svg: collector,      // Provide collector as 'svg' for explicit use
                // Render function for explicit control
                render: (explicitCollector?: patterin.SVGCollector) => {
                    renderCalled = true;
                    const c = explicitCollector || collector;
                    resultSVG = (c as any).toString({
                        width: 400,
                        height: 400,
                        margin: 20,
                        autoScale: false
                    });
                    const stats = (c as any).stats;
                    if (stats) {
                        resultStats = { shapes: stats.shapes, segments: stats.segments };
                    }
                },
            };

            const paramNames = Object.keys(sandboxContext);
            const paramValues = Object.values(sandboxContext);

            const sandbox = new Function(...paramNames, code);
            sandbox(...paramValues);

            // Auto-render: if shapes or systems were created and render() wasn't called explicitly
            if ((createdShapes.length > 0 || createdSystems.length > 0) && !renderCalled) {
                // Stamp all created shapes to the collector
                for (const shapeCtx of createdShapes) {
                    if (typeof shapeCtx.stamp === 'function') {
                        shapeCtx.stamp(collector);
                    }
                }

                // Stamp all created systems to the collector
                for (const sys of createdSystems) {
                    if (typeof sys.stamp === 'function') {
                        sys.stamp(collector);
                    }
                }

                // Render the collector
                resultSVG = (collector as any).toString({
                    width: 400,
                    height: 400,
                    margin: 20,
                    autoScale: false
                });

                // Get stats
                const stats = (collector as any).stats;
                if (stats) {
                    resultStats = { shapes: stats.shapes, segments: stats.segments };
                }
            }

            // Send back result
            self.postMessage({
                type: 'success',
                svg: resultSVG,
                stats: resultStats
            } as WorkerResponse);
        } catch (err) {
            console.error('Worker execution error:', err);
            const parsed = parseError(err);
            self.postMessage({
                type: 'error',
                error: parsed.message,
                line: parsed.line,
                column: parsed.column
            } as WorkerResponse);
        }
    }
};
