import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DroppedItems } from '../../../models/dropped_items';
import { Enemy } from '../../../models/enemy';
import { Item } from '../../../models/item';

export interface NewKillData {
  enemy: Enemy;
  dropped_items: DroppedItems[];
  dropped_money: number;
}

interface ItemDropRow {
  item: Item | null;
  amount: number | null;
}

@Component({
  selector: 'app-create-kill',
  imports: [FormsModule],
  templateUrl: './create-kill.component.html',
  styleUrl: './create-kill.component.scss',
})
export class CreateKillComponent {
  @Input() enemies: Enemy[] = [];
  @Input() items: Item[] = [];
  @Input()
  set fixedEnemy(enemy: Enemy | null) {
    this._fixedEnemy = enemy;
    if (enemy) {
      this.selectedEnemy = enemy;
    }
  }

  get fixedEnemy(): Enemy | null {
    return this._fixedEnemy;
  }

  @Output() submitted = new EventEmitter<NewKillData>();
  @Output() cancelled = new EventEmitter<void>();

  private _fixedEnemy: Enemy | null = null;
  selectedEnemy: Enemy | null = null;
  droppedMoney = 0;
  itemRows: ItemDropRow[] = [];

  get sortedItems(): Item[] {
    return [...this.items].sort((first, second) => first.name.localeCompare(second.name));
  }

  get isSubmitDisabled(): boolean {
    return !this.selectedEnemy
      || this.droppedMoney < 0
      || this.itemRows.some((row) => !row.item || !row.amount || row.amount < 1);
  }

  addItemRow(): void {
    this.itemRows.push({ item: null, amount: 1 });
  }

  removeItemRow(index: number): void {
    this.itemRows.splice(index, 1);
  }

  submit(): void {
    const enemy = this.selectedEnemy;

    if (this.isSubmitDisabled || !enemy) {
      return;
    }

    this.submitted.emit({
      enemy,
      dropped_items: this.itemRows.map((row) => ({
        item: row.item as Item,
        amount: row.amount as number,
      })),
      dropped_money: this.droppedMoney,
    });
  }
}
