# Tarkov Experience Levels Documentation

## Overview

This document describes the structure and meaning of the `levels.json` file, which contains experience requirements for all player levels in Escape from Tarkov.

## Data Source

All data is sourced from the official Escape from Tarkov Wiki:
- **URL**: https://escapefromtarkov.fandom.com/wiki/Experience
- **Last Updated**: January 25, 2026

## File Structure

The `levels.json` file contains a JSON object where each key represents a player level (1-79) and contains the following properties:

### Properties

- **`exp`** (number): The amount of experience required to **advance from this level to the next level**
  - Example: Level 5 has `"exp": 5824`, meaning you need 5,824 XP to go from level 5 to level 6
  - Level 1 has `"exp": 0` as it's the starting level

- **`total`** (number): The **cumulative total experience** required to reach this level from level 1
  - Example: Level 10 has `"total": 63723`, meaning you need 63,723 total XP to reach level 10
  - This is the sum of all `exp` values from level 1 through this level

- **`group`** (string): The level grouping/tier for game mechanics purposes
  - Values range from "1" to "16"
  - Used internally for various game systems (trader unlocks, quest availability, etc.)

## Example Entry

```json
"15": {
  "exp": 34084,      // Need 34,084 XP to go from level 15 → 16
  "total": 177337,   // Need 177,337 total XP to reach level 15
  "group": "4"       // Belongs to group 4
}
```

## Level Milestones

### Early Game (Levels 1-20)
- **Level 1**: Starting level (0 total XP)
- **Level 10**: 63,723 total XP
- **Level 20**: 437,465 total XP

### Mid Game (Levels 21-50)
- **Level 30**: 1,499,338 total XP
- **Level 40**: 4,010,401 total XP
- **Level 50**: 9,055,144 total XP

### Late Game (Levels 51-79)
- **Level 60**: 17,816,442 total XP
- **Level 70**: 44,260,543 total XP
- **Level 79**: 172,016,256 total XP (maximum level)

## Calculation Formula

The cumulative total for any level can be calculated as:

```
total[n] = Σ(exp[i]) for i = 1 to n
```

Or in simpler terms:
```
total[current_level] = total[previous_level] + exp[previous_level]
```

## Notes

- The experience curve becomes significantly steeper after level 60
- Levels 76-79 were added in recent updates
- The highest level gap is between level 78 and 79, requiring over 27 million XP
- Group numbers generally increase with level ranges but don't strictly correlate 1:1

## Usage Examples

### Finding XP needed to reach a specific level
```javascript
// To reach level 50 from scratch
const xpNeeded = levels["50"].total; // 9,055,144
```

### Finding XP needed between two levels
```javascript
// XP needed to go from level 30 to level 40
const xpNeeded = levels["40"].total - levels["30"].total; 
// 4,010,401 - 1,499,338 = 2,511,063
```

### Finding current level from total XP
```javascript
function getLevelFromXP(totalXP) {
  for (let level = 79; level >= 1; level--) {
    if (totalXP >= levels[level.toString()].total) {
      return level;
    }
  }
  return 1;
}
```
