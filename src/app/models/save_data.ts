import { Enemy } from "./enemy";
import { Item } from "./item";
import { KilledEnemy } from "./killed_enemy";

export interface SaveData {
  known_items: Item[];
  known_enemies: Enemy[];
  kills: KilledEnemy[];
}