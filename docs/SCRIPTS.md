# Maintenance Scripts

This directory contains TypeScript scripts for maintaining and synchronizing game data with the Escape From Tarkov wiki.

## Prerequisites

- Node.js (v16 or higher)
- npm packages installed (`npm install`)

## Scripts

### Ammunition Scripts

#### syncAmmunition.ts
Synchronizes ammunition data from the wiki with the local database.

```bash
npm run sync:ammo
```

**Process:**
1. Loads current ammunition.json
2. Fetches caliber list from wiki
3. Fetches ammunition data for each caliber
4. Compares with local data
5. Displays changes and requests confirmation
6. Updates ammunition.json with approved changes

**Features:**
- Detects new ammunition types
- Updates ballistics data
- Reports missing entries
- Interactive confirmation before applying changes

#### fetchCalibers.ts
Fetches the list of ammunition calibers from the wiki.

```bash
npm run fetch:calibers
```

Returns a list of all calibers with their wiki URLs.

#### fetchAmmoData.ts
Fetches ammunition data for testing purposes.

```bash
npm run fetch:ammo
```

Useful for debugging the wiki parsing logic without modifying local data.

#### reportMissing.ts
Reports ammunition entries that exist in the database but are missing from the wiki.

```bash
npm run report:missing
```

Helps identify outdated or removed ammunition types.

## Script Architecture

### Data Flow

```
Wiki (HTML) -> Parser -> Comparison -> User Approval -> JSON Update
```

### Type Definitions

All scripts use TypeScript interfaces defined in `types.ts`:

- `Ammunition` - Local database ammunition format
- `WikiAmmoRow` - Parsed wiki ammunition data
- `CaliberInfo` - Caliber metadata
- `Ballistics` - Ballistics properties

### Wiki Parsing

The scripts use `cheerio` for HTML parsing:
- Extracts data from wiki tables
- Handles various table formats
- Parses modifiers and percentages
- Cleans and validates data

### Error Handling

- Network errors are caught and reported
- Invalid data is skipped with warnings
- User can cancel operations at any time
- Changes are atomic (all or nothing)

## Development

### Adding New Scripts

1. Create a new TypeScript file in `scripts/`
2. Add types to `types.ts` if needed
3. Add npm script to `package.json`
4. Document in this file

### Testing Scripts

Run scripts in test mode by modifying the source to skip the confirmation step:

```typescript
if (!await confirm('Apply changes?')) {
  // Change to: if (true) {
```

### Code Style

- Use async/await for asynchronous operations
- Add descriptive console output
- Include error handling
- Request user confirmation for destructive operations
- Use TypeScript strict mode

## File Paths

All scripts expect to be run from the repository root:

```
tarkovdata/
├── data/
│   └── ammunition.json    # Data files
└── scripts/
    └── *.ts               # Scripts run from root
```

Paths in scripts are relative to the repository root:
- `'./data/ammunition.json'`

## Common Issues

### Module Not Found
Ensure you run scripts from the repository root:
```bash
npm run sync:ammo  # Correct
cd scripts && tsx syncAmmunition.ts  # Wrong
```

### Network Errors
Wiki fetching may fail due to:
- Rate limiting (wait between requests)
- Connection issues (check internet)
- Wiki structure changes (update parsers)

### Type Errors
If TypeScript complains about types:
```bash
npm install --save-dev @types/node
```

## Future Enhancements

Planned improvements:
- Hideout data synchronization scripts
- Quest data validation
- Automated testing
- CI/CD integration
- Schema validation
