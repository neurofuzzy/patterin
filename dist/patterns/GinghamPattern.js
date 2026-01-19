import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
/**
 * Create a gingham pattern.
 * Generates overlapping horizontal and vertical bands creating a woven appearance.
 *
 * @param options - Gingham pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const gingham = createGingham({
 *   checkSize: 20,
 *   bands: [1, 3, 1, 3],  // Thin-thick-thin-thick pattern
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createGingham(options) {
    const { checkSize, bounds } = options;
    const bands = options.bands ?? [1, 2, 1, 2]; // Default pattern
    const shapes = [];
    // Calculate total pattern width
    const totalBandUnits = bands.reduce((sum, b) => sum + b, 0);
    const patternSize = totalBandUnits * checkSize;
    // Generate band positions
    const bandPositions = [];
    let currentPos = 0;
    for (let i = 0; i < bands.length; i++) {
        const width = bands[i] * checkSize;
        bandPositions.push({ start: currentPos, width, index: i });
        currentPos += width;
    }
    // Create horizontal bands
    let y = 0;
    let bandIndex = 0;
    while (y < bounds.height) {
        const band = bandPositions[bandIndex % bands.length];
        const horizontalBand = Shape.fromPoints([
            new Vector2(0, y),
            new Vector2(bounds.width, y),
            new Vector2(bounds.width, y + band.width),
            new Vector2(0, y + band.width)
        ]);
        horizontalBand.group = band.index % 2 === 0 ? 'horizontal-light' : 'horizontal-dark';
        shapes.push(horizontalBand);
        y += band.width;
        bandIndex++;
    }
    // Create vertical bands
    let x = 0;
    bandIndex = 0;
    while (x < bounds.width) {
        const band = bandPositions[bandIndex % bands.length];
        const verticalBand = Shape.fromPoints([
            new Vector2(x, 0),
            new Vector2(x + band.width, 0),
            new Vector2(x + band.width, bounds.height),
            new Vector2(x, bounds.height)
        ]);
        verticalBand.group = band.index % 2 === 0 ? 'vertical-light' : 'vertical-dark';
        shapes.push(verticalBand);
        x += band.width;
        bandIndex++;
    }
    // Create intersection rectangles where bands cross
    y = 0;
    let yBandIndex = 0;
    while (y < bounds.height) {
        const yBand = bandPositions[yBandIndex % bands.length];
        x = 0;
        let xBandIndex = 0;
        while (x < bounds.width) {
            const xBand = bandPositions[xBandIndex % bands.length];
            const intersection = Shape.fromPoints([
                new Vector2(x, y),
                new Vector2(x + xBand.width, y),
                new Vector2(x + xBand.width, y + yBand.width),
                new Vector2(x, y + yBand.width)
            ]);
            // Intersections where both bands are dark get special group
            const isDark = (xBand.index % 2 === 1) && (yBand.index % 2 === 1);
            intersection.group = isDark ? 'intersection-dark' : 'intersection-light';
            shapes.push(intersection);
            x += xBand.width;
            xBandIndex++;
        }
        y += yBand.width;
        yBandIndex++;
    }
    return new ShapesContext(shapes);
}
