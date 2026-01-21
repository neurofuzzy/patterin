/**
 * Thumbnail Generator for Examples
 * Run this page to generate SVG thumbnails for all examples
 */

import { EXAMPLES, Example } from './examples/index.ts';
import type { WorkerResponse } from './worker.ts';

interface ThumbnailResult {
    example: Example;
    svg: string | null;
    error: string | null;
}

const results: ThumbnailResult[] = [];
let worker: Worker;

// Initialize worker
function initWorker(): void {
    worker = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module',
    });
}

// Generate thumbnail for a single example
async function generateThumbnail(example: Example): Promise<ThumbnailResult> {
    return new Promise((resolve) => {
        const handler = (e: MessageEvent<WorkerResponse>) => {
            worker.removeEventListener('message', handler);

            if (e.data.type === 'success') {
                // Use collectorData to re-render at thumbnail size
                let svg: string;
                if (e.data.collectorData) {
                    svg = renderThumbnailFromCollectorData(e.data.collectorData);
                } else {
                    // Fallback: try to scale the existing SVG
                    svg = scaleSVGForThumbnail(e.data.svg);
                }
                resolve({ example, svg, error: null });
            } else {
                resolve({ example, svg: null, error: e.data.error });
            }
        };

        worker.addEventListener('message', handler);
        worker.postMessage({ 
            type: 'execute', 
            code: example.code,
            autoRender: true 
        });
    });
}

// Render thumbnail directly from collector data
function renderThumbnailFromCollectorData(data: {
    paths: Array<{ d: string; style: any; group?: string }>;
    bounds: { minX: number; minY: number; maxX: number; maxY: number };
}): string {
    const { paths, bounds } = data;
    const { minX, minY, maxX, maxY } = bounds;
    
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Thumbnail dimensions (16:9 aspect ratio)
    const thumbWidth = 160;
    const thumbHeight = 90;
    const padding = 6; // Small padding
    
    // Calculate scale to FILL thumbnail (zoom in for close-up)
    const scaleX = (thumbWidth - padding * 2) / contentWidth;
    const scaleY = (thumbHeight - padding * 2) / contentHeight;
    const scale = Math.max(scaleX, scaleY); // max = zoom to fill
    
    // Calculate the viewBox to center the content
    const viewBoxWidth = thumbWidth / scale;
    const viewBoxHeight = thumbHeight / scale;
    const centerX = minX + contentWidth / 2;
    const centerY = minY + contentHeight / 2;
    const viewBoxMinX = centerX - viewBoxWidth / 2;
    const viewBoxMinY = centerY - viewBoxHeight / 2;
    
    // Render paths
    const pathElements = paths.map(({ d, style }) => {
        const attrs: string[] = [`d="${d}"`];
        
        if (style.fill && style.fill !== 'none') {
            attrs.push(`fill="${style.fill}"`);
        } else {
            attrs.push(`fill="none"`);
        }
        
        if (style.stroke && style.stroke !== 'none') {
            attrs.push(`stroke="${style.stroke}"`);
        }
        
        if (style.strokeWidth !== undefined) {
            attrs.push(`stroke-width="${style.strokeWidth}"`);
        }
        
        if (style.opacity !== undefined) {
            attrs.push(`opacity="${style.opacity}"`);
        }
        
        return `<path ${attrs.join(' ')} />`;
    }).join('\n  ');
    
    return `<svg width="160" height="90" viewBox="${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg">
  ${pathElements}
</svg>`;
}

// Scale SVG to fit in thumbnail (160x90px) with "scale to fill"
function scaleSVGForThumbnail(svgString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    
    if (!svg) return svgString;

    // Get the viewBox which contains the actual content bounds
    const viewBox = svg.getAttribute('viewBox');
    if (!viewBox) {
        // Fallback: just set fixed dimensions (16:9 aspect ratio)
        svg.setAttribute('width', '160');
        svg.setAttribute('height', '90');
        return new XMLSerializer().serializeToString(svg);
    }
    
    const [minX, minY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);
    
    // Target thumbnail dimensions (16:9 aspect ratio)
    const targetWidth = 160;
    const targetHeight = 90;
    const padding = 6; // pixels of padding
    
    // Calculate scale to FILL the thumbnail (zoom in to content)
    // Use max instead of min to fill, then we'll crop what doesn't fit
    const scaleX = (targetWidth - padding * 2) / vbWidth;
    const scaleY = (targetHeight - padding * 2) / vbHeight;
    const scale = Math.max(scaleX, scaleY); // Use max to fill/zoom
    
    // Calculate the centered crop area in viewBox coordinates
    const scaledWidth = targetWidth / scale;
    const scaledHeight = targetHeight / scale;
    
    // Center the content in the thumbnail
    const centerX = minX + vbWidth / 2;
    const centerY = minY + vbHeight / 2;
    const newMinX = centerX - scaledWidth / 2;
    const newMinY = centerY - scaledHeight / 2;
    
    // Create wrapper SVG with the zoomed viewBox
    const wrapper = `<svg width="160" height="90" viewBox="${newMinX} ${newMinY} ${scaledWidth} ${scaledHeight}" xmlns="http://www.w3.org/2000/svg">
  ${svg.innerHTML}
</svg>`;
    
    return wrapper;
}

