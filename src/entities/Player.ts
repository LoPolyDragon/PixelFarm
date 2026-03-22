import Phaser from 'phaser';
import { Direction, TILE_SIZE, PLAYER_SPEED, COLORS } from '../utils/constants';

export class Player {
  private graphics: Phaser.GameObjects.Graphics;
  private sprite: Phaser.GameObjects.Container;
  private direction: Direction;
  private isMoving: boolean;
  private keys: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    e: Phaser.Input.Keyboard.Key;
    i: Phaser.Input.Keyboard.Key;
  };
  private animFrame: number = 0;
  private animTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.direction = Direction.DOWN;
    this.isMoving = false;

    this.sprite = scene.add.container(x, y);
    this.graphics = scene.add.graphics();
    this.sprite.add(this.graphics);

    this.drawPlayer();

    const kb = scene.input.keyboard;
    if (!kb) throw new Error('Keyboard not available');

    this.keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      e: kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      i: kb.addKey(Phaser.Input.Keyboard.KeyCodes.I)
    };
  }

  update(delta: number): void {
    this.isMoving = false;
    let velocityX = 0;
    let velocityY = 0;

    if (this.keys.up.isDown || this.keys.w.isDown) {
      velocityY = -1;
      this.direction = Direction.UP;
      this.isMoving = true;
    } else if (this.keys.down.isDown || this.keys.s.isDown) {
      velocityY = 1;
      this.direction = Direction.DOWN;
      this.isMoving = true;
    }

    if (this.keys.left.isDown || this.keys.a.isDown) {
      velocityX = -1;
      this.direction = Direction.LEFT;
      this.isMoving = true;
    } else if (this.keys.right.isDown || this.keys.d.isDown) {
      velocityX = 1;
      this.direction = Direction.RIGHT;
      this.isMoving = true;
    }

    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.sprite.x += velocityX * PLAYER_SPEED * (delta / 1000);
    this.sprite.y += velocityY * PLAYER_SPEED * (delta / 1000);

    if (this.isMoving) {
      this.animTimer += delta;
      if (this.animTimer > 200) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
        this.drawPlayer();
      }
    } else {
      this.animFrame = 0;
      this.drawPlayer();
    }
  }

  private drawPlayer(): void {
    this.graphics.clear();

    const offset = this.isMoving ? Math.sin(this.animFrame * Math.PI / 2) * 2 : 0;

    this.graphics.fillStyle(COLORS.PLAYER);
    this.graphics.fillRect(-8, -8 + offset, 16, 16);

    this.graphics.fillStyle(0xffffff);
    switch (this.direction) {
      case Direction.DOWN:
        this.graphics.fillRect(-4, -2 + offset, 3, 3);
        this.graphics.fillRect(1, -2 + offset, 3, 3);
        break;
      case Direction.UP:
        this.graphics.fillRect(-4, -4 + offset, 3, 3);
        this.graphics.fillRect(1, -4 + offset, 3, 3);
        break;
      case Direction.LEFT:
        this.graphics.fillRect(-5, -2 + offset, 3, 3);
        break;
      case Direction.RIGHT:
        this.graphics.fillRect(2, -2 + offset, 3, 3);
        break;
    }

    this.graphics.fillStyle(0x000000);
    this.graphics.fillRect(-6, 4 + offset, 4, 6);
    this.graphics.fillRect(2, 4 + offset, 4, 6);
  }

  getX(): number {
    return this.sprite.x;
  }

  getY(): number {
    return this.sprite.y;
  }

  getTileX(): number {
    return Math.floor(this.sprite.x / TILE_SIZE);
  }

  getTileY(): number {
    return Math.floor(this.sprite.y / TILE_SIZE);
  }

  getFacingTileX(): number {
    switch (this.direction) {
      case Direction.LEFT:
        return this.getTileX() - 1;
      case Direction.RIGHT:
        return this.getTileX() + 1;
      default:
        return this.getTileX();
    }
  }

  getFacingTileY(): number {
    switch (this.direction) {
      case Direction.UP:
        return this.getTileY() - 1;
      case Direction.DOWN:
        return this.getTileY() + 1;
      default:
        return this.getTileY();
    }
  }

  isActionPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.e);
  }

  isInventoryPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.i);
  }

  setPosition(x: number, y: number): void {
    this.sprite.x = x;
    this.sprite.y = y;
  }
}
