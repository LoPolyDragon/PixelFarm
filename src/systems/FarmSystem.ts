import Phaser from 'phaser';
import { Crop } from '../entities/Crop';
import { TileType } from '../utils/constants';

export class FarmSystem {
  private scene: Phaser.Scene;
  private crops: Map<string, Crop>;
  private tileData: number[][];
  private currentDay: number;

  constructor(scene: Phaser.Scene, tileData: number[][], startDay: number = 1) {
    this.scene = scene;
    this.crops = new Map();
    this.tileData = tileData;
    this.currentDay = startDay;

    scene.events.on('dayChanged', this.onDayChanged, this);
  }

  private getTileKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  canPlant(x: number, y: number): boolean {
    if (x < 0 || y < 0 || y >= this.tileData.length || x >= this.tileData[0].length) {
      return false;
    }

    const tile = this.tileData[y][x];
    const key = this.getTileKey(x, y);

    return (tile === TileType.GRASS || tile === TileType.DIRT || tile === TileType.PLOWED) &&
           !this.crops.has(key);
  }

  plant(x: number, y: number): boolean {
    if (!this.canPlant(x, y)) {
      return false;
    }

    const key = this.getTileKey(x, y);
    const crop = new Crop(this.scene, x, y, this.currentDay);
    this.crops.set(key, crop);
    this.tileData[y][x] = TileType.PLOWED;

    return true;
  }

  canWater(x: number, y: number): boolean {
    const key = this.getTileKey(x, y);
    const crop = this.crops.get(key);
    return crop !== undefined && !crop.isWatered();
  }

  water(x: number, y: number): boolean {
    const key = this.getTileKey(x, y);
    const crop = this.crops.get(key);

    if (!crop || crop.isWatered()) {
      return false;
    }

    crop.water();
    return true;
  }

  canHarvest(x: number, y: number): boolean {
    const key = this.getTileKey(x, y);
    const crop = this.crops.get(key);
    return crop !== undefined && crop.canHarvest();
  }

  harvest(x: number, y: number): boolean {
    const key = this.getTileKey(x, y);
    const crop = this.crops.get(key);

    if (!crop || !crop.canHarvest()) {
      return false;
    }

    crop.destroy();
    this.crops.delete(key);
    this.tileData[y][x] = TileType.GRASS;

    return true;
  }

  update(): void {
    this.crops.forEach(crop => {
      crop.update(this.currentDay);
    });
  }

  private onDayChanged(day: number): void {
    this.currentDay = day;

    this.crops.forEach(crop => {
      crop.resetWatered();
      crop.update(this.currentDay);
    });
  }

  getCropsData(): Array<{x: number, y: number, stage: number, dayPlanted: number, watered: boolean}> {
    const data: Array<{x: number, y: number, stage: number, dayPlanted: number, watered: boolean}> = [];
    this.crops.forEach(crop => {
      data.push({
        x: crop.x,
        y: crop.y,
        stage: crop.getStage(),
        dayPlanted: 0,
        watered: crop.isWatered()
      });
    });
    return data;
  }

  destroy(): void {
    this.crops.forEach(crop => crop.destroy());
    this.crops.clear();
    this.scene.events.off('dayChanged', this.onDayChanged, this);
  }
}
