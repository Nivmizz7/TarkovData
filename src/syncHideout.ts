import { readFile, writeFile } from 'fs/promises';
import { createInterface } from 'readline';
import { fetchHideoutStations, fetchHideoutModules } from './fetchHideoutData.js';
import { HideoutDatabase, WikiHideoutStation, WikiHideoutModule, HideoutStation, HideoutModule } from './types.js';

const HIDEOUT_FILE = './hideout.json';

/**
 * Prompts the user for confirmation
 */
async function confirm(question: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Loads the current hideout database
 */
async function loadHideoutDatabase(): Promise<HideoutDatabase> {
  try {
    const data = await readFile(HIDEOUT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading hideout.json:', error);
    throw error;
  }
}

/**
 * Saves the hideout database
 */
async function saveHideoutDatabase(database: HideoutDatabase): Promise<void> {
  const json = JSON.stringify(database, null, 4);
  await writeFile(HIDEOUT_FILE, json, 'utf-8');
  console.log(`✓ Saved to ${HIDEOUT_FILE}`);
}

/**
 * Finds a hideout station by name in the database (case-insensitive)
 */
function findStationByName(database: HideoutDatabase, name: string): HideoutStation | null {
  const nameLower = name.toLowerCase();
  for (const station of database.stations) {
    if (station.locales.en.toLowerCase() === nameLower) {
      return station;
    }
  }
  return null;
}

/**
 * Finds a hideout module by name and level in the database (case-insensitive)
 */
function findModuleByNameAndLevel(database: HideoutDatabase, name: string, level: number): HideoutModule | null {
  const nameLower = name.toLowerCase();
  for (const module of database.modules) {
    if (module.module.toLowerCase() === nameLower && module.level === level) {
      return module;
    }
  }
  return null;
}

/**
 * Converts wiki station data to our format
 */
function wikiStationToDatabase(wikiStation: WikiHideoutStation, existingStation?: HideoutStation): Partial<HideoutStation> {
  const updates: Partial<HideoutStation> = {};
  
  // Check if name changed
  if (existingStation?.locales.en !== wikiStation.name) {
    updates.locales = { en: wikiStation.name };
  }
  
  // Check if function changed
  if (existingStation?.function !== wikiStation.function && wikiStation.function) {
    updates.function = wikiStation.function;
  }
  
  return updates;
}

/**
 * Converts wiki module data to our format
 */
function wikiModuleToDatabase(wikiModule: WikiHideoutModule, existingModule?: HideoutModule): Partial<HideoutModule> {
  const updates: Partial<HideoutModule> = {};
  
  // Compare requirements
  if (wikiModule.requirements && existingModule) {
    const reqsChanged = JSON.stringify(existingModule.require) !== JSON.stringify(wikiModule.requirements);
    if (reqsChanged) {
      updates.require = wikiModule.requirements;
    }
  }
  
  return updates;
}

/**
 * Displays changes for review
 */
function displayStationChanges(station: HideoutStation, updates: Partial<HideoutStation>): void {
  console.log(`\nStation ${station.id} - ${station.locales.en}:`);
  
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'locales') {
      console.log(`  name: ${station.locales.en} → ${(value as any).en}`);
    } else {
      console.log(`  ${key}: ${(station as any)[key]} → ${value}`);
    }
  }
}

/**
 * Displays module changes for review
 */
function displayModuleChanges(module: HideoutModule, updates: Partial<HideoutModule>): void {
  console.log(`\n${module.module} Level ${module.level}:`);
  
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'require') {
      console.log('  Requirements updated');
    } else {
      console.log(`  ${key}: ${(module as any)[key]} → ${value}`);
    }
  }
}

/**
 * Main synchronization function
 */
