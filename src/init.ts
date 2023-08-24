import * as PIXI from "pixi.js";

import { Enemy } from "./Enemy";
import { Level, TileType } from "./Level";
import { TILE_SIZE } from "./constants";
import { Direction } from "./types";
import { compareCoordinates } from "./utils";
import { tiles } from "./main";
import { Tower } from "./Tower";
import { Tilemap } from "@pixi/tilemap";

function createMap(tiles: Array<Array<TileType>>) {
  const map = new Tilemap([PIXI.Texture.from("grass.png")]);
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

export async function init(app: PIXI.Application<PIXI.ICanvas>) {
  const level = new Level(tiles, { x: 1, y: 0 }, { x: 6, y: 1 });

  let enemies: Enemy[] = [];

  const towers = [
    new Tower({ x: 3, y: 2 }),
    new Tower({ x: 2, y: 4 }),
  ];

  await PIXI.Assets.load("/assets/assets.json");
  const map = createMap(tiles);
  app.stage.addChild(map);

  const units = new PIXI.Container();
  app.stage.addChild(units);
  // units.sortChildren = true;
  for (const tower of towers) {
    const { textures } = PIXI.Assets.cache.get("/assets/assets.json");
    const sprite = PIXI.Sprite.from(textures["towerRound_sampleF_N.png"]);
    const MAX_WIDTH = TILE_SIZE * 0.75;
    sprite.height = sprite.height * (MAX_WIDTH / sprite.width);
    sprite.width = MAX_WIDTH;
    sprite.x = tower.coordinates.x * TILE_SIZE + 0.5 * (TILE_SIZE - MAX_WIDTH);
    sprite.y = tower.coordinates.y * TILE_SIZE - 0.5 * sprite.height;
    sprite.zIndex = tower.coordinates.y;
    tower.text.zIndex = tower.coordinates.y + 1;
    units.addChild(sprite);
    units.addChild(tower.text);
  }

  let elapsed = 0.0;
  app.ticker.add((delta) => {
    elapsed += delta;

    for (const tower of towers) {
      tower.tick(elapsed, enemies);
    }

    if (Math.round(elapsed % 100) === 0) {
      const newEnemy = new Enemy(level.startCoordinates, Direction.Down);
      enemies.push(newEnemy);
      units.addChild(newEnemy.sprite);
    }

    for (const enemy of enemies) {
      if (enemy.state === "dead" || enemy.state === "finished") {
        units.removeChild(enemy.sprite);
        enemies = enemies.filter(({ id }) => id !== enemy.id);
        continue;
      }

      enemy.tick(delta);

      if (compareCoordinates(enemy.coordinates, level.endCoordinates)) {
        enemy.finished();
      }

      if (!enemy.targetCoordinates) {
        const next = level.findPath(
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

    units.sortChildren();
  });
}

function getTileSpritePath(tileInfo: TileType): string {
  switch (tileInfo) {
    case TileType.None:
      return "grass.png";
    case TileType.Path:
      return "ground.png";
  }
}
