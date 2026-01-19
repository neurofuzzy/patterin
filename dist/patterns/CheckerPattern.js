import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
/**
 * Create a checker/checkerboard pattern.
 * Generates alternating squares tagged as 'light' and 'dark'.
 *
 * @param options - Checker pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const checker = createChecker({
 *   size: 30,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createChecker(options) {
    const { size, bounds } = options;
    const cols = Math.ceil(bounds.width / size);
    const rows = Math.ceil(bounds.height / size);
    const shapes = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * size;
            const y = row * size;
            // Create square using four corner points
            const points = [
                new Vector2(x, y),
                new Vector2(x + size, y),
                new Vector2(x + size, y + size),
                new Vector2(x, y + size)
            ];
            const square = Shape.fromPoints(points);
            square.group = (row + col) % 2 === 0 ? 'light' : 'dark';
            shapes.push(square);
        }
    }
    return new ShapesContext(shapes);
}
