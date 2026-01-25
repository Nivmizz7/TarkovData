# Hideout Data Synchronization

Ce document explique comment utiliser les scripts de synchronisation du hideout avec le wiki Escape From Tarkov.

## Scripts disponibles

### fetch:hideout
Récupère les données du hideout depuis le wiki sans modifier les fichiers locaux.

```bash
npm run fetch:hideout
```

Ce script affiche :
- La liste des stations trouvées sur le wiki
- La liste des modules et leurs niveaux

### sync:hideout / update:hideout
Synchronise les données du hideout local (`hideout.json`) avec celles du wiki.

```bash
npm run sync:hideout
# ou
npm run update:hideout
```

Le script :
1. Charge le fichier `hideout.json` actuel
2. Récupère les données du wiki
3. Compare les deux sources
4. Affiche un rapport détaillé des différences :
   - Nouvelles stations
   - Nouveaux modules/niveaux
   - Différences dans le nombre de requirements
   - Modules présents localement mais absents du wiki
5. Demande confirmation avant d'appliquer les changements

## Structure des données

### Stations
Les stations sont les différents modules du hideout (Generator, Workbench, etc.).

```json
{
  "id": 0,
  "locales": {
    "en": "Generator"
  },
  "function": "Provides power for hideout crafting stations",
  "imgSource": "/img/Generator_Portrait.png"
}
```

### Modules
Les modules représentent les niveaux d'amélioration de chaque station.

```json
{
  "module": "Generator",
  "level": 1,
  "require": [
    {
      "type": "module",
      "name": "Vents",
      "quantity": 1,
      "id": 0
    },
    {
      "type": "item",
      "name": "5696686a4bdc2da3298b456a",
      "quantity": 25000,
      "id": 189
    }
  ]
}
```

## Limitations actuelles

### Mapping des IDs d'items
Le wiki utilise les **noms d'items** dans les requirements, tandis que `hideout.json` utilise des **IDs d'items** (ex: `5696686a4bdc2da3298b456a`).

Le script ne peut pas automatiquement convertir entre les deux formats. Lorsque de nouveaux modules sont ajoutés, les requirements sont laissés vides et doivent être remplis manuellement en consultant :
- Le fichier `items.en.json` pour trouver les IDs correspondant aux noms
- Le wiki pour les requirements exacts

### Différences de casse
Il peut y avoir des différences de casse entre le wiki et les données locales :
- Wiki : "Intelligence Center"
- Local : "Intelligence center"

Le script considère ces variations comme différentes. Une normalisation manuelle peut être nécessaire.

## Workflow recommandé

1. **Vérifier les changements** avec `fetch:hideout`
2. **Synchroniser** avec `sync:hideout`
3. **Réviser manuellement** les nouveaux modules ajoutés
4. **Mapper les IDs d'items** pour les nouveaux requirements
5. **Tester** que le fichier JSON est valide
6. **Commit** les changements

## Source des données

Les données sont extraites de la page wiki officielle :
https://escapefromtarkov.fandom.com/wiki/Hideout

Le script parse les tables HTML pour chaque module et extrait :
- Les niveaux d'amélioration
- Les requirements (modules, items, traders, skills)
- Les bonus accordés
- Le temps de construction
