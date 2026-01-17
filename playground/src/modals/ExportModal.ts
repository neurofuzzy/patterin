/**
 * Export Modal - SVG export options
 */

interface ExportSettings {
    style: 'themed' | 'plain';
    preset: 'letter' | 'a4' | 'a3' | 'custom';
    width: number;
    height: number;
    units: 'in' | 'mm';
}

const PRESETS = {
    letter: { width: 8.5, height: 11, units: 'in' as const },
    a4: { width: 210, height: 297, units: 'mm' as const },
    a3: { width: 297, height: 420, units: 'mm' as const },
    custom: { width: 100, height: 100, units: 'mm' as const },
};

let settings: ExportSettings = {
    style: 'themed',
    preset: 'letter',
    width: 8.5,
    height: 11,
    units: 'in',
};

export function createExportModal(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'export-modal';

    // Style section
    const styleSection = document.createElement('div');
    styleSection.className = 'modal-section';
    styleSection.innerHTML = `
    <label class="modal-label">Style</label>
    <div class="radio-group">
      <label class="radio-option">
        <input type="radio" name="export-style" value="themed" ${settings.style === 'themed' ? 'checked' : ''}>
        <span>Themed (current)</span>
      </label>
      <label class="radio-option">
        <input type="radio" name="export-style" value="plain" ${settings.style === 'plain' ? 'checked' : ''}>
        <span>Plain (black/white)</span>
      </label>
    </div>
  `;

    // Preset section
    const presetSection = document.createElement('div');
    presetSection.className = 'modal-section';
    presetSection.innerHTML = `
    <label class="modal-label">Preset</label>
    <select class="modal-select" id="export-preset">
      <option value="letter" ${settings.preset === 'letter' ? 'selected' : ''}>Letter (8.5×11 in)</option>
      <option value="a4" ${settings.preset === 'a4' ? 'selected' : ''}>A4 (210×297 mm)</option>
      <option value="a3" ${settings.preset === 'a3' ? 'selected' : ''}>A3 (297×420 mm)</option>
      <option value="custom" ${settings.preset === 'custom' ? 'selected' : ''}>Custom</option>
    </select>
  `;

    // Size section
    const sizeSection = document.createElement('div');
    sizeSection.className = 'modal-section';
    sizeSection.innerHTML = `
    <label class="modal-label">Page Size</label>
    <div class="size-inputs">
      <div class="size-row">
        <label>Width:</label>
        <input type="number" id="export-width" value="${settings.width}" step="0.1" min="0">
      </div>
      <div class="size-row">
        <label>Height:</label>
        <input type="number" id="export-height" value="${settings.height}" step="0.1" min="0">
      </div>
      <div class="units-row">
        <label class="radio-option">
          <input type="radio" name="export-units" value="in" ${settings.units === 'in' ? 'checked' : ''}>
          <span>in</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="export-units" value="mm" ${settings.units === 'mm' ? 'checked' : ''}>
          <span>mm</span>
        </label>
      </div>
    </div>
  `;

    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'modal-button primary';
    downloadBtn.textContent = 'Download SVG';
    downloadBtn.addEventListener('click', () => downloadSVG());

    container.appendChild(styleSection);
    container.appendChild(presetSection);
    container.appendChild(sizeSection);
    container.appendChild(downloadBtn);

    // Event handlers
    const presetSelect = container.querySelector('#export-preset') as HTMLSelectElement;
    const widthInput = container.querySelector('#export-width') as HTMLInputElement;
    const heightInput = container.querySelector('#export-height') as HTMLInputElement;

    presetSelect.addEventListener('change', () => {
        const preset = presetSelect.value as keyof typeof PRESETS;
        settings.preset = preset;
        const presetData = PRESETS[preset];
        settings.width = presetData.width;
        settings.height = presetData.height;
        settings.units = presetData.units;
        widthInput.value = String(presetData.width);
        heightInput.value = String(presetData.height);

        // Update units radio
        const unitsRadios = container.querySelectorAll('input[name="export-units"]') as NodeListOf<HTMLInputElement>;
        unitsRadios.forEach(r => r.checked = r.value === presetData.units);
    });

    widthInput.addEventListener('input', () => {
        settings.width = parseFloat(widthInput.value) || 0;
        settings.preset = 'custom';
        presetSelect.value = 'custom';
    });

    heightInput.addEventListener('input', () => {
        settings.height = parseFloat(heightInput.value) || 0;
        settings.preset = 'custom';
        presetSelect.value = 'custom';
    });

    container.querySelectorAll('input[name="export-style"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            settings.style = (e.target as HTMLInputElement).value as 'themed' | 'plain';
        });
    });

    container.querySelectorAll('input[name="export-units"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            settings.units = (e.target as HTMLInputElement).value as 'in' | 'mm';
        });
    });

    return container;
}

function downloadSVG(): void {
    // Get the current SVG from the preview
    const svgContainer = document.querySelector('.svg-container');
    const svg = svgContainer?.querySelector('svg');

    if (!svg) {
        alert('No SVG to export. Run your code first.');
        return;
    }

    // Clone and modify if plain style
    const clonedSvg = svg.cloneNode(true) as SVGElement;

    if (settings.style === 'plain') {
        // Convert to black/white
        clonedSvg.querySelectorAll('path').forEach(path => {
            path.setAttribute('stroke', '#000000');
            path.setAttribute('fill', 'none');
        });
        clonedSvg.style.background = '#ffffff';
    }

    // Set dimensions
    const pxPerUnit = settings.units === 'in' ? 96 : 96 / 25.4;
    const widthPx = settings.width * pxPerUnit;
    const heightPx = settings.height * pxPerUnit;

    clonedSvg.setAttribute('width', `${widthPx}`);
    clonedSvg.setAttribute('height', `${heightPx}`);

    // Create download
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'patterin-export.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
