import { Component } from '@angular/core';
import { MainService } from '../../services/main.service';
import { KilledEnemy } from '../../models/killed_enemy';

@Component({
  selector: 'app-stats',
  imports: [],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent {
  constructor(readonly mainService: MainService) {}

  enemyWorth(enemy: KilledEnemy, type: 'items' | 'money' | 'total'): number {
    var itemsWorth = 0;
    var moneyWorth = 0;
    for (const droppedItem of enemy.dropped_items) {
      itemsWorth += droppedItem.item.sell_price * droppedItem.amount;
    }
    moneyWorth += enemy.dropped_money;
    switch (type) {
      case 'items':
        return itemsWorth;
      case 'money':
        return moneyWorth;
      case 'total':
        return itemsWorth + moneyWorth;
    }
  }

  allEnemiesWorth(enemies: KilledEnemy[], type: 'items' | 'money' | 'total'): number {
    var itemsWorth = 0;
    var moneyWorth = 0;
    for (const enemy of enemies) {
      itemsWorth += this.enemyWorth(enemy, 'items');
      moneyWorth += this.enemyWorth(enemy, 'money');
    }
    switch (type) {
      case 'items':
        return itemsWorth;
      case 'money':
        return moneyWorth;
      case 'total':
        return itemsWorth + moneyWorth;
    }
  }
}
