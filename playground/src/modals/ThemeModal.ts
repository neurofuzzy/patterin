/**
 * Theme Modal - Theme selection
 */

interface Theme {
    name: string;
    id: string;
    accentColor: string;
}

const THEMES: Theme[] = [
    { name: 'GitHub Dark', id: 'github-dark', accentColor: '#58a6ff' },
    { name: 'Nord', id: 'nord', accentColor: '#88c0d0' },
    { name: 'Tokyo Night Storm', id: 'tokyo-night', accentColor: '#7dcfff' },
];

function getCurrentTheme(): string {
    return localStorage.getItem('patterin-theme') || 'github-dark';
}

function setTheme(themeId: string): void {
    localStorage.setItem('patterin-theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);

    // Dispatch custom event for editor theme switching
    window.dispatchEvent(new CustomEvent('patterin-theme-change', {
        detail: themeId
    }));

    // Update all theme swatches
    document.querySelectorAll('.theme-option').forEach(option => {
        const isSelected = option.getAttribute('data-theme-id') === themeId;
        option.classList.toggle('selected', isSelected);
    });
}

export function createThemeModal(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'theme-modal';

    const currentTheme = getCurrentTheme();

    for (const theme of THEMES) {
        const option = document.createElement('button');
        option.className = 'theme-option';
        option.setAttribute('data-theme-id', theme.id);

        if (theme.id === currentTheme) {
            option.classList.add('selected');
        }

        option.innerHTML = `
      <span class="theme-swatch" style="background: ${theme.accentColor}"></span>
      <span class="theme-name">${theme.name}</span>
      <span class="theme-check">✓</span>
    `;

        option.addEventListener('click', () => {
            setTheme(theme.id);
        });

        container.appendChild(option);
    }

    return container;
}

// Initialize theme on load
export function initTheme(): void {
    const theme = getCurrentTheme();
    document.documentElement.setAttribute('data-theme', theme);
}
