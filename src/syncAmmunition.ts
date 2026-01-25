import { readFile, writeFile } from 'fs/promises';
import { createInterface } from 'readline';
import { fetchCaliberList } from './fetchCalibers.js';
import { fetchCaliberAmmoData, parseModifier, parsePercentage } from './fetchAmmoData.js';
import { Ammunition, AmmoDatabase, WikiAmmoRow, CaliberInfo } from './types.js';

const AMMO_FILE = './ammunition.json';

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
 * Loads the current ammunition database
 */
async function loadAmmoDatabase(): Promise<AmmoDatabase> {
  try {
    const data = await readFile(AMMO_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading ammunition.json:', error);
    throw error;
  }
}

/**
 * Saves the ammunition database
 */
async function saveAmmoDatabase(database: AmmoDatabase): Promise<void> {
  const json = JSON.stringify(database, null, 2);
  await writeFile(AMMO_FILE, json, 'utf-8');
  console.log(`✓ Saved to ${AMMO_FILE}`);
}

/**
 * Finds an ammunition entry by name in the database
 */
function findAmmoByName(database: AmmoDatabase, name: string): Ammunition | null {
  for (const ammo of Object.values(database)) {
    if (ammo.name === name || ammo.shortName === name) {
      return ammo;
    }
  }
  return null;
}

/**
 * Converts wiki ammo data to our format
 */
function wikiAmmoToDatabase(wikiAmmo: WikiAmmoRow, caliberId: string, existingAmmo?: Ammunition): Partial<Ammunition> {
  const updates: Partial<Ammunition> = {};
  
  // Update basic info
  if (existingAmmo?.name !== wikiAmmo.name) {
    updates.name = wikiAmmo.name;
  }
  
  // Update caliber if different
  if (existingAmmo?.caliber !== caliberId) {
    updates.caliber = caliberId;
  }
  
  // Update ballistics
  const ballistics = existingAmmo?.ballistics || {} as any;
  let ballisticsChanged = false;
  
  if (wikiAmmo.damage && ballistics.damage !== wikiAmmo.damage) {
    ballistics.damage = wikiAmmo.damage;
    ballisticsChanged = true;
  }
  
  if (wikiAmmo.penetration && ballistics.penetrationPower !== wikiAmmo.penetration) {
    ballistics.penetrationPower = wikiAmmo.penetration;
    ballisticsChanged = true;
  }
  
  if (wikiAmmo.armorDamage && ballistics.armorDamage !== wikiAmmo.armorDamage) {
    ballistics.armorDamage = wikiAmmo.armorDamage;
    ballisticsChanged = true;
  }
  
  if (wikiAmmo.velocity && ballistics.initialSpeed !== wikiAmmo.velocity) {
    ballistics.initialSpeed = wikiAmmo.velocity;
    ballisticsChanged = true;
  }
  
  const fragChance = parsePercentage(wikiAmmo.fragmentation);
  if (fragChance > 0 && ballistics.fragmentationChance !== fragChance) {
    ballistics.fragmentationChance = fragChance;
    ballisticsChanged = true;
  }
  
  const accuracy = parseModifier(wikiAmmo.accuracyModifier);
  if (ballistics.accuracy !== accuracy) {
    ballistics.accuracy = accuracy;
    ballisticsChanged = true;
  }
  
  const recoil = parseModifier(wikiAmmo.recoilModifier);
  if (ballistics.recoil !== recoil) {
    ballistics.recoil = recoil;
    ballisticsChanged = true;
  }
  
  if (ballisticsChanged) {
    updates.ballistics = ballistics;
  }
  
  return updates;
}

/**
 * Displays changes for review
 */
function displayChanges(ammoId: string, existing: Ammunition, updates: Partial<Ammunition>): void {
  console.log(`\n${ammoId} - ${existing.name}:`);
  
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'ballistics') {
      console.log('  Ballistics:');
      for (const [bKey, bValue] of Object.entries(value)) {
        const oldValue = (existing.ballistics as any)[bKey];
        if (oldValue !== bValue) {
          console.log(`    ${bKey}: ${oldValue} → ${bValue}`);
        }
      }
    } else {
      console.log(`  ${key}: ${(existing as any)[key]} → ${value}`);
    }
  }
}

/**
 * Main synchronization function
 */
