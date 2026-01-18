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
import type { WorkerMessage, WorkerResponse } from './worker.ts';

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

// Worker management
const WORKER_TIMEOUT_MS = 5000;
let worker: Worker | null = null;
let workerTimeoutId: number | null = null;

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
 * Terminate current worker and clear timeout
 */
function terminateWorker() {
    if (workerTimeoutId !== null) {
        clearTimeout(workerTimeoutId);
        workerTimeoutId = null;
    }
    if (worker) {
        worker.terminate();
        worker = null;
    }
}

/**
 * Create worker and configure message handling
 */
function createWorker(): Worker {
    const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    return w;
}

/**
 * Run code via worker with timeout
 */
function runCode(code: string): void {
    // Terminate any existing worker
    terminateWorker();

    // Show loading state
    preview.setLoading(true);

    // Create new worker
    worker = createWorker();

    // Set timeout
    workerTimeoutId = window.setTimeout(() => {
        terminateWorker();
        preview.setLoading(false);
        showError(`Execution timeout (${WORKER_TIMEOUT_MS / 1000}s) - pattern too complex`);
        editor.setDiagnostics([{ message: 'Execution timeout - reduce complexity', line: 1 }]);
    }, WORKER_TIMEOUT_MS);

    // Handle worker messages
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        // Clear timeout since we got a response
        if (workerTimeoutId !== null) {
            clearTimeout(workerTimeoutId);
            workerTimeoutId = null;
        }
        preview.setLoading(false);

        const response = e.data;

        if (response.type === 'success') {
            if (response.svg) {
                preview.setSVG(response.svg);
                // Update lastCollector for export (create a minimal one from SVG)
                lastCollector = new patterin.SVGCollector();
                (lastCollector as any)._svgCache = response.svg;
            }
            if (response.stats) {
                preview.setStats(response.stats.shapes, response.stats.segments);
            }
            hideError();
            editor.clearDiagnostics();
            editor.saveCode(code);
        } else {
            showError(response.error);
            editor.setDiagnostics([{
                message: response.error,
                line: response.line,
                column: response.column
            }]);
        }
    };

    // Handle worker errors
    worker.onerror = (error) => {
        if (workerTimeoutId !== null) {
            clearTimeout(workerTimeoutId);
            workerTimeoutId = null;
        }
        preview.setLoading(false);
        showError(`Worker error: ${error.message}`);
        console.error('Worker error:', error);
    };

    // Send code to worker
    worker.postMessage({
        type: 'execute',
        code
    } as WorkerMessage);
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
    // Terminate any running worker when user starts typing again
    terminateWorker();
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
