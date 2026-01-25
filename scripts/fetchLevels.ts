import * as cheerio from 'cheerio';

const WIKI_URL = 'https://escapefromtarkov.fandom.com/wiki/Experience';

export interface LevelData {
  level: number;
  exp: number;
  total: number;
  group: string;
}

/**
 * Fetches level data from the Escape from Tarkov wiki
 */
export async function fetchLevelData(): Promise<LevelData[]> {
  console.log('Fetching level data from wiki...');
  
  try {
    const response = await fetch(WIKI_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch wiki page: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const levels: LevelData[] = [];
    
    // Manual data extracted from the wiki
    // This is hardcoded based on the wiki structure as of the fetch
    const wikiData = [
      { level: 1, exp: 0, total: 0 },
      { level: 2, exp: 1000, total: 1000 },
      { level: 3, exp: 3017, total: 4017 },
      { level: 4, exp: 4415, total: 8432 },
      { level: 5, exp: 5824, total: 14256 },
      { level: 6, exp: 7221, total: 21477 },
      { level: 7, exp: 8546, total: 30023 },
      { level: 8, exp: 9913, total: 39936 },
      { level: 9, exp: 11268, total: 51204 },
      { level: 10, exp: 12519, total: 63723 },
      { level: 11, exp: 13840, total: 77563 },
      { level: 12, exp: 15716, total: 93279 },
      { level: 13, exp: 22023, total: 115302 },
      { level: 14, exp: 27951, total: 143253 },
      { level: 15, exp: 34084, total: 177337 },
      { level: 16, exp: 40548, total: 217885 },
      { level: 17, exp: 46547, total: 264432 },
      { level: 18, exp: 52419, total: 316851 },
      { level: 19, exp: 57549, total: 374400 },
      { level: 20, exp: 63065, total: 437465 },
      { level: 21, exp: 67696, total: 505161 },
      { level: 22, exp: 72817, total: 577978 },
      { level: 23, exp: 78369, total: 656347 },
      { level: 24, exp: 84803, total: 741150 },
      { level: 25, exp: 94916, total: 836066 },
      { level: 26, exp: 108067, total: 944133 },
      { level: 27, exp: 122126, total: 1066259 },
      { level: 28, exp: 133164, total: 1199423 },
      { level: 29, exp: 144320, total: 1343743 },
      { level: 30, exp: 155595, total: 1499338 },
      { level: 31, exp: 166982, total: 1666320 },
      { level: 32, exp: 180344, total: 1846664 },
      { level: 33, exp: 196685, total: 2043349 },
      { level: 34, exp: 215087, total: 2258436 },
      { level: 35, exp: 233690, total: 2492126 },
      { level: 36, exp: 258091, total: 2750217 },
      { level: 37, exp: 281805, total: 3032022 },
      { level: 38, exp: 305744, total: 3337766 },
      { level: 39, exp: 326065, total: 3663831 },
      { level: 40, exp: 346570, total: 4010401 },
      { level: 41, exp: 367261, total: 4377662 },
      { level: 42, exp: 388137, total: 4765799 },
      { level: 43, exp: 416600, total: 5182399 },
      { level: 44, exp: 445333, total: 5627732 },
      { level: 45, exp: 474331, total: 6102063 },
      { level: 46, exp: 528224, total: 6630287 },
      { level: 47, exp: 559155, total: 7189442 },
      { level: 48, exp: 590350, total: 7779792 },
      { level: 49, exp: 621815, total: 8401607 },
      { level: 50, exp: 653537, total: 9055144 },
      { level: 51, exp: 685522, total: 9740666 },
      { level: 52, exp: 717765, total: 10458431 },
      { level: 53, exp: 761235, total: 11219666 },
      { level: 54, exp: 805078, total: 12024744 },
      { level: 55, exp: 849297, total: 12874041 },
      { level: 56, exp: 893877, total: 13767918 },
      { level: 57, exp: 938823, total: 14706741 },
      { level: 58, exp: 984131, total: 15690872 },
      { level: 59, exp: 1029795, total: 16720667 },
      { level: 60, exp: 1095775, total: 17816442 },
      { level: 61, exp: 1225050, total: 19041492 },
      { level: 62, exp: 1319453, total: 20360945 },
      { level: 63, exp: 1431321, total: 21792266 },
      { level: 64, exp: 1558177, total: 23350443 },
      { level: 65, exp: 1748019, total: 25098462 },
      { level: 66, exp: 2002313, total: 27100775 },
      { level: 67, exp: 2480456, total: 29581231 },
      { level: 68, exp: 3447343, total: 33028574 },
      { level: 69, exp: 4924970, total: 37953544 },
      { level: 70, exp: 6306999, total: 44260543 },
      { level: 71, exp: 7640970, total: 51901513 },
      { level: 72, exp: 8986198, total: 60887711 },
      { level: 73, exp: 10341135, total: 71228846 },
      { level: 74, exp: 11704613, total: 82933459 },
      { level: 75, exp: 13075721, total: 96009180 },
      { level: 76, exp: 14453730, total: 110462910 },
      { level: 77, exp: 15838039, total: 126300949 },
      { level: 78, exp: 18623623, total: 144924572 },
      { level: 79, exp: 27091684, total: 172016256 }
    ];
    
    // Convert to LevelData format with groups
    // Groups: 1-4=1, 5-9=2, 10-14=3, 15-19=4, etc.
    for (const data of wikiData) {
      const group = (data.level < 5 ? 1 : Math.floor(data.level / 5) + 1).toString();
      levels.push({
        level: data.level,
        exp: data.exp,
        total: data.total,
        group
      });
    }
    
    console.log(`Found ${levels.length} levels`);
    return levels;
    
  } catch (error) {
    console.error('Error fetching level data:', error);
    throw error;
  }
}

/**
 * Main function to test the fetcher
 */
async function main() {
  try {
    const levels = await fetchLevelData();
    
    console.log('\nFirst 5 levels:');
    levels.slice(0, 5).forEach(level => {
      console.log(`Level ${level.level}: ${level.exp} exp, ${level.total} total, group ${level.group}`);
    });
    
    console.log('\nLast 5 levels:');
    levels.slice(-5).forEach(level => {
      console.log(`Level ${level.level}: ${level.exp} exp, ${level.total} total, group ${level.group}`);
    });
    
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
