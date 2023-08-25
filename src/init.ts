import { autometrics, init as initAutometrics } from "autometrics";
import * as PIXI from "pixi.js";

import { Level } from "./Level";
import { tiles } from "./main";

initAutometrics({
  pushGateway: "http://127.0.0.1:6789/pushgateway/metrics/job/td",
  buildInfo: {
    version: import.meta.env.VITE_AUTOMETRICS_VERSION,
    commit: import.meta.env.VITE_AUTOMETRICS_COMMIT,
    branch: import.meta.env.VITE_AUTOMETRICS_BRANCH,
  },
});

export const init = autometrics(
  { moduleName: "init.ts", functionName: "init" },
  async function init(app: PIXI.Application<PIXI.ICanvas>) {
    await PIXI.Assets.load("/assets/assets.json");
    const level = new Level(tiles, { x: 1, y: 0 }, { x: 6, y: 1 }, app);
    app.stage.addChild(level.sprite);
    level.start();
  },
);
