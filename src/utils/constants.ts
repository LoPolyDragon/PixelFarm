export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const TILE_SIZE = 32;
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 30;

export const PLAYER_SPEED = 100;

export const DAY_LENGTH_MS = 300000; // 5 minutes
export const DAYS_IN_MONTH = 30;

export const CROP_GROWTH_DAYS = 3;
export const CROP_WATERED_TINT = 0x8888ff;

export enum Direction {
  DOWN = 0,
  LEFT = 1,
  RIGHT = 2,
  UP = 3
}

export enum TileType {
  GRASS = 0,
  DIRT = 1,
  WATER = 2,
  PATH = 3,
  PLOWED = 4
}

export enum CropStage {
  SEED = 0,
  GROWING = 1,
  READY = 2
}

export const COLORS = {
  GRASS: 0x4a8d3c,
  DIRT: 0x8b6f47,
  WATER: 0x4a90e2,
  PATH: 0xc9a66b,
  PLOWED: 0x6b5334,
  TREE_TRUNK: 0x654321,
  TREE_TOP: 0x2d5a2d,
  HOUSE_WALL: 0x9b6d3f,
  HOUSE_ROOF: 0x8b0000,
  PLAYER: 0xff6b9d,
  SEED: 0x8b7355,
  CROP_GROWING: 0x9acd32,
  CROP_READY: 0x32cd32,
  CHEST: 0x8b4513,
  BED: 0xdaa520
};

export interface GameData {
  day: number;
  gold: number;
  inventory: { [key: string]: number };
  cropData: CropData[];
  tileData: number[][];
}

export interface CropData {
  x: number;
  y: number;
  stage: CropStage;
  dayPlanted: number;
  watered: boolean;
}
