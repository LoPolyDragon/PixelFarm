import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { TimeSystem } from '../systems/TimeSystem';
import { SeasonSystem } from '../systems/SeasonSystem';
import { FarmSystem } from '../systems/FarmSystem';
import { EnergySystem } from '../systems/EnergySystem';
import { ToolSystem } from '../systems/ToolSystem';
import { ShopSystem } from '../systems/ShopSystem';
import { HUD } from '../ui/HUD';
import { DialogBox } from '../ui/DialogBox';
import { ParticleEffects } from '../ui/ParticleEffects';
import {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  TileType,
  Season,
  Tool,
  CropType,
  GameData,
  InventoryData,
  CROP_DATA
} from '../utils/constants';

export class FarmScene extends Phaser.Scene {
  // Entities
  private player!: Player;

  // Systems
  private seasonSystem!: SeasonSystem;
  private timeSystem!: TimeSystem;
  private farmSystem!: FarmSystem;
  private energySystem!: EnergySystem;
  private toolSystem!: ToolSystem;
  private shopSystem!: ShopSystem;

  // UI
  private hud!: HUD;
  private dialogBox!: DialogBox;
  private particleEffects!: ParticleEffects;

  // Map
  private tileSprites: Phaser.GameObjects.Sprite[][] = [];
  private tileData: number[][] = [];

  // Buildings and objects
  private farmhouse!: Phaser.GameObjects.Sprite;
  private shippingBin!: Phaser.GameObjects.Sprite;
  private shopSprite!: Phaser.GameObjects.Sprite;
  private trees: Phaser.GameObjects.Sprite[] = [];

  // Game state
  private gold: number = 100;
  private inventory: InventoryData = {
    seeds: {} as Record<CropType, number>,
    crops: {} as Record<CropType, number>
  };
  private selectedSeedType: CropType = CropType.PARSNIP;

  // Positions
  private bedPosition = { x: 8, y: 8 };
  private shippingBinPosition = { x: 15, y: 8 };
  private shopPosition = { x: 40, y: 10 };

