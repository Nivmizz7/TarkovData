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

// Hideout types
export interface HideoutStation {
  id: number;
  locales: {
    en: string;
  };
  function: string;
  imgSource: string;
  disabled?: boolean;
}

export interface HideoutRequirement {
  type: string;
  name: string;
  quantity: number;
  id: number;
}

export interface HideoutModule {
  module: string;
  level: number;
  require: HideoutRequirement[];
  bonuses?: any[];
  require_build?: number;
  time?: number;
}

export interface HideoutDatabase {
  stations: HideoutStation[];
  modules: HideoutModule[];
}

// Wiki hideout types
export interface WikiHideoutStation {
  name: string;
  function?: string;
  imgSource?: string;
}

export interface WikiHideoutModule {
  name: string;
  level: number;
  requirements?: any[];
  bonuses?: string;
  constructionTime?: string;
}
