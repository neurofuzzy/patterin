/**
 * Preview Component - SVG canvas with pan/zoom
 */

export interface PreviewOptions {
    container: HTMLElement;
    onZoomChange?: (zoom: number) => void;
}

export class Preview {
    private container: HTMLElement;
    private canvas: HTMLDivElement;
    private svgContainer: HTMLDivElement;
    private gridOverlay: HTMLDivElement;
    private centerMark: HTMLDivElement;
    private controls: HTMLDivElement;
    private statusBar: HTMLDivElement;

    private zoom = 1;
    private panX = 0;
    private panY = 0;
    private isPanning = false;
    private lastMouseX = 0;
    private lastMouseY = 0;

    private onZoomChange?: (zoom: number) => void;

    constructor(options: PreviewOptions) {
        this.container = options.container;
        this.onZoomChange = options.onZoomChange;

        this.canvas = this.createElement('div', 'preview-canvas');
        this.svgContainer = this.createElement('div', 'svg-container');
        this.gridOverlay = this.createElement('div', 'grid-overlay');
        this.centerMark = this.createElement('div', 'center-mark');
        this.controls = this.createControls();
        this.statusBar = this.createElement('div', 'status-bar');

        this.canvas.appendChild(this.svgContainer);
        this.container.appendChild(this.gridOverlay);
        this.container.appendChild(this.centerMark);
        this.container.appendChild(this.canvas);
        this.container.appendChild(this.controls);
        this.container.appendChild(this.statusBar);

        this.setupEvents();
        this.updateStatus();
    }

    private createElement(tag: string, className: string): HTMLDivElement {
        const el = document.createElement(tag) as HTMLDivElement;
        el.className = className;
        return el;
    }

    private createControls(): HTMLDivElement {
        const controls = this.createElement('div', 'preview-controls');

        const gridBtn = document.createElement('button');
        gridBtn.className = 'preview-btn active';
        gridBtn.textContent = 'Grid';
        gridBtn.addEventListener('click', () => this.toggleGrid(gridBtn));

        const centerBtn = document.createElement('button');
        centerBtn.className = 'preview-btn active';
        centerBtn.textContent = '⊕';
        centerBtn.title = 'Center mark';
        centerBtn.addEventListener('click', () => this.toggleCenter(centerBtn));

        const resetBtn = document.createElement('button');
        resetBtn.className = 'preview-btn';
        resetBtn.textContent = 'Reset';
        resetBtn.addEventListener('click', () => this.resetView());

        controls.appendChild(gridBtn);
        controls.appendChild(centerBtn);
        controls.appendChild(resetBtn);

        return controls;
    }

    private setupEvents(): void {
        // Pan
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.isPanning = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.canvas.style.cursor = 'grabbing';
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.panX += dx;
                this.panY += dy;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.updateTransform();
            }
        });

        window.addEventListener('mouseup', () => {
            this.isPanning = false;
            this.canvas.style.cursor = 'grab';
        });

        // Zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.max(0.1, Math.min(10, this.zoom * delta));

            // Zoom toward mouse position
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;

            this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
            this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
            this.zoom = newZoom;

            this.updateTransform();
            this.updateStatus();
            this.onZoomChange?.(this.zoom);
        });

        // Double-click to reset
        this.canvas.addEventListener('dblclick', () => this.resetView());
    }

    private updateTransform(): void {
        this.svgContainer.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;

        // Sync grid and origin mark logic runs in the next frame to ensure layout is updated
        requestAnimationFrame(() => this.syncOverlays());
    }

    private syncOverlays(): void {
        if (!this.svgContainer || !this.gridOverlay || !this.centerMark) return;

        // Get relative position of the SVG container within the main container
        const containerRect = this.container.getBoundingClientRect();
        const svgRect = this.svgContainer.getBoundingClientRect();

        const x = svgRect.left - containerRect.left;
        const y = svgRect.top - containerRect.top;

        // Update grid
        // 20px is the base grid size defined in CSS
        const gridSize = 20 * this.zoom;
        this.gridOverlay.style.backgroundSize = `${gridSize}px ${gridSize}px`;
        this.gridOverlay.style.backgroundPosition = `${x}px ${y}px`;

        // Update origin center mark
        // Position at (0,0) of the SVG content (top-left of svgContainer)
        this.centerMark.style.left = `${x}px`;
        this.centerMark.style.top = `${y}px`;
        this.centerMark.style.transform = 'translate(-50%, -50%)'; // Center symbol on point
    }

    private updateStatus(): void {
        const panText = `(${Math.round(this.panX)}, ${Math.round(this.panY)})`;
        this.statusBar.textContent = `${Math.round(this.zoom * 100)}% ${panText}`;
    }

    private toggleGrid(btn: HTMLButtonElement): void {
        this.gridOverlay.classList.toggle('hidden');
        btn.classList.toggle('active');
        if (!this.gridOverlay.classList.contains('hidden')) {
            this.syncOverlays();
        }
    }

    private toggleCenter(btn: HTMLButtonElement): void {
        this.centerMark.classList.toggle('hidden');
        btn.classList.toggle('active');
        if (!this.centerMark.classList.contains('hidden')) {
            this.syncOverlays();
        }
    }

    resetView(): void {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
        this.updateStatus();
    }

    /**
     * Set the SVG content to display
     */
    setSVG(svgString: string): void {
        this.svgContainer.innerHTML = svgString;
        // Sync overlays after new content size might change centering
        requestAnimationFrame(() => this.syncOverlays());
    }

    /**
     * Get current zoom level
     */
    getZoom(): number {
        return this.zoom;
    }

    /**
     * Set zoom level
     */
    setZoom(zoom: number): void {
        this.zoom = Math.max(0.1, Math.min(10, zoom));
        this.updateTransform();
        this.updateStatus();
    }
}
