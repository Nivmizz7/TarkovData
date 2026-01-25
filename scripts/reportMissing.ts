import { readFile } from 'fs/promises';
import { fetchCaliberList } from './fetchCalibers.js';
import { fetchCaliberAmmoData } from './fetchAmmoData.js';
import { AmmoDatabase, CaliberInfo } from './types.js';

const AMMO_FILE = './data/ammunition.json';

interface AmmoStats {
  totalInFile: number;
  totalOnWiki: number;
  missingFromFile: string[];
  calibersInFile: Set<string>;
  calibersOnWiki: Set<string>;
  missingCalibers: string[];
  emptyEntries: number;
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
 * Analyzes what's missing between the file and wiki
 */
async function reportMissing(): Promise<void> {
  console.log('=== Tarkov Ammunition - Missing Data Report ===\n');
  
  // Load current database
  console.log('Loading ammunition.json...');
  const database = await loadAmmoDatabase();
  
  const stats: AmmoStats = {
    totalInFile: Object.keys(database).length,
    totalOnWiki: 0,
    missingFromFile: [],
    calibersInFile: new Set(),
    calibersOnWiki: new Set(),
    missingCalibers: [],
    emptyEntries: 0
  };
  
  // Analyze current file
  for (const [id, ammo] of Object.entries(database)) {
    if (ammo.caliber) {
      stats.calibersInFile.add(ammo.caliber);
    }
    
    // Check if entry is empty (missing name or ballistics)
    if (!ammo.name || !ammo.ballistics) {
      stats.emptyEntries++;
    }
  }
  
  console.log(`Loaded ${stats.totalInFile} entries`);
  console.log(`Found ${stats.calibersInFile.size} different calibers in file`);
  console.log(`Warning: Found ${stats.emptyEntries} empty/incomplete entries\n`);
  
  // Fetch calibers from wiki
  console.log('Fetching calibers from wiki...');
  const wikiCalibers = await fetchCaliberList();
  console.log(`Found ${wikiCalibers.length} calibers on wiki\n`);
  
  // Track all wiki ammo
  const wikiAmmoNames = new Set<string>();
  const fileAmmoNames = new Set<string>();
  
  // Collect all ammo names from file
  for (const ammo of Object.values(database)) {
    if (ammo.name) {
      fileAmmoNames.add(ammo.name);
    }
  }
  
  // Process each caliber
  console.log('Analyzing each caliber...\n');
  
  for (const caliber of wikiCalibers) {
    stats.calibersOnWiki.add(caliber.caliberId);
    
    try {
      const wikiAmmo = await fetchCaliberAmmoData(caliber);
      stats.totalOnWiki += wikiAmmo.length;
      
      const missingInCaliber: string[] = [];
      
      for (const ammo of wikiAmmo) {
        wikiAmmoNames.add(ammo.name);
        
        if (!fileAmmoNames.has(ammo.name)) {
          missingInCaliber.push(ammo.name);
          stats.missingFromFile.push(ammo.name);
        }
      }
      
      if (missingInCaliber.length > 0) {
        console.log(`📦 ${caliber.name} (${caliber.caliberId})`);
        console.log(`   Wiki: ${wikiAmmo.length} munitions`);
        console.log(`   Manquantes: ${missingInCaliber.length}`);
        missingInCaliber.forEach(name => console.log(`     ❌ ${name}`));
        console.log();
      } else {
        console.log(`${caliber.name} - Complete (${wikiAmmo.length} ammunition types)`);
      }
      
      // Small delay to avoid hammering the wiki
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Error processing ${caliber.name}:`, error);
    }
  }
  
  // Find missing calibers
  for (const wikiCaliber of stats.calibersOnWiki) {
    if (!stats.calibersInFile.has(wikiCaliber)) {
      stats.missingCalibers.push(wikiCaliber);
    }
  }
  
  // Final summary
  console.log('\n=== RÉSUMÉ ===');
  console.log(`\nCalibers:`);
  console.log(`  Dans le fichier: ${stats.calibersInFile.size}`);
  console.log(`  Sur le wiki: ${stats.calibersOnWiki.size}`);
  
  if (stats.missingCalibers.length > 0) {
    console.log(`  Missing calibers: ${stats.missingCalibers.length}`);
    stats.missingCalibers.forEach(cal => console.log(`    - ${cal}`));
  }
  
  console.log(`\nMunitions:`);
  console.log(`  Dans le fichier: ${stats.totalInFile} entrées`);
  console.log(`  Avec données: ${stats.totalInFile - stats.emptyEntries}`);
  console.log(`  Vides/incomplètes: ${stats.emptyEntries}`);
  console.log(`  Sur le wiki: ${stats.totalOnWiki}`);
  console.log(`  Manquantes: ${stats.missingFromFile.length}`);
  
  if (stats.missingFromFile.length > 0) {
    console.log(`\nMunitions manquantes dans le fichier:`);
    const byFirst10 = stats.missingFromFile.slice(0, 10);
    byFirst10.forEach(name => console.log(`  - ${name}`));
    if (stats.missingFromFile.length > 10) {
      console.log(`  ... et ${stats.missingFromFile.length - 10} autres`);
    }
  }
  
  console.log('\nReport completed!');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  reportMissing()
    .catch(error => {
      console.error('\nFatal error:', error);
      process.exit(1);
    });
}
