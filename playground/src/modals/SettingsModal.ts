/**
 * Settings Modal - Playground settings
 */

interface Settings {
    autoUpdate: boolean;
    showGrid: boolean;
    showCenterMark: boolean;
    showConstruction: boolean;
}

function getSettings(): Settings {
    const stored = localStorage.getItem('patterin-settings');
    if (stored) {
        return JSON.parse(stored);
    }
    return {
        autoUpdate: true,
        showGrid: true,
        showCenterMark: true,
        showConstruction: true,
    };
}

function saveSettings(settings: Settings): void {
    localStorage.setItem('patterin-settings', JSON.stringify(settings));
}

export function createSettingsModal(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'settings-modal';

    const settings = getSettings();

    // Auto-update
    const autoUpdateRow = createCheckbox(
        'Auto-update preview',
        settings.autoUpdate,
        (checked) => {
            settings.autoUpdate = checked;
            saveSettings(settings);
        }
    );

    // Show grid
    const gridRow = createCheckbox(
        'Show grid',
        settings.showGrid,
        (checked) => {
            settings.showGrid = checked;
            saveSettings(settings);
            // Toggle grid visibility
            document.querySelector('.grid-overlay')?.classList.toggle('hidden', !checked);
        }
    );

    // Show center mark
    const centerMarkRow = createCheckbox(
        'Show center mark',
        settings.showCenterMark,
        (checked) => {
            settings.showCenterMark = checked;
            saveSettings(settings);
            // Toggle center mark visibility
            document.querySelector('.center-mark')?.classList.toggle('hidden', !checked);
        }
    );

    // Show construction geometry
    const constructionRow = createCheckbox(
        'Show construction geometry',
        settings.showConstruction,
        (checked) => {
            settings.showConstruction = checked;
            saveSettings(settings);
        }
    );

    // Divider
    const divider = document.createElement('hr');
    divider.className = 'modal-divider';

    // Clear saved work
    const clearBtn = document.createElement('button');
    clearBtn.className = 'modal-button danger';
    clearBtn.textContent = 'Clear saved work';
    clearBtn.addEventListener('click', () => {
        if (confirm('Clear all saved work? This cannot be undone.')) {
            localStorage.removeItem('patterin-code');
            localStorage.removeItem('patterin-settings');
            localStorage.removeItem('patterin-theme');
            window.location.reload();
        }
    });

    container.appendChild(autoUpdateRow);
    container.appendChild(gridRow);
    container.appendChild(centerMarkRow);
    container.appendChild(constructionRow);
    container.appendChild(divider);
    container.appendChild(clearBtn);

    return container;
}

function createCheckbox(
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void
): HTMLElement {
    const row = document.createElement('label');
    row.className = 'settings-row';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    checkbox.addEventListener('change', () => onChange(checkbox.checked));

    const text = document.createElement('span');
    text.textContent = label;

    row.appendChild(checkbox);
    row.appendChild(text);

    return row;
}

// Export settings getter for use elsewhere
export { getSettings };
