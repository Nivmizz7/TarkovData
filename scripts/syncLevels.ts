import { readFile, writeFile } from 'fs/promises';
import { createInterface } from 'readline';
import { fetchLevelData, LevelData } from './fetchLevels.js';

const LEVELS_FILE = './data/levels.json';

interface LevelEntry {
  exp: number;
  total: number;
  group: string;
}

type LevelsDatabase = Record<string, LevelEntry>;

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
 * Loads the current levels database
 */
async function loadLevelsDatabase(): Promise<LevelsDatabase> {
  try {
    const data = await readFile(LEVELS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading levels.json:', error);
    throw error;
  }
}

/**
 * Saves the levels database
 */
async function saveLevelsDatabase(database: LevelsDatabase): Promise<void> {
  const json = JSON.stringify(database, null, 4);
  await writeFile(LEVELS_FILE, json, 'utf-8');
  console.log(`Saved to ${LEVELS_FILE}`);
}

/**
 * Converts wiki level data to database format
 */
function levelDataToDatabase(levels: LevelData[]): LevelsDatabase {
  const database: LevelsDatabase = {};
  
  for (const level of levels) {
    database[level.level.toString()] = {
      exp: level.exp,
      total: level.total,
      group: level.group
    };
  }
  
  return database;
}

/**
 * Compares two databases and reports differences
 */
function compareDatabases(current: LevelsDatabase, updated: LevelsDatabase): {
  hasChanges: boolean;
  added: string[];
  modified: string[];
  removed: string[];
} {
  const added: string[] = [];
  const modified: string[] = [];
  const removed: string[] = [];
  
  // Check for added and modified levels
  for (const [level, data] of Object.entries(updated)) {
    if (!current[level]) {
      added.push(level);
    } else {
      const currentData = current[level];
      if (
        currentData.exp !== data.exp ||
        currentData.total !== data.total ||
        currentData.group !== data.group
      ) {
        modified.push(level);
      }
    }
  }
  
  // Check for removed levels
  for (const level of Object.keys(current)) {
    if (!updated[level]) {
      removed.push(level);
    }
  }
  
  const hasChanges = added.length > 0 || modified.length > 0 || removed.length > 0;
  
  return { hasChanges, added, modified, removed };
}

/**
 * Displays the differences between databases
 */
function displayChanges(
  current: LevelsDatabase,
  updated: LevelsDatabase,
  changes: ReturnType<typeof compareDatabases>
): void {
  console.log('\n=== Changes Summary ===\n');
  
  if (changes.added.length > 0) {
    console.log(`\nAdded levels (${changes.added.length}):`);
    changes.added.forEach(level => {
      const data = updated[level];
      console.log(`  Level ${level}: exp=${data.exp}, total=${data.total}, group=${data.group}`);
    });
  }
  
  if (changes.modified.length > 0) {
    console.log(`\nModified levels (${changes.modified.length}):`);
    changes.modified.forEach(level => {
      const oldData = current[level];
      const newData = updated[level];
      console.log(`  Level ${level}:`);
      
      if (oldData.exp !== newData.exp) {
        console.log(`    exp: ${oldData.exp} → ${newData.exp}`);
      }
      if (oldData.total !== newData.total) {
        console.log(`    total: ${oldData.total} → ${newData.total}`);
      }
      if (oldData.group !== newData.group) {
        console.log(`    group: ${oldData.group} → ${newData.group}`);
      }
    });
  }
  
  if (changes.removed.length > 0) {
    console.log(`\nRemoved levels (${changes.removed.length}):`);
    changes.removed.forEach(level => {
      const data = current[level];
      console.log(`  Level ${level}: exp=${data.exp}, total=${data.total}, group=${data.group}`);
    });
  }
  
  if (!changes.hasChanges) {
    console.log('No changes detected. Database is up to date!');
  }
}

/**
 * Main synchronization function
 */
async function main() {
  console.log('=== Tarkov Levels Synchronization ===\n');
  
  try {
    // Fetch data from wiki
    const wikiLevels = await fetchLevelData();
    
    if (wikiLevels.length === 0) {
      console.error('No level data found on wiki!');
      process.exit(1);
    }
    
    console.log(`\nFetched ${wikiLevels.length} levels from wiki`);
    
    // Load current database
    const currentDatabase = await loadLevelsDatabase();
    console.log(`Loaded ${Object.keys(currentDatabase).length} levels from database`);
    
    // Convert wiki data to database format
    const updatedDatabase = levelDataToDatabase(wikiLevels);
    
    // Compare databases
    const changes = compareDatabases(currentDatabase, updatedDatabase);
    
    // Display changes
    displayChanges(currentDatabase, updatedDatabase, changes);
    
    // Ask for confirmation if there are changes
    if (changes.hasChanges) {
      console.log('\n');
      const shouldUpdate = await confirm('Do you want to apply these changes?');
      
      if (shouldUpdate) {
        await saveLevelsDatabase(updatedDatabase);
        console.log('\n✓ Database updated successfully!');
      } else {
        console.log('\n✗ Update cancelled.');
      }
    }
    
  } catch (error) {
    console.error('\n✗ Synchronization failed:', error);
    process.exit(1);
  }
}

// Run the main function
main();
