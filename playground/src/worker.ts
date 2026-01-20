/**
 * Web Worker for DSL Execution
 * Handles CPU-intensive pattern generation off the main thread.
 */

import * as patterin from 'patterin';

// Define message types
export type WorkerMessage = {
    type: 'execute';
    code: string;
    autoRender?: boolean;
};

export type WorkerResponse = {
    type: 'success';
    svg: string;
    stats: { shapes: number; segments: number } | null;
    collectorData?: {
        paths: Array<{ d: string; style: any; group?: string }>;
        bounds: { minX: number; minY: number; maxX: number; maxY: number };
    };
} | {
    type: 'error';
    error: string;
    line?: number;
    column?: number;
};

/**
 * Create auto-collecting shape factory.
 * Every shape created through this factory is tracked and auto-rendered.
 * Uses Proxy wrappers to also track shapes returned by operations.
 */
function createAutoCollectContext() {
    // Registry for all shape contexts (both factory-created and operation-returned)
    const shapeRegistry = new Set<patterin.ShapeContext | patterin.ShapesContext>();
    
    // Track contexts that have been consumed by generative operations (don't render these)
    const consumedContexts = new WeakSet<patterin.ShapeContext | patterin.ShapesContext>();
    
    // Track systems whose subsets have been consumed (don't render these)
    const consumedSystems = new WeakSet<any>();

    /**
     * Wrap a sub-context (PointsContext, LinesContext) to track returned shapes
     * Note: Sub-contexts are accessed via .points or .lines on a ShapeContext,
     * so when they create new shapes, we DON'T mark the parent as consumed
     * because the sub-context operations are typically additive/generative by nature.
     */
    function wrapSubContext<T extends object>(ctx: T): T {
        return new Proxy(ctx, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                if (typeof value === 'function') {
                    return function (this: T, ...args: unknown[]) {
                        const result = value.apply(target, args);
                        // Track returned ShapeContext or ShapesContext
                        if (result instanceof patterin.ShapeContext) {
                            shapeRegistry.add(result);
                            return wrapShapeContext(result);
                        }
                        if (result instanceof patterin.ShapesContext) {
                            shapeRegistry.add(result);
                            return wrapShapesContext(result);
                        }
                        return result;
                    };
                }
                return value;
            }
        }) as T;
    }

    /**
     * Wrap ShapesContext to track it
     */
    function wrapShapesContext(ctx: patterin.ShapesContext): patterin.ShapesContext {
        return new Proxy(ctx, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                if (typeof value === 'function') {
                    return function (this: patterin.ShapesContext, ...args: unknown[]) {
                        const result = value.apply(target, args);
                        if (result instanceof patterin.ShapeContext) {
                            // Generative operation that returns a ShapeContext
                            // Mark the source as consumed
                            consumedContexts.add(target);
                            shapeRegistry.add(result);
                            return wrapShapeContext(result);
                        }
                        if (result instanceof patterin.ShapesContext) {
                            // If method returns a NEW context (not self), it's generative
                            if (result !== target) {
                                consumedContexts.add(target);
                            }
                            shapeRegistry.add(result);
                            return wrapShapesContext(result);
                        }
                        return result;
                    };
                }
                // Wrap property accessors
                if (value instanceof patterin.PointsContext || value instanceof patterin.LinesContext) {
                    return wrapSubContext(value);
                }
                return value;
            }
        });
    }

    /**
     * Wrap ShapeContext to track returned contexts from operations
     */
    function wrapShapeContext<T extends patterin.ShapeContext>(ctx: T): T {
        return new Proxy(ctx, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                if (typeof value === 'function') {
                    return function (this: T, ...args: unknown[]) {
                        const result = value.apply(target, args);
                        // Track returned ShapeContext or ShapesContext
                        if (result instanceof patterin.ShapeContext) {
                            // If method returns a NEW context (not self), it's generative
                            // Mark the source as consumed so we don't render it
                            if (result !== target) {
                                consumedContexts.add(target);
                            }
                            shapeRegistry.add(result);
                            return wrapShapeContext(result);
                        }
                        if (result instanceof patterin.ShapesContext) {
                            // Generative operation that returns multiple shapes
                            // Mark the source as consumed
                            consumedContexts.add(target);
                            shapeRegistry.add(result);
                            return wrapShapesContext(result);
                        }
                        // Track CloneSystem from clone() calls
                        if (result instanceof patterin.CloneSystem) {
                            // Clone is generative, mark source as consumed
                            consumedContexts.add(target);
                            createdSystems.push(result);
                            return wrapCloneSystem(result);
                        }
                        return result;
                    };
                }
                // Wrap property accessors like .points and .lines
                if (value instanceof patterin.PointsContext || value instanceof patterin.LinesContext) {
                    return wrapSubContext(value);
                }
                return value;
            }
        }) as T;
    }

    /**
     * Wrap a context returned from a System method.
     * LOGIC:
     * - If method returns THE SAME context (this), keep it wrapped but DO NOT add to registry 
     *   (it's a view/subset that the System already renders).
     * - If method returns a NEW context (generative), ADD to registry and wrap normally.
     * - DO NOT mark the parent system as consumed - the system should still render all its shapes.
     *   Only the subset context itself should be marked as consumed (handled elsewhere).
     */
    function wrapSystemReturnedContext<T extends object>(ctx: T, parentSystem?: any): T {
        return new Proxy(ctx, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                if (typeof value === 'function') {
                    return function (this: T, ...args: unknown[]) {
                        const result = value.apply(target, args);

                        // If chaining (returns itself), return this wrapper (still not in registry)
                        if (result === target) {
                            return wrapSystemReturnedContext(result, parentSystem);
                        }

                        // If it returns a NEW ShapeContext/ShapesContext, it's likely generative (offset)
                        // Track the NEW result (not the original subset)
                        if (result instanceof patterin.ShapeContext) {
                            // Mark the SOURCE (target) as consumed, NOT the parent system
                            consumedContexts.add(target as any);
                            shapeRegistry.add(result);
                            return wrapShapeContext(result);
                        }
                        if (result instanceof patterin.ShapesContext) {
                            // Mark the SOURCE (target) as consumed, NOT the parent system
                            consumedContexts.add(target as any);
                            shapeRegistry.add(result);
                            return wrapShapesContext(result);
                        }

                        return result;
                    };
                }
                // Wrap property accessors like .points and .lines
                if (value instanceof patterin.PointsContext || value instanceof patterin.LinesContext) {
                    return wrapSubContext(value);
                }
                return value;
            }
        }) as T;
    }

    /**
     * Wrap CloneSystem to track nested clone() calls
     */
    function wrapCloneSystem(sys: patterin.CloneSystem): patterin.CloneSystem {
        return new Proxy(sys, {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);
                if (typeof value === 'function') {
                    return function (this: patterin.CloneSystem, ...args: unknown[]) {
                        const result = value.apply(target, args);
                        // Track nested CloneSystem from clone() calls
                        if (result instanceof patterin.CloneSystem) {
                            createdSystems.push(result);
                            return wrapCloneSystem(result);
                        }
                        // Handle ShapeContext/ShapesContext returned from system methods (e.g. every, slice)
                        if (result instanceof patterin.ShapeContext || result instanceof patterin.ShapesContext) {
                            // Do NOT add to registry yet (avoid double render of system subsets)
                            // But wrap it so subsequent generative calls ARE tracked
                            return wrapSystemReturnedContext(result, target);
                        }
                        return result;
                    };
                }
                return value;
            }
        });
    }

    const createdSystems: (patterin.GridSystem | patterin.TessellationSystem | patterin.ShapeSystem | patterin.LSystem | patterin.CloneSystem)[] = [];

    // Wrap shape factory to track created shapes
    const autoShape = {
        circle: () => {
            const ctx = new patterin.CircleContext();
            shapeRegistry.add(ctx);
            return wrapShapeContext(ctx);
        },
        rect: () => {
            const ctx = new patterin.RectContext();
            shapeRegistry.add(ctx);
            return wrapShapeContext(ctx);
        },
        square: () => {
            const ctx = new patterin.SquareContext();
            shapeRegistry.add(ctx);
            return wrapShapeContext(ctx);
        },
        hexagon: () => {
            const ctx = new patterin.HexagonContext();
            shapeRegistry.add(ctx);
            return wrapShapeContext(ctx);
        },
        triangle: () => {
            const ctx = new patterin.TriangleContext();
            shapeRegistry.add(ctx);
            return wrapShapeContext(ctx);
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

    return { autoShape, autoSystem, shapeRegistry, createdSystems, consumedContexts, consumedSystems };
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
    const { type, code, autoRender = true } = e.data;

    if (type === 'execute') {
        try {
            // Create fresh auto-collect context for this run
            const { autoShape, autoSystem, shapeRegistry, createdSystems, consumedContexts, consumedSystems } = createAutoCollectContext();

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

            // Auto-render: if autoRender is enabled, shapes or systems were created, and render() wasn't called explicitly
            if (autoRender && (shapeRegistry.size > 0 || createdSystems.length > 0) && !renderCalled) {
                // Stamp all created systems to the collector (skip consumed systems)
                for (const sys of createdSystems) {
                    if (!consumedSystems.has(sys) && typeof sys.stamp === 'function') {
                        sys.stamp(collector);
                    }
                }

                // Stamp all registered shapes to the collector (skip consumed contexts)
                for (const shapeCtx of shapeRegistry) {
                    if (!consumedContexts.has(shapeCtx) && typeof shapeCtx.stamp === 'function') {
                        shapeCtx.stamp(collector);
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
            } else if (!renderCalled) {
                // render() was not called explicitly
                // Check if user manually stamped anything to the collector
                const collectorLength = (collector as any).length || 0;
                
                if (collectorLength > 0) {
                    // User manually stamped content - render it
                    resultSVG = (collector as any).toString({
                        width: 400,
                        height: 400,
                        margin: 20,
                        autoScale: false
                    });
                    const stats = (collector as any).stats;
                    if (stats) {
                        resultStats = { shapes: stats.shapes, segments: stats.segments };
                    }
                } else {
                    // Collector is empty and auto-render is OFF - clear preview
                    resultSVG = '';
                    resultStats = null;
                }
            }

            // Extract collector data for export
            let collectorData = undefined;
            if (resultSVG && collector) {
                const paths = (collector as any).paths || [];
                const bounds = {
                    minX: (collector as any).minX ?? 0,
                    minY: (collector as any).minY ?? 0,
                    maxX: (collector as any).maxX ?? 0,
                    maxY: (collector as any).maxY ?? 0,
                };
                collectorData = { paths, bounds };
            }

            // Send back result
            self.postMessage({
                type: 'success',
                svg: resultSVG,
                stats: resultStats,
                collectorData
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
