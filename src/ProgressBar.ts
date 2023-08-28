import { Container, Graphics } from "pixi.js";
import { VisualElement } from "./VisualElement";

export class ProgressBar implements VisualElement{
  sprite: VisualElement["sprite"];
  private background: Graphics;
  private bar: Graphics;
  private _width: number = 100;
  private _progress: number = 100;
  constructor({width = 100, progress = 0
  }: {
    width?: number,
    progress?: number,
  }) {
    this.sprite = new Container();;
    this._width = width
    this._progress = progress;
    this.background = new Graphics()
    this.bar = new Graphics()
    this.initSprite();
    this.sprite.addChild(this.background);
    this.sprite.addChild(this.bar);
  }

  initSprite() {
    this.background.clear();
    this.background.beginFill(0x000000);
    this.background.drawRect(0, 0, this._width, 10);
    this.background.endFill();
    this.updateBar();

  }

  updateBar() {
    this.bar.clear();
    this.bar.beginFill(0x00ff00);
    this.bar.drawRect(2, 2, (this._width - 4) / (100 / this._progress), 8);
    this.bar.endFill();
  }

  set width(width: number) {
    this._width = width;
    this.initSprite();
  }

  set progress(progress: number) {
    this._progress = progress;
    this.updateBar();
  }
}
