import Phaser from 'phaser';
import {
  Direction,
  TILE_SIZE,
  PLAYER_SPEED,
  WALK_ANIMATION_SPEED,
  Tool
} from '../utils/constants';

export class Player {
  private sprite: Phaser.GameObjects.Sprite;
  private direction: Direction;
  private isMoving: boolean;
  private currentTool: Tool = Tool.NONE;
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
    num1: Phaser.Input.Keyboard.Key;
    num2: Phaser.Input.Keyboard.Key;
    num3: Phaser.Input.Keyboard.Key;
    num4: Phaser.Input.Keyboard.Key;
    num5: Phaser.Input.Keyboard.Key;
    num6: Phaser.Input.Keyboard.Key;
  };
  private animFrame: number = 0;
  private animTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.direction = Direction.DOWN;
    this.isMoving = false;

    // Create sprite (16x32 player)
    this.sprite = scene.add.sprite(x, y, this.getSpriteKey());
    this.sprite.setOrigin(0.5, 0.5);

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
      i: kb.addKey(Phaser.Input.Keyboard.KeyCodes.I),
      num1: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      num2: kb.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      num3: kb.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      num4: kb.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      num5: kb.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
      num6: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SIX)
    };
  }

  update(delta: number): void {
    this.isMoving = false;
    let velocityX = 0;
    let velocityY = 0;

    // Movement input
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

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    // Apply movement
    this.sprite.x += velocityX * PLAYER_SPEED * (delta / 1000);
    this.sprite.y += velocityY * PLAYER_SPEED * (delta / 1000);

    // Animation
    if (this.isMoving) {
      this.animTimer += delta;
      if (this.animTimer > WALK_ANIMATION_SPEED) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 3;
        this.updateSprite();
      }
    } else {
      if (this.animFrame !== 0) {
        this.animFrame = 0;
        this.updateSprite();
      }
    }
  }

  setTool(tool: Tool): void {
    this.currentTool = tool;
    this.updateSprite();
  }

  private getSpriteKey(): string {
    if (this.currentTool !== Tool.NONE && this.currentTool !== Tool.SEEDS) {
      return `player_${this.direction}_tool_${this.currentTool}`;
    }
    return `player_${this.direction}_${this.animFrame}`;
  }

  private updateSprite(): void {
    this.sprite.setTexture(this.getSpriteKey());
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

  getDirection(): Direction {
    return this.direction;
  }

  isActionPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.e);
  }

  isInventoryPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.i);
  }

  getToolSelection(): number | null {
    if (Phaser.Input.Keyboard.JustDown(this.keys.num1)) return 0;
    if (Phaser.Input.Keyboard.JustDown(this.keys.num2)) return 1;
    if (Phaser.Input.Keyboard.JustDown(this.keys.num3)) return 2;
    if (Phaser.Input.Keyboard.JustDown(this.keys.num4)) return 3;
    if (Phaser.Input.Keyboard.JustDown(this.keys.num5)) return 4;
    if (Phaser.Input.Keyboard.JustDown(this.keys.num6)) return 5;
    return null;
  }

  setPosition(x: number, y: number): void {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}
