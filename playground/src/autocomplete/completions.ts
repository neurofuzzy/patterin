/**
 * CodeMirror Autocomplete Completions for Patterin DSL
 */
import {
    CompletionContext,
    CompletionResult,
    Completion,
    autocompletion
} from '@codemirror/autocomplete';
import { API_DATA, getAllMethods, getAllGetters, getReturnType } from './api-data';

/**
 * Create a completion item
 */
function createCompletion(
    label: string,
    type: 'function' | 'property' | 'class' | 'variable',
    detail: string,
    info?: string
): Completion {
    return {
        label,
        type,
        detail,
        info,
        boost: type === 'function' ? 1 : 0,
    };
}

/**
 * Get completions for a type's methods and getters
 */
function getCompletionsForType(typeName: string): Completion[] {
    const completions: Completion[] = [];

    const methods = getAllMethods(typeName);
    for (const [name, info] of Object.entries(methods)) {
        const params = info.params?.join(', ') || '';
        completions.push(createCompletion(
            name,
            'function',
            `(${params}) → ${info.returns}`,
            info.doc
        ));
    }

    const getters = getAllGetters(typeName);
    for (const [name, info] of Object.entries(getters)) {
        completions.push(createCompletion(
            name,
            'property',
            info.returns,
            info.doc
        ));
    }

    return completions;
}

/**
 * Get completions for static methods
 */
function getStaticCompletions(typeName: string): Completion[] {
    const typeInfo = API_DATA[typeName];
    if (!typeInfo?.static) return [];

    const completions: Completion[] = [];
    for (const [name, info] of Object.entries(typeInfo.static)) {
        const params = info.params?.join(', ') || '';
        completions.push(createCompletion(
            name,
            'function',
            `(${params}) → ${info.returns}`,
            info.doc
        ));
    }

    return completions;
}

/**
 * Analyze the context to determine the type being accessed
 */
function analyzeContext(beforeCursor: string): string | null {
    // Remove comments and strings for cleaner analysis
    const cleaned = beforeCursor
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/'[^']*'/g, '""')
        .replace(/"[^"]*"/g, '""');

    // Find the last expression before the dot
    const dotMatch = cleaned.match(/(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)\.$/);
    if (!dotMatch) return null;

    const chain = dotMatch[1];

    // Parse the chain to determine the final type
    return resolveChainType(chain);
}

/**
 * Resolve the type of a method chain
 */
function resolveChainType(chain: string): string | null {
    // Split into parts (method calls and property accesses)
    const parts = chain.match(/\w+(?:\([^)]*\))?/g);
    if (!parts) return null;

    let currentType: string | null = null;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const name = part.replace(/\([^)]*\)$/, '');
        const isCall = part.includes('(');

        if (i === 0) {
            // First part: determine initial type
            if (name === 'shape') {
                currentType = 'shape';
            } else if (name === 'svg' || name === 'collector') {
                currentType = 'SVGCollector';
            } else if (name === 'GridSystem') {
                currentType = 'GridSystem';
            } else if (name === 'TessellationSystem') {
                currentType = 'TessellationSystem';
            } else if (name === 'Vector2') {
                currentType = 'Vector2';
            } else if (name === 'circle' || name === 'rect' || name === 'square' ||
                name === 'hexagon' || name === 'triangle') {
                // Probably a variable holding a shape context
                currentType = name.charAt(0).toUpperCase() + name.slice(1) + 'Context';
            } else {
                // Try to infer from common variable patterns
                if (name.includes('circle')) currentType = 'CircleContext';
                else if (name.includes('rect')) currentType = 'RectContext';
                else if (name.includes('hex')) currentType = 'HexagonContext';
                else if (name.includes('tri')) currentType = 'TriangleContext';
                else if (name.includes('grid')) currentType = 'GridSystem';
                else currentType = 'ShapeContext'; // Default assumption
            }
        } else {
            // Subsequent parts: resolve return type
            if (!currentType) break;

            // Special case for shape factory
            if (currentType === 'shape') {
                const shapeType = API_DATA.shape?.methods?.[name]?.returns;
                if (shapeType) {
                    currentType = shapeType;
                    continue;
                }
            }

            const returnType = getReturnType(currentType, name);
            if (returnType) {
                // Handle 'this' return type
                if (returnType === 'this') {
                    // Type stays the same
                } else {
                    currentType = returnType;
                }
            }
        }
    }

    return currentType;
}

/**
 * Main completion source for Patterin DSL
 */
export function patterinCompletions(context: CompletionContext): CompletionResult | null {
    const beforeCursor = context.state.doc.sliceString(0, context.pos);

    // Check if we're after a dot
    const dotBefore = beforeCursor.endsWith('.');

    if (dotBefore) {
        const contextType = analyzeContext(beforeCursor);

        if (contextType) {
            let completions: Completion[];

            // For factory objects, show their methods
            if (contextType === 'shape') {
                completions = getStaticCompletions('shape') || [];
                // Add shape factory methods
                const shapeMethods = API_DATA.shape?.methods;
                if (shapeMethods) {
                    for (const [name, info] of Object.entries(shapeMethods)) {
                        completions.push(createCompletion(
                            name,
                            'function',
                            `() → ${info.returns}`,
                            info.doc
                        ));
                    }
                }
            } else {
                // Get completions for the resolved type
                completions = getCompletionsForType(contextType);

                // Add static methods for class types
                const staticCompletions = getStaticCompletions(contextType);
                completions = [...completions, ...staticCompletions];
            }

            if (completions.length > 0) {
                return {
                    from: context.pos,
                    options: completions,
                };
            }
        }
    }

    // Word completion (not after dot)
    const wordMatch = context.matchBefore(/\w+/);
    if (wordMatch && wordMatch.from < wordMatch.to) {
        const completions: Completion[] = [];

        // Global entry points
        completions.push(createCompletion('shape', 'variable', 'Shape factory', 'Create shapes'));
        completions.push(createCompletion('SVGCollector', 'class', 'class', 'SVG output collector'));
        completions.push(createCompletion('GridSystem', 'class', 'class', 'Grid system'));
        completions.push(createCompletion('TessellationSystem', 'class', 'class', 'Tessellation system'));
        completions.push(createCompletion('Vector2', 'class', 'class', 'Immutable 2D vector'));
        completions.push(createCompletion('render', 'function', '(collector) → void', 'Render to preview'));

        return {
            from: wordMatch.from,
            options: completions,
        };
    }

    return null;
}

/**
 * Create the autocompletion extension
 */
export function createAutocomplete() {
    return autocompletion({
        override: [patterinCompletions],
        activateOnTyping: true,
        maxRenderedOptions: 50,
    });
}
