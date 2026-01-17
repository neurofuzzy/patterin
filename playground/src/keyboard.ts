/**
 * Keyboard Shortcuts Handler
 */

export interface KeyboardShortcuts {
    onExport?: () => void;
    onToggleGrid?: () => void;
    onToggleConstruction?: () => void;
    onResetView?: () => void;
}

const MAC = navigator.platform.toLowerCase().includes('mac');

function isModKey(e: KeyboardEvent): boolean {
    return MAC ? e.metaKey : e.ctrlKey;
}

export function initKeyboardShortcuts(shortcuts: KeyboardShortcuts): void {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs (but allow in CodeMirror)
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return;
        }

        // Cmd/Ctrl + E - Export
        if (isModKey(e) && e.key === 'e') {
            e.preventDefault();
            shortcuts.onExport?.();
        }

        // Cmd/Ctrl + G - Toggle grid
        if (isModKey(e) && e.key === 'g') {
            e.preventDefault();
            shortcuts.onToggleGrid?.();
        }

        // Cmd/Ctrl + K - Toggle construction geometry
        if (isModKey(e) && e.key === 'k') {
            e.preventDefault();
            shortcuts.onToggleConstruction?.();
        }

        // Cmd/Ctrl + 0 - Reset view
        if (isModKey(e) && e.key === '0') {
            e.preventDefault();
            shortcuts.onResetView?.();
        }
    });
}

/**
 * Get human-readable shortcut text
 */
export function getShortcutText(key: string): string {
    const mod = MAC ? '⌘' : 'Ctrl';
    return `${mod}+${key.toUpperCase()}`;
}
