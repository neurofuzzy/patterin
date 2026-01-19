/**
 * Export Modal - SVG export options with live preview
 */

interface ExportSettings {
  preset: 'letter' | 'a4' | 'a3' | 'custom';
  width: number;
  height: number;
  units: 'in' | 'mm';
  margin: number;
  paperColor: 'white' | 'black';
  strokeColor: 'themed' | 'black' | 'white';
}

const PRESETS = {
  letter: { width: 8.5, height: 11, units: 'in' as const },
  a4: { width: 210, height: 297, units: 'mm' as const },
  a3: { width: 297, height: 420, units: 'mm' as const },
  custom: { width: 100, height: 100, units: 'mm' as const },
};

let settings: ExportSettings = {
  preset: 'letter',
  width: 8.5,
  height: 11,
  units: 'in',
  margin: 0.5,
  paperColor: 'white',
  strokeColor: 'black',
};

let currentCollector: any = null;

export function createExportModal(passedCollector?: any): HTMLElement {
  currentCollector = passedCollector;

  const container = document.createElement('div');
  container.className = 'export-modal-enhanced';

  // Layout: Left controls, Right preview
  container.innerHTML = `
    <div class="export-layout">
      <div class="export-controls">
        <!-- Page Size -->
        <div class="modal-section">
          <label class="modal-label">Page Size</label>
          <select class="modal-select" id="export-preset">
            <option value="letter" ${settings.preset === 'letter' ? 'selected' : ''}>Letter (8.5×11 in)</option>
            <option value="a4" ${settings.preset === 'a4' ? 'selected' : ''}>A4 (210×297 mm)</option>
            <option value="a3" ${settings.preset === 'a3' ? 'selected' : ''}>A3 (297×420 mm)</option>
            <option value="custom" ${settings.preset === 'custom' ? 'selected' : ''}>Custom</option>
          </select>
        </div>

        <!-- Custom Dimensions -->
        <div class="modal-section size-section">
          <div class="size-row">
            <label>W:</label>
            <input type="number" id="export-width" value="${settings.width}" step="0.1" min="0">
            <span class="unit-label">${settings.units}</span>
          </div>
          <div class="size-row">
            <label>H:</label>
            <input type="number" id="export-height" value="${settings.height}" step="0.1" min="0">
            <span class="unit-label">${settings.units}</span>
          </div>
        </div>

        <!-- Margins -->
        <div class="modal-section">
          <label class="modal-label">Margin</label>
          <div class="size-row">
            <input type="number" id="export-margin" value="${settings.margin}" step="0.1" min="0">
            <span class="unit-label">${settings.units}</span>
          </div>
        </div>

        <!-- Paper Color -->
        <div class="modal-section">
          <label class="modal-label">Paper Color</label>
          <div class="color-toggle">
            <button class="color-btn ${settings.paperColor === 'white' ? 'active' : ''}" data-color="white">
              <span class="color-swatch white"></span> White
            </button>
            <button class="color-btn ${settings.paperColor === 'black' ? 'active' : ''}" data-color="black">
              <span class="color-swatch black"></span> Black
            </button>
          </div>
        </div>

        <!-- Stroke Color -->
        <div class="modal-section">
          <label class="modal-label">Stroke Color</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" name="stroke-color" value="themed" ${settings.strokeColor === 'themed' ? 'checked' : ''}>
              <span>Themed (current)</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="stroke-color" value="black" ${settings.strokeColor === 'black' ? 'checked' : ''}>
              <span>Black</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="stroke-color" value="white" ${settings.strokeColor === 'white' ? 'checked' : ''}>
              <span>White</span>
            </label>
          </div>
        </div>

        <!-- Download Button -->
        <button class="modal-button primary" id="export-download">Download SVG</button>
      </div>

      <div class="export-preview-container">
        <div class="export-preview" id="export-preview"></div>
      </div>
    </div>
  `;

  // Setup event listeners
  setupEventListeners(container);

  // Initial preview render
  requestAnimationFrame(() => updatePreview(container));

  return container;
}

