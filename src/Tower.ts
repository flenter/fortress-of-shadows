import { Enemy } from "./Enemy";
import { TILE_SIZE } from "./constants";
import { Coordinates } from "./types";
import * as PIXI from "pixi.js";
import { sound } from "@pixi/sound";

const RANGE = 1;
const FIRING_RATE = 250;

sound.add("fire", "/sounds/piew.wav");

export class Tower {
  coordinates: Coordinates;
  text: PIXI.Text;
  kills: number;
  lastFired: number;

  constructor(coordinates: Coordinates) {
    this.coordinates = coordinates;
    this.text = new PIXI.Text();
    this.text.x = coordinates.x * TILE_SIZE;
    this.text.y = coordinates.y * TILE_SIZE;
    this.kills = 0;
    this.lastFired = 0.0;
  }

  tick(elapsed: number, enemies: Enemy[]) {
    const target = this.findNearestTargetInRange(enemies);
    this.text.text = `Target: ${
      target?.id ?? "No Target"
    } \n Kills: ${this.kills}`;

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

  private fire(target: Enemy, elapsed: number) {
    sound.play("fire");
    target.damage();
    this.lastFired = elapsed;
    this.kills++;
  }
}
