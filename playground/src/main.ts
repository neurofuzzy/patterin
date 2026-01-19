/**
 * Patterin Playground - Main Entry Point
 */
import * as patterin from 'patterin';
import { Preview } from './components/Preview.ts';
import { MonacoEditor as Editor } from './components/MonacoEditor.ts';
import { Menu } from './components/Menu.ts';
import { Modal } from './components/Modal.ts';
import { initTheme } from './modals/ThemeModal.ts';
import { createExportModal } from './modals/ExportModal.ts';
import { getSettings } from './modals/SettingsModal.ts';
import { initKeyboardShortcuts } from './keyboard.ts';

// Initialize theme
initTheme();

// Load settings
const settings = getSettings();

// Get DOM elements
const editorContainer = document.querySelector('.editor-container') as HTMLDivElement;
const previewPane = document.getElementById('preview-pane') as HTMLDivElement;
const errorDisplay = document.getElementById('error-display') as HTMLDivElement;
const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement;

let lastCollector: patterin.SVGCollector | null = null;

// Forward declare export handler
const handleExport = () => {
    Modal.show({
        title: 'Export SVG',
        content: createExportModal(lastCollector),
    });
};

// Initialize Preview component
const preview = new Preview({
    container: previewPane,
    onExport: handleExport,
});

// Apply initial settings
preview.setGridVisible(settings.showGrid);
preview.setCenterMarkVisible(settings.showCenterMark ?? true);

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


function runCode(code: string): boolean {
    try {
        // Create fresh auto-collect context for this run
        const { autoShape, autoSystem, createdShapes, createdSystems } = createAutoCollectContext();

        // Create collector for this run
        const collector = new patterin.SVGCollector();

        // Track if render() was called explicitly
        let renderCalled = false;

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
                lastCollector = c;
                const svgString = (c as any).toString({
                    width: 400,
                    height: 400,
                    margin: 20,
                    autoScale: false
                });
                preview.setSVG(svgString);
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
            lastCollector = collector;
            const svgString = (collector as any).toString({
                width: 400,
                height: 400,
                margin: 20,
                autoScale: false
            });
            preview.setSVG(svgString);

            // Update stats
            const stats = (collector as any).stats;
            if (stats) {
                preview.setStats(stats.shapes, stats.segments);
            }
        }

        hideError();
        editor.clearDiagnostics();

        // Auto-save on successful compile
        editor.saveCode(code);

        return true;
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        showError(message);
        console.error('Code error:', err);

        // Try to extract line/column from error
        const diagnostic = parseError(err);
        editor.setDiagnostics([diagnostic]);

        return false;
    }
}

/**
 * Parse an error to extract line/column information
 */
function parseError(err: unknown): { message: string; line?: number; column?: number } {
    const message = err instanceof Error ? err.message : String(err);

    if (err instanceof Error && err.stack) {
        // Log for debugging
        console.debug('Error stack:', err.stack);

        // Different browsers format stacks differently:
        // Chrome: "    at eval (eval at runCode..., <anonymous>:2:5)"
        // Firefox: "@debugger eval code:2:5"
        // Safari: "eval code@[native code]" or similar

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

// Expose patterin globally for debugging
(window as unknown as Record<string, unknown>).patterin = patterin;

let debounceTimer: number;

function showError(message: string): void {
    errorDisplay.textContent = message;
    errorDisplay.classList.remove('hidden');
}

function hideError(): void {
    errorDisplay.classList.add('hidden');
}

function debouncedRun(code: string): void {
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => runCode(code), 250);
}

// Initialize CodeMirror Editor
const editor = new Editor({
    container: editorContainer,
    onChange: debouncedRun,
});

// Initialize Menu
new Menu({
    button: menuBtn,
    onExampleLoad: (code: string) => {
        editor.setCode(code);
        runCode(code);
        preview.resetView(); // Auto-fit when loading example
    },
});

// Initialize Keyboard Shortcuts
initKeyboardShortcuts({
    onExport: () => {
        Modal.show({
            title: 'Export SVG',
            content: createExportModal(lastCollector),
        });
    },
    onToggleGrid: () => {
        const gridBtn = document.querySelector('.preview-btn') as HTMLButtonElement;
        gridBtn?.click();
    },
    onResetView: () => {
        preview.resetView();
    },
});

// Initial run
runCode(editor.getCode());

// Log available exports
console.log('Patterin Playground loaded');
console.log('Available:', Object.keys(patterin));
console.log('Shortcuts: ⌘E Export, ⌘G Grid, ⌘0 Reset');
console.log('Auto-render: Just type shape.circle() and it appears!');
