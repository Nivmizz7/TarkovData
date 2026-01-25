import * as cheerio from 'cheerio';
import { CaliberInfo } from './types.js';

const WIKI_BASE_URL = 'https://escapefromtarkov.fandom.com';
const AMMUNITION_PAGE = `${WIKI_BASE_URL}/wiki/Ammunition`;

/**
 * Fetches the list of all calibers from the wiki ammunition page
 */
export async function fetchCaliberList(): Promise<CaliberInfo[]> {
  console.log('Fetching caliber list from wiki...');
  
  const response = await fetch(AMMUNITION_PAGE);
  if (!response.ok) {
    throw new Error(`Failed to fetch ammunition page: ${response.statusText}`);
  }
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const calibers: CaliberInfo[] = [];
  
  // Find all tables with caliber information
  $('table tr').each((_, row) => {
    const $row = $(row);
    const cells = $row.find('td');
    
    if (cells.length >= 2) {
      const firstCell = $(cells[0]);
      const secondCell = $(cells[1]);
      
      // Look for caliber links in the second cell
      const link = secondCell.find('a').first();
      if (link.length > 0) {
        const href = link.attr('href');
        const caliberName = link.text().trim();
        
        if (href && caliberName && !href.includes('redlink') && href.startsWith('/wiki/')) {
          const wikiUrl = `${WIKI_BASE_URL}${href}`;
          
          // Extract caliber ID from the first cell or use a normalized version
          const caliberId = normalizeCaliber(caliberName);
          
          calibers.push({
            name: caliberName,
            wikiUrl,
            caliberId
          });
        }
      }
    }
  });
  
  // Remove duplicates
  const uniqueCalibers = calibers.filter((caliber, index, self) =>
    index === self.findIndex((c) => c.caliberId === caliber.caliberId)
  );
  
  console.log(`Found ${uniqueCalibers.length} calibers`);
  return uniqueCalibers;
}

/**
 * Normalizes caliber names to match the format used in ammunition.json
 */
function normalizeCaliber(caliberName: string): string {
  const mapping: Record<string, string> = {
    '7.62x25mm Tokarev': 'Caliber762x25TT',
    '9x18mm Makarov': 'Caliber9x18PM',
    '9x19mm Parabellum': 'Caliber9x19PARA',
    '9x21mm Gyurza': 'Caliber9x21',
    '.357 Magnum': 'Caliber9x33R',
    '.45 ACP': 'Caliber1143x23ACP',
    '.50 Action Express': 'Caliber50AE',
    '20x1mm': 'Caliber20x1mm',
    '4.6x30mm HK': 'Caliber46x30',
    '5.7x28mm FN': 'Caliber57x28',
    '5.45x39mm': 'Caliber545x39',
    '5.56x45mm NATO': 'Caliber556x45NATO',
    '6.8x51mm': 'Caliber68x51',
    '.300 Blackout': 'Caliber762x35',
    '7.62x39mm': 'Caliber762x39',
    '7.62x51mm NATO': 'Caliber762x51',
    '.308 Marlin Express': 'Caliber308Marlin',
    '7.62x54mmR': 'Caliber762x54R',
    '.338 Lapua Magnum': 'Caliber86x70',
    '9x39mm': 'Caliber9x39',
    '9.3x64mm': 'Caliber93x64',
    '.366 TKM': 'Caliber366TKM',
    '12.7x55mm': 'Caliber127x55',
    '.50 BMG': 'Caliber50BMG',
    '12.7x108mm': 'Caliber127x108',
    '12/70': 'Caliber12g',
    '20/70': 'Caliber20g',
    '23x75mmR': 'Caliber23x75',
    '30x29mm': 'Caliber30x29',
    '40x46mm': 'Caliber40x46',
    '40x53mm': 'Caliber40mmRU',
    '26x75mm': 'Caliber26x75'
  };
  
  return mapping[caliberName] || caliberName.replace(/[^a-zA-Z0-9]/g, '');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchCaliberList()
    .then(calibers => {
      console.log('\nCalibers found:');
      calibers.forEach(caliber => {
        console.log(`  ${caliber.name} (${caliber.caliberId}) - ${caliber.wikiUrl}`);
      });
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}
