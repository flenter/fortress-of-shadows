import * as PIXI from "pixi.js";
import { Enemy } from "./Enemy";
import { Direction } from "./types";
import { Level, TileType } from "./Level";
import { SPRITE_PATH, TILE_SIZE } from "./constants";
import { compareCoordinates } from "./utils";

// enum TileType {
//   None,
//   Path,
// }

const tiles = [
  [
    TileType.None,
    TileType.Path,
    TileType.None,
    TileType.None,
    TileType.None,
    TileType.None,
    TileType.None,
  ],
  [
    TileType.None,
    TileType.Path,
    TileType.Path,
    TileType.None,
    TileType.None,
    TileType.Path,
    TileType.Path,
  ],
  [
    TileType.None,
    TileType.None,
    TileType.Path,
    TileType.None,
    TileType.Path,
    TileType.Path,
    TileType.None,
  ],
  [
    TileType.None,
    TileType.Path,
    TileType.Path,
    TileType.None,
    TileType.Path,
    TileType.None,
    TileType.None,
  ],
  [
    TileType.None,
    TileType.Path,
    TileType.None,
    TileType.None,
    TileType.Path,
    TileType.None,
    TileType.None,
  ],
  [
    TileType.None,
    TileType.Path,
    TileType.Path,
    TileType.Path,
    TileType.Path,
    TileType.None,
    TileType.None,
  ],
];

const level = new Level(tiles, { x: 1, y: 0 }, { x: 6, y: 1 });

let app = new PIXI.Application({
  width: tiles[0].length * TILE_SIZE,
  height: tiles.length * TILE_SIZE,
});

function getTileSpritePath(tileInfo: TileType): string {
  switch (tileInfo) {
    case TileType.None:
      return SPRITE_PATH + "towerDefense_tile157.png";
    case TileType.Path:
      return SPRITE_PATH + "towerDefense_tile159.png";
  }
}

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

let enemies: Enemy[] = [];

let elapsed = 0.0;
app.ticker.add((delta) => {
  elapsed += delta;

  if (Math.round(elapsed % 100) === 0) {
    const newEnemy = new Enemy(level.startCoordinates, Direction.Down);
    enemies.push(newEnemy);
    app.stage.addChild(newEnemy.sprite);
  }

  for (const enemy of enemies) {
    enemy.tick(delta);

    if (compareCoordinates(enemy.coordinates, level.endCoordinates)) {
      enemy.finished();
      enemies = enemies.filter(({ id }) => id !== enemy.id);
    }

    if (!enemy.targetCoordinates) {
      const next = level.findPath(enemy.coordinates, enemy.previousCoordinates);

      if (next) {
        const { coordinates: nextCoordinates, direction: nextDirection } = next;

        enemy.setNextPosition(nextCoordinates, nextDirection);
      }
    }
  }
});

document.body.appendChild(app.view);

// import "./style.css";
// import typescriptLogo from "./typescript.svg";
// import viteLogo from "/vite.svg";
// import { setupCounter } from "./counter.ts";
//
// document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>Vite + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite and TypeScript logos to learn more
//     </p>
//   </div>
// `;
//
// setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
