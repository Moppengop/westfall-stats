import { Component, OnInit } from '@angular/core';
import { Item } from '../../models/item';
import { Enemy } from '../../models/enemy';
import { KilledEnemy } from '../../models/killed_enemy';
import { DroppedItems } from '../../models/dropped_items';
import { EnemyCardComponent } from '../cards/enemy-card/enemy-card.component';
import { ItemCardComponent } from '../cards/item-card/item-card.component';
import { MainService } from '../../services/main.service';

@Component({
  selector: 'app-input',
  imports: [EnemyCardComponent, ItemCardComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})

export class InputComponent implements OnInit {
  constructor(private readonly mainService: MainService) {}

  knownItems: Item[] = [];
  knownEnemies: Enemy[] = [];
  killedEnemies: KilledEnemy[] = [];

  ngOnInit(): void {
    const data = this.mainService.loadMockData();
    this.knownItems = data.knownItems;
    this.knownEnemies = data.knownEnemies;
    this.killedEnemies = data.killedEnemies;
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

    repeat(amount: number): undefined[] {
    return Array.from({ length: amount });
  }
}
