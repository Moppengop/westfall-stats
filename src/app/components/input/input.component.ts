import { Component, OnInit } from '@angular/core';
import { Item } from '../../models/item';
import { Enemy } from '../../models/enemy';
import { KilledEnemy } from '../../models/killed_enemy';
import { DroppedItems } from '../../models/dropped_items';
import { EnemyCardComponent } from '../cards/enemy-card/enemy-card.component';
import { ItemCardComponent } from '../cards/item-card/item-card.component';
import { MainService } from '../../services/main.service';
import { CreateEnemyComponent, NewEnemyData } from '../popups/create-enemy/create-enemy.component';
import { CreateItemComponent, NewItemData } from '../popups/create-item/create-item.component';
import { CreateKillComponent, NewKillData } from '../popups/create-kill/create-kill.component';
import { StatsComponent } from '../stats/stats.component';

@Component({
  selector: 'app-input',
  imports: [EnemyCardComponent, ItemCardComponent, CreateEnemyComponent, CreateItemComponent, CreateKillComponent, StatsComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})

export class InputComponent implements OnInit {
  constructor(private readonly mainService: MainService) {}

  knownItems: Item[] = [];
  knownEnemies: Enemy[] = [];
  killedEnemies: KilledEnemy[] = [];
  isCreateEnemyOpen = false;
  isCreateItemOpen = false;
  isCreateKillOpen = false;

  ngOnInit(): void {
    const data = this.mainService.loadMockData();
    this.knownItems = data.knownItems;
    this.knownEnemies = data.knownEnemies;
    this.killedEnemies = data.killedEnemies;
    this.mainService.setKilledEnemies(this.killedEnemies);
  }

  addKnownItem(name: string, sell_price: number): boolean {
    if (this.knownItems.some(item => item.name === name)) {
      console.warn(`Item with name "${name}" already exists.`);
      return false;
    }

    const newItem: Item = {
      id: (this.knownItems.length + 1), 
      name: name,
      sell_price: sell_price
    };
    
    this.knownItems.push(newItem);
    return true;
  }

  createItem(item: NewItemData): void {
    if (this.addKnownItem(item.name, item.sell_price)) {
      this.isCreateItemOpen = false;
    }
  }

  addKnownEnemy(name: string, health: number, level: number): boolean {
    if (this.knownEnemies.some(enemy => enemy.name === name) && this.knownEnemies.some(enemy => enemy.level === level)) {
      console.warn(`Enemy with name "${name}" and level "${level}" already exists.`);
      return false;
    };

    const newEnemy: Enemy = {
      id: (this.knownEnemies.length + 1), 
      name: name,
      health: health,
      level: level,
  }

    this.knownEnemies.push(newEnemy);
    return true;
}

  createEnemy(enemy: NewEnemyData): void {
    if (this.addKnownEnemy(enemy.name, enemy.health, enemy.level)) {
      this.isCreateEnemyOpen = false;
    }
  }

  addKill(knownEnemy: Enemy, droppedItems: DroppedItems[], droppedMoney: number): KilledEnemy {
    const newKill: KilledEnemy = {
      kill_number: (this.killedEnemies.length + 1),
      enemy: knownEnemy,
      dropped_items: droppedItems,
      dropped_money: droppedMoney
    }

    this.killedEnemies.push(newKill);
    this.mainService.setKilledEnemies([...this.killedEnemies]);
    return newKill;
  }

  createKill(kill: NewKillData): void {
    this.addKill(kill.enemy, kill.dropped_items, kill.dropped_money);
    this.isCreateKillOpen = false;
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