function setupEventListeners(container: HTMLElement): void {
  const presetSelect = container.querySelector('#export-preset') as HTMLSelectElement;
  const widthInput = container.querySelector('#export-width') as HTMLInputElement;
  const heightInput = container.querySelector('#export-height') as HTMLInputElement;
  const marginInput = container.querySelector('#export-margin') as HTMLInputElement;
  const downloadBtn = container.querySelector('#export-download') as HTMLButtonElement;
  const colorBtns = container.querySelectorAll('.color-btn') as NodeListOf<HTMLButtonElement>;
  const strokeRadios = container.querySelectorAll('input[name="stroke-color"]') as NodeListOf<HTMLInputElement>;
  const unitLabels = container.querySelectorAll('.unit-label') as NodeListOf<HTMLSpanElement>;

  presetSelect.addEventListener('change', () => {
    const preset = presetSelect.value as keyof typeof PRESETS;
    settings.preset = preset;
    const presetData = PRESETS[preset];
    settings.width = presetData.width;
    settings.height = presetData.height;
    settings.units = presetData.units;
    widthInput.value = String(presetData.width);
    heightInput.value = String(presetData.height);
    unitLabels.forEach(l => l.textContent = presetData.units);
    // Reset margin to sensible default for unit
    settings.margin = presetData.units === 'in' ? 0.5 : 10;
    marginInput.value = String(settings.margin);
    updatePreview(container);
  });

  widthInput.addEventListener('input', () => {
    settings.width = parseFloat(widthInput.value) || 0;
    settings.preset = 'custom';
    presetSelect.value = 'custom';
    updatePreview(container);
  });

  heightInput.addEventListener('input', () => {
    settings.height = parseFloat(heightInput.value) || 0;
    settings.preset = 'custom';
    presetSelect.value = 'custom';
    updatePreview(container);
  });

  marginInput.addEventListener('input', () => {
    settings.margin = parseFloat(marginInput.value) || 0;
    updatePreview(container);
  });

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      settings.paperColor = btn.dataset.color as 'white' | 'black';
      // Auto-select contrasting stroke if themed
      if (settings.strokeColor === 'themed') {
        // Keep themed
      }
      updatePreview(container);
    });
  });

  strokeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      settings.strokeColor = radio.value as 'themed' | 'black' | 'white';
      updatePreview(container);
    });
  });

  downloadBtn.addEventListener('click', () => downloadSVG());
}

function updatePreview(container: HTMLElement): void {
  const previewContainer = container.querySelector('#export-preview') as HTMLDivElement;
  if (!previewContainer) return;

  // Calculate preview dimensions (fit in container maintaining aspect ratio)
  const containerRect = previewContainer.getBoundingClientRect();
  const maxPreviewWidth = containerRect.width || 200;
  const maxPreviewHeight = containerRect.height || 280;

  const pageAspect = settings.width / settings.height;
  let previewWidth: number;
  let previewHeight: number;

  if (pageAspect > maxPreviewWidth / maxPreviewHeight) {
    previewWidth = maxPreviewWidth;
    previewHeight = maxPreviewWidth / pageAspect;
  } else {
    previewHeight = maxPreviewHeight;
    previewWidth = maxPreviewHeight * pageAspect;
  }

  // Create preview SVG
  const pxPerUnit = settings.units === 'in' ? 96 : 96 / 25.4;
  const pagePxW = settings.width * pxPerUnit;
  const pagePxH = settings.height * pxPerUnit;
  const marginPx = settings.margin * pxPerUnit;

  const bgColor = settings.paperColor === 'white' ? '#ffffff' : '#1a1a1a';
  const borderColor = settings.paperColor === 'white' ? '#ccc' : '#444';

  let contentSVG = '';
  if (currentCollector && typeof currentCollector.toString === 'function') {
    // Get the content SVG with scale-to-fit within the margin area
    const innerWidth = pagePxW - marginPx * 2;
    const innerHeight = pagePxH - marginPx * 2;

    try {
      contentSVG = currentCollector.toString({
        width: innerWidth,
        height: innerHeight,
        margin: 0,
        autoScale: true,
      });

      // Modify stroke colors if needed
      if (settings.strokeColor !== 'themed') {
        const strokeVal = settings.strokeColor === 'black' ? '#000000' : '#ffffff';
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentSVG, 'image/svg+xml');
        doc.querySelectorAll('path').forEach(path => {
          path.setAttribute('stroke', strokeVal);
        });
        contentSVG = new XMLSerializer().serializeToString(doc.documentElement);
      }
    } catch (e) {
      console.error('Failed to generate preview content:', e);
    }
  }

  // Build preview HTML
  const scale = previewWidth / pagePxW;
  const marginScaled = marginPx * scale;

  previewContainer.innerHTML = `
    <div class="preview-page" style="
      width: ${previewWidth}px;
      height: ${previewHeight}px;
      background: ${bgColor};
      border: 1px solid ${borderColor};
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
    ">
      <div class="preview-margin-box" style="
        position: absolute;
        left: ${marginScaled}px;
        top: ${marginScaled}px;
        right: ${marginScaled}px;
        bottom: ${marginScaled}px;
        border: 1px dashed ${settings.paperColor === 'white' ? '#ddd' : '#333'};
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      ">
        <div class="preview-content" style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${contentSVG ? `<div style="width: 100%; height: 100%;">${contentSVG}</div>` : '<span style="color: #888; font-size: 10px;">No content</span>'}
        </div>
      </div>
    </div>
  `;

  // Scale the inner SVG to fit
  const innerSvg = previewContainer.querySelector('.preview-content svg') as SVGElement;
  if (innerSvg) {
    innerSvg.style.width = '100%';
    innerSvg.style.height = '100%';
    innerSvg.removeAttribute('width');
    innerSvg.removeAttribute('height');
  }
}

