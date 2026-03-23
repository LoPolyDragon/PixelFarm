import { MAX_ENERGY, ENERGY_COSTS, Tool } from '../utils/constants';

/**
 * EnergySystem - Manages player energy
 */
export class EnergySystem {
  private currentEnergy: number;
  private maxEnergy: number;

  constructor(initialEnergy: number = MAX_ENERGY) {
    this.currentEnergy = initialEnergy;
    this.maxEnergy = MAX_ENERGY;
  }

  getCurrentEnergy(): number {
    return this.currentEnergy;
  }

  getMaxEnergy(): number {
    return this.maxEnergy;
  }

  getEnergyPercentage(): number {
    return this.currentEnergy / this.maxEnergy;
  }

  useEnergy(amount: number): boolean {
    if (this.currentEnergy >= amount) {
      this.currentEnergy -= amount;
      return true;
    }
    return false;
  }

  useEnergyForTool(tool: Tool): boolean {
    const cost = this.getToolEnergyCost(tool);
    return this.useEnergy(cost);
  }

  getToolEnergyCost(tool: Tool): number {
    switch (tool) {
      case Tool.HOE:
        return ENERGY_COSTS.HOE;
      case Tool.WATERING_CAN:
        return ENERGY_COSTS.WATER;
      case Tool.SCYTHE:
        return ENERGY_COSTS.HARVEST;
      case Tool.AXE:
        return ENERGY_COSTS.AXE;
      case Tool.PICKAXE:
        return ENERGY_COSTS.PICKAXE;
      default:
        return 0;
    }
  }

  canUseEnergy(amount: number): boolean {
    return this.currentEnergy >= amount;
  }

  canUseTool(tool: Tool): boolean {
    return this.canUseEnergy(this.getToolEnergyCost(tool));
  }

  restoreEnergy(amount: number): void {
    this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + amount);
  }

  restoreToFull(): void {
    this.currentEnergy = this.maxEnergy;
  }

  setEnergy(amount: number): void {
    this.currentEnergy = Math.max(0, Math.min(this.maxEnergy, amount));
  }

  isLow(): boolean {
    return this.getEnergyPercentage() < 0.25;
  }

  isEmpty(): boolean {
    return this.currentEnergy <= 0;
  }

  isFull(): boolean {
    return this.currentEnergy >= this.maxEnergy;
  }
}
