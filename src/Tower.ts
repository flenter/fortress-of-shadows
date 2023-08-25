import { Enemy } from "./Enemy";
import { VisualElement } from "./VisualElement";
import { TILE_SIZE } from "./constants";
import { Coordinates } from "./types";
import * as PIXI from "pixi.js";
import { sound } from "@pixi/sound";
import { EventEmitter } from "@pixi/utils";

const RANGE = 1;
const FIRING_RATE = 200;

sound.add("fire", "/sounds/piew.wav");

export class Tower extends EventEmitter implements VisualElement  {
  coordinates: Coordinates;
  sprite: PIXI.Sprite | PIXI.Container;
  text: PIXI.Text;
  kills: number;
  lastFired: number = 0;

  constructor(coordinates: Coordinates) {
    super();
    this.coordinates = coordinates;
    this.text = new PIXI.Text();
    this.text.x = coordinates.x * TILE_SIZE;
    this.text.y = coordinates.y * TILE_SIZE;
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
    this.sprite.x = this.coordinates.x * TILE_SIZE;
    this.sprite.y = this.coordinates.y * TILE_SIZE - 8;
  }
  tick(elapsed: number, enemies: Enemy[]) {
    const target = this.findNearestTargetInRange(enemies);
    this.text.text = `Target: ${target?.id ?? "No Target"} \n Kills: ${
      this.kills
    }`;

    const canFire = target && elapsed - this.lastFired > FIRING_RATE;
    if (canFire) {
      this.fire(target, elapsed);
    }
  }

  private findNearestTargetInRange(enemies: Enemy[]): Enemy | undefined {
    const enemiesInRange = enemies.filter((enemy) => {
      if (enemy.state === "dead" || enemy.state === "finished") {
        return false;
      }

      const xDistance = Math.abs(enemy.coordinates.x - this.coordinates.x);
      const yDistance = Math.abs(enemy.coordinates.y - this.coordinates.y);

      return xDistance <= RANGE && yDistance <= RANGE;
    });

    const [target] = enemiesInRange;
    return target;
  }

  private fire(target: Enemy, currentTime: number) {
    sound.play("fire");
    target.damage();
    this.lastFired = currentTime;
    this.kills++;
    this.emit("fire", {
      target,
      tower: this,
    })
  }
}
