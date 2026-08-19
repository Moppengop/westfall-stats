import { DroppedItems } from "./dropped_items"
import { Enemy } from "./enemy"

export interface KilledEnemy {
  kill_number: number;
  enemy: Enemy
  dropped_items: DroppedItems[]
  dropped_money: number
}

