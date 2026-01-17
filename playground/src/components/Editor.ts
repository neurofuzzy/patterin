/**
 * Editor Component - CodeMirror 6 with Patterin autocomplete
 */
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { createAutocomplete } from '../autocomplete/completions';

export interface EditorOptions {
    container: HTMLElement;
    initialCode?: string;
    onChange?: (code: string) => void;
}

/**
 * GitHub Dark theme for CodeMirror
 */
const githubDarkTheme = EditorView.theme({
    '&': {
        backgroundColor: '#0d1117',
        color: '#e6edf3',
        height: '100%',
    },
    '.cm-content': {
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: '14px',
        lineHeight: '1.7',
        padding: '16px 0',
        caretColor: '#58a6ff',
    },
    '.cm-cursor': {
        borderLeftColor: '#58a6ff',
    },
    '.cm-activeLine': {
        backgroundColor: '#161b2277',
    },
    '.cm-selectionBackground': {
        backgroundColor: '#1f6feb44 !important',
    },
    '.cm-gutters': {
        backgroundColor: '#0d1117',
        color: '#484f58',
        border: 'none',
        paddingRight: '8px',
    },
    '.cm-activeLineGutter': {
        backgroundColor: '#161b22',
        color: '#e6edf3',
    },
    '.cm-lineNumbers .cm-gutterElement': {
        padding: '0 8px 0 16px',
    },
    // Syntax highlighting
    '.cm-keyword': { color: '#ff7b72' },
    '.cm-operator': { color: '#ff7b72' },
    '.cm-variableName': { color: '#e6edf3' },
    '.cm-propertyName': { color: '#d2a8ff' },
    '.cm-function': { color: '#d2a8ff' },
    '.cm-string': { color: '#a5d6ff' },
    '.cm-number': { color: '#79c0ff' },
    '.cm-comment': { color: '#8b949e' },
    '.cm-bracket': { color: '#e6edf3' },
    '.cm-punctuation': { color: '#e6edf3' },
    // Autocomplete
    '.cm-tooltip': {
        backgroundColor: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '6px',
        boxShadow: '0 8px 24px rgba(1,4,9,0.75)',
    },
    '.cm-tooltip-autocomplete': {
        '& > ul': {
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
        },
        '& > ul > li': {
            padding: '4px 8px',
        },
        '& > ul > li[aria-selected]': {
            backgroundColor: '#1f6feb',
            color: '#ffffff',
        },
    },
    '.cm-completionLabel': {
        color: '#e6edf3',
    },
    '.cm-completionDetail': {
        color: '#8b949e',
        fontStyle: 'normal',
        marginLeft: '8px',
    },
    '.cm-completionMatchedText': {
        color: '#58a6ff',
        fontWeight: 'bold',
        textDecoration: 'none',
    },
    // Scrollbar
    '.cm-scroller': {
        overflow: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#30363d #0d1117',
    },
}, { dark: true });

export class Editor {
    private view: EditorView;
    private onChange?: (code: string) => void;

    constructor(options: EditorOptions) {
        this.onChange = options.onChange;

        // Remove placeholder textarea if present
        const textarea = options.container.querySelector('textarea');
        const initialCode = options.initialCode || textarea?.value || '';
        if (textarea) {
            textarea.remove();
        }

        const state = EditorState.create({
            doc: initialCode,
            extensions: [
                basicSetup,
                javascript(),
                githubDarkTheme,
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

        this.view = new EditorView({
            state,
            parent: options.container,
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
