import * as PIXI from "pixi.js";
import { init } from "./init";
import { TileType } from "./Level";
import { TILE_SIZE } from "./constants";
import "./style.css";

export const tiles = [
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

const container = document.getElementById("app");

container?.appendChild(app.view);
function setup() {
  init(app);
}

setup();

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
