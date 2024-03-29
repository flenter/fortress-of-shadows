import { Coordinates, Direction } from "./types";
import * as PIXI from "pixi.js";
import { TILE_SIZE } from "./constants";
import { VisualElement } from "./VisualElement";
import { autometrics } from "autometrics";
import { EventEmitter } from "@pixi/utils";
import { ProgressBar } from "./ProgressBar";

let id = 0;

function getEnemy() {
  const stats = [
    {
      name: "big_demon_run_anim_f",
      speed: 0.2,
      health: 5,
    },
    {
      name: "angel_run_anim_f",
      speed: 1.5,
      health: 3,
    },
    {
      name: "big_zombie_run_anim_f",
      speed: 0.25,
      health: 1
    },
    {
      name: "elf_m_run_anim_f",
      speed: 1.1,
      health: 1
    },
    {
      name: "slug_anim_f",
      speed: 0.1,
      health: 4
    },
    {
      name: "goblin_run_anim_f",
      speed: 1,
      health: 1
    },
    {
      name: "knight_m_run_anim_f",
      speed: 0.9,
      health: 4
    },
    {
      name: "lizard_f_run_anim_f",
      speed: 1.2,
      health: 3
    },
    {
      name: "ogre_run_anim_f",
      speed: 1,
      health: 3
    },
    {
      name: "wizzard_f_run_anim_f",
      speed: 1.05,
      health: 2
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
  health = 5;
  maxHealth = 5;
  bar: ProgressBar;

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
    this.maxHealth = stats.health;
    this.health = stats.health;
    const { data } = PIXI.Assets.cache.get("/assets/assets.json");
    const { animations } = data;
    const animation = animations[this.type];
    this.character = PIXI.AnimatedSprite.fromFrames(animation);
    this.bar = new ProgressBar({
      width: 20,
      progress: 100,
    })
    this.initSprite();
  }

  initSprite() {
    const _initSprite = autometrics({
      moduleName: "Enemy.ts",
      functionName: "initSprite",
    }, this._initSprite.bind(this));

    _initSprite();
  }

  _initSprite() {
    this.sprite.addChild(this.character);
    this.character.play();
    this.character.animationSpeed = 0.2;
    this.character.width *= 2;
    this.character.height *= 2;
    const { x, y } = this.translateToScreenCoordinates(
      this.targetCoordinates || this.coordinates,
    );
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.zIndex = this.coordinates.y;
    this.sprite.addChild(this.bar.sprite);
  }

  private translateToScreenCoordinates(coordinates: Coordinates): Coordinates {
    const _translateToScreenCoordinates = autometrics({
      moduleName: "Enemy.ts",
      functionName: "translateToScreenCoordinates",
    }, this._translateToScreenCoordinates.bind(this));

    return _translateToScreenCoordinates(coordinates);
  }

  private _translateToScreenCoordinates(coordinates: Coordinates): Coordinates {
    return {
      x: coordinates.x * TILE_SIZE + 0.5 * (TILE_SIZE - this.character.width),
      y: coordinates.y * TILE_SIZE - 8, // + 0.5 * (this.character.height - TILE_SIZE),
    };
  }

  tick(delta: number) {
    const _tick = autometrics(
      { moduleName: "Enemy.ts", functionName: "tick" },
      this._tick.bind(this),
    );

    _tick(delta);
  }

  _tick(delta: number) {
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
      this.sprite.zIndex = this.sprite.y + this.character.height;

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
    const _setNextPosition = autometrics({
      moduleName: "Enemy.ts",
      functionName: "setNextPosition",
    }, this._setNextPosition.bind(this));

    _setNextPosition(nextCoordinates, nextDirection);
  }

  _setNextPosition(nextCoordinates: Coordinates, nextDirection: Direction) {
    this.previousCoordinates = this.coordinates;
    this.targetCoordinates = nextCoordinates;
    this.direction = nextDirection;
  }

  finished() {
    const _finished = autometrics({
      moduleName: "Enemy.ts",
      functionName: "finished",
    }, this._finished.bind(this));

    _finished();
  }

  _finished() {
    this.state = "finished";
    this.character.animationSpeed = 0;
  }

  damage(amount: number): boolean {
    
    const _damage = autometrics({
      moduleName: "Enemy.ts",
      functionName: "damage",
    }, this._damage.bind(this));

    return _damage(amount);
  }

  _damage(amount: number): boolean {
    this.health -= amount;  
    this.bar.progress =this.health / this.maxHealth * 100;
    if (this.health > 0) {
      return false;
    }
    this.state = "dead";
    this.character.alpha = 0.5;
    this.character.animationSpeed = 0;
    return true;
  }
}
