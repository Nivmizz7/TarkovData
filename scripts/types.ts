export interface Ballistics {
  damage: number;
  armorDamage: number;
  fragmentationChance: number;
  ricochetChance: number;
  penetrationChance: number;
  penetrationPower: number;
  penetrationPowerDeviation: number;
  accuracy: number;
  recoil: number;
  initialSpeed: number;
  lightBleedDelta: number;
  heavyBleedDelta: number;
}

export interface Ammunition {
  id: string;
  name: string;
  shortName: string;
  weight: number;
  caliber: string;
  stackMaxSize: number;
  tracer: boolean;
  tracerColor: string;
  ammoType: string;
  projectileCount: number;
  ballistics: Ballistics;
}

export interface WikiAmmoRow {
  icon: string;
  name: string;
  damage: number;
  penetration: number;
  armorDamage: number;
  fragmentation: string;
  accuracyModifier: string;
  recoilModifier: string;
  lightBleedModifier: string;
  heavyBleedModifier: string;
  velocity: number;
  traders: string;
}

export interface CaliberInfo {
  name: string;
  wikiUrl: string;
  caliberId: string;
}

export type AmmoDatabase = Record<string, Ammunition>;
