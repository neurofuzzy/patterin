import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
        if (label === 'json') {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
        }
        return new editorWorker();
    }
};

// Configure TypeScript defaults
const tsDefaults = (monaco.languages.typescript as any).typescriptDefaults;

// Enable semantic and syntax validation, but hide suggestions to avoid double underlines
tsDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    noSuggestionDiagnostics: true, // Hide suggestion diagnostics (they can cause double underlines)
    diagnosticCodesToIgnore: []
});

tsDefaults.setCompilerOptions({
    target: (monaco.languages.typescript as any).ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: (monaco.languages.typescript as any).ModuleResolutionKind.NodeJs,
    module: (monaco.languages.typescript as any).ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    allowJs: true,
    strict: false,
    checkJs: false
});
