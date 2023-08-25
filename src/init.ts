import * as PIXI from "pixi.js";

import { Level } from "./Level";
import { tiles } from "./main";

export async function init(app: PIXI.Application<PIXI.ICanvas>) {
  await PIXI.Assets.load("/assets/assets.json");
  const entry =  { x: 1, y: 0 }
  const exit = { x: 8, y: 4 };
  const level = new Level(tiles, entry, exit, app);
  level.addTower(3, 2)
  level.addTower(2, 4)
  const container = new PIXI.Container();
  container.addChild(level.sprite);
  app.stage.addChild(container);
  level.start();
}
