# Traders Data Documentation

## Overview

This document describes the structure and format of the `traders.json` file, which contains information about all traders in Escape from Tarkov, including their loyalty levels and items sold.

## Trader Structure

Each trader in the JSON file has the following properties:

### Base Properties

- **`id`** (number): Unique identifier for the trader (0-7)
- **`name`** (string): Full name of the trader
- **`locale`** (object): Localized display names
  - `en`: English name
- **`wiki`** (string): URL to the trader's wiki page
- **`description`** (string): Background story and description
- **`currencies`** (array): Currencies accepted by this trader (RUB, USD, EUR, BTC)
- **`salesCurrency`** (string): Primary currency used for calculating sales totals

### Loyalty Levels

Each trader has a `loyalty` array with 4 levels (1-4), except Fence who has special requirements.

Each loyalty level contains:

- **`level`** (number): Loyalty level (1-4)
- **`requiredLevel`** (number): Player level required to unlock
- **`requiredReputation`** (number): Reputation required (0.0 to 1.0)
- **`requiredSales`** (number): Total sales amount required in trader's currency
- **`items`** (array): Items available at this loyalty level

## Items Structure

Each item in the `items` array should have the following format:

```json
{
  "id": "item_id_from_items_json",
  "price": 12345,
  "currency": "RUB",
  "stock": 100,
  "restock": 3600
}
```

### Item Properties

- **`id`** (string): Item ID matching the ID in `items.en.json`
- **`price`** (number): Cost to purchase from trader
- **`currency`** (string): Currency for this item (RUB, USD, EUR, BTC)
- **`stock`** (number): Number of items available per restock cycle
  - `-1` for unlimited stock
- **`restock`** (number): Restock time in seconds
  - Common values: 3600 (1 hour), 7200 (2 hours), etc.

## Traders List

### Prapor (ID: 0)
- **Specialization**: Weapons, ammunition, grenades
- **Currency**: RUB
- **Unlock**: Level 1

### Therapist (ID: 1)
- **Specialization**: Medical supplies, food, containers
- **Currency**: RUB, EUR
- **Unlock**: Level 1

### Skier (ID: 2)
- **Specialization**: Tactical equipment, weapon parts
- **Currency**: RUB, USD, EUR
- **Unlock**: Level 1

### Peacekeeper (ID: 3)
- **Specialization**: Western weapons and equipment
- **Currency**: USD
- **Unlock**: Level 1

### Mechanic (ID: 4)
- **Specialization**: Weapon modifications, technical items
- **Currency**: EUR, RUB, BTC
- **Unlock**: Level 1

### Ragman (ID: 5)
- **Specialization**: Clothing, armor, rigs, backpacks
- **Currency**: RUB
- **Unlock**: Level 1

### Jaeger (ID: 6)
- **Specialization**: Hunting equipment, survival gear
- **Currency**: RUB
- **Unlock**: Level 1 (requires quest completion)

### Fence (ID: 7)
- **Specialization**: Flea market items, player-sold goods
- **Currency**: RUB
- **Note**: Dynamic inventory, no static items list

## Loyalty Level Requirements Summary

| Trader | LL2 Level | LL2 Rep | LL2 Sales | LL3 Level | LL3 Rep | LL3 Sales | LL4 Level | LL4 Rep | LL4 Sales |
|--------|-----------|---------|-----------|-----------|---------|-----------|-----------|---------|-----------|
| Prapor | 15 | 0.20 | 1,120,000₽ | 26 | 0.35 | 1,700,000₽ | 36 | 0.50 | 3,400,000₽ |
| Therapist | 14 | 0.15 | 600,000₽ | 23 | 0.30 | 1,000,000₽ | 37 | 0.60 | 1,600,000₽ |
| Skier | 15 | 0.20 | 1,200,000₽ | 28 | 0.40 | 2,400,000₽ | 38 | 0.75 | 3,900,000₽ |
| Peacekeeper | 14 | 0.00 | $16,000 | 23 | 0.30 | $37,000 | 37 | 0.60 | $55,000 |
| Mechanic | 20 | 0.15 | 1,120,000₽ | 30 | 0.30 | 2,400,000₽ | 40 | 0.60 | 3,700,000₽ |
| Ragman | 17 | 0.00 | 1,120,000₽ | 32 | 0.30 | 2,400,000₽ | 42 | 0.60 | 3,700,000₽ |
| Jaeger | 15 | 0.20 | 840,000₽ | 22 | 0.35 | 1,680,000₽ | 33 | 0.50 | 2,580,000₽ |

## Data Sources

- **Trader Information**: https://escapefromtarkov.fandom.com/wiki/Trading
- **Loyalty Levels**: Official game data
- **Items Assortment**: To be populated from game API or wiki

## Notes

- Fence has special loyalty requirements (Reputation 6.0) and dynamic inventory
- Item prices may change with game updates
- Restock times may vary by item type and trader
- Some items may require quest completion to unlock
- Barter trades are not included in this structure (separate system)

## Example Item Entry

```json
{
  "level": 1,
  "requiredLevel": 1,
  "requiredReputation": 0,
  "requiredSales": 0,
  "items": [
    {
      "id": "5449016a4bdc2d6f028b456f",
      "price": 339,
      "currency": "RUB",
      "stock": 200,
      "restock": 3600
    }
  ]
}
```