function downloadSVG(): void {
  const pxPerUnit = settings.units === 'in' ? 96 : 96 / 25.4;
  const pagePxW = settings.width * pxPerUnit;
  const pagePxH = settings.height * pxPerUnit;
  const marginPx = settings.margin * pxPerUnit;

  const bgColor = settings.paperColor === 'white' ? '#ffffff' : '#1a1a1a';

  let svgContent: string;

  if (currentCollector && typeof currentCollector.toString === 'function') {
    const innerWidth = pagePxW - marginPx * 2;
    const innerHeight = pagePxH - marginPx * 2;

    // Get flattened SVG with pre-transformed coordinates
    let innerSVG = currentCollector.toString({
      width: innerWidth,
      height: innerHeight,
      margin: 0,
      autoScale: true,
      flatten: true,  // Use flatten mode for maximum compatibility
    });

    // Parse and modify
    const parser = new DOMParser();
    const doc = parser.parseFromString(innerSVG, 'image/svg+xml');

    // Modify strokes if needed
    if (settings.strokeColor !== 'themed') {
      const strokeVal = settings.strokeColor === 'black' ? '#000000' : '#ffffff';
      doc.querySelectorAll('path').forEach(path => {
        path.setAttribute('stroke', strokeVal);
      });
    }

    // Apply margin offset to all paths (including those in groups)
    doc.querySelectorAll('path').forEach(path => {
      const d = path.getAttribute('d') || '';
      const offsetD = offsetPathData(d, marginPx, marginPx);
      path.setAttribute('d', offsetD);
    });

    // Extract all children from the inner SVG (preserving groups)
    const contentParts: string[] = [];
    const svgRoot = doc.documentElement;
    for (const child of Array.from(svgRoot.children)) {
      // Skip any rects that were added as backgrounds
      if (child.tagName.toLowerCase() === 'rect') continue;
      contentParts.push(child.outerHTML);
    }

    // Build final flat SVG - preserving groups
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${pagePxW}" height="${pagePxH}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  ${contentParts.join('\n  ')}
</svg>`;
  } else {
    // Fallback: empty page
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${pagePxW}" height="${pagePxH}">
  <rect width="100%" height="100%" fill="${bgColor}"/>
</svg>`;
  }

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'patterin-export.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Offset path data coordinates by a fixed amount.
 */
function offsetPathData(d: string, offsetX: number, offsetY: number): string {
  return d.replace(
    /([ML])\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)\s+(-?\d+\.?\d*(?:e[+-]?\d+)?)/gi,
    (_match, cmd, xStr, yStr) => {
      const x = parseFloat(xStr) + offsetX;
      const y = parseFloat(yStr) + offsetY;
      return `${cmd} ${x} ${y}`;
    }
  );
}
