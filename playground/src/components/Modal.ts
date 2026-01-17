/**
 * Modal Component - Base modal overlay
 */

export interface ModalOptions {
    title: string;
    content: HTMLElement;
    onClose?: () => void;
}

export class Modal {
    private overlay: HTMLDivElement;
    private container: HTMLDivElement;
    private onCloseCallback?: () => void;

    constructor(options: ModalOptions) {
        this.onCloseCallback = options.onClose;

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Create container
        this.container = document.createElement('div');
        this.container.className = 'modal-container';

        // Create header
        const header = document.createElement('div');
        header.className = 'modal-header';

        const title = document.createElement('h2');
        title.className = 'modal-title';
        title.textContent = options.title;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => this.close());

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Create body
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.appendChild(options.content);

        this.container.appendChild(header);
        this.container.appendChild(body);
        this.overlay.appendChild(this.container);

        // Handle escape key
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    private handleKeydown(e: KeyboardEvent): void {
        if (e.key === 'Escape') {
            this.close();
        }
    }

    open(): void {
        document.body.appendChild(this.overlay);
        document.addEventListener('keydown', this.handleKeydown);

        // Animate in
        requestAnimationFrame(() => {
            this.overlay.classList.add('open');
        });
    }

    close(): void {
        this.overlay.classList.remove('open');
        document.removeEventListener('keydown', this.handleKeydown);

        // Remove after animation
        setTimeout(() => {
            this.overlay.remove();
            this.onCloseCallback?.();
        }, 150);
    }

    /**
     * Static helper to create and open a modal
     */
    static show(options: ModalOptions): Modal {
        const modal = new Modal(options);
        modal.open();
        return modal;
    }
}
