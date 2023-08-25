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
    TileType.Path,
    TileType.None,
  ],
  [
    TileType.None,
    TileType.None,
    TileType.Path,
    TileType.None,
    TileType.Path,
    TileType.Path,
    TileType.None,
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
    TileType.Path,
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
    TileType.Path,
    TileType.Path,
  ],
  [
    TileType.None,
    TileType.Path,
    TileType.Path,
    TileType.Path,
    TileType.Path,
    TileType.None,
    TileType.None,
    TileType.None,
    TileType.None,
  ],
  [
    TileType.None,
    TileType.None,
    TileType.None,
    TileType.None,
    TileType.None,
    TileType.None,
    TileType.None,
    TileType.None,
    TileType.None,
  ],
];

let app = new PIXI.Application({
  width: 2 * tiles[0].length * TILE_SIZE,
  height: 2 * tiles.length * TILE_SIZE,
});

const container = document.getElementById("app");

container?.appendChild(app.view);
function setup() {
  init(app);
}

setup();
