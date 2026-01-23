import * as monaco from 'monaco-editor';

export const LANGUAGE_ID = 'patterin';

export function registerDSLLanguage() {
    monaco.languages.register({ id: LANGUAGE_ID });

    // Configure language features (comments, brackets, auto-closing)
    monaco.languages.setLanguageConfiguration(LANGUAGE_ID, {
        comments: {
            lineComment: '//',
            blockComment: ['/*', '*/']
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"', notIn: ['string'] },
            { open: "'", close: "'", notIn: ['string'] },
            { open: '`', close: '`', notIn: ['string'] }
        ],
        surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
            { open: '`', close: '`' }
        ],
        folding: {
            markers: {
                start: /^\s*\/\/\s*#?region\b/,
                end: /^\s*\/\/\s*#?endregion\b/
            }
        }
    });
    monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, {
        defaultToken: 'invalid',
        tokenPostfix: '.js',

        keywords: [
            'break', 'case', 'catch', 'class', 'continue', 'const',
            'constructor', 'debugger', 'default', 'delete', 'do', 'else',
            'export', 'extends', 'false', 'finally', 'for', 'from', 'function',
            'get', 'if', 'import', 'in', 'instanceof', 'let', 'new', 'null',
            'return', 'set', 'super', 'switch', 'symbol', 'this', 'throw', 'true',
            'try', 'typeof', 'undefined', 'var', 'void', 'while', 'with', 'yield',
            'async', 'await', 'of', 'system'
        ],

        // Core JavaScript globals
        globals: [
            'Math', 'console', 'Array', 'String', 'Number', 'Boolean',
            'Object', 'JSON', 'Date', 'RegExp', 'Error', 'Promise'
        ],

        // Patterin specific methods
        dslMethods: [
            'tessellation', 'grid', 'place', 'trace', 'mask', 'ephemeral',
            'clone', 'scale', 'rotate', 'translate', 'add', 'subtract',
            'every', 'at', 'repeat', 'expand', 'inset', 'round', 'extrude',
            'subdivide', 'lsystem'
        ],

        // Patterin specific shapes
        dslShapes: [
            'hex', 'rect', 'circle', 'triangle', 'square', 'shape'
        ],

        operators: [
            '<=', '>=', '==', '!=', '===', '!==', '=>', '+', '-', '**',
            '*', '/', '%', '++', '--', '<<', '<<<', '>>', '>>>', '&',
            '|', '^', '!', '~', '&&', '||', '?', ':', '=', '+=', '-=',
            '*=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '|=', '^='
        ],

        // we include these common regular expressions
        symbols: /[=><!~?:&|+\-*\/\^%]+/,

        tokenizer: {
            root: [
                // identifiers and keywords (case-sensitive for globals like Math)
                [/[A-Z][\w$]*/, {
                    cases: {
                        '@globals': 'type.identifier',
                        '@default': 'identifier'
                    }
                }],
                [/[a-z_$][\w$]*/, {
                    cases: {
                        '@dslMethods': 'function',
                        '@dslShapes': 'type',
                        '@keywords': 'keyword',
                        '@globals': 'type.identifier',
                        '@default': 'identifier'
                    }
                }],

                // whitespace
                { include: '@whitespace' },

                // delimiters and operators
                [/[{}()\[\]]/, '@brackets'],
                [/[<>](?!@symbols)/, '@brackets'],
                [/@symbols/, {
                    cases: {
                        '@operators': 'operator',
                        '@default': ''
                    }
                }],

                // numbers
                [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                [/\d+/, 'number'],

                // delimiter: after number because of .\d floats
                [/[;,.]/, 'delimiter'],

                // strings
                [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
                [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
                [/'/, { token: 'string.quote', bracket: '@open', next: '@stringSingle' }],
            ],

            comment: [
                [/[^\/*]+/, 'comment'],
                [/\/\*/, 'comment', '@push'],    // nested comment
                ["\\*/", 'comment', '@pop'],
                [/[\/*]/, 'comment']
            ],

            string: [
                [/[^\\"]+/, 'string'],
                [/\\./, 'string.escape.invalid'],
                [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
            ],

            stringSingle: [
                [/[^\\']+/, 'string'],
                [/\\./, 'string.escape.invalid'],
                [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
            ],

            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment'],
            ],
        },
    });

    // Register hover provider for tooltips
    registerHoverProvider();

    // Register signature help provider
    registerSignatureHelpProvider();
}

// Import API_DATA for hover/signature info
import { API_DATA, getAllMethods, getAllGetters } from './api-data';

function registerHoverProvider() {
    monaco.languages.registerHoverProvider(LANGUAGE_ID, {
        provideHover(model, position) {
            const word = model.getWordAtPosition(position);
            if (!word) return null;

            const text = word.word;

            // Check if it's a known type
            if (API_DATA[text]) {
                const info = API_DATA[text];
                return {
                    contents: [
                        { value: `**${text}**` },
                        { value: info.doc || '' }
                    ]
                };
            }

            // Check if it's a method or getter on any type
            for (const typeName of Object.keys(API_DATA)) {
                const methods = getAllMethods(typeName);
                if (methods[text]) {
                    const method = methods[text];
                    const params = method.params?.join(', ') || '';
                    return {
                        contents: [
                            { value: `\`\`\`typescript\n${text}(${params}): ${method.returns}\n\`\`\`` },
                            { value: method.doc }
                        ]
                    };
                }

                const getters = getAllGetters(typeName);
                if (getters[text]) {
                    const getter = getters[text];
                    return {
                        contents: [
                            { value: `\`\`\`typescript\n${text}: ${getter.returns}\n\`\`\`` },
                            { value: getter.doc }
                        ]
                    };
                }
            }

            return null;
        }
    });
}

function registerSignatureHelpProvider() {
    monaco.languages.registerSignatureHelpProvider(LANGUAGE_ID, {
        signatureHelpTriggerCharacters: ['(', ','],
        provideSignatureHelp(model, position) {
            const textBefore = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });

            // Find the method name before the opening paren
            const match = textBefore.match(/\.(\w+)\s*\([^)]*$/);
            if (!match) return null;

            const methodName = match[1];

            // Find method info
            for (const typeName of Object.keys(API_DATA)) {
                const methods = getAllMethods(typeName);
                if (methods[methodName]) {
                    const method = methods[methodName];
                    const params = method.params || [];
                    const signature = `${methodName}(${params.join(', ')}): ${method.returns}`;

                    // Count commas to determine active parameter
                    const afterParen = textBefore.split(/\.\w+\s*\(/).pop() || '';
                    const activeParam = (afterParen.match(/,/g) || []).length;

                    return {
                        value: {
                            signatures: [{
                                label: signature,
                                documentation: method.doc,
                                parameters: params.map(p => ({
                                    label: p,
                                    documentation: ''
                                }))
                            }],
                            activeSignature: 0,
                            activeParameter: Math.min(activeParam, params.length - 1)
                        },
                        dispose: () => { }
                    };
                }
            }

            return null;
        }
    });
}
