import { Coordinates } from "./types";

export function lerp(start: number, end: number, amount: number) {
  return (1 - amount) * start + amount * end;
}

export function compareCoordinates(a: Coordinates, b: Coordinates) {
  return a.x === b.x && a.y === b.y;
}
