import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { TimeSystem } from '../systems/TimeSystem';
import { FarmSystem } from '../systems/FarmSystem';
import { HUD } from '../ui/HUD';
import { DialogBox } from '../ui/DialogBox';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, TileType, COLORS, GameData } from '../utils/constants';

export class FarmScene extends Phaser.Scene {
  private player!: Player;
  private timeSystem!: TimeSystem;
  private farmSystem!: FarmSystem;
  private hud!: HUD;
  private dialogBox!: DialogBox;
  private tileMap!: Phaser.GameObjects.Graphics;
  private tileData!: number[][];
  private gold: number = 0;
  private inventory: { [key: string]: number } = { crops: 0 };
  private bedPosition = { x: 5, y: 5 };
  private sellBoxPosition = { x: 35, y: 15 };
  private overlayGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'FarmScene' });
  }

  init(data: { loadGame?: boolean }): void {
    if (data.loadGame) {
      this.loadGame();
    }
  }

  create(): void {
    this.tileData = this.generateTileMap();
    this.drawTileMap();

    this.player = new Player(this, 320, 320);

    this.timeSystem = new TimeSystem(this, 1);
    this.farmSystem = new FarmSystem(this, this.tileData, 1);

    this.overlayGraphics = this.add.graphics();
    this.overlayGraphics.setDepth(500);
    this.overlayGraphics.setScrollFactor(0);

    this.hud = new HUD(this);
    this.dialogBox = new DialogBox(this);

    this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    this.cameras.main.startFollow(this.player['sprite'], true, 0.1, 0.1);

    this.events.on('dayChanged', (day: number) => {
      this.hud.updateDay(day);
      this.dialogBox.show(`Day ${day} - A new day begins!`);
      this.saveGame();
    });

    this.hud.updateDay(1);
    this.hud.updateGold(this.gold);

    this.drawHouse();
    this.drawSellBox();
    this.drawTrees();
  }

  update(_time: number, delta: number): void {
    this.player.update(delta);
    this.timeSystem.update(delta);
    this.farmSystem.update();

    this.hud.updateTime(this.timeSystem.getFormattedTime());

    this.updateLighting();

    if (this.player.isActionPressed()) {
      this.handleAction();
    }

    if (this.player.isInventoryPressed()) {
      this.showInventory();
    }
  }

  private generateTileMap(): number[][] {
    const map: number[][] = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
      map[y] = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (y < 10 && x < 10) {
          map[y][x] = TileType.PATH;
        } else if (y < 15 && x > 30) {
          map[y][x] = TileType.WATER;
        } else if ((x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1)) {
          map[y][x] = TileType.WATER;
        } else if (Math.random() < 0.1) {
          map[y][x] = TileType.DIRT;
        } else {
          map[y][x] = TileType.GRASS;
        }
      }
    }

    for (let y = 3; y < 8; y++) {
      for (let x = 3; x < 8; x++) {
        map[y][x] = TileType.PATH;
      }
    }

    return map;
  }

  private drawTileMap(): void {
    this.tileMap = this.add.graphics();

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = this.tileData[y][x];
        let color = COLORS.GRASS;

        switch (tile) {
          case TileType.DIRT:
            color = COLORS.DIRT;
            break;
          case TileType.WATER:
            color = COLORS.WATER;
            break;
          case TileType.PATH:
            color = COLORS.PATH;
            break;
          case TileType.PLOWED:
            color = COLORS.PLOWED;
            break;
        }

        this.tileMap.fillStyle(color);
        this.tileMap.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        this.tileMap.lineStyle(1, 0x000000, 0.1);
        this.tileMap.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  private drawHouse(): void {
    const houseGraphics = this.add.graphics();
    const houseX = this.bedPosition.x * TILE_SIZE - TILE_SIZE;
    const houseY = this.bedPosition.y * TILE_SIZE - TILE_SIZE;

    houseGraphics.fillStyle(COLORS.HOUSE_WALL);
    houseGraphics.fillRect(houseX, houseY, TILE_SIZE * 4, TILE_SIZE * 4);

    houseGraphics.fillStyle(COLORS.HOUSE_ROOF);
    houseGraphics.fillTriangle(
      houseX, houseY,
      houseX + TILE_SIZE * 2, houseY - TILE_SIZE,
      houseX + TILE_SIZE * 4, houseY
    );

    houseGraphics.fillStyle(COLORS.BED);
    houseGraphics.fillRect(
      this.bedPosition.x * TILE_SIZE,
      this.bedPosition.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  }

  private drawSellBox(): void {
    const boxGraphics = this.add.graphics();
    boxGraphics.fillStyle(COLORS.CHEST);
    boxGraphics.fillRect(
      this.sellBoxPosition.x * TILE_SIZE,
      this.sellBoxPosition.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );

    boxGraphics.lineStyle(2, 0x000000);
    boxGraphics.strokeRect(
      this.sellBoxPosition.x * TILE_SIZE,
      this.sellBoxPosition.y * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE
    );
  }

  private drawTrees(): void {
    const treePositions = [
      { x: 10, y: 20 }, { x: 15, y: 22 }, { x: 12, y: 25 },
      { x: 25, y: 10 }, { x: 28, y: 12 }, { x: 22, y: 8 }
    ];

    treePositions.forEach(pos => {
      const treeGraphics = this.add.graphics();

      treeGraphics.fillStyle(COLORS.TREE_TRUNK);
      treeGraphics.fillRect(
        pos.x * TILE_SIZE + 12,
        pos.y * TILE_SIZE + 10,
        8,
        16
      );

      treeGraphics.fillStyle(COLORS.TREE_TOP);
      treeGraphics.fillCircle(
        pos.x * TILE_SIZE + 16,
        pos.y * TILE_SIZE + 10,
        12
      );
    });
  }

  private updateLighting(): void {
    const tint = this.timeSystem.getLightingTint();
    const alpha = ((tint & 0xFF) / 255) * 0.5;
    this.overlayGraphics.clear();
    this.overlayGraphics.fillStyle(0x000000, 1 - alpha);
    this.overlayGraphics.fillRect(0, 0, 800, 600);
  }

  private handleAction(): void {
    const facingX = this.player.getFacingTileX();
    const facingY = this.player.getFacingTileY();

    if (facingX === this.bedPosition.x && facingY === this.bedPosition.y) {
      this.sleep();
      return;
    }

    if (facingX === this.sellBoxPosition.x && facingY === this.sellBoxPosition.y) {
      this.sellCrops();
      return;
    }

    if (this.farmSystem.canHarvest(facingX, facingY)) {
      if (this.farmSystem.harvest(facingX, facingY)) {
        this.inventory.crops = (this.inventory.crops || 0) + 1;
        this.dialogBox.show('Harvested crop! Press E at the sell box to sell.');
        this.redrawTile(facingX, facingY);
      }
    } else if (this.farmSystem.canWater(facingX, facingY)) {
      if (this.farmSystem.water(facingX, facingY)) {
        this.dialogBox.show('Watered the crop!');
      }
    } else if (this.farmSystem.canPlant(facingX, facingY)) {
      if (this.farmSystem.plant(facingX, facingY)) {
        this.dialogBox.show('Planted a seed! Water it daily to grow.');
        this.redrawTile(facingX, facingY);
      }
    }
  }

  private redrawTile(x: number, y: number): void {
    const tile = this.tileData[y][x];
    let color = COLORS.GRASS;

    switch (tile) {
      case TileType.DIRT:
        color = COLORS.DIRT;
        break;
      case TileType.WATER:
        color = COLORS.WATER;
        break;
      case TileType.PATH:
        color = COLORS.PATH;
        break;
      case TileType.PLOWED:
        color = COLORS.PLOWED;
        break;
    }

    this.tileMap.fillStyle(color);
    this.tileMap.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    this.tileMap.lineStyle(1, 0x000000, 0.1);
    this.tileMap.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }

  private sleep(): void {
    this.dialogBox.show('Sleeping... Tomorrow is a new day!', 1500);
    this.time.delayedCall(1500, () => {
      this.timeSystem.skipToMorning();
    });
  }

  private sellCrops(): void {
    const cropCount = this.inventory.crops || 0;
    if (cropCount > 0) {
      const earnings = cropCount * 50;
      this.gold += earnings;
      this.inventory.crops = 0;
      this.hud.updateGold(this.gold);
      this.dialogBox.show(`Sold ${cropCount} crops for ${earnings} gold!`);
      this.saveGame();
    } else {
      this.dialogBox.show('No crops to sell!');
    }
  }

  private showInventory(): void {
    const cropCount = this.inventory.crops || 0;
    this.dialogBox.show(`Inventory: ${cropCount} crops ready to sell`, 3000);
  }

  private saveGame(): void {
    const gameData: GameData = {
      day: this.timeSystem.getDay(),
      gold: this.gold,
      inventory: this.inventory,
      cropData: [],
      tileData: this.tileData
    };

    localStorage.setItem('pixelfarm_save', JSON.stringify(gameData));
  }

  private loadGame(): void {
    const savedData = localStorage.getItem('pixelfarm_save');
    if (savedData) {
      const gameData: GameData = JSON.parse(savedData);
      this.gold = gameData.gold;
      this.inventory = gameData.inventory;
    }
  }
}
