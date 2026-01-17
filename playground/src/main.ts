/**
 * Patterin Playground - Main Entry Point
 */
import * as patterin from 'patterin';
import { Preview } from './components/Preview.ts';
import { Editor } from './components/Editor.ts';
import { Menu } from './components/Menu.ts';
import { initTheme } from './modals/ThemeModal.ts';

// Initialize theme
initTheme();

// Get DOM elements
const editorContainer = document.querySelector('.editor-container') as HTMLDivElement;
const previewPane = document.getElementById('preview-pane') as HTMLDivElement;
const errorDisplay = document.getElementById('error-display') as HTMLDivElement;
const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement;

// Initialize Preview component
const preview = new Preview({
    container: previewPane,
});

// Create sandbox context with all patterin exports + render helper
const sandboxContext = {
    ...patterin,
    render: (collector: patterin.SVGCollector) => {
        const svgString = collector.toString({
            width: 400,
            height: 400,
            margin: 20
        });
        preview.setSVG(svgString);
    },
};

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

function runCode(code: string): void {
    try {
        // Create sandbox function with all patterin exports + render helper
        const paramNames = Object.keys(sandboxContext);
        const paramValues = Object.values(sandboxContext);

        const sandbox = new Function(...paramNames, code);
        sandbox(...paramValues);

        hideError();
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        showError(message);
        console.error('Code error:', err);
    }
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
    },
});

// Initial run
runCode(editor.getCode());

// Log available exports
console.log('Patterin Playground loaded');
console.log('Available:', Object.keys(patterin));
console.log('Tip: Type "shape." to see autocomplete, or click ≡ for examples');
