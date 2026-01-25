# Wiki Sync Scripts

Scripts TypeScript pour synchroniser les données de munitions depuis le wiki Escape from Tarkov.

## Installation

```bash
npm install
```

## Scripts disponibles

### 1. Rapport des données manquantes

```bash
npm run report:missing
```

Compare les données actuelles dans `ammunition.json` avec les données du wiki et affiche un rapport détaillé des munitions manquantes.

### 2. Synchronisation complète des munitions

```bash
npm run sync:ammo
```

Ce script :
- Récupère la liste de tous les calibres depuis https://escapefromtarkov.fandom.com/wiki/Ammunition
- Pour chaque calibre, récupère les données de munitions depuis les pages wiki individuelles
- Compare avec les données existantes dans `ammunition.json`
- Affiche les changements détectés
- **Demande confirmation avant d'écrire les modifications**

**Note:** Le wiki est la source de vérité - les données du wiki écrasent celles du fichier local.

### 3. Lister les calibres disponibles

```bash
npm run fetch:calibers
```

Affiche la liste de tous les calibres disponibles sur le wiki.

### 4. Tester la récupération des données d'un calibre

```bash
npm run fetch:ammo
```

Teste la récupération des données pour le calibre 9.3x64mm.

## Calibres détectés

Le script détecte automatiquement tous les calibres du wiki, incluant:
- Tous les calibres de pistolet (9x18mm, 9x19mm, .45 ACP, .357 Magnum, etc.)
- Calibres PDW (4.6x30mm, 5.7x28mm)
- Calibres de fusil russes (5.45x39mm, 7.62x39mm, 7.62x54mmR, 9x39mm, **9.3x64mm**, .366 TKM, etc.)
- Calibres de fusil US/OTAN (5.56x45mm, 7.62x51mm, .300 Blackout, .338 Lapua, etc.)
- Calibres de shotgun (12/70, 20/70, 23x75mm)
- Grenades et fusées éclairantes

## Structure des fichiers

```
src/
├── types.ts              # Types TypeScript pour les données de munitions
├── fetchCalibers.ts      # Récupération de la liste des calibres
├── fetchAmmoData.ts      # Récupération des données d'un calibre
└── syncAmmunition.ts     # Script principal de synchronisation
```

## Fonctionnement

1. **fetchCalibers.ts** : Scrape la page principale des munitions et extrait :
   - Nom du calibre
   - URL de la page wiki du calibre
   - ID normalisé du calibre (pour correspondre au format du JSON)

2. **fetchAmmoData.ts** : Pour chaque calibre, scrape la table des munitions et extrait :
   - Nom de la munition
   - Dégâts
   - Pénétration
   - Dégâts aux armures
   - Fragmentation
   - Modificateurs de précision et recul
   - Modificateurs de saignement
   - Vélocité

3. **syncAmmunition.ts** : Compare les données wiki avec `ammunition.json` :
   - Identifie les munitions existantes par leur nom
   - Détecte les différences dans les statistiques
   - Affiche un résumé des changements
   - Demande confirmation avant de sauvegarder
   - Met à jour le fichier JSON si confirmé

## Exemple d'utilisation

```bash
# Installation des dépendances
npm install

# Synchronisation des données
npm run sync:ammo
```

Le script affichera :
```
=== Tarkov Ammunition Wiki Sync ===

Loading ammunition.json...
✓ Loaded 150 ammunition entries

Fetching caliber list from wiki...
Found 25 calibers

Found 25 calibers. Continue? (y/n): y

--- Processing 9x18mm Makarov ---
  Found 12 ammunition types

--- Processing 9x19mm Parabellum ---
  Found 15 ammunition types
  
57371f2b24597761224311f1 - 9x18mm PM PS gs PPO:
  Ballistics:
    damage: 50 → 52
    penetrationPower: 10 → 12

=== Summary ===
Updates found: 1
New ammunition: 0

Apply these updates to ammunition.json? (y/n): y

✓ Saved to ./ammunition.json
✓ Synchronization complete!
```

## Notes

- Le script attend 1 seconde entre chaque requête pour ne pas surcharger le wiki
- Toutes les modifications nécessitent une confirmation manuelle
- Les nouvelles munitions sont détectées mais pas automatiquement ajoutées (nécessite un ID unique)
- Le mapping des noms de calibres peut nécessiter des ajustements manuels
