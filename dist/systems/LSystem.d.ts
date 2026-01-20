import { Shape, Vertex } from '../primitives';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector';
import { ShapeContext, PointsContext, LinesContext } from '../contexts';
import { BaseSystem, type RenderGroup } from './BaseSystem';
import type { SystemBounds } from '../types';
export interface LSystemOptions {
    axiom: string;
    rules: Record<string, string>;
    iterations: number;
    angle: number;
    length: number;
    origin?: [number, number];
    heading?: number;
}
export declare class LSystem extends BaseSystem {
    private _config;
    private _segments;
    private _nodes;
    private _endpoints;
    segments: LinesContext;
    nodes: PointsContext;
    endpoints: PointsContext;
    path: ShapeContext;
    private _shape;
    private constructor();
    static create(config: LSystemOptions): LSystem;
    private applyRules;
    private interpretTurtle;
    /**
     * Make the object concrete (renderable).
     */
    trace(): this;
    protected getNodes(): Vertex[];
    protected filterByMask(shape: Shape): void;
    protected scaleGeometry(factor: number): void;
    protected rotateGeometry(angleRad: number): void;
    protected stampGeometry(collector: SVGCollector, style?: PathStyle): void;
    protected getGeometryRenderGroups(): RenderGroup[];
    protected getGeometryBounds(): SystemBounds;
    protected getSourceForSelection(): Shape[];
}
