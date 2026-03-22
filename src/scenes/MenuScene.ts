import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor(0x1a1a2e);

    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const star = this.add.circle(x, y, 1, 0xffffff);

      this.tweens.add({
        targets: star,
        alpha: 0.3,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }

    const title = this.add.text(width / 2, height / 3, 'PixelFarm', {
      fontSize: '64px',
      color: '#4a8d3c',
      fontFamily: 'monospace',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: height / 3 - 10,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    const subtitle = this.add.text(width / 2, height / 3 + 60, 'A farming life simulation', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    subtitle.setOrigin(0.5);

    this.createButton(width / 2, height / 2 + 50, 'New Game', () => {
      this.scene.start('FarmScene');
    });

    this.createButton(width / 2, height / 2 + 110, 'Continue', () => {
      const savedData = localStorage.getItem('pixelfarm_save');
      if (savedData) {
        this.scene.start('FarmScene', { loadGame: true });
      } else {
        const noSaveText = this.add.text(width / 2, height / 2 + 170, 'No saved game found!', {
          fontSize: '14px',
          color: '#ff0000',
          fontFamily: 'monospace'
        });
        noSaveText.setOrigin(0.5);
        this.time.delayedCall(2000, () => noSaveText.destroy());
      }
    });

    const controlsText = this.add.text(width / 2, height - 80,
      'Controls: WASD/Arrows to move | E to interact | I for inventory', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'monospace'
    });
    controlsText.setOrigin(0.5);
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x4a8d3c, 1);
    bg.fillRoundedRect(-100, -20, 200, 40, 10);
    container.add(bg);

    const buttonText = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'monospace'
    });
    buttonText.setOrigin(0.5);
    container.add(buttonText);

    container.setInteractive(
      new Phaser.Geom.Rectangle(-100, -20, 200, 40),
      Phaser.Geom.Rectangle.Contains
    );

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x5aa14e, 1);
      bg.fillRoundedRect(-100, -20, 200, 40, 10);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x4a8d3c, 1);
      bg.fillRoundedRect(-100, -20, 200, 40, 10);
    });

    container.on('pointerdown', callback);

    return container;
  }
}
