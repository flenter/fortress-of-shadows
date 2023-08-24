import { Enemy } from "./Enemy";
import { TILE_SIZE } from "./constants";
import { Coordinates } from "./types";
import * as PIXI from "pixi.js";

const RANGE = 1;
const FIRING_RATE = 250;

let elapsed = 0;

export class Tower {
  coordinates: Coordinates;
  text: PIXI.Text;
  kill: (enemy: Enemy) => void;
  kills: number;

  constructor(coordinates: Coordinates, kill: (enemy: Enemy) => void) {
    this.coordinates = coordinates;
    this.text = new PIXI.Text();
    this.text.x = coordinates.x * TILE_SIZE;
    this.text.y = coordinates.y * TILE_SIZE;
    this.kill = kill;
    this.kills = 0;
  }

  tick(delta: number, enemies: Enemy[]) {
    elapsed += delta;

    const target = this.findNearestTargetInRange(enemies);
    this.text.text = `Target: ${
      target?.id ?? "No Target"
    } \n Kills: ${this.kills}`;

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
