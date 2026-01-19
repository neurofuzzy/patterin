/**
 * Examples Modal - Example gallery
 */
import { EXAMPLES, Example } from '../examples/index.ts';

export function createExamplesModal(onSelect: (code: string) => void): HTMLElement {
    const container = document.createElement('div');
    container.className = 'examples-modal';

    // Category tabs
    const categories = [...new Set(EXAMPLES.map(e => e.category))];

    const tabs = document.createElement('div');
    tabs.className = 'examples-tabs';

    let activeCategory = categories[0];

    for (const category of categories) {
        const tab = document.createElement('button');
        tab.className = 'examples-tab';
        tab.textContent = category;
        if (category === activeCategory) {
            tab.classList.add('active');
        }
        tab.addEventListener('click', () => {
            tabs.querySelectorAll('.examples-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = category;
            renderExamples();
        });
        tabs.appendChild(tab);
    }

    const grid = document.createElement('div');
    grid.className = 'examples-grid';

    function renderExamples(): void {
        grid.innerHTML = '';

        const filtered = EXAMPLES.filter(e => e.category === activeCategory);

        for (const example of filtered) {
            const card = createExampleCard(example, () => {
                onSelect(example.code);
                // Close modal by clicking overlay
                document.querySelector('.modal-overlay')?.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                );
            });
            grid.appendChild(card);
        }
    }

    container.appendChild(tabs);
    container.appendChild(grid);

    renderExamples();

    return container;
}

function createExampleCard(example: Example, onClick: () => void): HTMLElement {
    const card = document.createElement('button');
    card.className = 'example-card';

    const preview = document.createElement('div');
    preview.className = 'example-preview';
    preview.innerHTML = example.preview || `<div class="example-placeholder">${example.name[0]}</div>`;

    const name = document.createElement('div');
    name.className = 'example-name';
    name.textContent = example.name;

    const desc = document.createElement('div');
    desc.className = 'example-desc';
    desc.textContent = example.description;

    card.appendChild(preview);
    card.appendChild(name);
    card.appendChild(desc);

    card.addEventListener('click', onClick);

    return card;
}
