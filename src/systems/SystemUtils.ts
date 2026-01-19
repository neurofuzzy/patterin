import { Shape } from '../primitives/Shape.ts';
import { Vector2 } from '../primitives/Vector2.ts';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector.ts';

export interface RenderGroup {
    name: string;
    items: { shape: Shape; style?: PathStyle }[];
    defaultStyle: PathStyle;
}

/**
 * Shared logic for system SVG generation.
 * Handles auto-scaling, centering, and grouped rendering of shapes.
 */
export function renderSystemToSVG(
    width: number,
    height: number,
    margin: number,
    groups: RenderGroup[]
): string {
    const collector = new SVGCollector();

    // Flatten all items to compute global bounds
    const allItems = groups.flatMap(g => g.items);

    if (allItems.length === 0) {
        return collector.toString({ width, height });
    }

    // Compute bounds
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const item of allItems) {
        const bbox = item.shape.boundingBox();
        minX = Math.min(minX, bbox.min.x);
        minY = Math.min(minY, bbox.min.y);
        maxX = Math.max(maxX, bbox.max.x);
        maxY = Math.max(maxY, bbox.max.y);
    }

    const contentWidth = maxX - minX || 1;
    const contentHeight = maxY - minY || 1;

    // Scale to fit
    const availW = width - margin * 2;
    const availH = height - margin * 2;
    const scale = Math.min(availW / contentWidth, availH / contentHeight);

    // Center offset
    const offsetX = margin + (availW - contentWidth * scale) / 2 - minX * scale;
    const offsetY = margin + (availH - contentHeight * scale) / 2 - minY * scale;

    // Render groups
    for (const group of groups) {
        if (group.items.length === 0) continue;

        collector.beginGroup(group.name);
        for (const item of group.items) {
            const clone = item.shape.clone();
            clone.scale(scale);
            clone.translate(new Vector2(offsetX, offsetY));
            collector.addShape(clone, item.style ?? group.defaultStyle);
        }
        collector.endGroup();
    }

    return collector.toString({ width, height });
}
