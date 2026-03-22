import Phaser from 'phaser';

export class HUD {
  private container: Phaser.GameObjects.Container;
  private dayText: Phaser.GameObjects.Text;
  private timeText: Phaser.GameObjects.Text;
  private goldText: Phaser.GameObjects.Text;
  private background: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);

    this.background = scene.add.graphics();
    this.background.fillStyle(0x000000, 0.7);
    this.background.fillRect(0, 0, 800, 40);
    this.container.add(this.background);

    this.dayText = scene.add.text(10, 10, 'Day 1', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    this.container.add(this.dayText);

    this.timeText = scene.add.text(150, 10, '8:00 AM', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    this.container.add(this.timeText);

    this.goldText = scene.add.text(350, 10, '💰 0g', {
      fontSize: '18px',
      color: '#ffcc00',
      fontFamily: 'monospace'
    });
    this.container.add(this.goldText);
  }

  updateDay(day: number): void {
    this.dayText.setText(`Day ${day}`);
  }

  updateTime(timeStr: string): void {
    this.timeText.setText(timeStr);
  }

  updateGold(gold: number): void {
    this.goldText.setText(`💰 ${gold}g`);
  }
}
