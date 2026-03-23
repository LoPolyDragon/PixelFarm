import Phaser from 'phaser';
import { SpriteGenerator } from '../sprites/SpriteGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading PixelFarm...', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    loadingText.setOrigin(0.5, 0.5);

    const statusText = this.add.text(width / 2, height / 2 + 50, 'Generating pixel art...', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    statusText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4a8d3c, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      statusText.destroy();
    });
  }

  create(): void {
    // Generate all sprites programmatically
    const spriteGenerator = new SpriteGenerator(this);
    spriteGenerator.generateAll();

    // Add a small delay to show the sprites are generated
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
