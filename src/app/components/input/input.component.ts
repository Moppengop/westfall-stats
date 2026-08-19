import { Component, OnInit } from '@angular/core';
import { Item } from '../../models/item';
import { Enemy } from '../../models/enemy';
import { KilledEnemy } from '../../models/killed_enemy';
import { DroppedItems } from '../../models/dropped_items';
import { EnemyCardComponent } from '../cards/enemy-card/enemy-card.component';
import { ItemCardComponent } from '../cards/item-card/item-card.component';

@Component({
  selector: 'app-input',
  imports: [EnemyCardComponent, ItemCardComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})

export class InputComponent implements OnInit {
  pages = ['addItem', 'addEnemy'];
  currentPage = 'addEnemy';

  knownItems: Item[] = [];
  knownEnemies: Enemy[] = [];
  killedEnemies: KilledEnemy[] = [];
  sampleEnemy: Enemy = {
    id: 1,
    name: 'Skeleton Warrior',
    level: 12,
    health: 850,
  };
  sampleItem: Item = {
    id: 1,
    name: 'Bronze Tube',
    sell_price: 13300,
  };

  ngOnInit(): void {
    // load items and enemies
  }

  addKnownItem(name: string, sell_price: number): void {
    if (this.knownItems.some(item => item.name === name)) {
      console.warn(`Item with name "${name}" already exists.`);
      return;
    }

    const newItem: Item = {
      id: (this.knownItems.length + 1), 
      name: name,
      sell_price: sell_price
    };
    
    this.knownItems.push(newItem);
  }

  addKnownEnemy(name: string, health: number, level: number): void {
    if (this.knownEnemies.some(enemy => enemy.name === name) && this.knownEnemies.some(enemy => enemy.level === level)) {
      console.warn(`Enemy with name "${name}" and level "${level}" already exists.`);
      return;
    };

    const newEnemy: Enemy = {
      id: (this.knownEnemies.length + 1), 
      name: name,
      health: health,
      level: level,
  }

    this.knownEnemies.push(newEnemy);
}

  addKill(knownEnemy: Enemy, droppedItems: DroppedItems[], droppedMoney: number): KilledEnemy{
    const newKill: KilledEnemy = {
      enemy: knownEnemy,
      dropped_items: droppedItems,
      dropped_money: droppedMoney
    }

    return newKill;
  }

  findPossibleItemsByName(name: string): Item[] {
    // try to find items by name
    // show 3 best matches
    return this.knownItems.filter(item => item.name.includes(name)).slice(0, 3);
  }
}
