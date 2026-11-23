// Shared, mutable animation state written by scroll handlers and read inside
// useFrame loops. Kept outside React so scrolling never triggers re-renders.
export const scroll = { progress: 0 }
export const pointer = { x: 0, y: 0 }
