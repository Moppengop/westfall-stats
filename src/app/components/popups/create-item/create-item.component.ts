import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface NewItemData {
  name: string;
  sell_price: number;
}

@Component({
  selector: 'app-create-item',
  imports: [FormsModule],
  templateUrl: './create-item.component.html',
  styleUrl: './create-item.component.scss',
})
export class CreateItemComponent {
  @Output() submitted = new EventEmitter<NewItemData>();
  @Output() cancelled = new EventEmitter<void>();

  name = '';
  sellPrice: number | null = null;

  submit(): void {
    if (!this.name.trim() || this.sellPrice === null) {
      return;
    }

    this.submitted.emit({
      name: this.name.trim(),
      sell_price: this.sellPrice,
    });
  }
}
