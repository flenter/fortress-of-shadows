import * as PIXI from "pixi.js";

const TILE_SIZE = 40;

enum TileType {
  None,
  Path,
}

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

let app = new PIXI.Application({
  width: tiles[0].length * TILE_SIZE,
  height: tiles.length * TILE_SIZE,
});

const SPRITE_PATH = "/assets/PNG/Retina/";

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

const enemy = PIXI.Sprite.from(SPRITE_PATH + "towerDefense_tile245.png");
enemy.width = TILE_SIZE;
enemy.height = TILE_SIZE;
enemy.x = 1 * TILE_SIZE;
enemy.y = 0;

app.stage.addChild(enemy);

document.body.appendChild(app.view);

type Coords = { x: number; y: number };

function findPath(current: Coords): Coords {
  const y = tiles[current.y];
  if (y) {
    const tileRight = y[current.x + 1];
    if (tileRight === TileType.Path) {
      console.log("right!");
      const next = { x: current.x + 1, y: current.y };
      return next;
    }
    const tileLeft = y[current.y - 1];
    if (tileLeft === TileType.Path) {
      console.log("left!");
      const next = { x: current.x - 1, y: current.y };
      return next;
    }
  }

  const bottomY = tiles[current.y + 1];
  if (bottomY) {
    const tileBottom = bottomY[current.x];
    if (tileBottom === TileType.Path) {
      console.log("bottom!");
      const next = { x: current.x, y: current.y + 1 };
      return next;
    }
  }

  const topY = tiles[current.y - 1];
  if (topY) {
    const tileTop = topY[current.x];
    if (tileTop === TileType.Path) {
      console.log("top!");
      const next = { x: current.x, y: current.y - 1 };
      return next;
    }
  }

  console.log("none");

  return current;
}

let enemyCoords: Coords = { x: 1, y: 0 };

let elapsed = 0.0;
app.ticker.add((delta) => {
  elapsed += delta;
  if (
    Math.round(enemy.x) === enemyCoords.x * TILE_SIZE &&
    Math.round(enemy.y) === enemyCoords.y * TILE_SIZE
  ) {
    console.log("REACHED");
    const goal = findPath(
      { x: enemyCoords.x, y: enemyCoords.y },
    );
    console.log(
      `x: ${enemy.x} -> ${goal.x * TILE_SIZE}`,
      `y: ${enemy.y} -> ${goal.y * TILE_SIZE}`,
    );
    enemyCoords = goal;
  }

  console.log(enemy.x, enemy.y, enemyCoords);

  enemy.x = lerp(enemy.x, enemyCoords.x * TILE_SIZE, 0.25);
  enemy.y = lerp(enemy.y, enemyCoords.y * TILE_SIZE, 0.25);
});

function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

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
