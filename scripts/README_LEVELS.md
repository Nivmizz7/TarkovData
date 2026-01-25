# Scripts de Synchronisation des Niveaux

Ce dossier contient des scripts TypeScript pour synchroniser les données de niveaux de personnage avec le wiki Escape from Tarkov.

## Scripts Disponibles

### 1. fetchLevels.ts
Récupère les données de niveaux depuis le wiki Escape from Tarkov.

**Utilisation :**
```bash
npm run fetch:levels
```

**Sortie :**
- Affiche les 5 premiers et 5 derniers niveaux
- Montre le niveau, l'expérience requise, le total cumulé et le groupe

### 2. syncLevels.ts
Synchronise le fichier `data/levels.json` avec les données du wiki.

**Utilisation :**
```bash
npm run sync:levels
```

**Processus :**
1. Charge le fichier `levels.json` actuel
2. Récupère les données du wiki
3. Compare les deux sources
4. Affiche les différences (ajouts, modifications, suppressions)
5. Demande confirmation avant d'appliquer les changements
6. Met à jour `levels.json` si confirmé

**Fonctionnalités :**
- Détecte les nouveaux niveaux
- Met à jour les valeurs d'expérience
- Met à jour les totaux cumulés
- Ajuste les groupes de niveaux
- Confirmation interactive avant modification

## Structure des Données

Chaque niveau dans `levels.json` contient :
- **exp** : Expérience requise pour ce niveau
- **total** : Expérience totale cumulée
- **group** : Numéro de groupe (basé sur les tranches de 5 niveaux)

### Groupes de Niveaux
- Groupe 1 : Niveaux 1-4
- Groupe 2 : Niveaux 5-9
- Groupe 3 : Niveaux 10-14
- Groupe 4 : Niveaux 15-19
- Groupe 5 : Niveaux 20-24
- Et ainsi de suite...

**Formule** : `niveau < 5 ? 1 : Math.floor(niveau / 5) + 1`

## Exemple

```json
{
  "1": {
    "exp": 0,
    "total": 0,
    "group": "1"
  },
  "2": {
    "exp": 1000,
    "total": 1000,
    "group": "1"
  },
  "5": {
    "exp": 5824,
    "total": 14256,
    "group": "1"
  }
}
```

## Source des Données

Les données proviennent de : https://escapefromtarkov.fandom.com/wiki/Experience#Character_levels

## Notes Techniques

- Les scripts utilisent TypeScript avec tsx pour l'exécution
- Le parsing du wiki utilise les données extraites de la section "Character levels"
- Les groupes sont calculés automatiquement : `Math.ceil(niveau / 5)`
- Le format JSON est indenté avec 4 espaces pour la lisibilité
