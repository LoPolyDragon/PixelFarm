import { Tool } from '../utils/constants';

/**
 * ToolSystem - Manages player tools and tool selection
 */
export class ToolSystem {
  private selectedTool: Tool;
  private tools: Tool[];

  constructor() {
    this.selectedTool = Tool.HOE;
    this.tools = [
      Tool.HOE,
      Tool.WATERING_CAN,
      Tool.SCYTHE,
      Tool.AXE,
      Tool.PICKAXE,
      Tool.SEEDS
    ];
  }

  getSelectedTool(): Tool {
    return this.selectedTool;
  }

  setSelectedTool(tool: Tool): void {
    if (this.tools.includes(tool)) {
      this.selectedTool = tool;
    }
  }

  selectToolByIndex(index: number): void {
    if (index >= 0 && index < this.tools.length) {
      this.selectedTool = this.tools[index];
    }
  }

  getTools(): Tool[] {
    return [...this.tools];
  }

  nextTool(): void {
    const currentIndex = this.tools.indexOf(this.selectedTool);
    const nextIndex = (currentIndex + 1) % this.tools.length;
    this.selectedTool = this.tools[nextIndex];
  }

  previousTool(): void {
    const currentIndex = this.tools.indexOf(this.selectedTool);
    const prevIndex = (currentIndex - 1 + this.tools.length) % this.tools.length;
    this.selectedTool = this.tools[prevIndex];
  }

  getToolName(tool: Tool): string {
    switch (tool) {
      case Tool.HOE:
        return 'Hoe';
      case Tool.WATERING_CAN:
        return 'Watering Can';
      case Tool.SCYTHE:
        return 'Scythe';
      case Tool.AXE:
        return 'Axe';
      case Tool.PICKAXE:
        return 'Pickaxe';
      case Tool.SEEDS:
        return 'Seeds';
      default:
        return 'None';
    }
  }
}
