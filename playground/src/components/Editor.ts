/**
 * Editor Component - CodeMirror 6 with Patterin autocomplete, theme switching, and linting
 */
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { linter, Diagnostic, lintGutter } from '@codemirror/lint';
import { createAutocomplete } from '../autocomplete/completions.ts';
import { createTheme, getCurrentThemeId, ThemeId } from '../editor-themes.ts';

const STORAGE_KEY = 'patterin-code';

export interface EditorOptions {
    container: HTMLElement;
    initialCode?: string;
    onChange?: (code: string) => void;
}

export class Editor {
    private view: EditorView;
    private container: HTMLElement;
    private onChange?: (code: string) => void;
    private themeCompartment: Compartment;
    private lintCompartment: Compartment;
    private currentTheme: ThemeId;
    private currentDiagnostics: Diagnostic[] = [];
    private saveTimer: number = 0;

    constructor(options: EditorOptions) {
        this.container = options.container;
        this.onChange = options.onChange;
        this.themeCompartment = new Compartment();
        this.lintCompartment = new Compartment();
        this.currentTheme = getCurrentThemeId();

        // Remove placeholder textarea if present
        const textarea = this.container.querySelector('textarea');

        // Load saved code or use initial/placeholder
        const savedCode = this.loadCode();
        const initialCode = savedCode || options.initialCode || textarea?.value || '';

        if (textarea) {
            textarea.remove();
        }

        this.view = this.createView(initialCode);

        // Listen for theme changes
        this.setupThemeListener();
    }

    /**
     * Load code from localStorage
     */
    private loadCode(): string | null {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }

    /**
     * Save code to localStorage (debounced, called on successful compile)
     */
    saveCode(code: string): void {
        clearTimeout(this.saveTimer);
        this.saveTimer = window.setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, code);
            } catch (e) {
                console.warn('Failed to save code to localStorage:', e);
            }
        }, 500);
    }

    private createView(doc: string): EditorView {
        const state = EditorState.create({
            doc,
            extensions: [
                basicSetup,
                javascript(),
                this.themeCompartment.of(createTheme(this.currentTheme)),
                createAutocomplete(),
                keymap.of([indentWithTab]),
                // Lint gutter for error icons
                lintGutter(),
                // Linter that uses externally-set diagnostics
                this.lintCompartment.of(linter(() => this.currentDiagnostics)),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        this.onChange?.(update.state.doc.toString());
                    }
                }),
                EditorView.lineWrapping,
            ],
        });

        return new EditorView({
            state,
            parent: this.container,
        });
    }

    private setupThemeListener(): void {
        // Listen for storage changes (theme is saved to localStorage)
        window.addEventListener('storage', (e) => {
            if (e.key === 'patterin-theme') {
                this.setTheme(e.newValue as ThemeId);
            }
        });

        // Also listen for custom theme change event
        window.addEventListener('patterin-theme-change', ((e: CustomEvent<ThemeId>) => {
            this.setTheme(e.detail);
        }) as EventListener);
    }

    /**
     * Change the editor theme
     */
    setTheme(themeId: ThemeId): void {
        if (themeId === this.currentTheme) return;

        this.currentTheme = themeId;
        this.view.dispatch({
            effects: this.themeCompartment.reconfigure(createTheme(themeId))
        });
    }

    /**
     * Set diagnostics (errors/warnings) to display in the editor
     */
    setDiagnostics(diagnostics: { message: string; line?: number; column?: number; severity?: 'error' | 'warning' }[]): void {
        const doc = this.view.state.doc;

        this.currentDiagnostics = diagnostics.map(d => {
            // Default to line 1 if not specified
            const line = Math.max(1, Math.min(d.line ?? 1, doc.lines));
            const lineInfo = doc.line(line);

            // Calculate position
            const from = lineInfo.from + Math.max(0, (d.column ?? 1) - 1);
            const to = lineInfo.to; // Underline to end of line

            return {
                from: Math.min(from, doc.length),
                to: Math.min(to, doc.length),
                severity: d.severity ?? 'error',
                message: d.message,
            };
        });

        // Trigger linter refresh
        this.view.dispatch({
            effects: this.lintCompartment.reconfigure(linter(() => this.currentDiagnostics))
        });
    }

    /**
     * Clear all diagnostics
     */
    clearDiagnostics(): void {
        this.currentDiagnostics = [];
        this.view.dispatch({
            effects: this.lintCompartment.reconfigure(linter(() => []))
        });
    }

    /**
     * Get current editor content
     */
    getCode(): string {
        return this.view.state.doc.toString();
    }

    /**
     * Set editor content
     */
    setCode(code: string): void {
        this.view.dispatch({
            changes: {
                from: 0,
                to: this.view.state.doc.length,
                insert: code,
            },
        });
    }

    /**
     * Focus the editor
     */
    focus(): void {
        this.view.focus();
    }

    /**
     * Destroy the editor
     */
    destroy(): void {
        this.view.destroy();
    }
}
