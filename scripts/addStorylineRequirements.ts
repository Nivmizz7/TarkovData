import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Traders et leurs objectifs de déblocage dans Tour
// Selon Tour:
// - Therapist (1): disponible dès le début (tour_obj_2 - Talk to Therapist)
// - Ragman (5): tour_obj_4 - Talk to Ragman
// - Skier (2): tour_obj_5 - débloqué après Interchange
// - Mechanic (4): tour_obj_9 - débloqué après Customs
// - Prapor (0): tour_obj_12 - débloqué après Factory
// - Peacekeeper (3): tour_obj_15 - débloqué après Woods

const traderStorylineRequirements: { [key: number]: string } = {
  0: 'tour_obj_12', // Prapor - unlocked after Factory
  1: 'tour_obj_2',  // Therapist - Talk to Therapist
  2: 'tour_obj_5',  // Skier - unlocked after Interchange
  3: 'tour_obj_15', // Peacekeeper - unlocked after Woods
  4: 'tour_obj_9',  // Mechanic - unlocked after Customs
  5: 'tour_obj_4',  // Ragman - Talk to Ragman
  // Les autres traders (Jaeger, etc.) peuvent ne pas avoir de requirement pour l'instant
};

const questsPath = path.join(__dirname, '..', 'data', 'quests.json');
const quests = JSON.parse(fs.readFileSync(questsPath, 'utf-8'));

let modified = 0;

quests.forEach((quest: any) => {
  const giver = quest.giver;
  
  // Si le giver a un requirement de storyline objective
  if (giver !== undefined && traderStorylineRequirements[giver] !== undefined) {
    // Remplacer le champ storyline par storylineObjective
    if (quest.require.storyline) {
      delete quest.require.storyline;
    }
    quest.require.storylineObjective = traderStorylineRequirements[giver];
    modified++;
    console.log(`Set storyline objective to quest ${quest.id} (${quest.title}) - Giver: ${giver} -> ${traderStorylineRequirements[giver]}`);
  }
});

fs.writeFileSync(questsPath, JSON.stringify(quests, null, 2), 'utf-8');

console.log(`\n✅ Modified ${modified} quests with storyline requirements`);
