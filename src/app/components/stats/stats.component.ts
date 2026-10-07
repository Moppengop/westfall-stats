import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Enemy } from '../../models/enemy';
import { Item } from '../../models/item';
import { KilledEnemy } from '../../models/killed_enemy';
import { MainService } from '../../services/main.service';

interface EnemyAggregate {
  enemy: Enemy;
  kills: number;
  items: number;
  itemsWorth: number;
  money: number;
  totalWorth: number;
}

interface ItemAggregate {
  item: Item;
  fromEnemies: number;
  fromChests: number;
  enemyDropKills: number;
}

interface MoneyPart {
  denomination: 'gold' | 'silver' | 'copper';
  amount: number;
  displayAmount: string;
}

type EnemySortKey =
  | 'enemy'
  | 'kills'
  | 'items'
  | 'averageItems'
  | 'totalWorth'
  | 'averageTotalWorth'
  | 'itemsWorth'
  | 'averageItemsWorth'
  | 'money'
  | 'averageMoney';

type ItemSortKey =
  | 'item'
  | 'fromEnemies'
  | 'fromChests'
  | 'totalLooted'
  | 'killsPerDrop'
  | 'unitWorth'
  | 'totalWorth';

@Component({
  selector: 'app-stats',
  imports: [FormsModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent {
  @Input() knownEnemies: Enemy[] = [];

  includeChests = true;
  selectedEnemyNames: string[] | null = null;
  minimumLevel: number | null = null;
  maximumLevel: number | null = null;
  enemySortKey: EnemySortKey | null = null;
  enemySortDirection: 'asc' | 'desc' = 'asc';
  itemSortKey: ItemSortKey | null = null;
  itemSortDirection: 'asc' | 'desc' = 'asc';

  constructor(readonly mainService: MainService) {}

  get allKills(): KilledEnemy[] {
    return this.mainService.killedEnemies();
  }

  get orderedKills(): KilledEnemy[] {
    return [...this.allKills].sort((first, second) => second.kill_number - first.kill_number);
  }

  get enemyNames(): string[] {
    return [...new Set(this.knownEnemies.map((enemy) => enemy.name))]
      .sort((first, second) => first.localeCompare(second));
  }

  get filteredKills(): KilledEnemy[] {
    if (this.minimumLevel !== null && this.maximumLevel !== null && this.minimumLevel > this.maximumLevel) {
      return [];
    }

    return this.allKills.filter((kill) =>
      (this.includeChests || !this.isChest(kill.enemy))
      && (this.selectedEnemyNames === null || this.selectedEnemyNames.includes(kill.enemy.name))
      && (this.minimumLevel === null || kill.enemy.level >= this.minimumLevel)
      && (this.maximumLevel === null || kill.enemy.level <= this.maximumLevel),
    );
  }

  get filteredItemCount(): number {
    return this.filteredKills.reduce((total, kill) => total + this.itemCount(kill), 0);
  }

  get filteredDamage(): number {
    return this.filteredKills.reduce((total, kill) => total + kill.enemy.health, 0);
  }

  get filteredItemsWorth(): number {
    return this.filteredKills.reduce((total, kill) => total + this.itemWorth(kill), 0);
  }

  get filteredMoney(): number {
    return this.filteredKills.reduce((total, kill) => total + kill.dropped_money, 0);
  }

  get filteredTotalWorth(): number {
    return this.filteredItemsWorth + this.filteredMoney;
  }

  get filteredAverageLevel(): number {
    return this.average(this.filteredKills.reduce((total, kill) => total + kill.enemy.level, 0));
  }

  get filteredAverageItems(): number {
    return this.average(this.filteredItemCount);
  }

  get filteredAverageDamage(): number {
    return this.average(this.filteredDamage);
  }

  get filteredAverageItemsWorth(): number {
    return this.average(this.filteredItemsWorth);
  }

  get filteredAverageMoney(): number {
    return this.average(this.filteredMoney);
  }

  get filteredAverageTotalWorth(): number {
    return this.average(this.filteredTotalWorth);
  }

  get mostWorthKill(): KilledEnemy | null {
    return this.worthKill((current, candidate) => this.killWorth(candidate) > this.killWorth(current));
  }

  get leastWorthKill(): KilledEnemy | null {
    return this.worthKill((current, candidate) => this.killWorth(candidate) < this.killWorth(current));
  }

  get enemyAggregates(): EnemyAggregate[] {
    const aggregates = new Map<number, EnemyAggregate>();
    for (const kill of this.allKills) {
      let aggregate = aggregates.get(kill.enemy.id);
      if (!aggregate) {
        aggregate = { enemy: kill.enemy, kills: 0, items: 0, itemsWorth: 0, money: 0, totalWorth: 0 };
        aggregates.set(kill.enemy.id, aggregate);
      }

      aggregate.kills += 1;
      aggregate.items += this.itemCount(kill);
      aggregate.itemsWorth += this.itemWorth(kill);
      aggregate.money += kill.dropped_money;
      aggregate.totalWorth += this.killWorth(kill);
    }

    return [...aggregates.values()].sort((first, second) =>
      first.enemy.name.localeCompare(second.enemy.name)
      || first.enemy.level - second.enemy.level
      || first.enemy.id - second.enemy.id,
    );
  }

  get sortedEnemyAggregates(): EnemyAggregate[] {
    const sortKey = this.enemySortKey;
    if (!sortKey) {
      return this.enemyAggregates;
    }

    return [...this.enemyAggregates].sort((first, second) =>
      this.compareValues(
        this.enemySortValue(first, sortKey),
        this.enemySortValue(second, sortKey),
        this.enemySortDirection,
      ),
    );
  }

  get itemAggregates(): ItemAggregate[] {
    const aggregates = new Map<number, ItemAggregate>();
    for (const kill of this.allKills) {
      const isChest = this.isChest(kill.enemy);
      const droppedItemIds = new Set<number>();
      for (const drop of kill.dropped_items) {
        let aggregate = aggregates.get(drop.item.id);
        if (!aggregate) {
          aggregate = { item: drop.item, fromEnemies: 0, fromChests: 0, enemyDropKills: 0 };
          aggregates.set(drop.item.id, aggregate);
        }

        if (isChest) {
          aggregate.fromChests += drop.amount;
        } else {
          aggregate.fromEnemies += drop.amount;
          if (drop.amount > 0) {
            droppedItemIds.add(drop.item.id);
          }
        }
      }

      for (const itemId of droppedItemIds) {
        const aggregate = aggregates.get(itemId);
        if (aggregate) {
          aggregate.enemyDropKills += 1;
        }
      }
    }

    return [...aggregates.values()].sort((first, second) =>
      first.item.name.localeCompare(second.item.name) || first.item.id - second.item.id,
    );
  }

  get sortedItemAggregates(): ItemAggregate[] {
    const sortKey = this.itemSortKey;
    if (!sortKey) {
      return this.itemAggregates;
    }

    return [...this.itemAggregates].sort((first, second) =>
      this.compareValues(
        this.itemSortValue(first, sortKey),
        this.itemSortValue(second, sortKey),
        this.itemSortDirection,
      ),
    );
  }

  itemTotalWorth(aggregate: ItemAggregate): number {
    return aggregate.item.sell_price * (aggregate.fromEnemies + aggregate.fromChests);
  }

  get moneyFromEnemies(): number {
    return this.allKills.reduce(
      (total, kill) => total + (this.isChest(kill.enemy) ? 0 : kill.dropped_money),
      0,
    );
  }

  get moneyFromChests(): number {
    return this.allKills.reduce(
      (total, kill) => total + (this.isChest(kill.enemy) ? kill.dropped_money : 0),
      0,
    );
  }

  get nonChestKillCount(): number {
    return this.allKills.filter((kill) => !this.isChest(kill.enemy)).length;
  }

  get allItemWorth(): number {
    return this.allKills.reduce((total, kill) => total + this.itemWorth(kill), 0);
  }

  get enemyItemWorth(): number {
    return this.allKills.reduce(
      (total, kill) => total + (this.isChest(kill.enemy) ? 0 : this.itemWorth(kill)),
      0,
    );
  }

  get chestItemWorth(): number {
    return this.allKills.reduce(
      (total, kill) => total + (this.isChest(kill.enemy) ? this.itemWorth(kill) : 0),
      0,
    );
  }

  itemCount(kill: KilledEnemy): number {
    return kill.dropped_items.reduce((total, drop) => total + drop.amount, 0);
  }

  itemWorth(kill: KilledEnemy): number {
    return kill.dropped_items.reduce(
      (total, drop) => total + drop.item.sell_price * drop.amount,
      0,
    );
  }

  killWorth(kill: KilledEnemy): number {
    return this.itemWorth(kill) + kill.dropped_money;
  }

  formatMoney(copper: number, decimals = 0): string {
    const rounded = Number(copper.toFixed(decimals));
    const gold = Math.floor(rounded / 10000);
    const silver = Math.floor((rounded % 10000) / 100);
    const copperRemainder = Number((rounded % 100).toFixed(decimals));
    const parts: string[] = [];

    if (gold > 0) {
      parts.push(`${gold} gold`);
    }
    if (silver > 0) {
      parts.push(`${silver} silver`);
    }
    if (copperRemainder > 0 || parts.length === 0) {
      parts.push(`${copperRemainder.toFixed(decimals)} copper`);
    }

    return parts.join(' ');
  }

  moneyParts(copper: number): MoneyPart[] {
    const amount = Math.round(copper);
    const parts: MoneyPart[] = [];
    const gold = Math.floor(amount / 10000);
    const silver = Math.floor((amount % 10000) / 100);
    const copperRemainder = amount % 100;

    if (gold > 0) {
      parts.push({ denomination: 'gold', amount: gold, displayAmount: `${gold}` });
    }
    if (gold > 0 || silver > 0) {
      parts.push({
        denomination: 'silver',
        amount: silver,
        displayAmount: gold > 0 ? `${silver}`.padStart(2, '0') : `${silver}`,
      });
    }
    if (gold > 0 || silver > 0 || copperRemainder > 0 || parts.length === 0) {
      parts.push({
        denomination: 'copper',
        amount: copperRemainder,
        displayAmount: gold > 0 || silver > 0
          ? `${copperRemainder}`.padStart(2, '0')
          : `${copperRemainder}`,
      });
    }

    return parts;
  }

  moneyPartsLabel(copper: number): string {
    return this.moneyParts(copper)
      .map((part) => `${part.amount} ${part.denomination}`)
      .join(', ');
  }

  average(value: number): number {
    return this.filteredKills.length === 0 ? 0 : value / this.filteredKills.length;
  }

  averageForEnemy(value: number, kills: number): number {
    return kills === 0 ? 0 : value / kills;
  }

  averageKillsPerDrop(kills: number): number | null {
    return kills === 0 ? null : this.nonChestKillCount / kills;
  }

  sortEnemyBy(key: EnemySortKey): void {
    if (this.enemySortKey === key) {
      this.enemySortDirection = this.enemySortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.enemySortKey = key;
    this.enemySortDirection = key === 'enemy' ? 'asc' : 'desc';
  }

  sortItemBy(key: ItemSortKey): void {
    if (this.itemSortKey === key) {
      this.itemSortDirection = this.itemSortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.itemSortKey = key;
    this.itemSortDirection = key === 'item' ? 'asc' : 'desc';
  }

  enemySortIndicator(key: EnemySortKey): string {
    return this.enemySortKey !== key ? '↕' : this.enemySortDirection === 'asc' ? '↑' : '↓';
  }

  itemSortIndicator(key: ItemSortKey): string {
    return this.itemSortKey !== key ? '↕' : this.itemSortDirection === 'asc' ? '↑' : '↓';
  }

  enemySortAria(key: EnemySortKey): string | null {
    return this.enemySortKey !== key
      ? null
      : this.enemySortDirection === 'asc' ? 'ascending' : 'descending';
  }

  itemSortAria(key: ItemSortKey): string | null {
    return this.itemSortKey !== key
      ? null
      : this.itemSortDirection === 'asc' ? 'ascending' : 'descending';
  }

  isChest(enemy: Enemy): boolean {
    return enemy.name.trim().toLocaleLowerCase() === 'chest';
  }

  isEnemyNameSelected(name: string): boolean {
    return this.selectedEnemyNames === null || this.selectedEnemyNames.includes(name);
  }

  setEnemyNameSelected(name: string, selected: boolean): void {
    const names = new Set(this.selectedEnemyNames ?? this.enemyNames);
    if (selected) {
      names.add(name);
    } else {
      names.delete(name);
    }

    this.selectedEnemyNames = this.enemyNames.every((enemyName) => names.has(enemyName))
      ? null
      : [...names];
  }

  setAllEnemyNames(selected: boolean): void {
    this.selectedEnemyNames = selected ? null : [];
  }

  resetFilters(): void {
    this.includeChests = true;
    this.selectedEnemyNames = null;
    this.minimumLevel = null;
    this.maximumLevel = null;
  }

  private worthKill(
    isBetter: (current: KilledEnemy, candidate: KilledEnemy) => boolean,
  ): KilledEnemy | null {
    const kills = this.filteredKills;
    if (kills.length === 0) {
      return null;
    }

    return kills.reduce((best, candidate) => isBetter(best, candidate) ? candidate : best);
  }

  private enemySortValue(aggregate: EnemyAggregate, key: EnemySortKey): number | string {
    switch (key) {
      case 'enemy':
        return `${aggregate.enemy.name}\u0000${aggregate.enemy.level}\u0000${aggregate.enemy.id}`;
      case 'kills':
        return aggregate.kills;
      case 'items':
        return aggregate.items;
      case 'averageItems':
        return this.averageForEnemy(aggregate.items, aggregate.kills);
      case 'totalWorth':
        return aggregate.totalWorth;
      case 'averageTotalWorth':
        return this.averageForEnemy(aggregate.totalWorth, aggregate.kills);
      case 'itemsWorth':
        return aggregate.itemsWorth;
      case 'averageItemsWorth':
        return this.averageForEnemy(aggregate.itemsWorth, aggregate.kills);
      case 'money':
        return aggregate.money;
      case 'averageMoney':
        return this.averageForEnemy(aggregate.money, aggregate.kills);
    }
  }

  private itemSortValue(aggregate: ItemAggregate, key: ItemSortKey): number | string | null {
    switch (key) {
      case 'item':
        return `${aggregate.item.name}\u0000${aggregate.item.id}`;
      case 'fromEnemies':
        return aggregate.fromEnemies;
      case 'fromChests':
        return aggregate.fromChests;
      case 'totalLooted':
        return aggregate.fromEnemies + aggregate.fromChests;
      case 'killsPerDrop':
        return this.averageKillsPerDrop(aggregate.enemyDropKills);
      case 'unitWorth':
        return aggregate.item.sell_price;
      case 'totalWorth':
        return this.itemTotalWorth(aggregate);
    }
  }

  private compareValues(
    first: number | string | null,
    second: number | string | null,
    direction: 'asc' | 'desc',
  ): number {
    if (first === null) {
      return second === null ? 0 : 1;
    }
    if (second === null) {
      return -1;
    }

    const result = typeof first === 'string' && typeof second === 'string'
      ? first.localeCompare(second)
      : Number(first) - Number(second);
    return direction === 'asc' ? result : -result;
  }
}
