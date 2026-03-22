import Phaser from 'phaser';

export class DialogBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  private visible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(100, 450);
    this.container.setScrollFactor(0);
    this.container.setDepth(2000);
    this.container.setVisible(false);

    this.background = scene.add.graphics();
    this.background.fillStyle(0x000000, 0.8);
    this.background.fillRoundedRect(0, 0, 600, 100, 10);
    this.background.lineStyle(2, 0xffffff, 1);
    this.background.strokeRoundedRect(0, 0, 600, 100, 10);
    this.container.add(this.background);

    this.text = scene.add.text(20, 20, '', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: 560 }
    });
    this.container.add(this.text);
  }

  show(message: string, duration: number = 2000): void {
    this.text.setText(message);
    this.container.setVisible(true);
    this.visible = true;

    this.scene.time.delayedCall(duration, () => {
      this.hide();
    });
  }

  hide(): void {
    this.container.setVisible(false);
    this.visible = false;
  }

  isVisible(): boolean {
    return this.visible;
  }
}
