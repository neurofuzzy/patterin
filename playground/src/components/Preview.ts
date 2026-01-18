/**
 * Preview Component - SVG canvas with pan/zoom
 */
import { Home, Download } from 'lucide';

export interface PreviewOptions {
    container: HTMLElement;
    onZoomChange?: (zoom: number) => void;
    onExport?: () => void;
}

export class Preview {
    private container: HTMLElement;
    private canvas: HTMLDivElement;
    private svgContainer: HTMLDivElement;
    private gridOverlay: HTMLDivElement;
    private centerMark: HTMLDivElement;
    private controls: HTMLDivElement;
    private statusBar: HTMLDivElement;
    private statsDisplay: HTMLDivElement;

    private zoom = 1;
    private panX = 0;
    private panY = 0;
    private isPanning = false;
    private lastMouseX = 0;
    private lastMouseY = 0;

    private onZoomChange?: (zoom: number) => void;
    private onExport?: () => void;

    constructor(options: PreviewOptions) {
        this.container = options.container;
        this.onZoomChange = options.onZoomChange;
        this.onExport = options.onExport;

        this.canvas = this.createElement('div', 'preview-canvas');
        this.svgContainer = this.createElement('div', 'svg-container');
        this.gridOverlay = this.createElement('div', 'grid-overlay');
        this.centerMark = this.createElement('div', 'center-mark');
        this.controls = this.createControls();
        this.statusBar = this.createElement('div', 'status-bar');
        this.statsDisplay = this.createElement('div', 'stats-display');

        this.canvas.appendChild(this.svgContainer);
        this.container.appendChild(this.gridOverlay);
        this.container.appendChild(this.centerMark);
        this.container.appendChild(this.canvas);
        this.container.appendChild(this.controls);
        this.container.appendChild(this.statusBar);
        this.container.appendChild(this.statsDisplay);

        this.setupEvents();
        this.updateStatus();
    }

    private createElement(tag: string, className: string): HTMLDivElement {
        const el = document.createElement(tag) as HTMLDivElement;
        el.className = className;
        return el;
    }

    private createIconButton(IconClass: typeof Home, title: string, onClick: () => void): HTMLButtonElement {
        const btn = document.createElement('button');
        btn.className = 'preview-btn icon-btn';
        btn.title = title;

        // Create SVG from Lucide icon
        const iconNode = IconClass as unknown as { toSvg: (options?: object) => string };
        if (typeof iconNode.toSvg === 'function') {
            btn.innerHTML = iconNode.toSvg({ width: 16, height: 16 });
        } else {
            // Fallback: manually create the SVG element
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            svg.setAttribute('stroke-linecap', 'round');
            svg.setAttribute('stroke-linejoin', 'round');

            if (IconClass === Home) {
                svg.innerHTML = '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>';
            } else if (IconClass === Download) {
                svg.innerHTML = '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>';
            }
            btn.appendChild(svg);
        }

        btn.addEventListener('click', onClick);
        return btn;
    }

    private createControls(): HTMLDivElement {
        const controls = this.createElement('div', 'preview-controls');

        // Reset button (Home icon) - first
        const resetBtn = this.createIconButton(Home, 'Reset view', () => this.resetView());

        // Export button (Download icon) - second
        const exportBtn = this.createIconButton(Download, 'Export SVG', () => this.onExport?.());

        controls.appendChild(resetBtn);
        controls.appendChild(exportBtn);

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
        this.statusBar.textContent = `${Math.round(this.zoom * 100)}%`;
    }

    /**
     * Toggle grid visibility (called from settings)
     */
    setGridVisible(visible: boolean): void {
        this.gridOverlay.classList.toggle('hidden', !visible);
        if (visible) {
            this.syncOverlays();
        }
    }

    /**
     * Toggle center mark visibility (called from settings)
     */
    setCenterMarkVisible(visible: boolean): void {
        this.centerMark.classList.toggle('hidden', !visible);
        if (visible) {
            this.syncOverlays();
        }
    }

    /**
     * Update stats display with shape and segment counts
     */
    setStats(shapes: number, segments: number): void {
        if (shapes === 0 && segments === 0) {
            this.statsDisplay.textContent = '';
        } else {
            const shapeText = shapes === 1 ? '1 shape' : `${shapes} shapes`;
            const segmentText = segments === 1 ? '1 segment' : `${segments} segments`;
            this.statsDisplay.textContent = `${shapeText} · ${segmentText}`;
        }
    }

    /**
     * Show or hide loading overlay during code execution
     */
    setLoading(loading: boolean): void {
        if (loading) {
            this.canvas.classList.add('loading');
        } else {
            this.canvas.classList.remove('loading');
        }
    }

    resetView(): void {
        this.fitToContent();
    }

