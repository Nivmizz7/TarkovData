# TarkovData

Community-maintained game data for [Escape From Tarkov](https://www.escapefromtarkov.com/) in easy-to-use formats. Everything here is contributed by the community and maintained by developers of community tools like [Tarkov Tracker](https://tarkovtracker.org/), [Tarkov Guru](https://tarkov.guru/), [Tarkov.dev](https://tarkov.dev/), and [Tarkov Tools](https://tarkov-tools.com/).

## Repository Structure

```
tarkovdata/
├── data/              # Game data files
│   ├── ammunition.json
│   ├── hideout.json
│   ├── items.en.json
│   ├── quests.json
│   ├── traders.json
│   ├── maps.json
│   ├── levels.json
│   └── item_presets.json
├── scripts/           # Maintenance and update scripts
├── docs/              # Documentation
└── maps/              # Map data and resources
```

## Data Files

### [data/ammunition.json](data/ammunition.json)
Ammunition metadata including ballistics, damage, penetration, and other stats for all ammunition types in the game.

### [data/hideout.json](data/hideout.json)
Hideout station information and upgrade requirements, including all modules, construction times, and item requirements.

### [data/items.en.json](data/items.en.json)
Item names in English with both short and long forms.

### [data/quests.json](data/quests.json)
Quest data including requirements, unlocks, objectives, and rewards.

### [data/traders.json](data/traders.json)
Trader metadata and information.

### [data/maps.json](data/maps.json)
Map metadata and properties.

### [data/item_presets.json](data/item_presets.json)
Weapon preset configurations as they appear in the game.

### [data/levels.json](data/levels.json)
Player level progression and experience requirements.

## Automated Scripts

This repository includes TypeScript scripts for synchronizing data with the Escape From Tarkov wiki.

See [docs/SCRIPTS.md](docs/SCRIPTS.md) for documentation on available maintenance scripts.

### Available Commands

```bash
# Ammunition synchronization
npm run sync:ammo          # Sync ammunition data from wiki
npm run fetch:calibers     # Fetch caliber list from wiki
npm run fetch:ammo         # Fetch ammunition data from wiki
npm run report:missing     # Report missing ammunition entries

# Data verification
npm run verify-quest-data  # Verify quest data integrity
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Create a Pull Request** with your changes
2. **Schema Changes**: Open an issue first to discuss with maintainers
3. **Data Verification**: Run verification scripts before submitting
4. **Approval Process**: One approval by a maintainer, then merge

### Data Integrity

Before submitting changes to data files, please run the verification commands:

```bash
npm run verify-quest-data
```

This helps ensure no critical mistakes were made when modifying the data.

## Documentation

Additional documentation is available in the [docs/](docs/) directory:

- [LEVELS.md](docs/LEVELS.md) - Level progression documentation
- [TRADERS.md](docs/TRADERS.md) - Trader information
- [SCRIPTS.md](docs/SCRIPTS.md) - Script documentation

## License

ISC License - See repository for details.

## Community

This data is actively used by several community tools. Join the discussion on GitHub to suggest improvements or report issues.
