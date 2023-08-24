import { Enemy } from "./Enemy";
import { TILE_SIZE } from "./constants";
import { Coordinates } from "./types";
import * as PIXI from "pixi.js";

const RANGE = 1;

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

  tick(_delta: number, enemies: Enemy[]) {
    const target = this.findNearestTargetInRange(enemies);
    this.text.text = `Target: ${
      target?.id ?? "No Target"
    } \n Kills: ${this.kills}`;

    if (target) {
      this.fire(target);
    }
  }

  private findNearestTargetInRange(enemies: Enemy[]): Enemy | undefined {
    const enemiesInRange = enemies.filter((enemy) => {
      const xDistance = Math.abs(enemy.coordinates.x - this.coordinates.x);
      const yDistance = Math.abs(enemy.coordinates.y - this.coordinates.y);
      console.log(enemy.id, `x: ${xDistance}`, `y: ${yDistance}`);

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
