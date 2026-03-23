import Phaser from 'phaser';
import { Season, Tool, COLORS } from '../utils/constants';

export class HUD {
  private container: Phaser.GameObjects.Container;
  private dayText: Phaser.GameObjects.Text;
  private seasonText: Phaser.GameObjects.Text;
  private timeText: Phaser.GameObjects.Text;
  private goldText: Phaser.GameObjects.Text;
  private coinIcon: Phaser.GameObjects.Sprite;
  private energyBarBg: Phaser.GameObjects.Sprite;
  private energyBarFill: Phaser.GameObjects.Graphics;
  private energyText: Phaser.GameObjects.Text;
  private seasonIcon: Phaser.GameObjects.Sprite;

  // Hotbar
  private hotbarContainer!: Phaser.GameObjects.Container;
  private hotbarSlots: Phaser.GameObjects.Sprite[] = [];
  private hotbarIcons: (Phaser.GameObjects.Sprite | null)[] = [];
  private hotbarCountTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    // Main HUD container (top bar)
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);

    // Top bar background
    const topBg = scene.add.graphics();
    topBg.fillStyle(COLORS.UI_BG, 0.9);
    topBg.fillRect(0, 0, 800, 50);
    topBg.lineStyle(2, COLORS.UI_BORDER, 1);
    topBg.strokeRect(0, 0, 800, 50);
    this.container.add(topBg);

    // Season icon and text
    this.seasonIcon = scene.add.sprite(15, 25, 'season_icon_spring');
    this.container.add(this.seasonIcon);

    this.seasonText = scene.add.text(35, 15, 'Spring', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.container.add(this.seasonText);

    // Day text
    this.dayText = scene.add.text(120, 15, 'Day 1', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.container.add(this.dayText);

    // Time text
    this.timeText = scene.add.text(200, 15, '6:00 AM', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.container.add(this.timeText);

    // Gold display
    this.coinIcon = scene.add.sprite(320, 25, 'coin_icon');
    this.container.add(this.coinIcon);

    this.goldText = scene.add.text(340, 15, '0g', {
      fontSize: '16px',
      color: this.colorToHex(COLORS.GOLD),
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.container.add(this.goldText);

    // Energy bar
    this.energyBarBg = scene.add.sprite(500, 25, 'energy_bar_bg');
    this.container.add(this.energyBarBg);

    this.energyBarFill = scene.add.graphics();
    this.container.add(this.energyBarFill);

    this.energyText = scene.add.text(460, 15, 'Energy:', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.container.add(this.energyText);

    // Create hotbar at bottom of screen
    this.createHotbar(scene);
  }

  private createHotbar(scene: Phaser.Scene): void {
    this.hotbarContainer = scene.add.container(200, 550);
    this.hotbarContainer.setScrollFactor(0);
    this.hotbarContainer.setDepth(1000);

    // Create 6 slots for tools
    for (let i = 0; i < 6; i++) {
      const x = i * 40;

      // Slot background
      const slot = scene.add.sprite(x, 0, 'inventory_slot');
      this.hotbarSlots.push(slot);
      this.hotbarContainer.add(slot);

      // Slot number
      const numberText = scene.add.text(x - 12, -18, `${i + 1}`, {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'Arial'
      });
      this.hotbarContainer.add(numberText);

      // Icon placeholder
      this.hotbarIcons.push(null);

      // Count text
      const countText = scene.add.text(x - 12, 8, '', {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 2
      });
      this.hotbarCountTexts.push(countText);
      this.hotbarContainer.add(countText);
    }

    // Set initial selection
    this.updateSelectedSlot(0);
  }

  updateDay(day: number): void {
    this.dayText.setText(`Day ${day}`);
  }

  updateSeason(season: Season, seasonName: string): void {
    this.seasonText.setText(seasonName);

    // Update season icon
    let iconKey = 'season_icon_spring';
    switch (season) {
      case Season.SPRING:
        iconKey = 'season_icon_spring';
        break;
      case Season.SUMMER:
        iconKey = 'season_icon_summer';
        break;
      case Season.FALL:
        iconKey = 'season_icon_fall';
        break;
      case Season.WINTER:
        iconKey = 'season_icon_winter';
        break;
    }

    this.seasonIcon.setTexture(iconKey);
  }

  updateTime(timeStr: string): void {
    this.timeText.setText(timeStr);
  }

  updateGold(gold: number): void {
    this.goldText.setText(`${gold}g`);
  }

  updateEnergy(current: number, max: number): void {
    const percentage = current / max;

    // Clear and redraw energy bar
    this.energyBarFill.clear();

    // Choose color based on energy level
    let color = COLORS.ENERGY_GREEN;
    if (percentage < 0.25) {
      color = COLORS.ENERGY_LOW;
    } else if (percentage < 0.5) {
      color = 0xf39c12; // Orange
    }

    this.energyBarFill.fillStyle(color, 1);
    this.energyBarFill.fillRect(500, 20, 100 * percentage, 10);
  }

  updateSelectedSlot(slotIndex: number): void {
    // Update all slot appearances
    for (let i = 0; i < this.hotbarSlots.length; i++) {
      if (i === slotIndex) {
        this.hotbarSlots[i].setTexture('inventory_slot_selected');
      } else {
        this.hotbarSlots[i].setTexture('inventory_slot');
      }
    }
  }

  updateToolIcon(slotIndex: number, tool: Tool): void {
    if (slotIndex < 0 || slotIndex >= this.hotbarIcons.length) {
      return;
    }

    // Remove old icon
    if (this.hotbarIcons[slotIndex]) {
      this.hotbarIcons[slotIndex]!.destroy();
    }

    // Get tool icon key
    let iconKey = '';
    switch (tool) {
      case Tool.HOE:
        iconKey = 'tool_icon_hoe';
        break;
      case Tool.WATERING_CAN:
        iconKey = 'tool_icon_watering_can';
        break;
      case Tool.SCYTHE:
        iconKey = 'tool_icon_scythe';
        break;
      case Tool.AXE:
        iconKey = 'tool_icon_axe';
        break;
      case Tool.PICKAXE:
        iconKey = 'tool_icon_pickaxe';
        break;
      case Tool.SEEDS:
        // Seeds icon will be updated separately
        iconKey = '';
        break;
    }

    if (iconKey) {
      const x = slotIndex * 40;
      const icon = this.hotbarContainer.scene.add.sprite(x, 0, iconKey);
      this.hotbarIcons[slotIndex] = icon;
      this.hotbarContainer.add(icon);
    }
  }

  updateSeedCount(slotIndex: number, count: number): void {
    if (slotIndex < 0 || slotIndex >= this.hotbarCountTexts.length) {
      return;
    }

    if (count > 0) {
      this.hotbarCountTexts[slotIndex].setText(`${count}`);
    } else {
      this.hotbarCountTexts[slotIndex].setText('');
    }
  }

  initializeHotbar(tools: Tool[]): void {
    tools.forEach((tool, index) => {
      this.updateToolIcon(index, tool);
    });
  }

  private colorToHex(color: number): string {
    return '#' + color.toString(16).padStart(6, '0');
  }

  destroy(): void {
    this.container.destroy();
    this.hotbarContainer.destroy();
  }
}
