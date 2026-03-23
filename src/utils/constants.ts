// Game dimensions
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Tile configuration
export const TILE_SIZE = 16; // Changed to 16x16 for pixel art style
export const MAP_WIDTH = 50; // Adjusted for 16px tiles (800 / 16)
export const MAP_HEIGHT = 38; // Adjusted for 16px tiles (600 / 16)

// Player configuration
export const PLAYER_SPEED = 80;
export const PLAYER_WIDTH = 16;
export const PLAYER_HEIGHT = 32; // 16x32 sprite (taller than tile)

// Time system
export const DAY_LENGTH_MS = 300000; // 5 minutes
export const DAYS_IN_SEASON = 28;
export const SEASONS_IN_YEAR = 4;

// Energy system
export const MAX_ENERGY = 100;
export const ENERGY_COSTS = {
  HOE: 2,
  WATER: 1,
  HARVEST: 1,
  AXE: 5,
  PICKAXE: 5,
  WALKING: 0
};

// Crop configuration
export const CROP_WATERED_TINT = 0x8888ff;

// Animation
export const WALK_ANIMATION_SPEED = 150; // ms per frame
export const TOOL_ANIMATION_SPEED = 100; // ms per frame

// Direction enum
export enum Direction {
  DOWN = 0,
  LEFT = 1,
  RIGHT = 2,
  UP = 3
}

// Tile types
export enum TileType {
  GRASS = 0,
  DIRT = 1,
  WATER = 2,
  PATH = 3,
  PLOWED = 4,
  SAND = 5,
  WATERED = 6,
  FARMLAND = 7
}

// Crop growth stages
export enum CropStage {
  SEED = 0,
  SPROUT = 1,
  GROWING = 2,
  READY = 3
}

// Crop types
export enum CropType {
  PARSNIP = 0,
  CAULIFLOWER = 1,
  POTATO = 2,
  TOMATO = 3,
  BLUEBERRY = 4,
  PUMPKIN = 5,
  CORN = 6,
  STRAWBERRY = 7
}

// Seasons
export enum Season {
  SPRING = 0,
  SUMMER = 1,
  FALL = 2,
  WINTER = 3
}

// Tools
export enum Tool {
  NONE = -1,
  HOE = 0,
  WATERING_CAN = 1,
  SCYTHE = 2,
  AXE = 3,
  PICKAXE = 4,
  SEEDS = 5
}

// Crop information
export interface CropInfo {
  name: string;
  growthDays: number;
  seasons: Season[];
  buyPrice: number;
  sellPrice: number;
  regrowDays?: number; // For multi-harvest crops
}

export const CROP_DATA: Record<CropType, CropInfo> = {
  [CropType.PARSNIP]: {
    name: 'Parsnip',
    growthDays: 4,
    seasons: [Season.SPRING],
    buyPrice: 20,
    sellPrice: 35
  },
  [CropType.CAULIFLOWER]: {
    name: 'Cauliflower',
    growthDays: 12,
    seasons: [Season.SPRING],
    buyPrice: 80,
    sellPrice: 175
  },
  [CropType.POTATO]: {
    name: 'Potato',
    growthDays: 6,
    seasons: [Season.SPRING],
    buyPrice: 50,
    sellPrice: 80
  },
  [CropType.TOMATO]: {
    name: 'Tomato',
    growthDays: 11,
    seasons: [Season.SUMMER],
    buyPrice: 50,
    sellPrice: 60,
    regrowDays: 4
  },
  [CropType.BLUEBERRY]: {
    name: 'Blueberry',
    growthDays: 13,
    seasons: [Season.SUMMER],
    buyPrice: 80,
    sellPrice: 50,
    regrowDays: 4
  },
  [CropType.PUMPKIN]: {
    name: 'Pumpkin',
    growthDays: 13,
    seasons: [Season.FALL],
    buyPrice: 100,
    sellPrice: 320
  },
  [CropType.CORN]: {
    name: 'Corn',
    growthDays: 14,
    seasons: [Season.SUMMER, Season.FALL],
    buyPrice: 150,
    sellPrice: 50,
    regrowDays: 4
  },
  [CropType.STRAWBERRY]: {
    name: 'Strawberry',
    growthDays: 8,
    seasons: [Season.SPRING],
    buyPrice: 100,
    sellPrice: 120,
    regrowDays: 4
  }
};

// Save data interfaces
export interface GameData {
  day: number;
  season: Season;
  gold: number;
  energy: number;
  selectedTool: Tool;
  selectedSeed: CropType | null;
  inventory: InventoryData;
  cropData: CropData[];
  tileData: number[][];
}

export interface InventoryData {
  seeds: Record<CropType, number>;
  crops: Record<CropType, number>;
}

export interface CropData {
  x: number;
  y: number;
  type: CropType;
  stage: CropStage;
  dayPlanted: number;
  seasonPlanted: Season;
  watered: boolean;
}

// Particle effect types
export enum ParticleType {
  DIRT = 0,
  WATER = 1,
  SPARKLE = 2,
  LEAF = 3
}

// Color palette for pixel art
export const COLORS = {
  // Terrain
  GRASS_BASE: 0x5cb85c,
  GRASS_DARK: 0x4a9d4a,
  GRASS_LIGHT: 0x6ec46e,
  DIRT: 0x8b6f47,
  DIRT_DARK: 0x6d5635,
  WATERED_SOIL: 0x4a3f2f,
  PATH: 0xa89980,
  WATER_BASE: 0x4a90e2,
  WATER_HIGHLIGHT: 0x6aa8e8,
  SAND: 0xf0d9a0,

  // Plants
  SEED_BROWN: 0x6b4423,
  SPROUT_GREEN: 0x7ec850,
  LEAF_GREEN: 0x5cb85c,
  LEAF_DARK: 0x4a9d4a,
  TREE_TRUNK: 0x654321,
  TREE_TOP: 0x2d5a2d,

  // Buildings
  WOOD: 0x8b5a3c,
  WOOD_DARK: 0x6d3f1f,
  ROOF_RED: 0xc0392b,
  ROOF_DARK: 0x922b21,
  STONE: 0x95a5a6,
  STONE_DARK: 0x7f8c8d,

  // UI
  UI_BG: 0x2c3e50,
  UI_BORDER: 0x34495e,
  UI_HIGHLIGHT: 0x3498db,
  UI_TEXT: 0xecf0f1,
  GOLD: 0xf39c12,
  ENERGY_GREEN: 0x27ae60,
  ENERGY_LOW: 0xe74c3c,

  // Player
  SKIN: 0xfdb99b,
  HAIR: 0x8b4513,
  SHIRT_BLUE: 0x3498db,
  PANTS_BROWN: 0x6d5635,

  // Special
  WHITE: 0xffffff,
  BLACK: 0x000000,
  TRANSPARENT: 0x000000
};
