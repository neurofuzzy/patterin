/**
 * Editor Themes - Color definitions for CodeMirror
 */
import { EditorView } from '@codemirror/view';

export type ThemeId = 'github-dark' | 'nord' | 'tokyo-night';

interface ThemeColors {
    // Background
    bgPrimary: string;
    bgTertiary: string;

    // Text
    textPrimary: string;
    textMuted: string;

    // Accent
    accent: string;
    accentMuted: string;

    // Syntax
    keyword: string;
    string: string;
    number: string;
    method: string;
    comment: string;

    // UI
    border: string;
    selection: string;
    activeLine: string;
}

const THEME_COLORS: Record<ThemeId, ThemeColors> = {
    'github-dark': {
        bgPrimary: '#0d1117',
        bgTertiary: '#161b22',
        textPrimary: '#e6edf3',
        textMuted: '#6e7681',
        accent: '#58a6ff',
        accentMuted: 'rgba(56, 139, 253, 0.3)',
        keyword: '#ff7b72',
        string: '#a5d6ff',
        number: '#79c0ff',
        method: '#d2a8ff',
        comment: '#8b949e',
        border: '#30363d',
        selection: 'rgba(56, 139, 253, 0.3)',
        activeLine: 'rgba(56, 139, 253, 0.1)',
    },
    'nord': {
        bgPrimary: '#2e3440',
        bgTertiary: '#3b4252',
        textPrimary: '#eceff4',
        textMuted: '#616e88',
        accent: '#88c0d0',
        accentMuted: 'rgba(136, 192, 208, 0.3)',
        keyword: '#81a1c1',
        string: '#a3be8c',
        number: '#b48ead',
        method: '#88c0d0',
        comment: '#616e88',
        border: '#434c5e',
        selection: 'rgba(136, 192, 208, 0.3)',
        activeLine: 'rgba(136, 192, 208, 0.1)',
    },
    'tokyo-night': {
        bgPrimary: '#1a1b26',
        bgTertiary: '#24283b',
        textPrimary: '#c0caf5',
        textMuted: '#565f89',
        accent: '#7dcfff',
        accentMuted: 'rgba(125, 207, 255, 0.3)',
        keyword: '#bb9af7',
        string: '#9ece6a',
        number: '#ff9e64',
        method: '#7dcfff',
        comment: '#565f89',
        border: '#414868',
        selection: 'rgba(125, 207, 255, 0.3)',
        activeLine: 'rgba(125, 207, 255, 0.1)',
    },
};

/**
 * Create a CodeMirror theme extension for the given theme ID
 */
export function createEditorTheme(themeId: ThemeId) {
    const c = THEME_COLORS[themeId];

    return EditorView.theme({
        '&': {
            backgroundColor: c.bgPrimary,
            color: c.textPrimary,
            height: '100%',
        },
        '.cm-content': {
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '14px',
            lineHeight: '1.7',
            padding: '16px 0',
            caretColor: c.accent,
        },
        '.cm-cursor': {
            borderLeftColor: c.accent,
            borderLeftWidth: '2px',
        },
        '.cm-activeLine': {
            backgroundColor: c.activeLine,
        },
        '.cm-selectionBackground': {
            backgroundColor: `${c.selection} !important`,
        },
        '.cm-gutters': {
            backgroundColor: c.bgPrimary,
            color: c.textMuted,
            border: 'none',
            paddingRight: '8px',
        },
        '.cm-activeLineGutter': {
            backgroundColor: c.activeLine,
            color: c.textPrimary,
        },
        '.cm-lineNumbers .cm-gutterElement': {
            padding: '0 8px 0 16px',
        },
        // Syntax highlighting
        '.cm-keyword': { color: c.keyword },
        '.cm-operator': { color: c.keyword },
        '.cm-variableName': { color: c.textPrimary },
        '.cm-propertyName': { color: c.method },
        '.cm-function': { color: c.method },
        '.cm-string': { color: c.string },
        '.cm-number': { color: c.number },
        '.cm-comment': { color: c.comment },
        '.cm-bracket': { color: c.textPrimary },
        '.cm-punctuation': { color: c.textPrimary },
        '.cm-definition': { color: c.method },
        '.cm-typeName': { color: c.number },
        '.cm-atom': { color: c.number },
        '.cm-bool': { color: c.number },
        // Autocomplete
        '.cm-tooltip': {
            backgroundColor: c.bgTertiary,
            border: `1px solid ${c.border}`,
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
                backgroundColor: c.accent,
                color: '#ffffff',
            },
        },
        '.cm-completionLabel': {
            color: c.textPrimary,
        },
        '.cm-completionDetail': {
            color: c.textMuted,
            fontStyle: 'normal',
            marginLeft: '8px',
        },
        '.cm-completionMatchedText': {
            color: c.accent,
            fontWeight: 'bold',
            textDecoration: 'none',
        },
        // Scrollbar
        '.cm-scroller': {
            overflow: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: `${c.border} ${c.bgPrimary}`,
        },
    }, { dark: true });
}

/**
 * Get current theme from localStorage
 */
export function getCurrentThemeId(): ThemeId {
    const stored = localStorage.getItem('patterin-theme');
    if (stored && stored in THEME_COLORS) {
        return stored as ThemeId;
    }
    return 'github-dark';
}
