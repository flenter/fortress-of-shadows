import * as PIXI from "pixi.js";

import { Level } from "./Level";
import { tiles } from "./main";

export async function init(app: PIXI.Application<PIXI.ICanvas>) {
  await PIXI.Assets.load("/assets/assets.json");
  const level = new Level(tiles, { x: 1, y: 0 }, { x: 6, y: 1 }, app);
  app.stage.addChild(level.sprite);
  level.start();
}
