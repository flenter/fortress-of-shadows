import { Application, Container, ICanvas, Texture } from "pixi.js";
import { Coordinates, Direction } from "./types";
import { compareCoordinates } from "./utils";
import { VisualElement } from "./VisualElement";
import { TILE_SIZE } from "./constants";
import { Tilemap } from "@pixi/tilemap";
import { Tower } from "./Tower";
import { Enemy } from "./Enemy";

export enum TileType {
  None,
  Path,
}

export type TileMap = Array<TileType[]>;

export class Level implements VisualElement {
  startCoordinates: Coordinates;
  endCoordinates: Coordinates;
  sprite: VisualElement["sprite"];
  objectsContainer: VisualElement["sprite"];
  towers: Array<Tower> = [];
  enemies: Array<Enemy> = [];
  private tileMap: TileMap;
  elapsed: number = 0.0;
  app: Application<ICanvas>;

  constructor(
    map: TileMap,
    startCoordinates: Coordinates,
    endCoordinates: Coordinates,
    app: Application<ICanvas>,
  ) {
    this.app = app;
    this.tileMap = map;
    this.startCoordinates = startCoordinates;
    this.endCoordinates = endCoordinates;
    this.towers = [new Tower({ x: 3, y: 2 }), new Tower({ x: 2, y: 4 })];
    this.sprite = new Container();
    this.objectsContainer = new Container();
    this.initSprite();
  }

  initSprite() {
    const tilemap = createMapFromTiles(this.tileMap);
    this.sprite.addChild(tilemap);

    this.sprite.addChild(this.objectsContainer);

    for (const tower of this.towers) {
      this.objectsContainer.addChild(tower.sprite);
    }

    for (const enemies of this.enemies) {
      this.objectsContainer.addChild(enemies.sprite);
    }
  }

  start() {
    this.app.ticker.add(this.tick.bind(this));
  }

  tick(delta: number) {
    this.elapsed += delta;
    for (const tower of this.towers) {
      tower.tick(delta, this.enemies);
    }

    if (Math.round(this.elapsed % 100) === 0) {
      const newEnemy = new Enemy(this.startCoordinates, Direction.Down);
      this.enemies.push(newEnemy);
      this.objectsContainer.addChild(newEnemy.sprite);
    }

    for (const enemy of this.enemies) {
      enemy.tick(delta);

      if (compareCoordinates(enemy.coordinates, this.endCoordinates)) {
        enemy.finished();
        this.enemies = this.enemies.filter(({ id }) => id !== enemy.id);
      }

      if (!enemy.targetCoordinates) {
        const next = this.findPath(
          enemy.coordinates,
          enemy.previousCoordinates,
        );

        if (next) { 
          const { coordinates: nextCoordinates, direction: nextDirection } =
            next;

          enemy.setNextPosition(nextCoordinates, nextDirection);
        }
      }
    }

    this.objectsContainer.sortChildren();
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

function createMapFromTiles(tiles: Array<Array<TileType>>) {
  const map = new Tilemap([Texture.from("grass.png")]);
  for (const y of tiles.keys()) {
    for (const x of tiles[y].keys()) {
      const tile = tiles[y][x];
      const hasLeftNeighbor = x > 0 && tiles[y][x - 1] === TileType.Path;
      const hasRightNeighbor =
        x < tiles[y].length - 1 && tiles[y][x + 1] === TileType.Path;
      const hasTopNeighbor = y > 0 && tiles[y - 1][x] === TileType.Path;
      const hasBottomNeighbor =
        y < tiles.length - 1 && tiles[y + 1][x] === TileType.Path;
      const isStartFinish =
        [
          hasLeftNeighbor,
          hasRightNeighbor,
          hasTopNeighbor,
          hasBottomNeighbor,
        ].filter(Boolean).length === 1;

      const tileX = x * TILE_SIZE;
      const tileY = y * TILE_SIZE;

      // Top left:
      let image = tile === TileType.None ? "grass.png" : "ground.png";
      if (tile !== TileType.None) {
        if (hasLeftNeighbor && !hasTopNeighbor) {
          image = "edge-top.png";
        } else if (hasTopNeighbor && !hasLeftNeighbor) {
          image = "edge-left.png";
        } else if (!hasTopNeighbor && !hasLeftNeighbor) {
          image = "edge-tl.png";
        }
      }
      map.tile(image, tileX, tileY);

      image = tile === TileType.None ? "grass.png" : "ground.png";
      if (tile !== TileType.None) {
        if (!hasTopNeighbor) {
          image = "edge-top.png";
        }
      }
      map.tile(image, tileX + 16, tileY);

      image = tile === TileType.None ? "grass.png" : "ground.png";
      if (tile !== TileType.None) {
        if (hasRightNeighbor && !hasTopNeighbor) {
          image = "edge-top.png";
        }
        if (!hasRightNeighbor && !hasTopNeighbor) {
          image = "edge-tr.png";
        }
        if (!hasRightNeighbor && hasTopNeighbor) {
          image = "edge-right.png";
        }
      }
      map.tile(image, tileX + 32, tileY);
      image = tile === TileType.None ? "grass.png" : "ground.png";
      if (!isStartFinish && tile !== TileType.None) {
        if (!hasLeftNeighbor) {
          image = "edge-left.png";
        }
      }

      map.tile(image, tileX, tileY + 16);
      image = tile === TileType.None ? "grass.png" : "ground.png";
      map.tile(image, tileX + 16, tileY + 16);
      image = tile === TileType.None ? "grass.png" : "ground.png";
      if (!isStartFinish && tile !== TileType.None) {
        if (!hasRightNeighbor) {
          image = "edge-right.png";
        }
      }
      map.tile(image, tileX + 32, tileY + 16);
      image = tile === TileType.None ? "grass.png" : "ground.png";
      if (tile !== TileType.None) {
        if (!hasLeftNeighbor && !hasBottomNeighbor) {
          image = "edge-bl.png";
        }
        if (hasLeftNeighbor && !hasBottomNeighbor) {
          image = "edge-bottom.png";
        }
        if (hasBottomNeighbor && !hasLeftNeighbor) {
          image = "edge-left.png";
        }
      }
      map.tile(image, tileX, tileY + 32);
      image = tile === TileType.None ? "grass.png" : "ground.png";
      if (tile !== TileType.None) {
        if (!hasBottomNeighbor) {
          image = "edge-bottom.png";
        }
      }
      map.tile(image, tileX + 16, tileY + 32);
      image = tile === TileType.None ? "grass.png" : "ground.png";
      if (tile !== TileType.None) {
        if (!hasBottomNeighbor) {
          image = "edge-bottom.png";
        }
        if (!hasBottomNeighbor && !hasRightNeighbor) {
          image = "edge-br.png";
        }
        if (hasBottomNeighbor && !hasRightNeighbor) {
          image = "edge-right.png";
        }
      }
      map.tile(image, tileX + 32, tileY + 32);
    }
  }
  return map;
}
