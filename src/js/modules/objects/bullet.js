import { Bitmap, Ticker, Shape, Sound } from "createjs-module";
import { Vector2 } from "../../utils";
import { DIR, FULL_WIDTH, FULL_HEIGHT, TAGS } from "../../constants";
import game from "../../main";
import { GameObject } from "./index";

export class Bullet extends GameObject {
  constructor(x, y, speed = 20, scene, dir, owner = TAGS.ENEMY) {
    super("bullet", x, y, speed, scene);

    // if (isCentered) {
    //   let bounds = this.getBounds();
    //   this.regX = bounds.width * 0.5;
    //   this.regY = bounds.height * 0.5;
    // }

    this.scaleX = 0.3;
    this.scaleY = 0.3;

    this.owner = owner;
    this.forward = dir;

    this.hitObj = { value: null };
    this.hitWall = { value: null };

    this.isAlive = true;
    this.rotation = 360 - this.forward.atan2(Vector2.Down) * 180 / Math.PI;

    Sound.play("bullet_hit");
  }

  onDestroyed(callback) {
    this.on("destroy", callback, null, true, this);
  }

  onCollision(callback) {
    this.on("collision", callback, null, true, { bullet: this, hitObj: this.hitObj });
  }

  onCollisionDestructible(callback) {
    this.on("collisionDestructible", callback, null, true, { bullet: this, hitWall: this.hitWall });
  }

  inBounds() {
    return this.x >= 0 && this.x < FULL_WIDTH && this.y >= 0 && this.y < FULL_HEIGHT;
  }

  // grid indexing implementation
  isColliding(pos) {
    const { x, y } = pos;
    let map = game.scene.tileMap;

    let isDestructibleObject = map.isDestructibleAtXY(x, y);

    if (isDestructibleObject) {
      this.hitWall.value = { x: map.getCol(x), y: map.getRow(y) };
      this.dispatchEvent("collisionDestructible");
    }

    let isColliding = map.isSolidTileAtXY(x, y);
    let collidables = null;

    this.hitObj.value = null;
    if (this.owner == TAGS.PLAYER) {
      collidables = game.scene.enemies;
    } else if (this.owner == TAGS.ENEMY) {
      collidables = game.scene.players;
    }

    if (collidables) {
      for (let obj of collidables) {
        let tile = map.getTileCoordRaw(obj.pos.x, obj.pos.y);
        if (map.isPointInTile(this.x, this.y, tile)) {
          isColliding = true;
          this.hitObj.value = obj;
          this.dispatchEvent("collision");
          break;
        }
      }
    }

    return isColliding;
  }

  // Old bounding box implementation
  /*
  isColliding() {
    let walls = game.scene.walls;
    // game.scene.walls;
    // console.log(this.stage.mouseX)
    for (let wall of walls) {
      let localPos = wall.globalToLocal(this.x, this.y);
      // let wallLocal = this.stage.globalToLocal(wall.x,wall.y)
      // console.log(localPos.x,localPos.y, "   ", this.x, this.y)
      // console.log(wallLocal.x, wallLocal.y, "   ", wall.x, wall.y)
      
      let wallWidth = wall.getBounds().width;
      let wallHeight = wall.getBounds().height;
      if (
        this.x >= wall.x &&
        this.x <= wall.x + wallWidth &&
        this.y >= wall.y &&
        this.y <= wall.y + wallHeight
      ) {
        console.log("hit with wall");
        return true;
      }

      // if (wall.hitTest(localPos.x, localPos.y)) {
      //   console.log("hit with wall");
      //   return true;
      // }
    }
    return false;
  }
  */

  Move() {
    let newPos = this.forward.scale(this.speed);
    this.pos = this.pos.add(newPos);
    if (!this.inBounds() || this.isColliding(this.pos)) {
      if (this.isAlive) {
        this.isAlive = false;
        this.dispatchEvent("destroy");
      }
    }
  }

  Update() {
    this.Move();
  }
}
