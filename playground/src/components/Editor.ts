/**
 * Editor Component - CodeMirror 6 with Patterin autocomplete and theme switching
 */
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { createAutocomplete } from '../autocomplete/completions.ts';
import { createEditorTheme, getCurrentThemeId, ThemeId } from '../editor-themes.ts';

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
    private currentTheme: ThemeId;

    constructor(options: EditorOptions) {
        this.container = options.container;
        this.onChange = options.onChange;
        this.themeCompartment = new Compartment();
        this.currentTheme = getCurrentThemeId();

        // Remove placeholder textarea if present
        const textarea = this.container.querySelector('textarea');
        const initialCode = options.initialCode || textarea?.value || '';
        if (textarea) {
            textarea.remove();
        }

        this.view = this.createView(initialCode);

        // Listen for theme changes
        this.setupThemeListener();
    }

    private createView(doc: string): EditorView {
        const state = EditorState.create({
            doc,
            extensions: [
                basicSetup,
                javascript(),
                this.themeCompartment.of(createEditorTheme(this.currentTheme)),
                createAutocomplete(),
                keymap.of([indentWithTab]),
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
            effects: this.themeCompartment.reconfigure(createEditorTheme(themeId))
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
