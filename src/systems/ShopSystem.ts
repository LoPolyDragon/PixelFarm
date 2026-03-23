import { CropType, CROP_DATA, Season, InventoryData } from '../utils/constants';

/**
 * ShopSystem - Manages buying seeds and selling crops
 */
export class ShopSystem {
  private currentSeason: Season;

  constructor(season: Season = Season.SPRING) {
    this.currentSeason = season;
  }

  setSeason(season: Season): void {
    this.currentSeason = season;
  }

  // Get available seeds for current season
  getAvailableSeeds(): CropType[] {
    const availableSeeds: CropType[] = [];

    Object.values(CropType).forEach(cropType => {
      if (typeof cropType === 'number') {
        const cropInfo = CROP_DATA[cropType];
        if (cropInfo.seasons.includes(this.currentSeason)) {
          availableSeeds.push(cropType);
        }
      }
    });

    return availableSeeds;
  }

  // Buy seeds
  buySeed(cropType: CropType, quantity: number, gold: number): {
    success: boolean;
    newGold: number;
    message: string;
  } {
    const cropInfo = CROP_DATA[cropType];

    // Check if seed is available in current season
    if (!cropInfo.seasons.includes(this.currentSeason)) {
      return {
        success: false,
        newGold: gold,
        message: `${cropInfo.name} seeds not available this season!`
      };
    }

    const totalCost = cropInfo.buyPrice * quantity;

    // Check if player has enough gold
    if (gold < totalCost) {
      return {
        success: false,
        newGold: gold,
        message: `Not enough gold! Need ${totalCost}g`
      };
    }

    return {
      success: true,
      newGold: gold - totalCost,
      message: `Bought ${quantity} ${cropInfo.name} seed${quantity > 1 ? 's' : ''} for ${totalCost}g`
    };
  }

  // Sell crop
  sellCrop(cropType: CropType, quantity: number, gold: number): {
    success: boolean;
    newGold: number;
    message: string;
  } {
    if (quantity <= 0) {
      return {
        success: false,
        newGold: gold,
        message: 'No crops to sell!'
      };
    }

    const cropInfo = CROP_DATA[cropType];
    const totalValue = cropInfo.sellPrice * quantity;

    return {
      success: true,
      newGold: gold + totalValue,
      message: `Sold ${quantity} ${cropInfo.name}${quantity > 1 ? 's' : ''} for ${totalValue}g!`
    };
  }

  // Sell all crops in inventory
  sellAllCrops(inventory: InventoryData, gold: number): {
    newGold: number;
    message: string;
    soldCrops: Partial<Record<CropType, number>>;
  } {
    let totalValue = 0;
    const soldCrops: Partial<Record<CropType, number>> = {};

    Object.entries(inventory.crops).forEach(([cropTypeStr, quantity]) => {
      const cropType = parseInt(cropTypeStr) as CropType;
      if (quantity > 0) {
        const cropInfo = CROP_DATA[cropType];
        const value = cropInfo.sellPrice * quantity;
        totalValue += value;
        soldCrops[cropType] = quantity;
      }
    });

    if (totalValue === 0) {
      return {
        newGold: gold,
        message: 'No crops to sell!',
        soldCrops: {}
      };
    }

    return {
      newGold: gold + totalValue,
      message: `Sold crops for ${totalValue}g!`,
      soldCrops
    };
  }

  // Get seed price
  getSeedPrice(cropType: CropType): number {
    return CROP_DATA[cropType].buyPrice;
  }

  // Get crop sell price
  getCropPrice(cropType: CropType): number {
    return CROP_DATA[cropType].sellPrice;
  }

  // Get crop name
  getCropName(cropType: CropType): string {
    return CROP_DATA[cropType].name;
  }

  // Check if seed is available
  isSeedAvailable(cropType: CropType): boolean {
    return CROP_DATA[cropType].seasons.includes(this.currentSeason);
  }
}
