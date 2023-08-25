import { Coordinates, Direction } from "./types";
import * as PIXI from "pixi.js";
import { TILE_SIZE } from "./constants";
import { VisualElement } from "./VisualElement";
import { EventEmitter } from "@pixi/utils";

let id = 0;

function getEnemy() {
  const stats = [
    {
      name: "big_demon_run_anim_f",
      speed: 0.2,
    },
    {
      name: "angel_run_anim_f",
      speed: 1.5,
    },
    {
      name: "big_zombie_run_anim_f",
      speed: 0.25,
    },
    {
      name: "elf_m_run_anim_f",
      speed: 1.1,
    },
    {
      name: "slug_anim_f",
      speed: 0.1,
    },
    {
      name: "goblin_run_anim_f",
      speed: 1,
    },
    {
      name: "knight_m_run_anim_f",
      speed: 0.9,
    },
    {
      name: "lizard_f_run_anim_f",
      speed: 1.2,
    },
    {
      name: "ogre_run_anim_f",
      speed: 1,
    },
    {
      name: "wizzard_f_run_anim_f",
      speed: 1.05,
    },
  ];
  const index = Math.floor(Math.random() * stats.length);
  return stats[index];
}

type EnemyState = "walking" | "dead" | "finished";

export class Enemy extends EventEmitter implements VisualElement {
  id: number;
  previousCoordinates: Coordinates | undefined;
  coordinates: Coordinates;
  targetCoordinates: Coordinates | undefined;
  direction: Direction;
  sprite: VisualElement["sprite"];
  speed = 1;
  type: string;
  private character: PIXI.AnimatedSprite;
  state: EnemyState;

  constructor(coordinates: Coordinates, direction: Direction) {
    super();
    this.state = "walking";

    this.sprite = new PIXI.Container();

    this.id = id++;
    this.coordinates = coordinates;
    this.direction = direction;
    this.sprite = new PIXI.Container();
    const stats = getEnemy();
    this.type = stats.name;
    this.speed = stats.speed;
    const { data } = PIXI.Assets.cache.get("/assets/assets.json");
    const { animations } = data;
    const animation = animations[this.type];
    this.character = PIXI.AnimatedSprite.fromFrames(animation);
    this.initSprite();
  }

  initSprite() {
    this.sprite.addChild(this.character);
    this.character.play();
    this.character.animationSpeed = 0.2;
    this.sprite.width *= 2;
    this.sprite.height *= 2;
    const { x, y } = this.translateToScreenCoordinates(
      this.targetCoordinates || this.coordinates,
    );
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.zIndex = this.coordinates.y;
  }

  private translateToScreenCoordinates(coordinates: Coordinates): Coordinates {
    return {
      x: coordinates.x * TILE_SIZE + 0.5 * (TILE_SIZE - this.sprite.width),
      y: coordinates.y * TILE_SIZE - 8, // + 0.5 * (this.sprite.height - TILE_SIZE),
    };
  }

  tick(delta: number) {
    if (this.targetCoordinates && this.state === "walking") {
      const { x: targetX, y: targetY } = this.translateToScreenCoordinates(
        this.targetCoordinates,
      );
      if (targetX > this.sprite.x) {
        this.sprite.x += delta * this.speed;
        if (this.sprite.x > targetX) {
          this.sprite.x = targetX;
        }
      } else if (targetX < this.sprite.x) {
        this.sprite.x -= delta * this.speed;
        if (this.sprite.x < targetX) {
          this.sprite.x = targetX;
        }
      } else if (targetY > this.sprite.y) {
        this.sprite.y += delta * this.speed;
        if (this.sprite.y > targetY) {
          this.sprite.y = targetY;
        }
      } else if (targetY < this.sprite.y) {
        this.sprite.y -= delta * this.speed;
        if (this.sprite.y < targetY) {
          this.sprite.y = targetY;
        }
      }
      this.sprite.zIndex = this.sprite.y + this.sprite.height;

      if (
        Math.round(this.sprite.x) === targetX &&
        Math.round(this.sprite.y) === targetY
      ) {
        this.previousCoordinates = this.coordinates;
        this.coordinates = this.targetCoordinates;
        this.targetCoordinates = undefined;
      }
    }
    if (this.state === "dead") {
      this.sprite.alpha -= 0.02 * delta;
      if (this.sprite.alpha < 0) {
        this.sprite.alpha = 0;
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
    this.character.animationSpeed = 0;
  }

  damage() {
    this.state = "dead";
    this.character.alpha = 0.5;
    this.character.animationSpeed = 0;
  }
}
