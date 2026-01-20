/**
 * Menu Component - Hamburger dropdown menu
 */
import { Modal } from './Modal.ts';
import { createThemeModal } from '../modals/ThemeModal.ts';
import { createExamplesModal } from '../modals/ExamplesModal.ts';
import { createSettingsModal } from '../modals/SettingsModal.ts';

export interface MenuOptions {
    button: HTMLElement;
    onExampleLoad?: (code: string) => void;
}

interface MenuItem {
    label: string;
    icon?: string;
    action: () => void;
}

export class Menu {
    private dropdown: HTMLDivElement | null = null;
    private isOpen = false;
    private button: HTMLElement;
    private onExampleLoad?: (code: string) => void;

    constructor(options: MenuOptions) {
        this.button = options.button;
        this.onExampleLoad = options.onExampleLoad;

        this.button.addEventListener('click', () => this.toggle());

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.button.contains(e.target as Node) &&
                !this.dropdown?.contains(e.target as Node)) {
                this.close();
            }
        });
    }

    private getMenuItems(): MenuItem[] {
        return [
            {
                label: 'Theme...',
                icon: '◐',
                action: () => this.showThemeModal(),
            },
            {
                label: 'Examples...',
                icon: '◇',
                action: () => this.showExamplesModal(),
            },
            {
                label: 'Settings...',
                icon: '⚙',
                action: () => this.showSettingsModal(),
            },
        ];
    }

    private toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    private open(): void {
        if (this.dropdown) return;

        this.dropdown = document.createElement('div');
        this.dropdown.className = 'menu-dropdown';

        const items = this.getMenuItems();
        for (const item of items) {
            const btn = document.createElement('button');
            btn.className = 'menu-item';

            if (item.icon) {
                const icon = document.createElement('span');
                icon.className = 'menu-icon';
                icon.textContent = item.icon;
                btn.appendChild(icon);
            }

            const label = document.createElement('span');
            label.textContent = item.label;
            btn.appendChild(label);

            btn.addEventListener('click', () => {
                this.close();
                item.action();
            });

            this.dropdown.appendChild(btn);
        }

        // Position below button
        const rect = this.button.getBoundingClientRect();
        this.dropdown.style.top = `${rect.bottom + 4}px`;
        this.dropdown.style.left = `${rect.left}px`;

        document.body.appendChild(this.dropdown);
        this.isOpen = true;

        // Animate in
        requestAnimationFrame(() => {
            this.dropdown?.classList.add('open');
        });
    }

    private close(): void {
        if (!this.dropdown) return;

        this.dropdown.classList.remove('open');
        setTimeout(() => {
            this.dropdown?.remove();
            this.dropdown = null;
        }, 150);

        this.isOpen = false;
    }

    private showThemeModal(): void {
        Modal.show({
            title: 'Choose Theme',
            content: createThemeModal(),
        });
    }

    private showExamplesModal(): void {
        Modal.show({
            title: 'Examples',
            content: createExamplesModal((code) => {
                this.onExampleLoad?.(code);
            }),
        });
    }

    private showSettingsModal(): void {
        Modal.show({
            title: 'Settings',
            content: createSettingsModal(),
        });
    }
}
