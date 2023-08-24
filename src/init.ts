import * as PIXI from "pixi.js";

import { Enemy } from "./Enemy";
import { Level, TileType } from "./Level";
import { SPRITE_PATH, TILE_SIZE } from "./constants";
import { Direction } from "./types";
import { compareCoordinates } from "./utils";
import { tiles } from "./main";
import { Tower } from "./Tower";

export async function init(app: PIXI.Application<PIXI.ICanvas>) {
  const level = new Level(tiles, { x: 1, y: 0 }, { x: 6, y: 1 });
  const towers = [new Tower({ x: 3, y: 2 }), new Tower({ x: 2, y: 4 })];

  await PIXI.Assets.load("/assets/assets.json");

  for (const y in tiles) {
    for (const x in tiles[y]) {
      const tile = tiles[y][x];
      const spritePath = getTileSpritePath(tile);
      const sprite = PIXI.Sprite.from(spritePath);

      sprite.width = TILE_SIZE;
      sprite.height = TILE_SIZE;

      sprite.x = Number.parseInt(x) * TILE_SIZE;
      sprite.y = Number.parseInt(y) * TILE_SIZE;

      app.stage.addChild(sprite);
    }
  }

  for (const tower of towers) {
    const sprite = PIXI.Sprite.from(SPRITE_PATH + "towerDefense_tile228.png");
    sprite.width = TILE_SIZE;
    sprite.height = TILE_SIZE;
    sprite.x = tower.coordinates.x * TILE_SIZE;
    sprite.y = tower.coordinates.y * TILE_SIZE;

    app.stage.addChild(sprite);
    app.stage.addChild(tower.text);
  }

  let enemies: Enemy[] = [];

  let elapsed = 0.0;
  app.ticker.add((delta) => {
    elapsed += delta;

    for (const tower of towers) {
      tower.tick(delta, enemies);
    }

    if (Math.round(elapsed % 100) === 0) {
      const newEnemy = new Enemy(level.startCoordinates, Direction.Down);
      enemies.push(newEnemy);
      app.stage.addChild(newEnemy.sprite);
      app.stage.addChild(newEnemy.text);
    }

    for (const enemy of enemies) {
      enemy.tick(delta);

      if (compareCoordinates(enemy.coordinates, level.endCoordinates)) {
        enemy.finished();
        enemies = enemies.filter(({ id }) => id !== enemy.id);
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
  });
}

function getTileSpritePath(tileInfo: TileType): string {
  switch (tileInfo) {
    case TileType.None:
      return SPRITE_PATH + "towerDefense_tile157.png";
    case TileType.Path:
      return SPRITE_PATH + "towerDefense_tile159.png";
  }
}
