import * as monaco from 'monaco-editor';
import '../monaco-setup'; // Ensure workers are set up
import { getCurrentThemeId, ThemeId, createTheme } from '../editor-themes';
import { generateDSLTypeDefinition } from '../dsl/dsl-to-dts';
import { registerDSLLanguage, LANGUAGE_ID } from '../dsl/dsl-language';

// Register custom language definition
registerDSLLanguage();

const STORAGE_KEY = 'patterin-code';

// Inject DSL Types once
const dslTypes = generateDSLTypeDefinition();
monaco.languages.typescript.javascriptDefaults.addExtraLib(dslTypes, 'patterin-dsl.d.ts');

export interface EditorOptions {
    container: HTMLElement;
    initialCode?: string;
    onChange?: (code: string) => void;
    onError?: (error: string | null) => void;
}

// ----------------------------------------------------------------------------
// GHOST TEXT LOGIC (Monaco Style)
// ----------------------------------------------------------------------------

const COMPLETION_MAP: Record<string, string[]> = {
    'circle': ['radius', 'segments', 'points', 'lines', 'clone', 'stamp'],
    'rect': ['width', 'height', 'wh', 'size', 'points', 'lines', 'clone'],
    'square': ['size', 'points', 'lines', 'clone'],
    'hexagon': ['radius', 'points', 'lines', 'clone'],
    'triangle': ['radius', 'points', 'lines', 'clone'],
    'points': ['expand', 'inset', 'round', 'move', 'every', 'at', 'raycast', 'connectTo', 'expandToCircles'],
    'lines': ['extrude', 'divide', 'offset', 'every', 'at', 'collapse', 'expand'],
    'shapes': ['spread', 'spreadPolar', 'every', 'at', 'slice', 'stamp'],
    'shape': ['circle', 'rect', 'square', 'hexagon', 'triangle'],
};

function getContext(text: string): string | null {
    const cleaned = text
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/'[^']*'/g, '""')
        .replace(/"[^"]*"/g, '""');

    // Match word chain ending at cursor
    const match = cleaned.match(/(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)\.?$/);
    if (!match) return null;

    const chain = match[1];
    const parts = chain.split('.').map(p => p.replace(/\(.*\)/, ''));

    if (parts.length === 0) return null;
    const lastPart = parts[parts.length - 1];

    if (COMPLETION_MAP[lastPart]) return lastPart;
    if (lastPart === 'shape') return 'shape';
    if (chain.includes('points')) return 'points';
    if (chain.includes('lines')) return 'lines';

    if (parts.length > 1) {
        const prevPart = parts[parts.length - 2];
        if (COMPLETION_MAP[prevPart]) return prevPart;
        if (prevPart === 'shape') return lastPart;
    }
    return null;
}

// Register Inline Completions Provider
monaco.languages.registerInlineCompletionsProvider(LANGUAGE_ID, {
    provideInlineCompletions: function (model, position, _context, _token) {
        const textBefore = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });

        if (!/[\w.]$/.test(textBefore)) {
            return { items: [] };
        }

        let parentContext: string | null = null;
        let partial = '';

        if (textBefore.endsWith('.')) {
            parentContext = getContext(textBefore.slice(0, -1));
        } else {
            const lastDotIndex = textBefore.lastIndexOf('.');
            if (lastDotIndex !== -1) {
                parentContext = getContext(textBefore.slice(0, lastDotIndex));
                partial = textBefore.slice(lastDotIndex + 1);
            }
        }

        if (!parentContext || !COMPLETION_MAP[parentContext]) {
            return { items: [] };
        }

        const candidates = COMPLETION_MAP[parentContext];
        const match = candidates.find(c => c.startsWith(partial) && c !== partial);

        if (match) {
            const insertText = match.slice(partial.length);
            return {
                items: [{
                    insertText: insertText,
                    range: new monaco.Range(
                        position.lineNumber,
                        position.column,
                        position.lineNumber,
                        position.column + insertText.length
                    )
                }]
            };
        }

        return { items: [] };
    },
    disposeInlineCompletions(_completions) {
        // No cleanup needed
    }
});

// ----------------------------------------------------------------------------
// EDITOR COMPONENT
// ----------------------------------------------------------------------------

export class MonacoEditor {
    private editor: monaco.editor.IStandaloneCodeEditor;
    private container: HTMLElement;
    private onChange?: (code: string) => void;
    private saveTimer: number = 0;
    private currentTheme: ThemeId;

    constructor(options: EditorOptions) {
        this.container = options.container;
        this.onChange = options.onChange;
        this.currentTheme = getCurrentThemeId();

        // Cleanup existing elements
        const textarea = this.container.querySelector('textarea');
        const savedCode = this.loadCode();
        const initialCode = savedCode || options.initialCode || textarea?.value || '';

        if (textarea) textarea.remove();
        this.container.innerHTML = ''; // Clear container for Monaco

        // Create Editor
        this.editor = monaco.editor.create(this.container, {
            value: initialCode,
            language: LANGUAGE_ID,
            theme: this.mapTheme(this.currentTheme),
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Menlo, monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            roundedSelection: true,
            padding: { top: 10 },
            // Enable inline suggestions (Ghost Text)
            inlineSuggest: {
                enabled: true,
                mode: 'prefix'
            }
        });

        // Event Listeners
        this.editor.onDidChangeModelContent(() => {
            const code = this.editor.getValue();
            this.onChange?.(code);
        });

        this.setupThemeListener();
    }

    private loadCode(): string | null {
        try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
    }

    saveCode(code: string): void {
        clearTimeout(this.saveTimer);
        this.saveTimer = window.setTimeout(() => {
            try { localStorage.setItem(STORAGE_KEY, code); }
            catch (e) { console.warn('Failed to save code:', e); }
        }, 500);
    }

    private mapTheme(themeId: ThemeId): string {
        // Register the theme dynamically
        monaco.editor.defineTheme(themeId, createTheme(themeId));
        return themeId;
    }

    private setupThemeListener(): void {
        window.addEventListener('storage', (e) => {
            if (e.key === 'patterin-theme') this.setTheme(e.newValue as ThemeId);
        });
        window.addEventListener('patterin-theme-change', ((e: CustomEvent<ThemeId>) => {
            this.setTheme(e.detail);
        }) as EventListener);
    }

    setTheme(themeId: ThemeId): void {
        if (themeId === this.currentTheme) return;
        this.currentTheme = themeId;
        monaco.editor.setTheme(this.mapTheme(themeId));
    }

    setDiagnostics(diagnostics: { message: string; line?: number; column?: number; severity?: 'error' | 'warning' }[]): void {
        const markers: monaco.editor.IMarkerData[] = diagnostics.map(d => ({
            startLineNumber: d.line || 1,
            startColumn: d.column || 1,
            endLineNumber: d.line || 1,
            endColumn: (d.column || 1) + 10, // Approximate end if unknown
            message: d.message,
            severity: d.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning
        }));

        const model = this.editor.getModel();
        if (model) {
            monaco.editor.setModelMarkers(model, 'owner', markers);
        }
    }

    clearDiagnostics(): void {
        const model = this.editor.getModel();
        if (model) {
            monaco.editor.setModelMarkers(model, 'owner', []);
        }
    }

    getCode(): string { return this.editor.getValue(); }

    setCode(code: string): void {
        this.editor.setValue(code);
    }

    focus(): void { this.editor.focus(); }

    destroy(): void {
        this.editor.dispose();
    }
}
