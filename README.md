# PixelFarm

A Stardew Valley-inspired farming RPG built with Phaser 3 and TypeScript.

## About

PixelFarm is a farming life simulation game where you plant crops, water them daily, harvest them, and sell them for gold. Experience a day/night cycle, manage your farm, and build your agricultural empire!

## Features

### Implemented (Foundation)
- **Player Movement**: Smooth WASD/Arrow key controls with 4-directional walking animations
- **Farming System**: Plant seeds, water crops daily, and harvest when ready
- **Day/Night Cycle**: 5-minute days with dynamic lighting that transitions between day and night
- **Time System**: 30-day months with in-game clock (8:00 AM start)
- **Economy**: Sell harvested crops for gold
- **Inventory System**: Track your harvested crops
- **Save System**: Auto-saves progress, continue from where you left off
- **Interactive World**: 40x30 tile farm with grass, dirt, water, paths, house, and trees
- **UI/HUD**: Real-time display of day, time, and gold

### Controls
- **WASD** or **Arrow Keys**: Move player
- **E**: Interact (plant, water, harvest, sleep, sell)
- **I**: View inventory

## Gameplay Loop

1. **Plant Seeds**: Press E on grass or dirt tiles to plant seeds
2. **Water Daily**: Press E on planted crops to water them (required for growth)
3. **Wait & Grow**: Crops take 3 days to fully mature when watered daily
4. **Harvest**: Press E on mature crops to harvest
5. **Sell**: Walk to the sell box (brown chest) and press E to sell all crops for 50 gold each
6. **Sleep**: Walk to your bed (in the house) and press E to advance to the next day

## Tech Stack

- **Phaser 3**: Game engine
- **TypeScript**: Strict mode enabled for type safety
- **Vite**: Build tool and dev server
- **Vercel**: Deployment platform

## Project Structure

```
src/
├── main.ts              # Phaser game configuration
├── scenes/
│   ├── BootScene.ts     # Loading screen
│   ├── MenuScene.ts     # Title screen with New Game/Continue
│   └── FarmScene.ts     # Main game scene
├── entities/
│   ├── Player.ts        # Player character with movement
│   └── Crop.ts          # Crop entity with growth stages
├── systems/
│   ├── TimeSystem.ts    # Day/night cycle and time management
│   └── FarmSystem.ts    # Planting, watering, harvesting logic
├── ui/
│   ├── HUD.ts           # Top bar with day, time, gold
│   └── DialogBox.ts     # Message popup system
└── utils/
    └── constants.ts     # Game constants and types
```

## Development

### Prerequisites
- Node.js 18+
- npm

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Roadmap

### Near Future (Next Iterations)
- Multiple crop types with different growth times and prices
- Tool system (watering can, hoe, axe)
- Energy/stamina system
- Weather system (rain auto-waters crops)
- Seasonal system (Spring, Summer, Fall, Winter)
- Shop to buy seeds
- More buildings and NPCs

### Long-term Vision
- Relationship system with NPCs
- Festivals and events
- Fishing mini-game
- Mining system
- Cooking system
- Farm animals
- Customizable farm layout
- Multiplayer co-op

## Credits

Built by Anthony Pan as a foundation for a long-term farming RPG project.

## License

MIT
