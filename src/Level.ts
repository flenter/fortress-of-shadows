import { Coordinates, Direction } from "./types";

export enum TileType {
  None,
  Path,
}

export type TileMap = Array<TileType[]>;

export class Level {
  private tileMap: TileMap;

  constructor(map: TileMap) {
    this.tileMap = map;
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
        !(right.coordinates.x === ignoreCoordinates?.x &&
          right.coordinates.y === ignoreCoordinates?.y)
      ) {
        return right;
      }
    }

    const down = this.findPathDown(currentCoordinates);
    if (down) {
      if (
        !(down.coordinates.x === ignoreCoordinates?.x &&
          down.coordinates.y === ignoreCoordinates?.y)
      ) {
        return down;
      }
    }

    const left = this.findPathLeft(currentCoordinates);
    if (left) {
      if (
        !(left.coordinates.x === ignoreCoordinates?.x &&
          left.coordinates.y === ignoreCoordinates?.y)
      ) {
        return left;
      }
    }

    const up = this.findPathUp(currentCoordinates);
    if (up) {
      if (
        !(up.coordinates.x === ignoreCoordinates?.x &&
          up.coordinates.y === ignoreCoordinates?.y)
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
