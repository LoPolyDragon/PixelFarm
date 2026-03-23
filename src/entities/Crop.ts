import Phaser from 'phaser';
import {
  CropStage,
  CropType,
  Season,
  CROP_DATA,
  TILE_SIZE,
  CROP_WATERED_TINT
} from '../utils/constants';

export class Crop {
  private sprite: Phaser.GameObjects.Sprite;
  private wateredOverlay: Phaser.GameObjects.Graphics | null = null;
  private stage: CropStage;
  private cropType: CropType;
  private dayPlanted: number;
  private seasonPlanted: Season;
  private watered: boolean;
  private daysGrown: number = 0;
  public x: number;
  public y: number;
  private scene: Phaser.Scene;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    cropType: CropType,
    dayPlanted: number,
    seasonPlanted: Season
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.cropType = cropType;
    this.stage = CropStage.SEED;
    this.dayPlanted = dayPlanted;
    this.seasonPlanted = seasonPlanted;
    this.watered = false;

    const worldX = x * TILE_SIZE + TILE_SIZE / 2;
    const worldY = y * TILE_SIZE + TILE_SIZE / 2;

    // Create sprite
    this.sprite = scene.add.sprite(worldX, worldY, this.getSpriteKey());
    this.sprite.setOrigin(0.5, 0.5);

    this.updateWateredOverlay();
  }

  update(currentDay: number, currentSeason: Season): void {
    // Calculate days grown
    this.daysGrown = currentDay - this.dayPlanted;

    // Check if season changed - crops die if season changes
    if (currentSeason !== this.seasonPlanted) {
      // Crop wilts/dies when season changes
      return;
    }

    // Update stage based on growth days
    const cropInfo = CROP_DATA[this.cropType];
    const growthDays = cropInfo.growthDays;

    if (this.watered) {
      if (this.daysGrown >= growthDays) {
        this.stage = CropStage.READY;
      } else if (this.daysGrown >= Math.floor(growthDays * 0.66)) {
        this.stage = CropStage.GROWING;
      } else if (this.daysGrown >= Math.floor(growthDays * 0.33)) {
        this.stage = CropStage.SPROUT;
      } else {
        this.stage = CropStage.SEED;
      }
    }

    this.updateSprite();
  }

  water(): void {
    this.watered = true;
    this.updateWateredOverlay();
  }

  isWatered(): boolean {
    return this.watered;
  }

  resetWatered(): void {
    this.watered = false;
    this.updateWateredOverlay();
  }

  getStage(): CropStage {
    return this.stage;
  }

  getCropType(): CropType {
    return this.cropType;
  }

  canHarvest(): boolean {
    return this.stage === CropStage.READY;
  }

  getDaysGrown(): number {
    return this.daysGrown;
  }

  // For multi-harvest crops (tomatoes, blueberries, etc.)
  harvest(): boolean {
    const cropInfo = CROP_DATA[this.cropType];

    if (!this.canHarvest()) {
      return false;
    }

    // If crop has regrow days, reset to growing stage
    if (cropInfo.regrowDays) {
      this.stage = CropStage.GROWING;
      this.dayPlanted += cropInfo.regrowDays;
      this.updateSprite();
      return true;
    }

    // Otherwise, crop is destroyed after harvest
    return true;
  }

  isDead(currentSeason: Season): boolean {
    // Crop dies if season changes
    return currentSeason !== this.seasonPlanted;
  }

  private getSpriteKey(): string {
    return `crop_${this.cropType}_${this.stage}`;
  }

  private updateSprite(): void {
    this.sprite.setTexture(this.getSpriteKey());
  }

  private updateWateredOverlay(): void {
    if (this.wateredOverlay) {
      this.wateredOverlay.destroy();
      this.wateredOverlay = null;
    }

    if (this.watered) {
      this.wateredOverlay = this.scene.add.graphics();
      this.wateredOverlay.fillStyle(CROP_WATERED_TINT, 0.3);
      this.wateredOverlay.fillRect(
        this.x * TILE_SIZE,
        this.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }

  destroy(): void {
    this.sprite.destroy();
    if (this.wateredOverlay) {
      this.wateredOverlay.destroy();
    }
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    const worldX = x * TILE_SIZE + TILE_SIZE / 2;
    const worldY = y * TILE_SIZE + TILE_SIZE / 2;
    this.sprite.setPosition(worldX, worldY);
    this.updateWateredOverlay();
  }
}
