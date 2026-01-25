# Quick Reference

Quick guide to common tasks and repository organization.

## Repository Structure

```
tarkovdata/
├── data/              # All JSON game data files
├── scripts/           # TypeScript maintenance scripts
├── docs/              # Documentation
├── maps/              # SVG maps and resources
├── cli.js             # Command-line tool
└── package.json       # npm configuration
```

## Common Commands

### Data Updates

```bash
# Update ammunition from wiki
npm run sync:ammo

# Fetch caliber list
npm run fetch:calibers

# Check for missing ammunition
npm run report:missing
```

### Data Verification

```bash
# Verify quest data integrity
npm run verify-quest-data
```

### CLI Tool

```bash
# Show available commands
node cli.js help

# Get next available quest ID
node cli.js new-quest-id
```

## Quick Links

- [Main README](../README.md) - Repository overview
- [Data Files](../data/README.md) - Data file documentation
- [Scripts](SCRIPTS.md) - Script documentation
- [Maps](../maps/README.md) - SVG maps documentation

## Data Files

| File | Description |
|------|-------------|
| [ammunition.json](../data/ammunition.json) | Ammunition stats and ballistics |
| [hideout.json](../data/hideout.json) | Hideout stations and upgrades |
| [items.en.json](../data/items.en.json) | Item names and IDs |
| [quests.json](../data/quests.json) | Quest data and objectives |
| [traders.json](../data/traders.json) | Trader information |
| [maps.json](../data/maps.json) | Map metadata |
| [levels.json](../data/levels.json) | Level progression |
| [item_presets.json](../data/item_presets.json) | Weapon presets |

## Contributing Workflow

1. Fork the repository
2. Make your changes
3. Run verification scripts
4. Create a pull request
5. Get approval from maintainer
6. Merge

## Getting Help

- Open an issue for bugs or feature requests
- Use discussions for questions
- Check existing documentation first

## Common Issues

**Scripts not working?**
- Run from repository root, not from subdirectories
- Check that npm packages are installed (`npm install`)

**JSON syntax errors?**
- Use a JSON validator
- Check for trailing commas
- Ensure proper escaping

**Data out of sync?**
- Run sync scripts to update from wiki
- Check wiki for recent game updates
- Report discrepancies in issues
