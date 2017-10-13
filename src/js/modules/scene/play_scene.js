import { Container, Text, Bitmap, Shape, Stage, Sprite } from "createjs-module";
import { Button } from "../common/button";
import { WIDTH, HEIGHT, FULL_HEIGHT, FULL_WIDTH, TILE_SIZE } from "../../constants";
import { Player, Enemy } from "../objects";
import TileMap from "../map/tile_map";
import Camera from "../map/camera";
import assetManager from "../../asset_store";

export class PlayScene extends Stage {
  constructor(args) {
    super(args);
    this.walls = [];
    this.tileMap = new TileMap();
    this.Main();
  }

  Main() {
    window.camera = this.camera = new Camera(this.tileMap, WIDTH, HEIGHT);
    console.log(this.camera);
    // let ground = new Shape();
    // ground.graphics.beginFill("lightgreen").drawRect(0, 0, WIDTH, HEIGHT);
    // ground.x = 0;
    // ground.y = 0;
    this.ground = new Container();
    this.addChild(this.ground);
    for (let i = 0; i < this.tileMap.rows; i++) {
      for (let j = 0; j < this.tileMap.cols; j++) {
        let tileType = this.tileMap.getTileType(i, j);
        let tile = new Sprite(this.tileMap.tileSet);
        tile.gotoAndStop(tileType);
        tile.x = j * TILE_SIZE;
        tile.y = i * TILE_SIZE;

        // let text = new Text(`${j},${i}`, "20px Arial", "#ff7700");
        // text.x = j * TILE_SIZE;
        // text.y = i * TILE_SIZE;

        // let border = new Shape();
        // border.graphics.beginStroke("red").drawRect(text.x, text.y, TILE_SIZE, TILE_SIZE);
        this.ground.addChild(tile);
        // this.stage.addChild(tile);
        // this.ground.addChild(text)
        // this.stage.addChild(border)
        // this.stage.update();
        // tile.cache(tile.x,tile.y, 120,120)
      }
    }

    const half = TILE_SIZE / 2;
    this.player = new Player(4 * TILE_SIZE - half, 6 * TILE_SIZE - half, 8, this);
    // this.player = new Player(6 * TILE_SIZE - half, 8 * TILE_SIZE - half, 5, this);

    this.enemy = new Enemy(8 * TILE_SIZE + half, 3 * TILE_SIZE + half, 5, this);
    this.stage.snapToPixel = true;

    this.addChild(this.enemy);
    this.addChild(this.player);
  }

  inViewport(x, y) {
    const tsize = TILE_SIZE;

    // let ceiledX = Math.floor(x + tsize)

    return (
      x + tsize > this.camera.x - tsize &&
      x < this.camera.x + WIDTH + tsize &&
      (y + tsize > this.camera.y - tsize && y < this.camera.y + HEIGHT + tsize)
    );
  }

  Update(e) {
    for (let i = 0; i < this.ground.numChildren; i++) {
      let element = this.ground.getChildAt(i);
      element.visible = this.inViewport(element.x, element.y);
    }

    this.player.Update(e);
    this.enemy.Update(e);

    this.camera.moveTo(this.player.pos.x - WIDTH / 2, this.player.pos.y - HEIGHT / 2);

    this.stage.x = -this.camera.x;
    this.stage.y = -this.camera.y;

    this.stage.update();
  }
}
