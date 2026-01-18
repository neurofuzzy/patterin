
import { Shape } from './src/primitives/Shape.ts';
import { CloneSystem } from './src/systems/CloneSystem.ts';
import { ShapesContext } from './src/contexts/ShapeContext.ts';
import { ShapeContext } from './src/contexts/ShapeContext.ts';

// Mock Shape.rect for context
const rectShape = Shape.regularPolygon(4, 10);
const rectContext = new ShapeContext(rectShape);

console.log("Original rect ephemeral:", rectShape.ephemeral);

// Chain clones
console.log("Cloning...");
const cs1 = rectContext.clone(2, 20, 0);
console.log("CS1 created. Original rect ephemeral:", rectShape.ephemeral);

const cs2 = cs1.clone(2, 0, 20);
// Access private _ephemeral with cast or check if exposed. 
// CloneSystem does not expose ephemeral getter, but we can check if it renders.
// But we can check internal state if we interpret it.
// Actually checking if CS1 is marked ephemeral is hard from outside without property.
// But we can check if CS2 shapes are what we expect.

console.log("CS2 shapes length:", cs2.shapes.length);

// Try to scale
const shapesCtx = cs2.shapes;
console.log("Trying to scale...");
try {
    // @ts-ignore
    shapesCtx.scale(2);
    console.log("Scale called successfully");
} catch (e) {
    console.log("Scale failed:", e.message);
}

// Check if shapes in CS2 are modified
// We can't easily check CS2 internal shapes without access, but we can verify if 'shapesCtx' shapes are same as CS2 internals
// if we could access them. 
// Instead, let's just check if shapesCtx shapes are modified.

const firstShape = shapesCtx.shapes[0]; // This is a clone in current impl
const originalArea = firstShape.boundingBox().width * firstShape.boundingBox().height;
console.log("First shape area (before potential scale):", originalArea);

try {
    // @ts-ignore
    shapesCtx.scale(2);
} catch (e) { }

const newArea = firstShape.boundingBox().width * firstShape.boundingBox().height;
console.log("First shape area (after potential scale):", newArea);

if (newArea > originalArea) {
    console.log("Scaling worked on the context shapes.");
} else {
    console.log("Scaling did NOT work on the context shapes.");
}
