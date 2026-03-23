import Phaser from 'phaser';
import { Crop } from '../entities/Crop';
import { TileType, CropType, Season, CropData } from '../utils/constants';

export class FarmSystem {
  private scene: Phaser.Scene;
  private crops: Map<string, Crop>;
  private tileData: number[][];
  private currentDay: number;
  private currentSeason: Season;

  constructor(
    scene: Phaser.Scene,
    tileData: number[][],
    startDay: number = 1,
    startSeason: Season = Season.SPRING
  ) {
    this.scene = scene;
    this.crops = new Map();
    this.tileData = tileData;
    this.currentDay = startDay;
    this.currentSeason = startSeason;

    scene.events.on('dayChanged', this.onDayChanged, this);
    scene.events.on('seasonChanged', this.onSeasonChanged, this);
  }

  private getTileKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  // Check if tile can be tilled
  canTill(x: number, y: number): boolean {
    if (x < 0 || y < 0 || y >= this.tileData.length || x >= this.tileData[0].length) {
      return false;
    }

    const tile = this.tileData[y][x];
    const key = this.getTileKey(x, y);

    return (tile === TileType.GRASS || tile === TileType.DIRT) && !this.crops.has(key);
  }

  // Till the soil
  till(x: number, y: number): boolean {
    if (!this.canTill(x, y)) {
      return false;
    }

    this.tileData[y][x] = TileType.PLOWED;
    return true;
  }

  // Check if can plant
  canPlant(x: number, y: number): boolean {
    if (x < 0 || y < 0 || y >= this.tileData.length || x >= this.tileData[0].length) {
      return false;
    }

    const tile = this.tileData[y][x];
    const key = this.getTileKey(x, y);

    return (tile === TileType.PLOWED || tile === TileType.WATERED) && !this.crops.has(key);
  }

  // Plant a crop
  plant(x: number, y: number, cropType: CropType): boolean {
    if (!this.canPlant(x, y)) {
      return false;
    }

    const key = this.getTileKey(x, y);
    const crop = new Crop(this.scene, x, y, cropType, this.currentDay, this.currentSeason);
    this.crops.set(key, crop);
    this.tileData[y][x] = TileType.PLOWED;

    return true;
  }

  // Check if can water
  canWater(x: number, y: number): boolean {
    const key = this.getTileKey(x, y);
    const crop = this.crops.get(key);

    // Can water crops or tilled soil
    if (crop) {
      return !crop.isWatered();
    }

    const tile = this.tileData[y][x];
    return tile === TileType.PLOWED;
  }

  // Water a crop or soil
  water(x: number, y: number): boolean {
    const key = this.getTileKey(x, y);
    const crop = this.crops.get(key);

    if (crop) {
      if (crop.isWatered()) {
        return false;
      }
      crop.water();
      this.tileData[y][x] = TileType.WATERED;
      return true;
    }

    // Water empty tilled soil
    const tile = this.tileData[y][x];
    if (tile === TileType.PLOWED) {
      this.tileData[y][x] = TileType.WATERED;
      return true;
    }

    return false;
  }

  // Check if can harvest
  canHarvest(x: number, y: number): boolean {
    const key = this.getTileKey(x, y);
    const crop = this.crops.get(key);
    return crop !== undefined && crop.canHarvest();
  }

  // Harvest a crop
  harvest(x: number, y: number): { success: boolean; cropType?: CropType; multiHarvest?: boolean } {
    const key = this.getTileKey(x, y);
    const crop = this.crops.get(key);

    if (!crop || !crop.canHarvest()) {
      return { success: false };
    }

    const cropType = crop.getCropType();
    const isMultiHarvest = crop.harvest();

    // If not multi-harvest, destroy the crop
    if (!isMultiHarvest) {
      crop.destroy();
      this.crops.delete(key);
      this.tileData[y][x] = TileType.PLOWED;
    }

    return {
      success: true,
      cropType,
      multiHarvest: isMultiHarvest
    };
  }

  // Get crop at tile
  getCrop(x: number, y: number): Crop | undefined {
    const key = this.getTileKey(x, y);
    return this.crops.get(key);
  }

  // Get tile type
  getTileType(x: number, y: number): TileType | undefined {
    if (x < 0 || y < 0 || y >= this.tileData.length || x >= this.tileData[0].length) {
      return undefined;
    }
    return this.tileData[y][x];
  }

  // Set tile type
  setTileType(x: number, y: number, type: TileType): void {
    if (x >= 0 && y >= 0 && y < this.tileData.length && x < this.tileData[0].length) {
      this.tileData[y][x] = type;
    }
  }

  update(): void {
    this.crops.forEach(crop => {
      crop.update(this.currentDay, this.currentSeason);
    });
  }

  private onDayChanged(day: number): void {
    this.currentDay = day;

    // Reset watering status and update crops
    this.crops.forEach(crop => {
      crop.resetWatered();
      crop.update(this.currentDay, this.currentSeason);
    });

    // Reset watered tiles back to plowed
    for (let y = 0; y < this.tileData.length; y++) {
      for (let x = 0; x < this.tileData[y].length; x++) {
        if (this.tileData[y][x] === TileType.WATERED) {
          this.tileData[y][x] = TileType.PLOWED;
        }
      }
    }
  }

  private onSeasonChanged(season: Season): void {
    this.currentSeason = season;

    // Remove dead crops (crops that died due to season change)
    const deadCrops: string[] = [];

    this.crops.forEach((crop, key) => {
      if (crop.isDead(season)) {
        crop.destroy();
        deadCrops.push(key);

        // Return tile to grass
        const [x, y] = key.split(',').map(Number);
        this.tileData[y][x] = TileType.GRASS;
      }
    });

    deadCrops.forEach(key => this.crops.delete(key));
  }

  // Load crops from save data
  loadCrops(cropDataArray: CropData[]): void {
    // Clear existing crops
    this.crops.forEach(crop => crop.destroy());
    this.crops.clear();

    // Create crops from data
    cropDataArray.forEach(data => {
      const crop = new Crop(
        this.scene,
        data.x,
        data.y,
        data.type,
        data.dayPlanted,
        data.seasonPlanted
      );

      // Set crop state
      if (data.watered) {
        crop.water();
      }

      const key = this.getTileKey(data.x, data.y);
      this.crops.set(key, crop);

      // Update crop to current state
      crop.update(this.currentDay, this.currentSeason);
    });
  }

  // Get crops data for saving
  getCropsData(): CropData[] {
    const data: CropData[] = [];

    this.crops.forEach(crop => {
      data.push({
        x: crop.x,
        y: crop.y,
        type: crop.getCropType(),
        stage: crop.getStage(),
        dayPlanted: crop.getDaysGrown(),
        seasonPlanted: this.currentSeason,
        watered: crop.isWatered()
      });
    });

    return data;
  }

  getTileData(): number[][] {
    return this.tileData;
  }

  destroy(): void {
    this.crops.forEach(crop => crop.destroy());
    this.crops.clear();
    this.scene.events.off('dayChanged', this.onDayChanged, this);
    this.scene.events.off('seasonChanged', this.onSeasonChanged, this);
  }
}
