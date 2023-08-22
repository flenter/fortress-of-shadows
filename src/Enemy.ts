import { Coordinates, Direction } from "./types";
import * as PIXI from "pixi.js";
import { lerp } from "./utils";
import { SPRITE_PATH, TILE_SIZE } from "./constants";

const SPEED = 0.1;

export class Enemy {
  position: Coordinates;
  nextPosition: Coordinates | undefined;
  direction: Direction;
  nextDirection: Direction | undefined;
  sprite: PIXI.Sprite;

  constructor(position: Coordinates, direction: Direction) {
    this.position = position;
    this.direction = direction;

    this.sprite = PIXI.Sprite.from(SPRITE_PATH + "towerDefense_tile246.png");
    this.sprite.width = TILE_SIZE;
    this.sprite.height = TILE_SIZE;
    this.sprite.x = this.position.x * TILE_SIZE;
    this.sprite.y = this.position.y * TILE_SIZE;
  }

  tick(_delta: number) {
    if (this.nextPosition) {
      this.sprite.x = lerp(
        this.sprite.x,
        this.nextPosition.x * TILE_SIZE,
        SPEED,
      );

      this.sprite.y = lerp(
        this.sprite.y,
        this.nextPosition.y * TILE_SIZE,
        SPEED,
      );

      if (
        Math.round(this.sprite.x) === this.nextPosition.x * TILE_SIZE &&
        Math.round(this.sprite.y) === this.nextPosition.y * TILE_SIZE
      ) {
        console.log("arrived");
        this.position = this.nextPosition;
        this.nextPosition = undefined;
      }
    }
  }

  setNextPosition(position: Coordinates, direction: Direction) {
    this.nextPosition = position;
    this.nextDirection = direction;
  }
}
