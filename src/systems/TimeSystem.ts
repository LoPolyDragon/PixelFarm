import Phaser from 'phaser';
import { DAY_LENGTH_MS } from '../utils/constants';
import { SeasonSystem } from './SeasonSystem';

export class TimeSystem {
  private scene: Phaser.Scene;
  private currentTime: number; // 0 to DAY_LENGTH_MS
  private timeSpeed: number = 1;
  private seasonSystem: SeasonSystem;

  constructor(scene: Phaser.Scene, seasonSystem: SeasonSystem) {
    this.scene = scene;
    this.seasonSystem = seasonSystem;
    this.currentTime = 0;
  }

  update(delta: number): void {
    this.currentTime += delta * this.timeSpeed;

    if (this.currentTime >= DAY_LENGTH_MS) {
      this.currentTime = 0;
      this.advanceDay();
    }
  }

  advanceDay(): void {
    const seasonChanged = this.seasonSystem.advanceDay();
    this.currentTime = 0;
    this.scene.events.emit('dayChanged', this.seasonSystem.getDayInSeason());

    if (seasonChanged) {
      this.scene.events.emit('seasonChanged', this.seasonSystem.getCurrentSeason());
    }
  }

  getDay(): number {
    return this.seasonSystem.getDayInSeason();
  }

  getSeasonSystem(): SeasonSystem {
    return this.seasonSystem;
  }

  getTimeOfDay(): number {
    return this.currentTime / DAY_LENGTH_MS;
  }

  getFormattedTime(): string {
    const progress = this.getTimeOfDay();
    const totalMinutes = progress * 24 * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  isNight(): boolean {
    const progress = this.getTimeOfDay();
    return progress < 0.25 || progress > 0.75;
  }

  getLightingTint(): number {
    const progress = this.getTimeOfDay();

    if (progress < 0.25) {
      const nightProgress = progress / 0.25;
      const brightness = Math.floor(50 + nightProgress * 155);
      return (brightness << 16) | (brightness << 8) | brightness;
    } else if (progress > 0.75) {
      const nightProgress = (progress - 0.75) / 0.25;
      const brightness = Math.floor(205 - nightProgress * 155);
      return (brightness << 16) | (brightness << 8) | brightness;
    }

    return 0xffffff;
  }

  skipToMorning(): void {
    this.currentTime = 0;
    this.advanceDay();
  }
}