async function syncHideout(): Promise<void> {
  console.log('=== Tarkov Hideout Wiki Sync ===\n');
  
  // Load current database
  console.log('Loading hideout.json...');
  const database = await loadHideoutDatabase();
  const totalStations = database.stations.length;
  const totalModules = database.modules.length;
  console.log(`✓ Loaded ${totalStations} stations and ${totalModules} modules\n`);
  
  // Fetch wiki data
  console.log('Fetching data from wiki...');
  const [wikiStations, wikiModules] = await Promise.all([
    fetchHideoutStations(),
    fetchHideoutModules()
  ]);
  
  console.log(`✓ Found ${wikiStations.length} stations and ${wikiModules.length} modules on wiki\n`);
  
  if (!await confirm('Continue with synchronization?')) {
    console.log('Cancelled.');
    return;
  }
  
  const stationUpdates: Array<{ station: HideoutStation, changes: Partial<HideoutStation> }> = [];
  const moduleUpdates: Array<{ module: HideoutModule, changes: Partial<HideoutModule> }> = [];
  const newStations: WikiHideoutStation[] = [];
  const newModules: WikiHideoutModule[] = [];
  
  // Process stations
  console.log('\n--- Processing Stations ---');
  for (const wikiStation of wikiStations) {
    const existing = findStationByName(database, wikiStation.name);
    
    if (existing) {
      const changes = wikiStationToDatabase(wikiStation, existing);
      if (Object.keys(changes).length > 0) {
        stationUpdates.push({ station: existing, changes });
        displayStationChanges(existing, changes);
      }
    } else {
      newStations.push(wikiStation);
      console.log(`  ⚠ New station found: ${wikiStation.name}`);
    }
  }
  
  // Process modules
  console.log('\n--- Processing Modules ---');
  for (const wikiModule of wikiModules) {
    const existing = findModuleByNameAndLevel(database, wikiModule.name, wikiModule.level);
    
    if (existing) {
      // For now, just report if requirements count differs
      const existingReqCount = existing.require?.length || 0;
      const wikiReqCount = wikiModule.requirements?.length || 0;
      
      if (existingReqCount !== wikiReqCount) {
        console.log(`  ℹ ${wikiModule.name} Level ${wikiModule.level}: ${existingReqCount} vs ${wikiReqCount} requirements`);
      }
      
      // We can't easily compare requirements without item ID mapping
      // So for now we just note differences
    } else {
      newModules.push(wikiModule);
      console.log(`  ⚠ New module found: ${wikiModule.name} Level ${wikiModule.level}`);
    }
  }
  
  // Report modules in database but not on wiki.toLowerCase()}-${m.level}`));
  const missingModules: HideoutModule[] = [];
  
  for (const module of database.modules) {
    const key = `${module.module.toLowerCase()modules) {
    const key = `${module.module}-${module.level}`;
    if (!wikiModuleKeys.has(key)) {
      missingModules.push(module);
    }
  }
  
  if (missingModules.length > 0) {
    console.log('\n--- Modules in database but not on wiki ---');
    missingModules.forEach(m => {
      console.log(`  - ${m.module} Level ${m.level}`);
    });
  }
  
  // Summary
  console.log('\n=== Summary ===');
  console.log(`Station updates: ${stationUpdates.length}`);
  console.log(`New stations: ${newStations.length}`);
  console.log(`New modules: ${newModules.length}`);
  console.log(`Modules in DB but not on wiki: ${missingModules.length}`);
  
  if (newStations.length > 0) {
    console.log('\nNew stations:');
    newStations.forEach(station => {
      console.log(`  - ${station.name}`);
    });
  }
  
  if (newModules.length > 0) {
    console.log('\nNew modules:');
    newModules.forEach(module => {
      console.log(`  - ${module.name} Level ${module.level}`);
    });
  }
  
  // Check if any updates needed
  if (stationUpdates.length === 0 && newStations.length === 0 && newModules.length === 0) {
    console.log('\n✓ No critical updates needed.');
    console.log('Note: Module requirements use item IDs in the database but item names on the wiki.');
    console.log('To update requirements, manual mapping is required.');
    return;
  }
  
  if (!await confirm('\nApply these updates to hideout.json?')) {
    console.log('Cancelled. No changes made.');
    return;
  }
  
  // Apply station updates
  for (const { station, changes } of stationUpdates) {
    Object.assign(station, changes);
  }
  
  // Add new stations
  for (const wikiStation of newStations) {
    const newId = Math.max(...database.stations.map(s => s.id)) + 1;
    database.stations.push({
      id: newId,
      locales: { en: wikiStation.name },
      function: wikiStation.function || '',
      imgSource: `/img/${wikiStation.name.replace(/\s+/g, '_')}_Portrait.png`,
      disabled: false
    });
    console.log(`  ✓ Added new station: ${wikiStation.name} (ID: ${newId})`);
  }
  
  // Add new modules (with placeholder requirements)
  for (const wikiModule of newModules) {
    database.modules.push({
      module: wikiModule.name,
      level: wikiModule.level,
      require: [] // Empty for now - needs manual item ID mapping
    });
    console.log(`  ✓ Added new module: ${wikiModule.name} Level ${wikiModule.level}`);
    console.log(`     ⚠ Requirements need manual mapping from item names to IDs`);
  }
  
  // Save
  await saveHideoutDatabase(database);
  console.log('\n✓ Synchronization complete!');
  
  if (newStations.length > 0) {
    console.log(`✓ Added ${newStations.length} new stations`);
  }
  if (newModules.length > 0) {
    console.log(`✓ Added ${newModules.length} new modules (requirements need manual review)`);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncHideout()
    .catch(error => {
      console.error('\n✗ Fatal error:', error);
      process.exit(1);
    });
}
