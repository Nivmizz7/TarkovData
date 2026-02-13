import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const OUT_DIR = path.join(ROOT, 'graphql', 'data');

async function loadJson(fileName) {
  const raw = await readFile(path.join(DATA_DIR, fileName), 'utf-8');
  return JSON.parse(raw);
}

async function saveJson(fileName, data) {
  const outputPath = path.join(OUT_DIR, fileName);
  const json = JSON.stringify(data, null, 2);
  await writeFile(outputPath, `${json}\n`, 'utf-8');
}

function mapObjectToArray(obj, extra = {}) {
  return Object.entries(obj).map(([key, value]) => ({
    ...value,
    ...extra,
    key
  }));
}

async function buildAchievements() {
  const achievements = await loadJson('achievements.json');
  await saveJson('achievements.json', Object.values(achievements));
}

async function buildAmmunition() {
  const ammunition = await loadJson('ammunition.json');
  await saveJson('ammunition.json', Object.values(ammunition));
}

async function buildHideout() {
  const hideout = await loadJson('hideout.json');
  await saveJson('hideout.json', hideout);
}

async function buildItemPresets() {
  const presets = await loadJson('item_presets.json');
  await saveJson('itemPresets.json', Object.values(presets));
}

async function buildItems() {
  const items = await loadJson('items.en.json');
  await saveJson('items.json', items?.data?.items ?? []);
}

async function buildLevels() {
  const levels = await loadJson('levels.json');
  const list = Object.entries(levels)
    .map(([level, entry]) => ({
      level: Number(level),
      ...entry
    }))
    .sort((a, b) => a.level - b.level);
  await saveJson('levels.json', list);
}

async function buildMaps() {
  const maps = await loadJson('maps.json');
  const list = Object.entries(maps).map(([key, value]) => ({
    id: key,
    numericId: value.id,
    ...value
  }));
  await saveJson('maps.json', list);
}

async function buildQuests() {
  const quests = await loadJson('quests.json');
  await saveJson('quests.json', quests);
}

async function buildStoryline() {
  const storyline = await loadJson('storyline.json');
  const chapters = Object.entries(storyline.chapters ?? {}).map(([key, value]) => ({
    key,
    ...value
  }));
  await saveJson('storyline.json', {
    storylines: storyline.storylines ?? [],
    chapters
  });
}

async function buildTraders() {
  const traders = await loadJson('traders.json');
  const list = Object.entries(traders).map(([key, value]) => ({
    key,
    ...value
  }));
  await saveJson('traders.json', list);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  await buildAchievements();
  await buildAmmunition();
  await buildHideout();
  await buildItemPresets();
  await buildItems();
  await buildLevels();
  await buildMaps();
  await buildQuests();
  await buildStoryline();
  await buildTraders();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
