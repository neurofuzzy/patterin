import * as monaco from 'monaco-editor';

export const LANGUAGE_ID = 'patterin';

export function registerDSLLanguage() {
    monaco.languages.register({ id: LANGUAGE_ID });

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

        // Patterin specific methods
        dslMethods: [
            'tessellation', 'grid', 'place', 'trace', 'mask', 'ephemeral',
            'clone', 'scale', 'rotate', 'translate', 'add', 'subtract',
            'every', 'at', 'repeat', 'expand', 'inset', 'round', 'extrude',
            'lsystem'
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
                // identifiers and keywords
                [/[a-z_$][\w$]*/, {
                    cases: {
                        '@dslMethods': 'function',
                        '@dslShapes': 'type',
                        '@keywords': 'keyword',
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
}
