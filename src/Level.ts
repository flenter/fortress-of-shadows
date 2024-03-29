import { autometrics } from "autometrics";
import {
  Application,
  Container,
  FederatedPointerEvent,
  Filter,
  ICanvas,
  Rectangle,
  Text,
  TextStyle,
  Texture,
} from "pixi.js";
import { Coordinates, Direction } from "./types";
import { compareCoordinates } from "./utils";
import { VisualElement } from "./VisualElement";
import { TILE_SIZE } from "./constants";
import { Tilemap } from "@pixi/tilemap";
import { ShockwaveFilter } from "@pixi/filter-shockwave";
import { Tower } from "./Tower";
import { Enemy } from "./Enemy";

export enum TileType {
  None = "none",
  Path = "path",
}

export type TileMap = Array<TileType[]>;

type State = "start" | "end" | "initial";

export class Level implements VisualElement {
  private startCoordinates: Coordinates;
  private endCoordinates: Coordinates;
  sprite: VisualElement["sprite"];
  private objectsContainer: VisualElement["sprite"];
  private towers: Array<Tower> = [];
  private enemies: Array<Enemy> = [];
  private tileMap: TileMap;
  private elapsed: number = 0.0;
  private enemyAdded: number = 0.0;
  private app: Application<ICanvas>;
  private state: State = "initial";
  private _tick: Level["tick"];
  private text: Text;

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
    this.towers = [];
    this.sprite = new Container();
    this.objectsContainer = new Container();
    this._tick = autometrics(
      { moduleName: "Level.ts", functionName: "tick" },
      this.tick.bind(this),
    ),

    this.initSprite();

    this.text = new Text();
    this.text.text = "GAME OVER";
    const style = new TextStyle({
      fontFamily: "Helvetica",
      dropShadow: true,
      fill: "#FFFFFF",
    });
    this.text.style = style;
    this.text.x = this.sprite.width / 2 - this.text.width / 2;
    this.text.y = this.sprite.height / 2 - this.text.height / 2;

    this.sprite.eventMode = "static";
    this.sprite.cursor = "pointer";
    this.sprite.hitArea = new Rectangle(
      0,
      0,
      this.sprite.width,
      this.sprite.height,
    );
    this.sprite.on("pointerdown", (event: FederatedPointerEvent) => {
      if (this.state !== "start") {
        return;
      }
      const tileX = Math.floor(event.global.x / TILE_SIZE);
      const tileY = Math.floor(event.global.y / TILE_SIZE);

      const tile = this.getTile({ x: tileX, y: tileY });
      if (tile === TileType.None) {
        this.addTower(tileX, tileY);
      }
    });
  }

  addTower(x: number, y: number) {
    const tower = new Tower({ x, y });
    this.objectsContainer.addChild(tower.sprite);
    this.towers.push(tower);

    tower.addListener("fire", (event) => {
      const { tower: target } = event;
      const filter = new ShockwaveFilter(
        [
          target.sprite.x + 0.5 * target.sprite.width,
          target.sprite.y + target.sprite.height - 8,
        ],
        {
          amplitude: 10,
          wavelength: 200,
          brightness: 1,
          radius: 500,
          speed: 20,
        },
      );

      const filters: Array<Filter> = this.sprite.filters || [];
      filters.push(filter);
      this.sprite.filters = filters;
    });
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
    this.app.ticker.add(this._tick);
    this.state = "start";
  }

  stop() {
    this.state = "end";
    this.app.ticker.remove(this._tick);
    this.sprite.addChild(this.text);
  }

  tick(delta: number) {
    this.elapsed += delta;
    for (const tower of this.towers) {
      tower.tick(this.elapsed, this.enemies);
    }

    if (this.sprite.filters) {
      for (const filter of this.sprite.filters) {
        if (filter.time !== undefined) {
          filter.time += delta;
        }
      }
    }

    if (this.elapsed > this.enemyAdded + 100) {
      this.enemyAdded = this.elapsed;
      const newEnemy = new Enemy(this.startCoordinates, Direction.Down);
      this.enemies.push(newEnemy);
      this.objectsContainer.addChild(newEnemy.sprite);
    }

    for (const enemy of this.enemies) {
      enemy.tick(delta);

      if (compareCoordinates(enemy.coordinates, this.endCoordinates)) {
        enemy.finished();
        this.stop();
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
      const hasRightNeighbor = x < tiles[y].length - 1 &&
        tiles[y][x + 1] === TileType.Path;
      const hasTopNeighbor = y > 0 && tiles[y - 1][x] === TileType.Path;
      const hasBottomNeighbor = y < tiles.length - 1 &&
        tiles[y + 1][x] === TileType.Path;
      const isStartFinish = [
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
      map.tile(image, tileX + 32, tileY);
      map.tile(image, tileX + 48, tileY);

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
      map.tile(image, tileX + 64, tileY);

      image = tile === TileType.None ? "grass.png" : "ground.png";
      if (!isStartFinish && tile !== TileType.None) {
        if (!hasLeftNeighbor) {
          image = "edge-left.png";
        }
      }
      map.tile(image, tileX, tileY + 16);
      map.tile(image, tileX, tileY + 32);
      map.tile(image, tileX, tileY + 48);
      image = tile === TileType.None ? "grass.png" : "ground.png";
      map.tile(image, tileX + 16, tileY + 16);
      map.tile(image, tileX + 16, tileY + 32);
      map.tile(image, tileX + 16, tileY + 48);
      map.tile(image, tileX + 32, tileY + 16);
      map.tile(image, tileX + 32, tileY + 32);
      map.tile(image, tileX + 32, tileY + 48);
      map.tile(image, tileX + 48, tileY + 16);
      map.tile(image, tileX + 48, tileY + 32);
      map.tile(image, tileX + 48, tileY + 48);
      image = tile === TileType.None ? "grass.png" : "ground.png";
      if (!isStartFinish && tile !== TileType.None) {
        if (!hasRightNeighbor) {
          image = "edge-right.png";
        }
      }
      map.tile(image, tileX + 64, tileY + 16);
      map.tile(image, tileX + 64, tileY + 32);
      map.tile(image, tileX + 64, tileY + 48);
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
      map.tile(image, tileX, tileY + 64);
      image = tile === TileType.None ? "grass.png" : "ground.png";
      if (tile !== TileType.None) {
        if (!hasBottomNeighbor) {
          image = "edge-bottom.png";
        }
      }
      map.tile(image, tileX + 16, tileY + 64);
      map.tile(image, tileX + 32, tileY + 64);
      map.tile(image, tileX + 48, tileY + 64);
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
      map.tile(image, tileX + 64, tileY + 64);
    }
  }
  return map;
}
