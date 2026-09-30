import { Enemy } from './enemy';
import { Item } from './item';
import { KilledEnemy } from './killed_enemy';

export interface SavedDrop {
  item_id: number;
  amount: number;
}

export interface SavedKill {
  kill_number: number;
  enemy_id: number;
  dropped_items: SavedDrop[];
  dropped_money: number;
}

export interface SaveData {
  known_items: Item[];
  known_enemies: Enemy[];
  kills: SavedKill[];
}

export interface LoadedData {
  knownItems: Item[];
  knownEnemies: Enemy[];
  killedEnemies: KilledEnemy[];
}