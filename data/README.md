# Data Files Documentation

This directory contains all game data files for Escape From Tarkov in JSON format.

## File Index

### ammunition.json
Complete ammunition database including ballistics, damage, penetration, and other stats.

**Structure:**
```json
{
  "ammo_id": {
    "id": "string",
    "name": "string",
    "caliber": "string",
    "ballistics": {
      "damage": 0,
      "penetrationPower": 0,
      "armorDamage": 0
    }
  }
}
```

### hideout.json
Hideout stations and module upgrades with requirements.

**Structure:**
```json
{
  "stations": [
    {
      "id": 0,
      "locales": { "en": "Station Name" },
      "function": "Description"
    }
  ],
  "modules": [
    {
      "module": "Station Name",
      "level": 1,
      "require": []
    }
  ]
}
```

### items.en.json
Item names and IDs in English.

**Structure:**
```json
{
  "item_id": {
    "name": "Full Item Name",
    "shortName": "Short Name"
  }
}
```

### quests.json
Quest data including objectives, requirements, and rewards.

**Structure:**
```json
[
  {
    "id": "quest_id",
    "name": "Quest Name",
    "giver": "trader_id",
    "objectives": [],
    "requirements": []
  }
]
```

### traders.json
Trader information and metadata.

**Structure:**
```json
{
  "trader_id": {
    "name": "Trader Name",
    "currency": "RUB"
  }
}
```

### maps.json
Map metadata and SVG information.

**Structure:**
```json
{
  "map_id": {
    "name": "Map Name",
    "svg": {
      "file": "map.svg",
      "floors": [],
      "defaultFloor": "floor1"
    }
  }
}
```

### item_presets.json
Weapon preset configurations.

**Structure:**
```json
{
  "preset_id": {
    "name": "Preset Name",
    "baseId": "base_item_id",
    "items": []
  }
}
```

### levels.json
Player level progression and experience requirements.

**Structure:**
```json
{
  "level": {
    "exp": 0,
    "traderUnlocks": []
  }
}
```

## Data Maintenance

### Updating Data

Data files are maintained through automated scripts and manual contributions:

- **Ammunition**: Use `npm run sync:ammo` to update from wiki
- **Other Files**: Manual updates via pull requests

### Validation

Before committing changes, run validation scripts:

```bash
npm run verify-quest-data
```

### File Format

All JSON files must be:
- Valid JSON syntax
- Properly formatted with 2-space indentation
- Encoded in UTF-8
- End with a newline character

## Schema Versioning

Schemas may evolve over time. Breaking changes are avoided when possible, but may occur for significant improvements.

Check git history and commit messages for schema changes.

## Usage Examples

### Loading Data

**Node.js:**
```javascript
const ammunition = require('./data/ammunition.json');
const quests = require('./data/quests.json');
```

**Browser/Fetch:**
```javascript
const response = await fetch('data/ammunition.json');
const ammunition = await response.json();
```

### Filtering Data

**Find specific ammunition:**
```javascript
const ammo = Object.values(ammunition).find(a => a.name === 'M855A1');
```

**Filter by caliber:**
```javascript
const nato556 = Object.values(ammunition)
  .filter(a => a.caliber === 'Caliber556x45NATO');
```

## Contributing

When contributing data updates:

1. Ensure JSON is valid
2. Follow existing schema structure
3. Add descriptive commit messages
4. Test with community tools if possible
5. Run validation scripts

For schema changes, open an issue first to discuss with maintainers.
