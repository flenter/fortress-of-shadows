import { Coordinates, Direction } from "./types";
import { compareCoordinates } from "./utils";

export enum TileType {
  None,
  Path,
}

export type TileMap = Array<TileType[]>;

export class Level {
  startCoordinates: Coordinates;
  endCoordinates: Coordinates;
  private tileMap: TileMap;

  constructor(
    map: TileMap,
    startCoordinates: Coordinates,
    endCoordinates: Coordinates,
  ) {
    this.tileMap = map;
    this.startCoordinates = startCoordinates;
    this.endCoordinates = endCoordinates;
  }

  getTile(coordinates: Coordinates) {
    const y = this.tileMap[coordinates.y];
    if (y) {
      return y[coordinates.x];
    }
  }

  findPath(
    currentCoordinates: Coordinates,
    ignoreCoordinates?: Coordinates,
  ): { coordinates: Coordinates; direction: Direction } | undefined {
    const right = this.findPathRight(currentCoordinates);
    if (right) {
      if (
        !ignoreCoordinates ||
        !compareCoordinates(right.coordinates, ignoreCoordinates)
      ) {
        return right;
      }
    }

    const down = this.findPathDown(currentCoordinates);
    if (down) {
      if (
        !ignoreCoordinates ||
        !compareCoordinates(down.coordinates, ignoreCoordinates)
      ) {
        return down;
      }
    }

    const left = this.findPathLeft(currentCoordinates);
    if (left) {
      if (
        !ignoreCoordinates ||
        !compareCoordinates(left.coordinates, ignoreCoordinates)
      ) {
        return left;
      }
    }

    const up = this.findPathUp(currentCoordinates);
    if (up) {
      if (
        !ignoreCoordinates ||
        !compareCoordinates(up.coordinates, ignoreCoordinates)
      ) {
        return up;
      }
    }
  }

  private findPathRight(currentCoordinates: Coordinates) {
    const right = this.getTile({
      x: currentCoordinates.x + 1,
      y: currentCoordinates.y,
    });

    if (right === TileType.Path) {
      return {
        coordinates: { ...currentCoordinates, x: currentCoordinates.x + 1 },
        direction: Direction.Right,
      };
    }
  }

  private findPathDown(currentCoordinates: Coordinates) {
    {
      const down = this.getTile({
        x: currentCoordinates.x,
        y: currentCoordinates.y + 1,
      });

      if (down === TileType.Path) {
        return {
          coordinates: { ...currentCoordinates, y: currentCoordinates.y + 1 },
          direction: Direction.Down,
        };
      }
    }
  }

  private findPathLeft(currentCoordinates: Coordinates) {
    const left = this.getTile({
      x: currentCoordinates.x - 1,
      y: currentCoordinates.y,
    });

    if (left === TileType.Path) {
      return {
        coordinates: { ...currentCoordinates, x: currentCoordinates.x - 1 },
        direction: Direction.Left,
      };
    }
  }

  private findPathUp(currentCoordinates: Coordinates) {
    const up = this.getTile({
      x: currentCoordinates.x,
      y: currentCoordinates.y - 1,
    });

    if (up === TileType.Path) {
      return {
        coordinates: { ...currentCoordinates, y: currentCoordinates.y - 1 },
        direction: Direction.Right,
      };
    }
  }
}
