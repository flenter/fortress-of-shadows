import { Coordinates, Direction } from "./types";
import * as PIXI from "pixi.js";
import { TILE_SIZE } from "./constants";

let id = 0;

export class Enemy {
  id: number;
  previousCoordinates: Coordinates | undefined;
  coordinates: Coordinates;
  targetCoordinates: Coordinates | undefined;
  direction: Direction;
  sprite: PIXI.Sprite;
  text: PIXI.Text;
  speed = 1;

  constructor(coordinates: Coordinates, direction: Direction) {
    this.id = id++;
    this.coordinates = coordinates;
    this.targetCoordinates = coordinates;
    this.direction = direction;
    this.text = new PIXI.Text(String(this.id));

    const { data } = PIXI.Assets.cache.get("/assets/assets.json");
    const { animations } = data;
    this.sprite = PIXI.AnimatedSprite.fromFrames(
      animations["big_demon_run_anim_f"],
    );
    this.sprite.play();
    const { x, y } = this.translateToScreenCoordinates(this.coordinates);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.animationSpeed = 0.1;
    this.text.x = x;
    this.text.y = y;
  }

  translateToScreenCoordinates(coordinates: Coordinates): Coordinates {
    return {
      x: coordinates.x * TILE_SIZE + 0.5 * TILE_SIZE,
      y: coordinates.y * TILE_SIZE + 0.5 * TILE_SIZE,
    };
  }

  tick(_delta: number) {
    if (this.targetCoordinates) {
      const { x: targetX, y: targetY } = this.translateToScreenCoordinates(
        this.targetCoordinates,
      );
      if (targetX > this.sprite.x) {
        this.sprite.x += _delta * this.speed;
        if (this.sprite.x > targetX) {
          this.sprite.x = targetX;
        }
      } else if (targetX < this.sprite.x) {
        this.sprite.x -= _delta * this.speed;
        if (this.sprite.x < targetX) {
          this.sprite.x = targetX;
        }
      } else if (targetY > this.sprite.y) {
        this.sprite.y += _delta * this.speed;
        if (this.sprite.y > targetY) {
          this.sprite.y = targetY;
        }
      } else if (targetY < this.sprite.y) {
        this.sprite.y -= _delta * this.speed;
        if (this.sprite.y < targetY) {
          this.sprite.y = targetY;
        }
      }

      this.text.x = this.sprite.x;
      this.text.y = this.sprite.y;

      if (
        Math.round(this.sprite.x) === targetX &&
        Math.round(this.sprite.y) === targetY
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

  kill() {
    this.finished();
  }
}
