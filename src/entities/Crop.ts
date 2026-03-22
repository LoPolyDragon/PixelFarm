import Phaser from 'phaser';
import { CropStage, COLORS, TILE_SIZE, CROP_WATERED_TINT } from '../utils/constants';

export class Crop {
  private graphics: Phaser.GameObjects.Graphics;
  private stage: CropStage;
  private dayPlanted: number;
  private watered: boolean;
  public x: number;
  public y: number;

  constructor(scene: Phaser.Scene, x: number, y: number, dayPlanted: number) {
    this.x = x;
    this.y = y;
    this.stage = CropStage.SEED;
    this.dayPlanted = dayPlanted;
    this.watered = false;

    this.graphics = scene.add.graphics();
    this.draw();
  }

  update(currentDay: number): void {
    const daysGrown = currentDay - this.dayPlanted;

    if (daysGrown >= 3 && this.watered) {
      this.stage = CropStage.READY;
    } else if (daysGrown >= 1 && this.watered) {
      this.stage = CropStage.GROWING;
    }

    this.draw();
  }

  water(): void {
    this.watered = true;
    this.draw();
  }

  isWatered(): boolean {
    return this.watered;
  }

  resetWatered(): void {
    this.watered = false;
  }

  getStage(): CropStage {
    return this.stage;
  }

  canHarvest(): boolean {
    return this.stage === CropStage.READY;
  }

  private draw(): void {
    this.graphics.clear();

    const worldX = this.x * TILE_SIZE + TILE_SIZE / 2;
    const worldY = this.y * TILE_SIZE + TILE_SIZE / 2;

    if (this.watered) {
      this.graphics.fillStyle(CROP_WATERED_TINT, 0.3);
      this.graphics.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    switch (this.stage) {
      case CropStage.SEED:
        this.graphics.fillStyle(COLORS.SEED);
        this.graphics.fillCircle(worldX, worldY, 3);
        break;
      case CropStage.GROWING:
        this.graphics.fillStyle(COLORS.CROP_GROWING);
        this.graphics.fillCircle(worldX, worldY, 8);
        break;
      case CropStage.READY:
        this.graphics.fillStyle(COLORS.CROP_READY);
        this.graphics.fillCircle(worldX, worldY, 12);
        this.graphics.fillStyle(COLORS.CROP_READY);
        this.graphics.fillCircle(worldX - 5, worldY - 5, 8);
        this.graphics.fillCircle(worldX + 5, worldY - 5, 8);
        break;
    }
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
