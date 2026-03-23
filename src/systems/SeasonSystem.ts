import { Season, DAYS_IN_SEASON } from '../utils/constants';

/**
 * SeasonSystem - Manages seasons and seasonal changes
 */
export class SeasonSystem {
  private currentSeason: Season;
  private dayInSeason: number;

  constructor(season: Season = Season.SPRING, day: number = 1) {
    this.currentSeason = season;
    this.dayInSeason = day;
  }

  getCurrentSeason(): Season {
    return this.currentSeason;
  }

  getDayInSeason(): number {
    return this.dayInSeason;
  }

  advanceDay(): boolean {
    this.dayInSeason++;

    if (this.dayInSeason > DAYS_IN_SEASON) {
      this.dayInSeason = 1;
      this.currentSeason = (this.currentSeason + 1) % 4;
      return true; // Season changed
    }

    return false; // Season did not change
  }

  getSeasonName(): string {
    switch (this.currentSeason) {
      case Season.SPRING:
        return 'Spring';
      case Season.SUMMER:
        return 'Summer';
      case Season.FALL:
        return 'Fall';
      case Season.WINTER:
        return 'Winter';
      default:
        return 'Unknown';
    }
  }

  getSeasonColor(): number {
    switch (this.currentSeason) {
      case Season.SPRING:
        return 0x2ecc71; // Green
      case Season.SUMMER:
        return 0xf1c40f; // Yellow
      case Season.FALL:
        return 0xe67e22; // Orange
      case Season.WINTER:
        return 0x3498db; // Blue
      default:
        return 0xffffff;
    }
  }

  // Get grass tint based on season
  getGrassTint(): number {
    switch (this.currentSeason) {
      case Season.SPRING:
        return 0xffffff; // Normal bright green
      case Season.SUMMER:
        return 0xffffe0; // Slight yellow tint
      case Season.FALL:
        return 0xffd700; // Golden tint
      case Season.WINTER:
        return 0xe0e0ff; // Slight blue/white tint
      default:
        return 0xffffff;
    }
  }

  // Get tree tint based on season
  getTreeTint(): number {
    switch (this.currentSeason) {
      case Season.SPRING:
        return 0xffffff; // Normal
      case Season.SUMMER:
        return 0xffffff; // Normal
      case Season.FALL:
        return 0xff8c00; // Orange/red leaves
      case Season.WINTER:
        return 0xe0e0ff; // Slight frost
      default:
        return 0xffffff;
    }
  }

  setSeason(season: Season, day: number = 1): void {
    this.currentSeason = season;
    this.dayInSeason = day;
  }

  // Check if it's winter (affects crop growth)
  isWinter(): boolean {
    return this.currentSeason === Season.WINTER;
  }
}