    /**
     * Fit view to content or center 0,0 if empty
     */
    fitToContent(): void {
        const svg = this.svgContainer.querySelector('svg');
        if (!svg) {
            this.resetToOrigin();
            return;
        }

        try {
            // Get content bounds using SVG API
            const bbox = (svg as SVGGraphicsElement).getBBox();

            if (bbox.width === 0 || bbox.height === 0) {
                // Empty content - reset to 100% at origin
                this.resetToOrigin();
                return;
            }

            // Get container dimensions
            const containerRect = this.container.getBoundingClientRect();
            const margin = 20;
            const availWidth = containerRect.width - margin * 2;
            const availHeight = containerRect.height - margin * 2;

            // Compute scale to fit
            const scaleX = availWidth / bbox.width;
            const scaleY = availHeight / bbox.height;
            // Zoom to fit, clamped to [0.1, 10] with 0.9 padding factor
            const constrainedZoom = Math.max(0.1, Math.min(10, Math.min(scaleX, scaleY) * 0.9));

            // Compute center of bounding box in local coords
            const contentCenterX = bbox.x + bbox.width / 2;
            const contentCenterY = bbox.y + bbox.height / 2;

            // We want (contentCenterX, contentCenterY) to be at (0,0) offset from center of canvas?
            // No, we want it at the visual center.
            // Canvas (svgContainer) is transformed by translate(panX, panY).
            // (0,0) of canvas maps to (panX, panY) relative to center of view? 
            // Wait, CSS says: justify-content: center.
            // Let's check updateTransform logic:
            // translate(panX, panY) scale(zoom)
            // Initial panX=0, panY=0 places (0,0) of SVG at the center of the viewport (because of flexbox centering of .preview-canvas?)
            // Let's check layout.css: 
            // .preview-canvas { display: flex; align-items: center; justify-content: center; }
            // So if SVG is 100x100, and no transform, it's centered.
            // SVG origin (top-left of svg element) is centered in the viewport minus half width/height?
            // This is tricky because we changed SVG to autoScale=false and width/height=SVG content size?
            // In native mode: SVG has width/height set to what?
            // In `main.ts`: width: 400, height: 400.
            // So the 400x400 box is centered. The (0,0) is at top-left of that box.

            // WE NEED TO IGNORE THE SVG "WIDTH/HEIGHT" ATTRIBUTES AND FOCUS ON CONTENT.
            // If we pan such that content visual center matches viewport center.

            // Viewport Center (0,0 in flexbox) coincides with SVG Element Center.
            // SVG Element (400x400) center is at (200, 200) local coords.
            // So default (pan=0) puts local (200,200) at viewport center.

            // If we want Content Center (cx, cy) to be at Viewport Center:
            // We need to shift the SVG such that (cx, cy) is at (SVG Width/2, SVG Height/2).
            // Shift = (SVG Width/2 - cx, SVG Height/2 - cy).
            // Multiplied by zoom? The pan applies before? No, usually translate is outer? 
            // transform = translate(pan) scale(zoom).
            // So we shift the whole scaled element.

            // Better strategy:
            // Calculate panX/panY such that the transformed point (cx, cy) ends up at viewport center.
            // Current center of view = (0,0) relative to flexbox center.
            // Transformed (cx, cy) = (cx * zoom + panX, cy * zoom + panY) ? 
            // No, origin of SVG is top-left of SVG element. 
            // Center of SVG element is at (0,0) of flexbox? Or is top-left at (0,0)?
            // CSS: justify-content: center.
            // So SVG center is at viewport center.
            // SVG Left = Viewport Center - SVGWidth/2.
            // SVG Top = Viewport Center - SVGHeight/2.

            // We want (cx, cy) * zoom + offset to be at Viewport Center.
            // SVG Origin (0,0) is at (-SVGWidth/2, -SVGHeight/2) relative to Viewport Center (before transform?).
            // With transform:
            // Effective Center = (SVGWidth/2, SVGHeight/2).
            // Local Point (cx, cy).
            // Distance from center = (cx - SVGWidth/2, cy - SVGHeight/2).
            // We need to counteract this distance with pan.
            // panX = -(cx - SVGWidth/2) * zoom
            // panY = -(cy - SVGHeight/2) * zoom

            // Let's verify SVG dimensions. They are fixed at 400x400 in main.ts.
            const svgWidth = parseFloat(svg.getAttribute('width') || '0');
            const svgHeight = parseFloat(svg.getAttribute('height') || '0');

            this.zoom = constrainedZoom;
            this.panX = -(contentCenterX - svgWidth / 2) * this.zoom;
            this.panY = -(contentCenterY - svgHeight / 2) * this.zoom;

            this.updateTransform();
            this.updateStatus();

        } catch (e) {
            console.error('Fit to content failed:', e);
            this.resetToOrigin();
        }
    }

    private resetToOrigin(): void {
        // Center (0,0) in the viewport
        // If SVG is 400x400, center is (200,200).
        // To put (0,0) at center, we shift by (200, 200) * zoom?
        // Wait, if (0,0) is top-left.
        // We want (0,0) to be at Viewport Center.
        // SVG Center (200,200) is at Viewport Center.
        // We need (0,0) -> (200,200) distance.
        // Shift = (200, 200).
        // panX = (SVGWidth/2 - 0) * zoom = 200 * 1 = 200.
        // Let's try.

        const svg = this.svgContainer.querySelector('svg');
        const svgWidth = parseFloat(svg?.getAttribute('width') || '400');
        const svgHeight = parseFloat(svg?.getAttribute('height') || '400');

        this.zoom = 1;
        this.panX = (svgWidth / 2);
        this.panY = (svgHeight / 2);

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
