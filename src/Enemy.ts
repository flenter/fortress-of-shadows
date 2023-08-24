import { Coordinates, Direction } from "./types";
import * as PIXI from "pixi.js";
import { lerp } from "./utils";
import { SPRITE_PATH, TILE_SIZE } from "./constants";

const SPEED = 0.1;

let id = 0;

export class Enemy {
  id: number;
  previousCoordinates: Coordinates | undefined;
  coordinates: Coordinates;
  targetCoordinates: Coordinates | undefined;
  direction: Direction;
  sprite: PIXI.Sprite;
  text: PIXI.Text;

  constructor(coordinates: Coordinates, direction: Direction) {
    this.id = id++;
    this.coordinates = coordinates;
    this.targetCoordinates = coordinates;
    this.direction = direction;
    this.text = new PIXI.Text(String(this.id));

    this.sprite = PIXI.Sprite.from(SPRITE_PATH + "towerDefense_tile245.png");
    this.sprite.width = TILE_SIZE;
    this.sprite.height = TILE_SIZE;
    this.sprite.x = this.coordinates.x * TILE_SIZE;
    this.sprite.y = this.coordinates.y * TILE_SIZE;
  }

  tick(_delta: number) {
    if (this.targetCoordinates) {
      this.sprite.x = lerp(
        this.sprite.x,
        this.targetCoordinates.x * TILE_SIZE,
        SPEED,
      );
      this.text.x = this.sprite.x;

      this.sprite.y = lerp(
        this.sprite.y,
        this.targetCoordinates.y * TILE_SIZE,
        SPEED,
      );
      this.text.y = this.sprite.y;

      if (
        Math.round(this.sprite.x) === this.targetCoordinates.x * TILE_SIZE &&
        Math.round(this.sprite.y) === this.targetCoordinates.y * TILE_SIZE
      ) {
        this.previousCoordinates = this.coordinates;
        this.coordinates = this.targetCoordinates;
        this.targetCoordinates = undefined;
      }
    }
  }

  setNextPosition(nextCoordinates: Coordinates, nextDirection: Direction) {
    this.previousCoordinates = this.coordinates;
    this.targetCoordinates = nextCoordinates;
    this.direction = nextDirection;
  }

  finished() {
    this.sprite.removeFromParent();
    this.text.removeFromParent();
  }
}
