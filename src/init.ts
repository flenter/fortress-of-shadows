import { autometrics } from "@autometrics/autometrics";
import { init as initAutometrics } from "@autometrics/exporter-prometheus-push-gateway";
import * as PIXI from "pixi.js";

import { Level } from "./Level";
import { tiles } from "./main";

initAutometrics({
  url: "http://127.0.0.1:6789/pushgateway/metrics/job/td",
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
    const entry = { x: 1, y: 0 };
    const exit = { x: 8, y: 4 };
    const level = new Level(tiles, entry, exit, app);
    const container = new PIXI.Container();
    container.addChild(level.sprite);
    app.stage.addChild(container);
    level.start();
  },
);
