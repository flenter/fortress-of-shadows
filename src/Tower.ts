import { Enemy } from "./Enemy";
import { VisualElement } from "./VisualElement";
import { TILE_SIZE } from "./constants";
import { Coordinates } from "./types";
import * as PIXI from "pixi.js";

const RANGE = 1;
const FIRING_RATE = 250;

let elapsed = 0;

export class Tower implements VisualElement {
  coordinates: Coordinates;
  sprite: PIXI.Sprite | PIXI.Container;
  text: PIXI.Text;
  kill: (enemy: Enemy) => void;
  kills: number;

  constructor(coordinates: Coordinates, kill: (enemy: Enemy) => void) {
    this.coordinates = coordinates;
    this.kill = kill;
    this.kills = 0;
    this.sprite = new PIXI.Container();
    this.text = new PIXI.Text();
    this.initSprite();
  }

  initSprite() {
    const { textures } = PIXI.Assets.cache.get("/assets/assets.json");
    const image = PIXI.Sprite.from(textures["towerRound_sampleF_N.png"]);
    const MAX_WIDTH = TILE_SIZE * 0.75;
    image.height = image.height * (MAX_WIDTH / image.width);
    image.width = MAX_WIDTH;
    image.x = 0.5 * (TILE_SIZE - MAX_WIDTH);
    image.zIndex = this.coordinates.y;
    this.text.zIndex = this.coordinates.y + 1;
    this.sprite.addChild(image);
    this.sprite.addChild(this.text);
    this.sprite.x = this.coordinates.x * TILE_SIZE;
    this.sprite.y = this.coordinates.y * TILE_SIZE;
  }

  tick(delta: number, enemies: Enemy[]) {
    elapsed += delta;

    const target = this.findNearestTargetInRange(enemies);
    this.text.text = `Target: ${target?.id ?? "No Target"} \n Kills: ${
      this.kills
    }`;

    const canFire = target && Math.round(elapsed % FIRING_RATE) === 0;
    if (canFire) {
      this.fire(target);
    }
  }

  private findNearestTargetInRange(enemies: Enemy[]): Enemy | undefined {
    const enemiesInRange = enemies.filter((enemy) => {
      const xDistance = Math.abs(enemy.coordinates.x - this.coordinates.x);
      const yDistance = Math.abs(enemy.coordinates.y - this.coordinates.y);

      return xDistance <= RANGE && yDistance <= RANGE;
    });

    const [target] = enemiesInRange;

    return target;
  }

  private fire(target: Enemy) {
    this.kill(target);
    this.kills++;
  }
}
