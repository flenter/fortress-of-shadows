import { Enemy } from "./Enemy";
import { TILE_SIZE } from "./constants";
import { Coordinates } from "./types";
import * as PIXI from "pixi.js";

const RANGE = 1;

export class Tower {
  coordinates: Coordinates;
  text: PIXI.Text;

  constructor(coordinates: Coordinates) {
    this.coordinates = coordinates;
    this.text = new PIXI.Text();
    this.text.x = coordinates.x * TILE_SIZE;
    this.text.y = coordinates.y * TILE_SIZE;
  }

  tick(_delta: number, enemies: Enemy[]) {
    const target = this.findNearestTargetInRange(enemies);
    this.text.text = target ? `Target: ${target.id}` : "No target";
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
}
