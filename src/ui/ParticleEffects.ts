import Phaser from 'phaser';
import { TILE_SIZE } from '../utils/constants';

export class ParticleEffects {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Dirt splash effect when hoeing
  createDirtSplash(tileX: number, tileY: number): void {
    const worldX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = tileY * TILE_SIZE + TILE_SIZE / 2;

    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.sprite(worldX, worldY, 'particle_dirt');
      const angle = (Math.PI * 2 * i) / 8;

      this.scene.tweens.add({
        targets: particle,
        x: worldX + Math.cos(angle) * 20,
        y: worldY + Math.sin(angle) * 20,
        alpha: 0,
        duration: 400,
        ease: 'Cubic.Out',
        onComplete: () => particle.destroy()
      });
    }
  }

  // Water droplets effect when watering
  createWaterDroplets(tileX: number, tileY: number): void {
    const worldX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = tileY * TILE_SIZE + TILE_SIZE / 2;

    for (let i = 0; i < 10; i++) {
      const particle = this.scene.add.sprite(
        worldX + (Math.random() - 0.5) * 10,
        worldY - 10,
        'particle_water'
      );

      this.scene.tweens.add({
        targets: particle,
        y: worldY + TILE_SIZE / 2,
        alpha: 0,
        duration: 300 + Math.random() * 200,
        ease: 'Cubic.In',
        onComplete: () => particle.destroy()
      });
    }
  }

  // Sparkle effect for harvest
  createSparkles(tileX: number, tileY: number): void {
    const worldX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = tileY * TILE_SIZE + TILE_SIZE / 2;

    for (let i = 0; i < 5; i++) {
      const particle = this.scene.add.sprite(worldX, worldY, 'particle_sparkle');
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 15;

      this.scene.tweens.add({
        targets: particle,
        x: worldX + Math.cos(angle) * distance,
        y: worldY + Math.sin(angle) * distance - 20,
        alpha: 0,
        scale: 1.5,
        duration: 600,
        ease: 'Cubic.Out',
        onComplete: () => particle.destroy()
      });
    }
  }

  // Leaf particles for harvesting
  createLeafParticles(tileX: number, tileY: number): void {
    const worldX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = tileY * TILE_SIZE + TILE_SIZE / 2;

    for (let i = 0; i < 6; i++) {
      const particle = this.scene.add.sprite(worldX, worldY, 'particle_leaf');
      const angle = (Math.PI * 2 * i) / 6;

      this.scene.tweens.add({
        targets: particle,
        x: worldX + Math.cos(angle) * 25,
        y: worldY + Math.sin(angle) * 25,
        rotation: Math.random() * Math.PI * 2,
        alpha: 0,
        duration: 500,
        ease: 'Cubic.Out',
        onComplete: () => particle.destroy()
      });
    }
  }

  // Floating text effect
  createFloatingText(x: number, y: number, text: string, color: string = '#ffffff'): void {
    const textObj = this.scene.add.text(x, y, text, {
      fontSize: '14px',
      color: color,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    textObj.setOrigin(0.5, 0.5);
    textObj.setDepth(2000);

    this.scene.tweens.add({
      targets: textObj,
      y: y - 30,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.Out',
      onComplete: () => textObj.destroy()
    });
  }

  // Action text at tile (like "Planted!", "Watered!")
  createActionText(tileX: number, tileY: number, text: string, color: string = '#ffffff'): void {
    const worldX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = tileY * TILE_SIZE + TILE_SIZE / 2;

    this.createFloatingText(worldX, worldY - 10, text, color);
  }

  // Gold earned effect
  createGoldText(tileX: number, tileY: number, amount: number): void {
    const worldX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const worldY = tileY * TILE_SIZE + TILE_SIZE / 2;

    this.createFloatingText(worldX, worldY - 10, `+${amount}g`, '#f39c12');
  }

  // Energy consumed effect
  createEnergyText(x: number, y: number, amount: number): void {
    this.createFloatingText(x, y, `-${amount} energy`, '#e74c3c');
  }

  // Tool use animation
  createToolEffect(tileX: number, tileY: number, tool: string): void {
    switch (tool) {
      case 'hoe':
        this.createDirtSplash(tileX, tileY);
        break;
      case 'water':
        this.createWaterDroplets(tileX, tileY);
        break;
      case 'harvest':
        this.createSparkles(tileX, tileY);
        this.createLeafParticles(tileX, tileY);
        break;
      case 'plant':
        this.createDirtSplash(tileX, tileY);
        break;
    }
  }
}
