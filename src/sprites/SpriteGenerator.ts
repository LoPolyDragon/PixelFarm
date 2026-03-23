import Phaser from 'phaser';
import {
  COLORS,
  CropType,
  CropStage,
  Direction,
  Tool
} from '../utils/constants';

/**
 * SpriteGenerator - Generates all game sprites programmatically using pixel art
 * All sprites are created using canvas-based pixel-by-pixel drawing
 */
export class SpriteGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Generate all game sprites
   */
  generateAll(): void {
    this.generateTerrainTiles();
    this.generateCropSprites();
    this.generatePlayerSprites();
    this.generateBuildingSprites();
    this.generateObjectSprites();
    this.generateUISprites();
    this.generateParticleSprites();
  }

  // ==================== TERRAIN TILES ====================

  private generateTerrainTiles(): void {
    // Grass variations (3 types)
    for (let i = 0; i < 3; i++) {
      this.createGrassTile(`grass_${i}`);
    }

    // Dirt
    this.createDirtTile('dirt');

    // Tilled soil
    this.createTilledSoil('tilled');

    // Watered soil
    this.createWateredSoil('watered');

    // Path
    this.createPathTile('path');

    // Water (animated - 4 frames)
    for (let i = 0; i < 4; i++) {
      this.createWaterTile(`water_${i}`, i);
    }

    // Sand
    this.createSandTile('sand');
  }

  private createGrassTile(key: string): void {
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Base grass color
    ctx.fillStyle = this.colorToHex(COLORS.GRASS_BASE);
    ctx.fillRect(0, 0, 16, 16);

    // Add grass details (random darker/lighter pixels)
    const variant = Math.floor(Math.random() * 3);

    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * 16);
      const y = Math.floor(Math.random() * 16);
      const color = Math.random() > 0.5 ? COLORS.GRASS_DARK : COLORS.GRASS_LIGHT;
      ctx.fillStyle = this.colorToHex(color);
      ctx.fillRect(x, y, 1, 1);
    }

    // Add small grass blades or flowers based on variant
    if (variant === 0) {
      // Grass blades
      for (let i = 0; i < 3; i++) {
        const x = Math.floor(Math.random() * 14) + 1;
        const y = Math.floor(Math.random() * 14) + 1;
        ctx.fillStyle = this.colorToHex(COLORS.GRASS_DARK);
        ctx.fillRect(x, y, 1, 2);
      }
    } else if (variant === 1) {
      // Small yellow flower
      const fx = 6 + Math.floor(Math.random() * 4);
      const fy = 6 + Math.floor(Math.random() * 4);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(fx, fy, 2, 2);
    }

    canvas.refresh();
  }

  private createDirtTile(key: string): void {
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Base dirt
    ctx.fillStyle = this.colorToHex(COLORS.DIRT);
    ctx.fillRect(0, 0, 16, 16);

    // Add texture with darker pixels
    for (let i = 0; i < 30; i++) {
      const x = Math.floor(Math.random() * 16);
      const y = Math.floor(Math.random() * 16);
      ctx.fillStyle = this.colorToHex(COLORS.DIRT_DARK);
      ctx.fillRect(x, y, 1, 1);
    }

    canvas.refresh();
  }

  private createTilledSoil(key: string): void {
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Base dark soil
    ctx.fillStyle = this.colorToHex(COLORS.DIRT_DARK);
    ctx.fillRect(0, 0, 16, 16);

    // Add horizontal furrow lines
    ctx.fillStyle = this.colorToHex(COLORS.DIRT);
    ctx.fillRect(0, 4, 16, 1);
    ctx.fillRect(0, 8, 16, 1);
    ctx.fillRect(0, 12, 16, 1);

    canvas.refresh();
  }

  private createWateredSoil(key: string): void {
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Very dark wet soil
    ctx.fillStyle = this.colorToHex(COLORS.WATERED_SOIL);
    ctx.fillRect(0, 0, 16, 16);

    // Subtle furrow lines
    ctx.fillStyle = '#3a3020';
    ctx.fillRect(0, 4, 16, 1);
    ctx.fillRect(0, 8, 16, 1);
    ctx.fillRect(0, 12, 16, 1);

    canvas.refresh();
  }

  private createPathTile(key: string): void {
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Base path color
    ctx.fillStyle = this.colorToHex(COLORS.PATH);
    ctx.fillRect(0, 0, 16, 16);

    // Add stone pattern
    const stones = [
      { x: 2, y: 2, w: 4, h: 4 },
      { x: 8, y: 1, w: 5, h: 4 },
      { x: 1, y: 8, w: 5, h: 5 },
      { x: 9, y: 9, w: 4, h: 4 }
    ];

    stones.forEach(stone => {
      ctx.fillStyle = this.colorToHex(COLORS.STONE);
      ctx.fillRect(stone.x, stone.y, stone.w, stone.h);
      // Dark edge for depth
      ctx.fillStyle = this.colorToHex(COLORS.STONE_DARK);
      ctx.fillRect(stone.x + stone.w - 1, stone.y, 1, stone.h);
      ctx.fillRect(stone.x, stone.y + stone.h - 1, stone.w, 1);
    });

    canvas.refresh();
  }

  private createWaterTile(key: string, frame: number): void {
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Base water
    ctx.fillStyle = this.colorToHex(COLORS.WATER_BASE);
    ctx.fillRect(0, 0, 16, 16);

    // Animated wave highlights (shift based on frame)
    const offset = frame * 4;
    for (let i = 0; i < 3; i++) {
      const y = ((i * 6) + offset) % 16;
      ctx.fillStyle = this.colorToHex(COLORS.WATER_HIGHLIGHT);
      ctx.fillRect(0, y, 16, 2);
    }

    canvas.refresh();
  }

  private createSandTile(key: string): void {
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Base sand
    ctx.fillStyle = this.colorToHex(COLORS.SAND);
    ctx.fillRect(0, 0, 16, 16);

    // Add sandy texture
    for (let i = 0; i < 25; i++) {
      const x = Math.floor(Math.random() * 16);
      const y = Math.floor(Math.random() * 16);
      const brightness = Math.random() > 0.5 ? 10 : -10;
      ctx.fillStyle = this.adjustBrightness(COLORS.SAND, brightness);
      ctx.fillRect(x, y, 1, 1);
    }

    canvas.refresh();
  }

  // ==================== CROPS ====================

  private generateCropSprites(): void {
    // Generate all crop types with 4 stages each
    Object.values(CropType).forEach(cropType => {
      if (typeof cropType === 'number') {
        for (let stage = 0; stage < 4; stage++) {
          this.createCropSprite(cropType, stage as CropStage);
        }
      }
    });
  }

  private createCropSprite(cropType: CropType, stage: CropStage): void {
    const key = `crop_${cropType}_${stage}`;
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Clear background
    ctx.clearRect(0, 0, 16, 16);

    switch (stage) {
      case CropStage.SEED:
        this.drawSeedStage(ctx, cropType);
        break;
      case CropStage.SPROUT:
        this.drawSproutStage(ctx, cropType);
        break;
      case CropStage.GROWING:
        this.drawGrowingStage(ctx, cropType);
        break;
      case CropStage.READY:
        this.drawReadyStage(ctx, cropType);
        break;
    }

    canvas.refresh();
  }

  private drawSeedStage(ctx: CanvasRenderingContext2D, _cropType: CropType): void {
    // All seeds look similar - small brown dots
    ctx.fillStyle = this.colorToHex(COLORS.SEED_BROWN);
    ctx.fillRect(7, 9, 2, 2);
    ctx.fillRect(6, 10, 1, 1);
    ctx.fillRect(9, 10, 1, 1);
  }

  private drawSproutStage(ctx: CanvasRenderingContext2D, _cropType: CropType): void {
    // Small green sprout
    ctx.fillStyle = this.colorToHex(COLORS.SPROUT_GREEN);
    ctx.fillRect(7, 10, 2, 2);
    ctx.fillRect(6, 11, 1, 2);
    ctx.fillRect(9, 11, 1, 2);
    ctx.fillRect(7, 8, 2, 2);
  }

  private drawGrowingStage(ctx: CanvasRenderingContext2D, cropType: CropType): void {
    switch (cropType) {
      case CropType.PARSNIP:
        // Leafy top
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(5, 7, 6, 4);
        ctx.fillRect(6, 5, 4, 2);
        break;

      case CropType.CAULIFLOWER:
        // Bush forming
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_DARK);
        ctx.fillRect(4, 6, 8, 6);
        ctx.fillRect(5, 4, 6, 2);
        break;

      case CropType.POTATO:
        // Bushy plant
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(4, 5, 8, 7);
        ctx.fillRect(3, 7, 2, 3);
        ctx.fillRect(11, 7, 2, 3);
        break;

      case CropType.TOMATO:
        // Vine with leaves
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(7, 4, 2, 8);
        ctx.fillRect(5, 6, 2, 2);
        ctx.fillRect(9, 6, 2, 2);
        ctx.fillRect(5, 9, 2, 2);
        ctx.fillRect(9, 9, 2, 2);
        break;

      case CropType.BLUEBERRY:
        // Bush
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_DARK);
        ctx.fillRect(4, 5, 8, 7);
        ctx.fillRect(5, 4, 6, 1);
        ctx.fillRect(5, 12, 6, 1);
        break;

      case CropType.PUMPKIN:
        // Vine spreading
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(3, 8, 10, 4);
        ctx.fillRect(6, 6, 4, 2);
        break;

      case CropType.CORN:
        // Tall stalk
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(7, 2, 2, 11);
        ctx.fillRect(5, 5, 2, 1);
        ctx.fillRect(9, 5, 2, 1);
        ctx.fillRect(5, 8, 2, 1);
        ctx.fillRect(9, 8, 2, 1);
        break;

      case CropType.STRAWBERRY:
        // Flowering plant
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(4, 7, 8, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, 8, 1, 1);
        ctx.fillRect(9, 8, 1, 1);
        break;
    }
  }

  private drawReadyStage(ctx: CanvasRenderingContext2D, cropType: CropType): void {
    switch (cropType) {
      case CropType.PARSNIP:
        // Leafy top + orange root showing
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(5, 6, 6, 3);
        ctx.fillStyle = '#ff8c00';
        ctx.fillRect(6, 9, 4, 4);
        ctx.fillRect(7, 13, 2, 1);
        break;

      case CropType.CAULIFLOWER:
        // Large white head
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_DARK);
        ctx.fillRect(3, 8, 10, 5);
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(4, 4, 8, 6);
        ctx.fillRect(5, 3, 6, 1);
        break;

      case CropType.POTATO:
        // Soil with potato visible
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(3, 4, 10, 5);
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(5, 9, 6, 4);
        break;

      case CropType.TOMATO:
        // Red tomatoes on vine
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(7, 3, 2, 10);
        ctx.fillRect(5, 5, 2, 2);
        ctx.fillRect(9, 5, 2, 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(5, 7, 2, 2);
        ctx.fillRect(9, 7, 2, 2);
        ctx.fillRect(7, 10, 2, 2);
        break;

      case CropType.BLUEBERRY:
        // Bush with blue berries
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_DARK);
        ctx.fillRect(3, 4, 10, 9);
        ctx.fillStyle = '#3b5998';
        ctx.fillRect(5, 6, 2, 2);
        ctx.fillRect(9, 6, 2, 2);
        ctx.fillRect(5, 9, 2, 2);
        ctx.fillRect(9, 9, 2, 2);
        ctx.fillRect(7, 8, 2, 2);
        break;

      case CropType.PUMPKIN:
        // Large orange pumpkin
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(2, 7, 12, 2);
        ctx.fillStyle = '#ff8c00';
        ctx.fillRect(4, 8, 8, 5);
        ctx.fillRect(5, 7, 6, 1);
        ctx.fillRect(5, 13, 6, 1);
        ctx.fillStyle = '#cc7000';
        ctx.fillRect(7, 9, 2, 3);
        break;

      case CropType.CORN:
        // Golden corn ears
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(7, 2, 2, 11);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(5, 5, 2, 3);
        ctx.fillRect(9, 5, 2, 3);
        ctx.fillRect(5, 9, 2, 3);
        ctx.fillRect(9, 9, 2, 3);
        break;

      case CropType.STRAWBERRY:
        // Red strawberries
        ctx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
        ctx.fillRect(3, 6, 10, 7);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(5, 7, 2, 2);
        ctx.fillRect(9, 7, 2, 2);
        ctx.fillRect(5, 10, 2, 2);
        ctx.fillRect(9, 10, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5, 7, 1, 1);
        ctx.fillRect(9, 7, 1, 1);
        break;
    }
  }

  // ==================== PLAYER ====================

  private generatePlayerSprites(): void {
    // Generate player sprites: 4 directions × 3 frames (idle + 2 walk)
    [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP].forEach(dir => {
      for (let frame = 0; frame < 3; frame++) {
        this.createPlayerSprite(dir, frame);
      }
    });

    // Generate tool holding variations
    [Tool.HOE, Tool.WATERING_CAN, Tool.SCYTHE, Tool.AXE, Tool.PICKAXE].forEach(tool => {
      [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP].forEach(dir => {
        this.createPlayerWithTool(dir, tool);
      });
    });
  }

  private createPlayerSprite(direction: Direction, frame: number): void {
    const key = `player_${direction}_${frame}`;
    const canvas = this.scene.textures.createCanvas(key, 16, 32)!;
    const ctx = canvas.context;

    ctx.clearRect(0, 0, 16, 32);

    const yOffset = frame === 1 ? -1 : frame === 2 ? 1 : 0; // Walking bob

    // Draw farmer character (Stardew Valley style)
    // Hat
    ctx.fillStyle = this.colorToHex(COLORS.HAIR);
    ctx.fillRect(4, 4 + yOffset, 8, 4);
    ctx.fillRect(3, 6 + yOffset, 10, 2);

    // Face/Head
    ctx.fillStyle = this.colorToHex(COLORS.SKIN);
    ctx.fillRect(5, 8 + yOffset, 6, 6);

    // Eyes (direction dependent)
    ctx.fillStyle = this.colorToHex(COLORS.BLACK);
    if (direction === Direction.DOWN) {
      ctx.fillRect(6, 10 + yOffset, 1, 1);
      ctx.fillRect(9, 10 + yOffset, 1, 1);
    } else if (direction === Direction.LEFT) {
      ctx.fillRect(6, 10 + yOffset, 1, 1);
      ctx.fillRect(8, 10 + yOffset, 1, 1);
    } else if (direction === Direction.RIGHT) {
      ctx.fillRect(7, 10 + yOffset, 1, 1);
      ctx.fillRect(9, 10 + yOffset, 1, 1);
    } else if (direction === Direction.UP) {
      // Back of head - no eyes
      ctx.fillRect(6, 7 + yOffset, 1, 1);
      ctx.fillRect(9, 7 + yOffset, 1, 1);
    }

    // Body (shirt)
    ctx.fillStyle = this.colorToHex(COLORS.SHIRT_BLUE);
    ctx.fillRect(4, 14 + yOffset, 8, 8);

    // Arms (position based on frame for walking)
    if (frame === 0 || direction === Direction.UP) {
      ctx.fillStyle = this.colorToHex(COLORS.SKIN);
      ctx.fillRect(3, 15 + yOffset, 2, 4);
      ctx.fillRect(11, 15 + yOffset, 2, 4);
    } else if (frame === 1) {
      ctx.fillStyle = this.colorToHex(COLORS.SKIN);
      ctx.fillRect(2, 16 + yOffset, 2, 4);
      ctx.fillRect(12, 14 + yOffset, 2, 4);
    } else {
      ctx.fillStyle = this.colorToHex(COLORS.SKIN);
      ctx.fillRect(2, 14 + yOffset, 2, 4);
      ctx.fillRect(12, 16 + yOffset, 2, 4);
    }

    // Pants
    ctx.fillStyle = this.colorToHex(COLORS.PANTS_BROWN);
    ctx.fillRect(5, 22 + yOffset, 6, 6);

    // Legs (walking animation)
    if (frame === 0) {
      ctx.fillRect(5, 28 + yOffset, 2, 3);
      ctx.fillRect(9, 28 + yOffset, 2, 3);
    } else if (frame === 1) {
      ctx.fillRect(5, 27 + yOffset, 2, 4);
      ctx.fillRect(9, 29 + yOffset, 2, 2);
    } else {
      ctx.fillRect(5, 29 + yOffset, 2, 2);
      ctx.fillRect(9, 27 + yOffset, 2, 4);
    }

    canvas.refresh();
  }

  private createPlayerWithTool(direction: Direction, tool: Tool): void {
    const key = `player_${direction}_tool_${tool}`;
    const canvas = this.scene.textures.createCanvas(key, 16, 32)!;
    const ctx = canvas.context;

    ctx.clearRect(0, 0, 16, 32);

    // Draw base player
    const baseKey = `player_${direction}_0`;
    const baseTexture = this.scene.textures.get(baseKey);
    if (baseTexture) {
      ctx.drawImage(baseTexture.getSourceImage() as HTMLCanvasElement, 0, 0);
    }

    // Draw tool
    ctx.fillStyle = this.colorToHex(COLORS.WOOD);

    switch (tool) {
      case Tool.HOE:
        if (direction === Direction.DOWN) {
          ctx.fillRect(11, 18, 2, 6); // Handle
          ctx.fillStyle = this.colorToHex(COLORS.STONE);
          ctx.fillRect(10, 24, 4, 2); // Blade
        }
        break;

      case Tool.WATERING_CAN:
        if (direction === Direction.DOWN) {
          ctx.fillStyle = this.colorToHex(COLORS.STONE);
          ctx.fillRect(10, 19, 4, 4); // Can body
          ctx.fillRect(12, 18, 2, 1); // Spout
        }
        break;

      case Tool.SCYTHE:
        if (direction === Direction.DOWN) {
          ctx.fillRect(11, 16, 2, 8); // Handle
          ctx.fillStyle = this.colorToHex(COLORS.STONE);
          ctx.fillRect(9, 16, 2, 3); // Blade curve
        }
        break;

      case Tool.AXE:
        if (direction === Direction.DOWN) {
          ctx.fillRect(11, 18, 2, 6); // Handle
          ctx.fillStyle = this.colorToHex(COLORS.STONE);
          ctx.fillRect(10, 18, 4, 3); // Axe head
        }
        break;

      case Tool.PICKAXE:
        if (direction === Direction.DOWN) {
          ctx.fillRect(11, 18, 2, 6); // Handle
          ctx.fillStyle = this.colorToHex(COLORS.STONE);
          ctx.fillRect(9, 18, 5, 2); // Pick head
        }
        break;
    }

    canvas.refresh();
  }

  // ==================== BUILDINGS ====================

  private generateBuildingSprites(): void {
    this.createFarmhouse();
    this.createBarn();
    this.createShippingBin();
    this.createShop();
  }

  private createFarmhouse(): void {
    const key = 'farmhouse';
    const canvas = this.scene.textures.createCanvas(key, 64, 48)!; // 4x3 tiles
    const ctx = canvas.context;

    // Walls
    ctx.fillStyle = this.colorToHex(COLORS.WOOD);
    ctx.fillRect(0, 16, 64, 32);

    // Roof
    ctx.fillStyle = this.colorToHex(COLORS.ROOF_RED);
    ctx.fillRect(0, 8, 64, 8);
    // Roof peak
    ctx.fillRect(8, 4, 48, 4);
    ctx.fillRect(16, 0, 32, 4);

    // Roof shadow
    ctx.fillStyle = this.colorToHex(COLORS.ROOF_DARK);
    ctx.fillRect(0, 15, 64, 1);

    // Door
    ctx.fillStyle = this.colorToHex(COLORS.WOOD_DARK);
    ctx.fillRect(26, 28, 12, 20);

    // Windows
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(8, 24, 8, 8);
    ctx.fillRect(48, 24, 8, 8);

    // Chimney
    ctx.fillStyle = this.colorToHex(COLORS.STONE);
    ctx.fillRect(48, 0, 6, 12);
    ctx.fillStyle = this.colorToHex(COLORS.STONE_DARK);
    ctx.fillRect(48, 12, 6, 1);

    canvas.refresh();
  }

  private createBarn(): void {
    const key = 'barn';
    const canvas = this.scene.textures.createCanvas(key, 48, 32)!; // 3x2 tiles
    const ctx = canvas.context;

    // Walls
    ctx.fillStyle = this.colorToHex(COLORS.WOOD);
    ctx.fillRect(0, 12, 48, 20);

    // Roof
    ctx.fillStyle = this.colorToHex(COLORS.ROOF_RED);
    ctx.fillRect(0, 4, 48, 8);
    ctx.fillRect(8, 0, 32, 4);

    // Large door
    ctx.fillStyle = this.colorToHex(COLORS.WOOD_DARK);
    ctx.fillRect(16, 16, 16, 16);

    canvas.refresh();
  }

  private createShippingBin(): void {
    const key = 'shipping_bin';
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Box body
    ctx.fillStyle = this.colorToHex(COLORS.WOOD);
    ctx.fillRect(2, 6, 12, 8);

    // Lid
    ctx.fillStyle = this.colorToHex(COLORS.WOOD_DARK);
    ctx.fillRect(1, 4, 14, 3);

    // Border
    ctx.strokeStyle = this.colorToHex(COLORS.BLACK);
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 6, 12, 8);

    canvas.refresh();
  }

  private createShop(): void {
    const key = 'shop';
    const canvas = this.scene.textures.createCanvas(key, 32, 32)!; // 2x2 tiles
    const ctx = canvas.context;

    // Counter
    ctx.fillStyle = this.colorToHex(COLORS.WOOD);
    ctx.fillRect(0, 16, 32, 16);

    // Awning
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(0, 8, 32, 8);

    // Sign
    ctx.fillStyle = this.colorToHex(COLORS.WOOD_DARK);
    ctx.fillRect(8, 0, 16, 8);

    canvas.refresh();
  }

  // ==================== OBJECTS ====================

  private generateObjectSprites(): void {
    this.createChest();
    this.createBed();
    this.createFences();
    this.createTrees();
    this.createFlowers();
    this.createRocks();
    this.createWell();
  }

  private createChest(): void {
    const key = 'chest';
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Chest body
    ctx.fillStyle = this.colorToHex(COLORS.WOOD);
    ctx.fillRect(2, 6, 12, 8);

    // Lid
    ctx.fillStyle = this.colorToHex(COLORS.WOOD_DARK);
    ctx.fillRect(2, 4, 12, 3);

    // Lock
    ctx.fillStyle = this.colorToHex(COLORS.GOLD);
    ctx.fillRect(7, 8, 2, 3);

    canvas.refresh();
  }

  private createBed(): void {
    const key = 'bed';
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Bed frame
    ctx.fillStyle = this.colorToHex(COLORS.WOOD);
    ctx.fillRect(2, 4, 12, 10);

    // Pillow
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 5, 4, 3);

    // Blanket
    ctx.fillStyle = '#3498db';
    ctx.fillRect(3, 9, 10, 4);

    canvas.refresh();
  }

  private createFences(): void {
    // Horizontal fence
    const h = this.scene.textures.createCanvas('fence_h', 16, 16)!;
    const hCtx = h.context;
    hCtx.fillStyle = this.colorToHex(COLORS.WOOD);
    hCtx.fillRect(0, 6, 16, 2);
    hCtx.fillRect(0, 10, 16, 2);
    hCtx.fillRect(4, 4, 2, 10);
    hCtx.fillRect(10, 4, 2, 10);
    h.refresh();

    // Vertical fence
    const v = this.scene.textures.createCanvas('fence_v', 16, 16)!;
    const vCtx = v.context;
    vCtx.fillStyle = this.colorToHex(COLORS.WOOD);
    vCtx.fillRect(6, 0, 2, 16);
    vCtx.fillRect(10, 0, 2, 16);
    vCtx.fillRect(4, 4, 10, 2);
    vCtx.fillRect(4, 10, 10, 2);
    v.refresh();
  }

  private createTrees(): void {
    // Oak tree
    this.createTree('tree_oak', COLORS.TREE_TOP, COLORS.TREE_TRUNK);

    // Maple tree (reddish in fall)
    this.createTree('tree_maple', 0x9d6b3f, COLORS.TREE_TRUNK);

    // Pine tree
    this.createTree('tree_pine', 0x2d5a2d, 0x4a3f2f);
  }

  private createTree(key: string, topColor: number, trunkColor: number): void {
    const canvas = this.scene.textures.createCanvas(key, 32, 48)!; // 2x3 tiles
    const ctx = canvas.context;

    // Trunk
    ctx.fillStyle = this.colorToHex(trunkColor);
    ctx.fillRect(12, 28, 8, 20);

    // Tree top (circular-ish)
    ctx.fillStyle = this.colorToHex(topColor);
    ctx.fillRect(4, 12, 24, 24);
    ctx.fillRect(8, 8, 16, 4);
    ctx.fillRect(8, 36, 16, 4);
    ctx.fillRect(0, 16, 4, 12);
    ctx.fillRect(28, 16, 4, 12);

    canvas.refresh();
  }

  private createFlowers(): void {
    // Rose
    const rose = this.scene.textures.createCanvas('flower_rose', 16, 16)!;
    const roseCtx = rose.context;
    roseCtx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
    roseCtx.fillRect(7, 8, 2, 6);
    roseCtx.fillStyle = '#e74c3c';
    roseCtx.fillRect(6, 5, 4, 4);
    rose.refresh();

    // Sunflower
    const sunflower = this.scene.textures.createCanvas('flower_sunflower', 16, 16)!;
    const sunCtx = sunflower.context;
    sunCtx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
    sunCtx.fillRect(7, 8, 2, 6);
    sunCtx.fillStyle = '#f1c40f';
    sunCtx.fillRect(5, 4, 6, 6);
    sunCtx.fillStyle = '#8b4513';
    sunCtx.fillRect(7, 6, 2, 2);
    sunflower.refresh();

    // Tulip
    const tulip = this.scene.textures.createCanvas('flower_tulip', 16, 16)!;
    const tulipCtx = tulip.context;
    tulipCtx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
    tulipCtx.fillRect(7, 9, 2, 5);
    tulipCtx.fillStyle = '#e91e63';
    tulipCtx.fillRect(6, 5, 4, 5);
    tulipCtx.fillRect(7, 4, 2, 1);
    tulip.refresh();
  }

  private createRocks(): void {
    for (let i = 0; i < 3; i++) {
      const key = `rock_${i}`;
      const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
      const ctx = canvas.context;

      ctx.fillStyle = this.colorToHex(COLORS.STONE);
      if (i === 0) {
        ctx.fillRect(4, 8, 8, 6);
        ctx.fillRect(6, 6, 4, 2);
      } else if (i === 1) {
        ctx.fillRect(3, 7, 10, 7);
        ctx.fillRect(5, 5, 6, 2);
      } else {
        ctx.fillRect(5, 9, 6, 5);
        ctx.fillRect(6, 7, 4, 2);
      }

      // Shadow
      ctx.fillStyle = this.colorToHex(COLORS.STONE_DARK);
      ctx.fillRect(4, 13, 8, 1);

      canvas.refresh();
    }
  }

  private createWell(): void {
    const key = 'well';
    const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
    const ctx = canvas.context;

    // Stone base
    ctx.fillStyle = this.colorToHex(COLORS.STONE);
    ctx.fillRect(2, 8, 12, 6);

    // Roof support
    ctx.fillStyle = this.colorToHex(COLORS.WOOD);
    ctx.fillRect(3, 4, 2, 5);
    ctx.fillRect(11, 4, 2, 5);

    // Roof
    ctx.fillStyle = this.colorToHex(COLORS.ROOF_RED);
    ctx.fillRect(2, 2, 12, 3);

    // Water
    ctx.fillStyle = this.colorToHex(COLORS.WATER_BASE);
    ctx.fillRect(4, 10, 8, 3);

    canvas.refresh();
  }

  // ==================== UI ELEMENTS ====================

  private generateUISprites(): void {
    this.createInventorySlot();
    this.createToolIcons();
    this.createCoinIcon();
    this.createHeartIcon();
    this.createSeasonIcons();
    this.createEnergyBar();
  }

  private createInventorySlot(): void {
    const key = 'inventory_slot';
    const canvas = this.scene.textures.createCanvas(key, 32, 32)!;
    const ctx = canvas.context;

    // Slot background
    ctx.fillStyle = this.colorToHex(COLORS.UI_BG);
    ctx.fillRect(0, 0, 32, 32);

    // Border
    ctx.strokeStyle = this.colorToHex(COLORS.UI_BORDER);
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 30, 30);

    canvas.refresh();

    // Selected version
    const selected = this.scene.textures.createCanvas('inventory_slot_selected', 32, 32)!;
    const sCtx = selected.context;
    sCtx.fillStyle = this.colorToHex(COLORS.UI_BG);
    sCtx.fillRect(0, 0, 32, 32);
    sCtx.strokeStyle = this.colorToHex(COLORS.UI_HIGHLIGHT);
    sCtx.lineWidth = 3;
    sCtx.strokeRect(1, 1, 30, 30);
    selected.refresh();
  }

  private createToolIcons(): void {
    // Simplified tool icons for inventory
    const tools = [
      { name: 'hoe', color: COLORS.WOOD },
      { name: 'watering_can', color: COLORS.STONE },
      { name: 'scythe', color: COLORS.WOOD },
      { name: 'axe', color: COLORS.STONE },
      { name: 'pickaxe', color: COLORS.STONE }
    ];

    tools.forEach(tool => {
      const key = `tool_icon_${tool.name}`;
      const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
      const ctx = canvas.context;

      ctx.fillStyle = this.colorToHex(tool.color);

      // Simple icon representation
      if (tool.name === 'hoe') {
        ctx.fillRect(6, 2, 2, 10);
        ctx.fillRect(4, 11, 6, 2);
      } else if (tool.name === 'watering_can') {
        ctx.fillRect(4, 5, 8, 6);
        ctx.fillRect(6, 4, 2, 1);
      } else if (tool.name === 'scythe') {
        ctx.fillRect(8, 2, 2, 10);
        ctx.fillRect(4, 2, 4, 4);
      } else if (tool.name === 'axe') {
        ctx.fillRect(7, 4, 2, 8);
        ctx.fillRect(4, 4, 6, 4);
      } else if (tool.name === 'pickaxe') {
        ctx.fillRect(7, 4, 2, 8);
        ctx.fillRect(3, 4, 10, 3);
      }

      canvas.refresh();
    });
  }

  private createCoinIcon(): void {
    const key = 'coin_icon';
    const canvas = this.scene.textures.createCanvas(key, 12, 12)!;
    const ctx = canvas.context;

    // Gold coin
    ctx.fillStyle = this.colorToHex(COLORS.GOLD);
    ctx.fillRect(2, 1, 8, 10);
    ctx.fillRect(1, 3, 10, 6);

    // Highlight
    ctx.fillStyle = '#f4d03f';
    ctx.fillRect(3, 3, 2, 2);

    canvas.refresh();
  }

  private createHeartIcon(): void {
    const key = 'heart_icon';
    const canvas = this.scene.textures.createCanvas(key, 12, 12)!;
    const ctx = canvas.context;

    // Heart shape
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(2, 2, 3, 2);
    ctx.fillRect(7, 2, 3, 2);
    ctx.fillRect(1, 4, 10, 4);
    ctx.fillRect(2, 8, 8, 2);
    ctx.fillRect(4, 10, 4, 1);

    canvas.refresh();
  }

  private createSeasonIcons(): void {
    const seasons = [
      { name: 'spring', color: '#2ecc71' },
      { name: 'summer', color: '#f1c40f' },
      { name: 'fall', color: '#e67e22' },
      { name: 'winter', color: '#3498db' }
    ];

    seasons.forEach(season => {
      const key = `season_icon_${season.name}`;
      const canvas = this.scene.textures.createCanvas(key, 16, 16)!;
      const ctx = canvas.context;

      ctx.fillStyle = season.color;

      // Simple icon - circle with color
      ctx.fillRect(4, 4, 8, 8);
      ctx.fillRect(5, 3, 6, 1);
      ctx.fillRect(5, 12, 6, 1);
      ctx.fillRect(3, 5, 1, 6);
      ctx.fillRect(12, 5, 1, 6);

      canvas.refresh();
    });
  }

  private createEnergyBar(): void {
    // Energy bar filled
    const filled = this.scene.textures.createCanvas('energy_bar_fill', 100, 10)!;
    const fCtx = filled.context;
    fCtx.fillStyle = this.colorToHex(COLORS.ENERGY_GREEN);
    fCtx.fillRect(0, 0, 100, 10);
    filled.refresh();

    // Energy bar background
    const bg = this.scene.textures.createCanvas('energy_bar_bg', 100, 10)!;
    const bgCtx = bg.context;
    bgCtx.fillStyle = '#2c3e50';
    bgCtx.fillRect(0, 0, 100, 10);
    bgCtx.strokeStyle = this.colorToHex(COLORS.UI_BORDER);
    bgCtx.lineWidth = 1;
    bgCtx.strokeRect(0, 0, 100, 10);
    bg.refresh();
  }

  // ==================== PARTICLES ====================

  private generateParticleSprites(): void {
    // Dirt particle
    const dirt = this.scene.textures.createCanvas('particle_dirt', 4, 4)!;
    const dirtCtx = dirt.context;
    dirtCtx.fillStyle = this.colorToHex(COLORS.DIRT);
    dirtCtx.fillRect(0, 0, 4, 4);
    dirt.refresh();

    // Water droplet
    const water = this.scene.textures.createCanvas('particle_water', 4, 4)!;
    const waterCtx = water.context;
    waterCtx.fillStyle = this.colorToHex(COLORS.WATER_BASE);
    waterCtx.fillRect(1, 0, 2, 4);
    waterCtx.fillRect(0, 1, 4, 2);
    water.refresh();

    // Sparkle
    const sparkle = this.scene.textures.createCanvas('particle_sparkle', 6, 6)!;
    const sparkleCtx = sparkle.context;
    sparkleCtx.fillStyle = '#ffffff';
    sparkleCtx.fillRect(2, 0, 2, 6);
    sparkleCtx.fillRect(0, 2, 6, 2);
    sparkle.refresh();

    // Leaf
    const leaf = this.scene.textures.createCanvas('particle_leaf', 4, 4)!;
    const leafCtx = leaf.context;
    leafCtx.fillStyle = this.colorToHex(COLORS.LEAF_GREEN);
    leafCtx.fillRect(0, 0, 4, 4);
    leafCtx.fillRect(1, 1, 2, 2);
    leaf.refresh();
  }

  // ==================== HELPER METHODS ====================

  private colorToHex(color: number): string {
    return '#' + color.toString(16).padStart(6, '0');
  }

  private adjustBrightness(color: number, amount: number): string {
    const r = Math.max(0, Math.min(255, ((color >> 16) & 0xFF) + amount));
    const g = Math.max(0, Math.min(255, ((color >> 8) & 0xFF) + amount));
    const b = Math.max(0, Math.min(255, (color & 0xFF) + amount));
    return `rgb(${r},${g},${b})`;
  }
}
