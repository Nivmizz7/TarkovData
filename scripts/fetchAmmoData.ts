import * as cheerio from 'cheerio';
import { WikiAmmoRow, CaliberInfo } from './types.js';

/**
 * Fetches ammunition data for a specific caliber from the wiki
 * Improved version with better HTML parsing
 */
export async function fetchCaliberAmmoData(caliber: CaliberInfo): Promise<WikiAmmoRow[]> {
  console.log(`Fetching ammunition data for ${caliber.name}...`);
  
  const response = await fetch(caliber.wikiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${caliber.name}: ${response.statusText}`);
  }
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const ammoData: WikiAmmoRow[] = [];
  
  // The first table usually contains the ammunition data
  const firstTable = $('table').first();
  
  if (!firstTable.length) {
    console.log('  Warning: No table found on page');
    return ammoData;
  }
  
  const rows = firstTable.find('tr');
  
  // Skip the header row (first row)
  rows.slice(1).each((_, row) => {
    const $row = $(row);
    
    try {
      // Wiki structure: First 2 columns are TH (icon, name), rest are TD (stats)
      const thCells = $row.find('th');
      const tdCells = $row.find('td');
      
      // Need at least name TH and damage TD
      if (thCells.length < 2 || tdCells.length < 1) {
        return;
      }
      
      // TH[0]: Icon with link
      // TH[1]: Name with link
      const nameCell = $(thCells[1]);
      const nameLink = nameCell.find('a').first();
      const name = nameLink.text().trim() || nameCell.text().trim();
      
      // Skip if name is empty
      if (!name || name.length < 3) {
        return;
      }
      
      // TD[0]: Damage
      const damageText = $(tdCells[0]).text().trim();
      const damageClean = damageText.replace(/\s*\([^)]*\)/g, '').trim();
      const damage = parseInt(damageClean) || 0;
      
      // Skip if no valid damage
      if (damage === 0 || damage > 300) {
        return;
      }
      
      // TD[1]: Penetration Power
      const penetration = tdCells.length > 1 ? parseInt($(tdCells[1]).text().trim()) || 0 : 0;
      
      // TD[2]: Armor Damage %
      const armorDamage = tdCells.length > 2 ? parseInt($(tdCells[2]).text().trim()) || 0 : 0;
      
      // TD[3]: Accuracy %
      const accuracyModifier = tdCells.length > 3 ? $(tdCells[3]).text().trim() : '';
      
      // TD[4]: Recoil
      const recoilModifier = tdCells.length > 4 ? $(tdCells[4]).text().trim() : '';
      
      // TD[5]: LightBleed %
      const lightBleedModifier = tdCells.length > 5 ? $(tdCells[5]).text().trim() : '';
      
      // TD[6]: HeavyBleed %
      const heavyBleedModifier = tdCells.length > 6 ? $(tdCells[6]).text().trim() : '';
      
      // TD[7]: Durability burn % (we'll use this as fragmentation placeholder)
      const fragmentation = tdCells.length > 7 ? $(tdCells[7]).text().trim() : '';
      
      // TD[9]: ProjectileSpeed (m/s)
      const velocity = tdCells.length > 9 ? parseInt($(tdCells[9]).text().trim()) || 0 : 0;
      
      // TD[10]: Source/Traders
      const traders = tdCells.length > 10 ? $(tdCells[10]).text().trim() : '';
      
      // Get icon from first TH
      const icon = $(thCells[0]).find('img').attr('alt') || '';
      
      ammoData.push({
        icon,
        name,
        damage,
        penetration,
        armorDamage,
        fragmentation,
        accuracyModifier,
        recoilModifier,
        lightBleedModifier,
        heavyBleedModifier,
        velocity,
        traders
      });
      
    } catch (error) {
      // Skip problematic rows silently
    }
  });
  
  console.log(`  Found ${ammoData.length} ammunition types`);
  return ammoData;
}

/**
 * Parses modifier strings like "+10", "-5", "" to numbers
 */
export function parseModifier(modifier: string): number {
  if (!modifier || modifier === '—' || modifier === '-') {
    return 0;
  }
  
  const cleaned = modifier.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Parses percentage strings like "20%" to decimal (0.20)
 */
export function parsePercentage(percentage: string): number {
  if (!percentage || percentage === '—' || percentage === '-') {
    return 0;
  }
  
  const cleaned = percentage.replace('%', '').trim();
  const value = parseFloat(cleaned);
  return isNaN(value) ? 0 : value / 100;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testCaliber: CaliberInfo = {
    name: '9.3x64mm',
    wikiUrl: 'https://escapefromtarkov.fandom.com/wiki/9.3x64mm',
    caliberId: 'Caliber93x64'
  };
  
  fetchCaliberAmmoData(testCaliber)
    .then(ammoData => {
      console.log('\nAmmunition data:');
      ammoData.forEach(ammo => {
        console.log(`  ${ammo.name}: DMG=${ammo.damage}, PEN=${ammo.penetration}, VEL=${ammo.velocity}`);
      });
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