  // Lighting overlay
  private overlayGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'FarmScene' });
  }

  init(data: { loadGame?: boolean }): void {
    if (data.loadGame) {
      this.loadGame();
    } else {
      // Initialize inventory with starting seeds
      this.inventory.seeds = {
        [CropType.PARSNIP]: 10,
        [CropType.CAULIFLOWER]: 0,
        [CropType.POTATO]: 5,
        [CropType.TOMATO]: 0,
        [CropType.BLUEBERRY]: 0,
        [CropType.PUMPKIN]: 0,
        [CropType.CORN]: 0,
        [CropType.STRAWBERRY]: 0
      };
      this.inventory.crops = {
        [CropType.PARSNIP]: 0,
        [CropType.CAULIFLOWER]: 0,
        [CropType.POTATO]: 0,
        [CropType.TOMATO]: 0,
        [CropType.BLUEBERRY]: 0,
        [CropType.PUMPKIN]: 0,
        [CropType.CORN]: 0,
        [CropType.STRAWBERRY]: 0
      };
    }
  }

  create(): void {
    // Initialize systems
    this.seasonSystem = new SeasonSystem(Season.SPRING, 1);
    this.timeSystem = new TimeSystem(this, this.seasonSystem);
    this.energySystem = new EnergySystem();
    this.toolSystem = new ToolSystem();
    this.shopSystem = new ShopSystem(this.seasonSystem.getCurrentSeason());

    // Generate and render map
    this.generateTileMap();
    this.renderTileMap();

    // Initialize farm system
    this.farmSystem = new FarmSystem(
      this,
      this.tileData,
      this.seasonSystem.getDayInSeason(),
      this.seasonSystem.getCurrentSeason()
    );

    // Create player
    this.player = new Player(this, 200, 200);

    // Create buildings and objects
    this.createBuildings();
    this.createDecorations();

    // Create overlay for day/night
    this.overlayGraphics = this.add.graphics();
    this.overlayGraphics.setDepth(999);

    // Create UI
    this.hud = new HUD(this);
    this.dialogBox = new DialogBox(this);
    this.particleEffects = new ParticleEffects(this);

    // Initialize HUD
    this.hud.initializeHotbar(this.toolSystem.getTools());
    this.hud.updateDay(this.seasonSystem.getDayInSeason());
    this.hud.updateSeason(this.seasonSystem.getCurrentSeason(), this.seasonSystem.getSeasonName());
    this.hud.updateGold(this.gold);
    this.hud.updateEnergy(this.energySystem.getCurrentEnergy(), this.energySystem.getMaxEnergy());
    this.updateSeedCountInHUD();

    // Camera setup
    this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player['sprite'], true, 0.1, 0.1);

    // Event listeners
    this.events.on('dayChanged', this.onDayChanged, this);
    this.events.on('seasonChanged', this.onSeasonChanged, this);

    // Show welcome message
    this.dialogBox.show('Welcome to PixelFarm! Use WASD to move, E to interact, 1-6 to select tools.', 3000);
  }

  update(_time: number, delta: number): void {
    // Update systems
    this.player.update(delta);
    this.timeSystem.update(delta);
    this.farmSystem.update();

    // Update HUD
    this.hud.updateTime(this.timeSystem.getFormattedTime());
    this.updateLighting();

    // Handle tool selection
    const toolSelection = this.player.getToolSelection();
    if (toolSelection !== null) {
      this.toolSystem.selectToolByIndex(toolSelection);
      this.hud.updateSelectedSlot(toolSelection);
      this.player.setTool(this.toolSystem.getSelectedTool());
    }

    // Handle action
    if (this.player.isActionPressed()) {
      this.handleAction();
    }

    // Handle inventory (show shop/inventory UI)
    if (this.player.isInventoryPressed()) {
      this.showInventory();
    }
  }

  private generateTileMap(): void {
    this.tileData = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
      const row: number[] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        // Create interesting farm layout
        if (y < 5 || y > MAP_HEIGHT - 5 || x < 5 || x > MAP_WIDTH - 5) {
          // Border - trees/water
          row.push(Math.random() > 0.7 ? TileType.WATER : TileType.GRASS);
        } else if (x >= 10 && x <= 12 && y >= 7 && y <= 9) {
          // Farmhouse area
          row.push(TileType.PATH);
        } else if (x >= 14 && x <= 16 && y >= 7 && y <= 9) {
          // Shipping bin area
          row.push(TileType.PATH);
        } else if (x >= 20 && x <= 35 && y >= 10 && y <= 25) {
          // Main farmland - tilled
          row.push(TileType.DIRT);
        } else if ((x === 13 || x === 17) && y >= 7 && y <= 25) {
          // Paths
          row.push(TileType.PATH);
        } else if (y === 9 && x >= 10 && x <= 17) {
          // Horizontal path
          row.push(TileType.PATH);
        } else {
          // Regular grass
          row.push(TileType.GRASS);
        }
      }
      this.tileData.push(row);
    }
  }

  private renderTileMap(): void {
    for (let y = 0; y < this.tileData.length; y++) {
      const row: Phaser.GameObjects.Sprite[] = [];
      for (let x = 0; x < this.tileData[y].length; x++) {
        const tile = this.createTileSprite(x, y, this.tileData[y][x]);
        row.push(tile);
      }
      this.tileSprites.push(row);
    }
  }

  private createTileSprite(x: number, y: number, tileType: TileType): Phaser.GameObjects.Sprite {
    const worldX = x * TILE_SIZE + TILE_SIZE / 2;
    const worldY = y * TILE_SIZE + TILE_SIZE / 2;

    let textureKey = 'grass_0';

    switch (tileType) {
      case TileType.GRASS:
        textureKey = `grass_${Math.floor(Math.random() * 3)}`;
        break;
      case TileType.DIRT:
        textureKey = 'dirt';
        break;
      case TileType.WATER:
        textureKey = 'water_0';
        break;
      case TileType.PATH:
        textureKey = 'path';
        break;
      case TileType.PLOWED:
        textureKey = 'tilled';
        break;
      case TileType.WATERED:
        textureKey = 'watered';
        break;
      case TileType.SAND:
        textureKey = 'sand';
        break;
    }

    const sprite = this.add.sprite(worldX, worldY, textureKey);
    sprite.setOrigin(0.5, 0.5);

    // Apply seasonal tint
    const tint = this.seasonSystem.getGrassTint();
    if (tileType === TileType.GRASS) {
      sprite.setTint(tint);
    }

    return sprite;
  }

  private updateTileSprite(x: number, y: number): void {
    if (y < 0 || y >= this.tileSprites.length || x < 0 || x >= this.tileSprites[y].length) {
      return;
    }

    const tileType = this.tileData[y][x];
    const sprite = this.tileSprites[y][x];

    let textureKey = 'grass_0';

    switch (tileType) {
      case TileType.GRASS:
        textureKey = `grass_${Math.floor(Math.random() * 3)}`;
        break;
      case TileType.DIRT:
        textureKey = 'dirt';
        break;
      case TileType.WATER:
        textureKey = 'water_0';
        break;
      case TileType.PATH:
        textureKey = 'path';
        break;
      case TileType.PLOWED:
        textureKey = 'tilled';
        break;
      case TileType.WATERED:
        textureKey = 'watered';
        break;
    }

    sprite.setTexture(textureKey);

    // Apply seasonal tint
    const tint = this.seasonSystem.getGrassTint();
    if (tileType === TileType.GRASS) {
      sprite.setTint(tint);
    }
  }

  private createBuildings(): void {
    // Farmhouse (4x3 tiles at position)
    const houseX = this.bedPosition.x * TILE_SIZE;
    const houseY = this.bedPosition.y * TILE_SIZE;
    this.farmhouse = this.add.sprite(houseX + 32, houseY + 24, 'farmhouse');
    this.farmhouse.setOrigin(0, 0);
    this.farmhouse.setDepth(100);

    // Shipping bin
    const binX = this.shippingBinPosition.x * TILE_SIZE + TILE_SIZE / 2;
    const binY = this.shippingBinPosition.y * TILE_SIZE + TILE_SIZE / 2;
    this.shippingBin = this.add.sprite(binX, binY, 'shipping_bin');
    this.shippingBin.setDepth(100);

    // Shop
    const shopX = this.shopPosition.x * TILE_SIZE;
    const shopY = this.shopPosition.y * TILE_SIZE;
    this.shopSprite = this.add.sprite(shopX, shopY, 'shop');
    this.shopSprite.setOrigin(0, 0);
    this.shopSprite.setDepth(100);
  }

  private createDecorations(): void {
    // Place decorative trees
    const treePositions = [
      { x: 7, y: 15 },
      { x: 10, y: 30 },
      { x: 38, y: 12 },
      { x: 42, y: 28 },
      { x: 15, y: 33 },
      { x: 25, y: 6 }
    ];

    treePositions.forEach(pos => {
      const tree = this.add.sprite(
        pos.x * TILE_SIZE,
        pos.y * TILE_SIZE,
        'tree_oak'
      );
      tree.setOrigin(0, 0);
      tree.setDepth(50);
      tree.setTint(this.seasonSystem.getTreeTint());
      this.trees.push(tree);
    });

    // Add some flowers
    for (let i = 0; i < 10; i++) {
      const x = 5 + Math.floor(Math.random() * 10);
      const y = 5 + Math.floor(Math.random() * 10);
      const flowerTypes = ['flower_rose', 'flower_sunflower', 'flower_tulip'];
      const flower = this.add.sprite(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2,
        flowerTypes[Math.floor(Math.random() * flowerTypes.length)]
      );
      flower.setDepth(50);
    }
  }

  private handleAction(): void {
    const facingX = this.player.getFacingTileX();
    const facingY = this.player.getFacingTileY();

    // Check if at bed (sleep)
    if (this.isNearPosition(facingX, facingY, this.bedPosition.x, this.bedPosition.y, 2)) {
      this.sleep();
      return;
    }

    // Check if at shipping bin (sell crops)
    if (this.isNearPosition(facingX, facingY, this.shippingBinPosition.x, this.shippingBinPosition.y, 1)) {
      this.sellCrops();
      return;
    }

    // Check if at shop (buy seeds)
    if (this.isNearPosition(facingX, facingY, this.shopPosition.x, this.shopPosition.y, 2)) {
      this.openShop();
      return;
    }

    // Tool actions
    const selectedTool = this.toolSystem.getSelectedTool();

    switch (selectedTool) {
      case Tool.HOE:
        this.useTool_Hoe(facingX, facingY);
        break;
      case Tool.WATERING_CAN:
        this.useTool_WateringCan(facingX, facingY);
        break;
      case Tool.SCYTHE:
        this.useTool_Scythe(facingX, facingY);
        break;
      case Tool.SEEDS:
        this.useTool_Seeds(facingX, facingY);
        break;
      case Tool.AXE:
      case Tool.PICKAXE:
        this.dialogBox.show('This tool is not implemented yet!', 1500);
        break;
    }
  }

  private useTool_Hoe(x: number, y: number): void {
    if (!this.energySystem.canUseTool(Tool.HOE)) {
      this.dialogBox.show('Not enough energy!', 1500);
      return;
    }

    if (this.farmSystem.canTill(x, y)) {
      this.farmSystem.till(x, y);
      this.energySystem.useEnergyForTool(Tool.HOE);
      this.updateTileSprite(x, y);
      this.particleEffects.createDirtSplash(x, y);
      this.particleEffects.createActionText(x, y, 'Tilled!', '#8b6f47');
      this.hud.updateEnergy(this.energySystem.getCurrentEnergy(), this.energySystem.getMaxEnergy());
    }
  }

  private useTool_WateringCan(x: number, y: number): void {
    if (!this.energySystem.canUseTool(Tool.WATERING_CAN)) {
      this.dialogBox.show('Not enough energy!', 1500);
      return;
    }

    if (this.farmSystem.canWater(x, y)) {
      this.farmSystem.water(x, y);
      this.energySystem.useEnergyForTool(Tool.WATERING_CAN);
      this.updateTileSprite(x, y);
      this.particleEffects.createWaterDroplets(x, y);
      this.particleEffects.createActionText(x, y, 'Watered!', '#4a90e2');
      this.hud.updateEnergy(this.energySystem.getCurrentEnergy(), this.energySystem.getMaxEnergy());
    }
  }

  private useTool_Scythe(x: number, y: number): void {
    if (!this.energySystem.canUseTool(Tool.SCYTHE)) {
      this.dialogBox.show('Not enough energy!', 1500);
      return;
    }

    if (this.farmSystem.canHarvest(x, y)) {
      const result = this.farmSystem.harvest(x, y);
      if (result.success && result.cropType !== undefined) {
        this.energySystem.useEnergyForTool(Tool.SCYTHE);
        this.inventory.crops[result.cropType]++;
        this.updateTileSprite(x, y);
        this.particleEffects.createSparkles(x, y);
        this.particleEffects.createLeafParticles(x, y);

        const cropName = CROP_DATA[result.cropType].name;
        this.particleEffects.createActionText(x, y, `Harvested ${cropName}!`, '#32cd32');

        this.hud.updateEnergy(this.energySystem.getCurrentEnergy(), this.energySystem.getMaxEnergy());
        this.saveGame();
      }
    }
  }

  private useTool_Seeds(x: number, y: number): void {
    // Check if have seeds
    if (this.inventory.seeds[this.selectedSeedType] <= 0) {
      this.dialogBox.show('No seeds! Visit the shop to buy more.', 2000);
      return;
    }

    if (this.farmSystem.canPlant(x, y)) {
      this.farmSystem.plant(x, y, this.selectedSeedType);
      this.inventory.seeds[this.selectedSeedType]--;
      this.updateTileSprite(x, y);
      this.particleEffects.createDirtSplash(x, y);

      const cropName = CROP_DATA[this.selectedSeedType].name;
      this.particleEffects.createActionText(x, y, `Planted ${cropName}!`, '#9acd32');

      this.updateSeedCountInHUD();
      this.saveGame();
    }
  }

  private sleep(): void {
    this.dialogBox.show('Going to sleep... See you tomorrow!', 2000);
    this.energySystem.restoreToFull();
    this.hud.updateEnergy(this.energySystem.getCurrentEnergy(), this.energySystem.getMaxEnergy());

    this.time.delayedCall(2000, () => {
      this.timeSystem.skipToMorning();
    });
  }

  private sellCrops(): void {
    const result = this.shopSystem.sellAllCrops(this.inventory, this.gold);

    if (Object.keys(result.soldCrops).length > 0) {
      this.gold = result.newGold;

      // Clear sold crops from inventory
      Object.keys(result.soldCrops).forEach(cropTypeStr => {
        const cropType = parseInt(cropTypeStr) as CropType;
        this.inventory.crops[cropType] = 0;
      });

      this.hud.updateGold(this.gold);
      this.dialogBox.show(result.message, 2000);

      const binX = this.shippingBinPosition.x * TILE_SIZE + TILE_SIZE / 2;
      const binY = this.shippingBinPosition.y * TILE_SIZE + TILE_SIZE / 2;
      this.particleEffects.createFloatingText(binX, binY, result.message, '#f39c12');

      this.saveGame();
    } else {
      this.dialogBox.show('No crops to sell!', 1500);
    }
  }

  private openShop(): void {
    const availableSeeds = this.shopSystem.getAvailableSeeds();

    if (availableSeeds.length === 0) {
      this.dialogBox.show('No seeds available this season!', 2000);
      return;
    }

    // Simple shop: buy 5 seeds of first available type
    const seedType = availableSeeds[0];
    const result = this.shopSystem.buySeed(seedType, 5, this.gold);

    if (result.success) {
      this.gold = result.newGold;
      this.inventory.seeds[seedType] += 5;
      this.selectedSeedType = seedType;
      this.hud.updateGold(this.gold);
      this.updateSeedCountInHUD();
      this.dialogBox.show(result.message, 2000);
      this.saveGame();
    } else {
      this.dialogBox.show(result.message, 2000);
    }
  }

  private showInventory(): void {
    let inventoryText = 'INVENTORY\n\nSeeds:\n';

    Object.entries(this.inventory.seeds).forEach(([typeStr, count]) => {
      const type = parseInt(typeStr) as CropType;
      const name = CROP_DATA[type].name;
      if (count > 0) {
        inventoryText += `  ${name}: ${count}\n`;
      }
    });

    inventoryText += '\nCrops:\n';
    Object.entries(this.inventory.crops).forEach(([typeStr, count]) => {
      const type = parseInt(typeStr) as CropType;
      const name = CROP_DATA[type].name;
      if (count > 0) {
        inventoryText += `  ${name}: ${count}\n`;
      }
    });

    this.dialogBox.show(inventoryText, 4000);
  }

  private updateSeedCountInHUD(): void {
    // Update seed count for Seeds tool (slot 5)
    const totalSeeds = Object.values(this.inventory.seeds).reduce((sum, count) => sum + count, 0);
    this.hud.updateSeedCount(5, totalSeeds);
  }

  private updateLighting(): void {
    this.overlayGraphics.clear();

    if (this.timeSystem.isNight()) {
      const tint = this.timeSystem.getLightingTint();
      const brightness = (tint & 0xff) / 255;
      const alpha = 1 - brightness;

      this.overlayGraphics.fillStyle(0x000000, alpha * 0.6);
      this.overlayGraphics.fillRect(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    }
  }

  private onDayChanged(day: number): void {
    this.hud.updateDay(day);
    this.dialogBox.show(`Day ${day} of ${this.seasonSystem.getSeasonName()}`, 2000);
    this.saveGame();
  }

  private onSeasonChanged(season: Season): void {
    this.hud.updateSeason(season, this.seasonSystem.getSeasonName());
    this.shopSystem.setSeason(season);
    this.dialogBox.show(`Season changed to ${this.seasonSystem.getSeasonName()}!`, 3000);

    // Update tile tints for new season
    const grassTint = this.seasonSystem.getGrassTint();
    const treeTint = this.seasonSystem.getTreeTint();

    for (let y = 0; y < this.tileSprites.length; y++) {
      for (let x = 0; x < this.tileSprites[y].length; x++) {
        if (this.tileData[y][x] === TileType.GRASS) {
          this.tileSprites[y][x].setTint(grassTint);
        }
      }
    }

    this.trees.forEach(tree => tree.setTint(treeTint));
  }

  private isNearPosition(x: number, y: number, targetX: number, targetY: number, range: number): boolean {
    return Math.abs(x - targetX) <= range && Math.abs(y - targetY) <= range;
  }

  private saveGame(): void {
    const saveData: GameData = {
      day: this.seasonSystem.getDayInSeason(),
      season: this.seasonSystem.getCurrentSeason(),
      gold: this.gold,
      energy: this.energySystem.getCurrentEnergy(),
      selectedTool: this.toolSystem.getSelectedTool(),
      selectedSeed: this.selectedSeedType,
      inventory: this.inventory,
      cropData: this.farmSystem.getCropsData(),
      tileData: this.farmSystem.getTileData()
    };

    localStorage.setItem('pixelfarm_save', JSON.stringify(saveData));
  }

  private loadGame(): void {
    const savedData = localStorage.getItem('pixelfarm_save');

    if (savedData) {
      try {
        const data: GameData = JSON.parse(savedData);

        // Load basic state
        this.gold = data.gold || 100;
        this.inventory = data.inventory || this.inventory;
        this.selectedSeedType = data.selectedSeed || CropType.PARSNIP;

        // Systems will be initialized in create() with loaded data
        // Store data temporarily
        (this as any).loadedData = data;
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
  }
}
