import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  constructor(
    private readonly mainService: MainService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  knownItems: Item[] = [];
  knownEnemies: Enemy[] = [];
  killedEnemies: KilledEnemy[] = [];
  isCreateEnemyOpen = false;
  isCreateItemOpen = false;
  isCreateKillOpen = false;
  isCreateChestOpen = false;
  backupMessage = '';

  get chestEnemy(): Enemy {
    return this.knownEnemies.find((enemy) => enemy.name === 'Chest' && enemy.level === 1) ?? {
      id: Math.max(0, ...this.knownEnemies.map((enemy) => enemy.id)) + 1,
      name: 'Chest',
      level: 1,
      health: 1,
    };
  }

  ngOnInit(): void {
    const data = this.mainService.loadData();
    this.knownItems = data.knownItems;
    this.knownEnemies = data.knownEnemies;
    this.killedEnemies = data.killedEnemies;
  }

  addKnownItem(name: string, sell_price: number): boolean {
    if (this.knownItems.some(item => item.name === name)) {
      console.warn(`Item with name "${name}" already exists.`);
      return false;
    }

    const newItem: Item = {
      id: Math.max(0, ...this.knownItems.map(item => item.id)) + 1,
      name: name,
      sell_price: sell_price
    };
    
    this.knownItems.push(newItem);
    this.saveData();
    return true;
  }

  createItem(item: NewItemData): void {
    if (this.addKnownItem(item.name, item.sell_price)) {
      this.isCreateItemOpen = false;
    }
  }

  addKnownEnemy(name: string, health: number, level: number): boolean {
    if (this.knownEnemies.some(enemy => enemy.name === name && enemy.level === level)) {
      console.warn(`Enemy with name "${name}" and level "${level}" already exists.`);
      return false;
    };

    const newEnemy: Enemy = {
      id: Math.max(0, ...this.knownEnemies.map(enemy => enemy.id)) + 1,
      name: name,
      health: health,
      level: level,
  }

    this.knownEnemies.push(newEnemy);
    this.saveData();
    return true;
}

  createEnemy(enemy: NewEnemyData): void {
    if (this.addKnownEnemy(enemy.name, enemy.health, enemy.level)) {
      this.isCreateEnemyOpen = false;
    }
  }

  addKill(knownEnemy: Enemy, droppedItems: DroppedItems[], droppedMoney: number): KilledEnemy {
    const newKill: KilledEnemy = {
      kill_number: Math.max(0, ...this.killedEnemies.map(kill => kill.kill_number)) + 1,
      enemy: knownEnemy,
      dropped_items: droppedItems,
      dropped_money: droppedMoney
    }

    this.killedEnemies.push(newKill);
  this.saveData();
    return newKill;
  }

  createKill(kill: NewKillData): void {
    if (!this.knownEnemies.some((enemy) => enemy.id === kill.enemy.id)) {
      this.knownEnemies.push(kill.enemy);
    }
    this.addKill(kill.enemy, kill.dropped_items, kill.dropped_money);
    this.isCreateKillOpen = false;
    this.isCreateChestOpen = false;
  }

  findPossibleItemsByName(name: string): Item[] {
    // try to find items by name
    // show 3 best matches
    return this.knownItems.filter(item => item.name.includes(name)).slice(0, 3);
  }

  repeat(amount: number): undefined[] {
    return Array.from({ length: amount });
  }

  exportBackup(): void {
    try {
      const contents = this.mainService.exportBackup(this.knownItems, this.knownEnemies, this.killedEnemies);
      const file = new Blob([contents], { type: 'application/json' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `westfall-stats-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      this.backupMessage = 'Backup exported.';
    } catch (error) {
      console.error('Could not export backup.', error);
      this.backupMessage = 'Could not export backup.';
    }
  }

  async importBackup(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      const data = this.mainService.importBackup(await file.text());
      this.knownItems = data.knownItems;
      this.knownEnemies = data.knownEnemies;
      this.killedEnemies = data.killedEnemies;
      this.backupMessage = 'Backup imported.';
    } catch (error) {
      console.error('Could not import backup.', error);
      this.backupMessage = error instanceof Error ? error.message : 'Could not import backup.';
    } finally {
      input.value = '';
      this.changeDetector.markForCheck();
    }
  }

  private saveData(): void {
    this.mainService.saveData(this.knownItems, this.knownEnemies, this.killedEnemies);
  }
}
