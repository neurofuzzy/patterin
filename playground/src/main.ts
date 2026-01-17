/**
 * Patterin Playground - Main Entry Point
 */
import * as patterin from 'patterin';
import { Preview } from './components/Preview';

// Get DOM elements
const editorEl = document.getElementById('editor') as HTMLTextAreaElement;
const previewPane = document.getElementById('preview-pane') as HTMLDivElement;
const errorDisplay = document.getElementById('error-display') as HTMLDivElement;

// Initialize Preview component
const preview = new Preview({
    container: previewPane,
});

// Create sandbox context
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

function runCode(): void {
    const code = editorEl.value;

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

function debouncedRun(): void {
    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(runCode, 250);
}

// Run on input
editorEl.addEventListener('input', debouncedRun);

// Initial run
runCode();

// Log available exports
console.log('Patterin Playground loaded');
console.log('Available:', Object.keys(patterin));
