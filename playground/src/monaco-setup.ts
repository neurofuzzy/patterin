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

// Use 'any' cast to avoid type issues with monaco properties
const tsDefaults = (monaco.languages.typescript as any).javascriptDefaults;

tsDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false // Allow syntax errors
});

tsDefaults.setCompilerOptions({
    target: (monaco.languages.typescript as any).ScriptTarget.ES2015,
    allowNonTsExtensions: true,
    lib: ['es2015'] // Remove DOM to avoid noise
});
