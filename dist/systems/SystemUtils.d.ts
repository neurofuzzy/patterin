import { Shape } from '../primitives';
import { PathStyle } from '../collectors/SVGCollector';
export interface RenderGroup {
    name: string;
    items: {
        shape: Shape;
        style?: PathStyle;
    }[];
    defaultStyle: PathStyle;
}
/**
 * Shared logic for system SVG generation.
 * Handles auto-scaling, centering, and grouped rendering of shapes.
 */
export declare function renderSystemToSVG(width: number, height: number, margin: number, groups: RenderGroup[]): string;