async function syncAmmunition(): Promise<void> {
  console.log('=== Tarkov Ammunition Wiki Sync ===\n');
  
  // Load current database
  console.log('Loading ammunition.json...');
  const database = await loadAmmoDatabase();
  const totalAmmo = Object.keys(database).length;
  console.log(`✓ Loaded ${totalAmmo} ammunition entries\n`);
  
  // Fetch caliber list
  const calibers = await fetchCaliberList();
  
  if (!await confirm(`\nFound ${calibers.length} calibers. Continue?`)) {
    console.log('Cancelled.');
    return;
  }
  
  const updates: Record<string, Partial<Ammunition>> = {};
  const newAmmo: Array<{wiki: WikiAmmoRow, caliber: CaliberInfo}> = [];
  const wikiAmmoNames: Set<string> = new Set();
  
  // Process each caliber
  for (const caliber of calibers) {
    console.log(`\n--- Processing ${caliber.name} ---`);
    
    try {
      const wikiAmmo = await fetchCaliberAmmoData(caliber);
      
      for (const ammo of wikiAmmo) {
        // Track all wiki ammunition names
        wikiAmmoNames.add(ammo.name);
        
        // Try to find existing ammunition
        const existing = findAmmoByName(database, ammo.name);
        
        if (existing) {
          const changes = wikiAmmoToDatabase(ammo, caliber.caliberId, existing);
          if (Object.keys(changes).length > 0) {
            updates[existing.id] = changes;
            displayChanges(existing.id, existing, changes);
          }
        } else {
          newAmmo.push({wiki: ammo, caliber});
          console.log(`  ⚠ New ammunition found: ${ammo.name}`);
        }
      }
      
      // Small delay to avoid hammering the wiki
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`✗ Error processing ${caliber.name}:`, error);
      if (!await confirm('Continue with other calibers?')) {
        return;
      }
    }
  }
  
  // Find ammunition to delete (in database but not on wiki)
  const toDelete: string[] = [];
  for (const [ammoId, ammo] of Object.entries(database)) {
    if (!wikiAmmoNames.has(ammo.name)) {
      toDelete.push(ammoId);
    }
  }
  
  // Summary
  console.log('\n=== Summary ===');
  console.log(`Updates found: ${Object.keys(updates).length}`);
  console.log(`New ammunition: ${newAmmo.length}`);
  console.log(`To delete (not on wiki): ${toDelete.length}`);
  
  if (newAmmo.length > 0) {
    console.log('\nNew ammunition:');
    newAmmo.forEach(({wiki}) => {
      console.log(`  - ${wiki.name}`);
    });
  }
  
  if (toDelete.length > 0) {
    console.log('\nTo delete:');
    toDelete.forEach(ammoId => {
      console.log(`  - ${database[ammoId].name} (${ammoId})`);
    });
  }
  
  // Confirm updates
  if (Object.keys(updates).length === 0 && toDelete.length === 0 && newAmmo.length === 0) {
    console.log('\n✓ No updates needed. Database is up to date!');
    return;
  }
  
  if (!await confirm('\nApply these updates to ammunition.json?')) {
    console.log('Cancelled. No changes made.');
    return;
  }
  
  // Apply updates
  for (const [ammoId, changes] of Object.entries(updates)) {
    Object.assign(database[ammoId], changes);
  }
  
  // Add new ammunition
  for (const {wiki, caliber} of newAmmo) {
    // Generate a unique ID for the new ammunition
    const newId = `${caliber.caliberId}_${wiki.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    database[newId] = {
      id: newId,
      name: wiki.name,
      shortName: wiki.name.split(' ').pop() || wiki.name,
      weight: 0.012,
      caliber: caliber.caliberId,
      stackMaxSize: 50,
      tracer: false,
      tracerColor: "red",
      ammoType: "bullet",
      projectileCount: 1,
      ballistics: {
        damage: wiki.damage || 0,
        armorDamage: wiki.armorDamage || 0,
        fragmentationChance: parsePercentage(wiki.fragmentation),
        ricochetChance: 0.1,
        penetrationChance: 0.2,
        penetrationPower: wiki.penetration || 0,
        accuracy: parseModifier(wiki.accuracyModifier),
        recoil: parseModifier(wiki.recoilModifier),
        initialSpeed: wiki.velocity || 0,
        lightBleedingDelta: 0,
        heavyBleedingDelta: 0,
        durabilityBurnFactor: 0,
        heatFactor: 0
      }
    };
    console.log(`  ✓ Added new ammunition: ${wiki.name} (${newId})`);
  }
  
  // Delete ammunition not on wiki
  for (const ammoId of toDelete) {
    delete database[ammoId];
  }
  
  // Save
  await saveAmmoDatabase(database);
  console.log('\n✓ Synchronization complete!');
  if (newAmmo.length > 0) {
    console.log(`✓ Added ${newAmmo.length} new ammunition entries`);
  }
  if (toDelete.length > 0) {
    console.log(`✓ Deleted ${toDelete.length} ammunition entries`);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncAmmunition()
    .catch(error => {
      console.error('\n✗ Fatal error:', error);
      process.exit(1);
    });
}
