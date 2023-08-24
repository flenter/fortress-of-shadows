import { Coordinates, Direction } from "./types";
import * as PIXI from "pixi.js";
import { TILE_SIZE } from "./constants";

let id = 0;

type EnemyState = "walking" | "dead" | "finished";

export class Enemy {
  id: number;
  previousCoordinates: Coordinates | undefined;
  coordinates: Coordinates;
  targetCoordinates: Coordinates | undefined;
  direction: Direction;
  private character: PIXI.AnimatedSprite;
  private text: PIXI.Text;
  speed = 1;
  sprite: PIXI.Container<PIXI.DisplayObject>;
  state: EnemyState;

  constructor(coordinates: Coordinates, direction: Direction) {
    this.state = "walking";

    this.sprite = new PIXI.Container();

    this.id = id++;
    this.coordinates = coordinates;
    this.targetCoordinates = coordinates;
    this.direction = direction;
    this.text = new PIXI.Text(String(this.id));

    const { data } = PIXI.Assets.cache.get("/assets/assets.json");
    const { animations } = data;
    this.character = PIXI.AnimatedSprite.fromFrames(
      animations["big_demon_run_anim_f"],
    );
    this.character.play();
    const { x, y } = this.translateToScreenCoordinates(this.coordinates);
    this.character.x = x;
    this.character.y = y;
    this.character.animationSpeed = 0.2;
    this.text.x = x;
    this.text.y = y;
    this.character.zIndex = coordinates.y;

    this.sprite.addChild(this.character, this.text);
  }

  private translateToScreenCoordinates(coordinates: Coordinates): Coordinates {
    return {
      x: coordinates.x * TILE_SIZE + 0.5 * TILE_SIZE -
        0.5 * this.character.width,
      y: coordinates.y * TILE_SIZE +
        0.5 * TILE_SIZE -
        0.5 * this.character.height -
        8,
    };
  }

  tick(delta: number) {
    if (this.targetCoordinates) {
      const { x: targetX, y: targetY } = this.translateToScreenCoordinates(
        this.targetCoordinates,
      );
      if (targetX > this.character.x) {
        this.character.x += delta * this.speed;
        if (this.character.x > targetX) {
          this.character.x = targetX;
        }
      } else if (targetX < this.character.x) {
        this.character.x -= delta * this.speed;
        if (this.character.x < targetX) {
          this.character.x = targetX;
        }
      } else if (targetY > this.character.y) {
        this.character.y += delta * this.speed;
        if (this.character.y > targetY) {
          this.character.y = targetY;
        }
      } else if (targetY < this.character.y) {
        this.character.y -= delta * this.speed;
        if (this.character.y < targetY) {
          this.character.y = targetY;
        }
      }

      this.text.x = this.character.x;
      this.text.y = this.character.y;

      if (
        Math.round(this.character.x) === targetX &&
        Math.round(this.character.y) === targetY
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
    this.state = "finished";
  }

  damage() {
    this.state = "dead";
  }
}
