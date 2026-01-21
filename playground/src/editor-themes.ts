/**
 * Editor Themes - Color definitions for Monaco Editor
 */

export type ThemeId = 'github-dark' | 'github-light' | 'nord' | 'tokyo-night' | 'atom-one-dark';

interface ThemeColors {
    // Background
    bgPrimary: string;
    bgTertiary: string;

    // Text
    textPrimary: string;
    textMuted: string;

    // Accent
    accent: string;
    accentMuted: string; // Used for selection/active line usually

    // Syntax
    keyword: string;
    string: string;
    number: string;
    method: string;
    comment: string;
    variable: string;
    property: string;
    punctuation: string;

    // UI
    border: string;
    selection: string;
    activeLine: string;
}

const THEME_COLORS: Record<ThemeId, ThemeColors> = {
    'github-dark': {
        bgPrimary: '#0d1117',
        bgTertiary: '#161b22',
        textPrimary: '#c9d1d9',
        textMuted: '#8b949e',
        accent: '#58a6ff',
        accentMuted: '#1f6feb44',
        keyword: '#ff7b72',
        string: '#a5d6ff',
        number: '#79c0ff',
        method: '#d2a8ff',
        comment: '#8b949e',
        variable: '#c9d1d9',
        property: '#79c0ff',
        punctuation: '#c9d1d9',
        border: '#30363d',
        selection: '#1f6feb44',
        activeLine: '#1f6feb22',
    },
    'github-light': {
        bgPrimary: '#ffffff',
        bgTertiary: '#f6f8fa',
        textPrimary: '#24292f',
        textMuted: '#57606a',
        accent: '#0969da',
        accentMuted: '#0969da22',
        keyword: '#cf222e',
        string: '#0a3069',
        number: '#0550ae',
        method: '#8250df',
        comment: '#6e7781',
        variable: '#24292f',
        property: '#0550ae',
        punctuation: '#24292f',
        border: '#d0d7de',
        selection: '#0969da33',
        activeLine: '#0969da11',
    },
    'nord': {
        bgPrimary: '#2e3440',
        bgTertiary: '#3b4252',
        textPrimary: '#eceff4',
        textMuted: '#616e88',
        accent: '#88c0d0',
        accentMuted: '#88c0d044',
        keyword: '#81a1c1',
        string: '#a3be8c',
        number: '#b48ead',
        method: '#88c0d0',
        comment: '#616e88',
        variable: '#d8dee9',
        property: '#88c0d0',
        punctuation: '#eceff4',
        border: '#434c5e',
        selection: '#88c0d044',
        activeLine: '#88c0d022',
    },
    'tokyo-night': {
        bgPrimary: '#1a1b26',
        bgTertiary: '#24283b',
        textPrimary: '#c0caf5',
        textMuted: '#565f89',
        accent: '#7dcfff',
        accentMuted: '#7dcfff44',
        keyword: '#bb9af7',
        string: '#9ece6a',
        number: '#ff9e64',
        method: '#7dcfff',
        comment: '#565f89',
        variable: '#c0caf5',
        property: '#7aa2f7',
        punctuation: '#c0caf5',
        border: '#414868',
        selection: '#7dcfff44',
        activeLine: '#7dcfff22',
    },
    'atom-one-dark': {
        bgPrimary: '#282c34',
        bgTertiary: '#21252b',
        textPrimary: '#abb2bf',
        textMuted: '#5c6370',
        accent: '#61afef',
        accentMuted: '#61afef44',
        keyword: '#c678dd',
        string: '#98c379',
        number: '#d19a66',
        method: '#61afef',
        comment: '#5c6370',
        variable: '#abb2bf',
        property: '#abb2bf',
        punctuation: '#abb2bf',
        border: '#181a1f',
        selection: '#61afef44',
        activeLine: '#61afef22',
    },
};

/**
 * Create a Monaco theme definition
 */
export function createTheme(themeId: ThemeId): any {
    const c = THEME_COLORS[themeId];
    const isDark = themeId !== 'github-light';

    return {
        base: isDark ? 'vs-dark' : 'vs',
        inherit: true,
        rules: [
            { token: 'keyword', foreground: c.keyword },
            { token: 'string', foreground: c.string },
            { token: 'number', foreground: c.number },
            { token: 'comment', foreground: c.comment, fontStyle: 'italic' },
            { token: 'identifier', foreground: c.variable },
            { token: 'type', foreground: c.number },
            { token: 'delimiter', foreground: c.punctuation },
            { token: 'function', foreground: c.method },
            { token: 'variable.property', foreground: c.property },
        ],
        colors: {
            'editor.background': c.bgPrimary,
            'editor.foreground': c.textPrimary,
            'editor.lineHighlightBackground': c.activeLine,
            'editor.selectionBackground': c.selection,
            'editorCursor.foreground': c.accent,
            'editorWhitespace.foreground': c.textMuted,
            'editorLineNumber.foreground': c.textMuted,
            'editorLineNumber.activeForeground': c.textPrimary,
            'editor.selectionHighlightBackground': c.accentMuted,
            // Error/warning/info squiggles
            'editorError.foreground': '#ff5370',
            'editorWarning.foreground': '#ffcb6b',
            'editorInfo.foreground': c.accent,
            'editorError.border': '#ff5370',
            'editorWarning.border': '#ffcb6b',
            'editorInfo.border': c.accent,
        }
    };
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
