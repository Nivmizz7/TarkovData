import * as cheerio from 'cheerio';

async function debugWiki() {
  const url = 'https://escapefromtarkov.fandom.com/wiki/9x19mm_Parabellum';
  
  console.log(`Fetching ${url}...`);
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  console.log('\n=== First Table - Row 1 Full HTML ===');
  
  const firstTable = $('table').first();
  const row1 = firstTable.find('tr').eq(1);
  
  console.log('Full Row HTML:');
  console.log(row1.html()?.substring(0, 500));
  
  console.log('\n\nSearching for name in row...');
  
  // Check if there's a link in the row
  const link = row1.find('a').first();
  if (link.length) {
    console.log(`Found link: "${link.text().trim()}"`);
    console.log(`Link href: ${link.attr('href')}`);
  }
  
  // Check all text content
  console.log('\nAll text in row:', row1.text().substring(0, 200));
}

debugWiki().catch(console.error);
