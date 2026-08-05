import { DroppedItems } from "./dropped_items"
import { Enemy } from "./enemy"

export interface KilledEnemy {
  enemy: Enemy
  dropped_items: DroppedItems[]
  dropped_money: number
}