// Minify SVG string for embedding
function minifySVG(svg: string): string {
    return svg
        .replace(/\n\s*/g, '') // Remove newlines and indentation
        .replace(/>\s+</g, '><') // Remove spaces between tags
        .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
        .trim();
}

// Render a single example card
function renderExampleCard(result: ThumbnailResult): HTMLElement {
    const card = document.createElement('div');
    card.className = 'example-card';
    
    card.innerHTML = `
        <div class="example-header">
            <div>
                <div class="example-title">${result.example.name}</div>
                <div class="example-category">${result.example.category}</div>
            </div>
            ${result.svg ? '<button class="download-btn">💾 Save</button>' : ''}
        </div>
        <div class="thumbnail-container">
            ${result.svg ? result.svg : result.error ? `<div class="error">${result.error}</div>` : '<div class="loading">Generating...</div>'}
        </div>
    `;
    
    if (result.svg) {
        const downloadBtn = card.querySelector('.download-btn');
        downloadBtn?.addEventListener('click', () => {
            downloadThumbnail(result);
            downloadBtn.textContent = '✓ Saved!';
            setTimeout(() => {
                downloadBtn.textContent = '💾 Save';
            }, 2000);
        });
    }
    
    return card;
}

// Convert example name to filename
function nameToSlug(name: string): string {
    return name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Generate TypeScript code with thumbnail URLs
function generateTypescriptCode(): string {
    // Generate the EXAMPLE_THUMBNAILS object with URL references
    let code = '/**\n';
    code += ' * Thumbnail URLs for examples\n';
    code += ' * SVG files are stored in playground/public/thumbnails/\n';
    code += ' * Generate using: http://localhost:3000/patterin/generate-thumbnails.html\n';
    code += ' */\n';
    code += 'export const EXAMPLE_THUMBNAILS: Record<string, string> = {\n';
    
    results.forEach((result) => {
        if (result.svg) {
            const slug = nameToSlug(result.example.name);
            code += `  ${JSON.stringify(result.example.name)}: \`/thumbnails/${slug}.svg\`,\n`;
        }
    });
    
    code += '};\n';
    
    return code;
}

// Download individual thumbnail as SVG file
function downloadThumbnail(result: ThumbnailResult): void {
    if (!result.svg) return;
    
    const slug = nameToSlug(result.example.name);
    const blob = new Blob([result.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Download all thumbnails as individual files
async function downloadAllThumbnails(): Promise<void> {
    for (const result of results) {
        if (result.svg) {
            downloadThumbnail(result);
            // Small delay between downloads to avoid browser blocking
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

// Main generation function
async function generateAll(): Promise<void> {
    const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
    const downloadAllBtn = document.getElementById('downloadAllBtn') as HTMLButtonElement;
    const copyAllBtn = document.getElementById('copyAllBtn') as HTMLButtonElement;
    const status = document.getElementById('status') as HTMLElement;
    const grid = document.getElementById('grid') as HTMLElement;
    const outputSection = document.getElementById('outputSection') as HTMLElement;
    const output = document.getElementById('output') as HTMLTextAreaElement;
    
    generateBtn.disabled = true;
    downloadAllBtn.disabled = true;
    copyAllBtn.disabled = true;
    results.length = 0;
    grid.innerHTML = '';
    outputSection.style.display = 'none';
    
    // Create placeholder cards
    const cards: HTMLElement[] = [];
    EXAMPLES.forEach(example => {
        const result: ThumbnailResult = { example, svg: null, error: null };
        const card = renderExampleCard(result);
        cards.push(card);
        grid.appendChild(card);
    });
    
    // Generate thumbnails one by one
    for (let i = 0; i < EXAMPLES.length; i++) {
        status.textContent = `Generating ${i + 1}/${EXAMPLES.length}...`;
        
        const result = await generateThumbnail(EXAMPLES[i]);
        results.push(result);
        
        // Update the card
        const newCard = renderExampleCard(result);
        cards[i].replaceWith(newCard);
        cards[i] = newCard;
    }
    
    status.textContent = `✓ Generated ${results.length} thumbnails`;
    status.className = 'status success';
    
    // Generate TypeScript code
    const code = generateTypescriptCode();
    output.value = code;
    outputSection.style.display = 'block';
    
    generateBtn.disabled = false;
    downloadAllBtn.disabled = false;
    copyAllBtn.disabled = false;
}

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    initWorker();
    
    const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
    const downloadAllBtn = document.getElementById('downloadAllBtn') as HTMLButtonElement;
    const copyAllBtn = document.getElementById('copyAllBtn') as HTMLButtonElement;
    const output = document.getElementById('output') as HTMLTextAreaElement;
    
    generateBtn?.addEventListener('click', generateAll);
    
    downloadAllBtn?.addEventListener('click', async () => {
        downloadAllBtn.textContent = '⏳ Downloading...';
        downloadAllBtn.disabled = true;
        await downloadAllThumbnails();
        downloadAllBtn.textContent = '✓ All Downloaded!';
        setTimeout(() => {
            downloadAllBtn.textContent = '💾 Download All SVGs';
            downloadAllBtn.disabled = false;
        }, 3000);
    });
    
    copyAllBtn?.addEventListener('click', () => {
        navigator.clipboard.writeText(output.value);
        copyAllBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyAllBtn.textContent = '📋 Copy Code';
        }, 2000);
    });
});
