import * as cheerio from 'cheerio';
import { WikiHideoutStation, WikiHideoutModule } from './types.js';

/**
 * List of all hideout stations (from the current hideout.json)
 */
const HIDEOUT_STATIONS = [
  'Air Filtering Unit',
  'Bitcoin farm',
  'Booze generator',
  'Cultist Circle',
  'Defective Wall',
  'Gear Rack',
  'Generator',
  'Gym',
  'Hall of Fame',
  'Heating',
  'Illumination',
  'Intelligence Center',
  'Lavatory',
  'Library',
  'Medstation',
  'Nutrition Unit',
  'Rest Space',
  'Scav Case',
  'Security',
  'Shooting range',
  'Solar power',
  'Stash',
  'Vents',
  'Water collector',
  'Weapon Rack',
  'Workbench',
  'Christmas Tree'
];

/**
 * Fetches hideout stations data from the wiki
 */
export async function fetchHideoutStations(): Promise<WikiHideoutStation[]> {
  console.log('Fetching hideout stations from wiki...');
  
  const wikiUrl = 'https://escapefromtarkov.fandom.com/wiki/Hideout';
  const response = await fetch(wikiUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch hideout data: ${response.statusText}`);
  }
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const stations: WikiHideoutStation[] = [];
  
  // The wiki page shows all modules as section headers with tables for each level
  // We'll extract stations from the module sections
  HIDEOUT_STATIONS.forEach(stationName => {
    // Check if the station name exists in the page content
    const content = $.text();
    if (content.includes(stationName)) {
      stations.push({
        name: stationName,
        function: '',
        imgSource: ''
      });
    }
  });
  
  console.log(`  Found ${stations.length} hideout stations`);
  return stations;
}

/**
 * Fetches hideout module upgrade requirements from the wiki
 */
export async function fetchHideoutModules(): Promise<WikiHideoutModule[]> {
  console.log('Fetching hideout module upgrades from wiki...');
  
  const wikiUrl = 'https://escapefromtarkov.fandom.com/wiki/Hideout';
  const response = await fetch(wikiUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch hideout data: ${response.statusText}`);
  }
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const modules: WikiHideoutModule[] = [];
  
  // Find all tables on the page
  const tables = $('table');
  
  tables.each((_, table) => {
    const $table = $(table);
    
    // Check if this table has Level, Requirements headers
    // The hideout tables have a special structure with the station name in first row
    const firstRow = $table.find('tr').first();
    const firstRowText = firstRow.text().trim();
    
    // Check if first row contains a station name
    let stationName = '';
    for (const station of HIDEOUT_STATIONS) {
      if (firstRowText.includes(station)) {
        stationName = station;
        break;
      }
    }
    
    if (!stationName) {
      return; // Skip tables that don't have a station name in first row
    }
    
    // Verify this is a hideout upgrade table by checking for Level/Requirements headers
    const secondRow = $table.find('tr').eq(1);
    const headers: string[] = [];
    secondRow.find('th').each((_, th) => {
      headers.push($(th).text().trim().toLowerCase());
    });
    
    const hasLevelHeader = headers.some(h => h === 'level');
    const hasRequirementsHeader = headers.some(h => h.includes('requirement'));
    
    if (!hasLevelHeader || !hasRequirementsHeader) {
      return; // Skip this table
    }
    
    // Parse data rows (skip first 2 rows: station name + headers)
    const rows = $table.find('tr');
    
    rows.each((index, row) => {
      if (index <= 1) return; // Skip station name row and header row
      
      const $row = $(row);
      
      // Try to get Level from TH or TD
      const levelCell = $row.find('th').first();
      const levelText = levelCell.text().trim();
      const level = parseInt(levelText);
      
      if (isNaN(level) || level < 1) {
        return;
      }
      
      // Get all TD cells for requirements, function, time
      const cells = $row.find('td');
      
      if (cells.length < 1) {
        return; // Skip if no data cells
      }
      
      // Column 0 (TD): Requirements
      const requirementsCell = $(cells[0]);
      const requirements = parseRequirements(requirementsCell, $);
      
      // Column 1 (TD): Function/bonuses (optional)
      const bonuses = cells.length > 1 ? $(cells[1]).text().trim() : '';
      
      // Column 2 (TD): Construction time (optional)
      const constructionTime = cells.length > 2 ? $(cells[2]).text().trim() : '';
      
      modules.push({
        name: stationName,
        level: level,
        requirements: requirements,
        bonuses: bonuses,
        constructionTime: constructionTime
      });
    });
  });
  
  console.log(`  Found ${modules.length} hideout module upgrades`);
  return modules;
}

/**
 * Parse requirements from a table cell
 */
function parseRequirements($cell: cheerio.Cheerio, $: cheerio.CheerioAPI): any[] {
  const requirements: any[] = [];
  
  // Get all text from the cell
  const fullText = $cell.text();
  
  // Split by newlines to get individual requirements
  const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  for (const line of lines) {
    // Skip empty lines
    if (!line) continue;
    
    // Remove "found in raid" suffix
    const cleaned = line.replace(/\s*found in raid\s*/gi, '').trim();
    if (!cleaned) continue;
    
    // Module requirement pattern: "Level 3 Generator"
    const moduleMatch = cleaned.match(/^Level\s+(\d+)\s+(.+)/i);
    if (moduleMatch) {
      requirements.push({
        type: 'module',
        name: moduleMatch[2].trim(),
        quantity: parseInt(moduleMatch[1]),
        id: 0
      });
      continue;
    }
    
    // Trader requirement pattern: "Skier LL3" or "Therapist Loyalty Level 2"
    const traderMatch = cleaned.match(/^(.+?)\s+(?:LL|Loyalty Level)\s*(\d+)/i);
    if (traderMatch) {
      requirements.push({
        type: 'trader',
        name: traderMatch[1].trim(),
        quantity: parseInt(traderMatch[2]),
        id: 0
      });
      continue;
    }
    
    // Skill requirement pattern: "Vents Level 15"
    const skillMatch = cleaned.match(/^(.+?)\s+Level\s+(\d+)/i);
    if (skillMatch && !skillMatch[1].includes('LL')) {
      const skillName = skillMatch[1].trim();
      // Check if it's a known skill (not a module)
      if (!HIDEOUT_STATIONS.includes(skillName)) {
        requirements.push({
          type: 'skill',
          name: skillName,
          quantity: parseInt(skillMatch[2]),
          id: 0
        });
        continue;
      }
    }
    
    // Item requirement pattern: "25,000 Dollars" or "5 Gas mask air filter"
    const itemMatch = cleaned.match(/^([\d,]+)\s+(.+)/);
    if (itemMatch) {
      const quantity = parseInt(itemMatch[1].replace(/,/g, ''));
      const itemName = itemMatch[2].trim();
      
      requirements.push({
        type: 'item',
        name: itemName,
        quantity: quantity,
        id: 0
      });
      continue;
    }
  }
  
  return requirements;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  Promise.all([
    fetchHideoutStations(),
    fetchHideoutModules()
  ])
    .then(([stations, modules]) => {
      console.log('\nHideout Stations:');
      stations.forEach(station => {
        console.log(`  ${station.name}`);
      });
      
      console.log('\nHideout Modules:');
      modules.forEach(module => {
        console.log(`  ${module.name} Level ${module.level}`);
      });
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
