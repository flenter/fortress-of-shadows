import { Coordinates, Direction } from "./types";
import * as PIXI from "pixi.js";
import { TILE_SIZE } from "./constants";
import { VisualElement } from "./VisualElement";

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
    // "dwarf_f_run_anim_f",
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
    // "masked_orc_run_anim_f",
    {
      name: "ogre_run_anim_f",
      speed: 1,
    },
    // "orc_shaman_run_anim_f",
    // "orc_warrior_run_anim_f",
    // "pumpkin_dude_run_anim_f",
    // "skelet_run_anim_f",
    // "tiny_zombie_run_anim_f",
    {
      name: "wizzard_f_run_anim_f",
      speed: 1.05,
    },
    // "wogol_run_anim_f",
    // "chort_run_anim_f",
    // "doc_run_anim_f",
  ];
  const index = Math.floor(Math.random() * stats.length);
  return stats[index];
}

type EnemyState = "walking" | "dead" | "finished";

export class Enemy implements VisualElement {
  id: number;
  previousCoordinates: Coordinates | undefined;
  coordinates: Coordinates;
  targetCoordinates: Coordinates | undefined;
  direction: Direction;
  sprite: VisualElement["sprite"];
  speed = 1;
  type: string;
  private character: PIXI.AnimatedSprite;
  private text: PIXI.Text;
  state: EnemyState;

  constructor(coordinates: Coordinates, direction: Direction) {
    this.state = "walking";

    this.sprite = new PIXI.Container();

    this.id = id++;
    console.log(coordinates, direction, Direction.Down)
    this.coordinates = coordinates;
    this.targetCoordinates = coordinates;
    this.direction = direction;
    this.text = new PIXI.Text(String(this.id));
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
    this.character.animationSpeed = 0.15;
    const { x, y } = this.translateToScreenCoordinates(this.targetCoordinates||this.coordinates);
    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.zIndex = this.coordinates.y;
  }

  private translateToScreenCoordinates(coordinates: Coordinates): Coordinates {
    // console.log('go to ', coordinates)
    return {
      x: coordinates.x * TILE_SIZE+
        0.5 * this.sprite.width,
      y: coordinates.y * TILE_SIZE +
        // 0.5 * TILE_SIZE -
        0.5 * this.sprite.height -
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
