import { Component, Input } from '@angular/core';
import { Item } from '../../../models/item';

@Component({
  selector: 'app-item-card',
  imports: [],
  templateUrl: './item-card.component.html',
  styleUrl: './item-card.component.scss',
})
export class ItemCardComponent {
  @Input() item!: Item;

  get formattedSellPrice(): string {
    const gold = Math.floor(this.item.sell_price / 10000);
    const silver = Math.floor((this.item.sell_price % 10000) / 100);
    const copper = this.item.sell_price % 100;

    let formattedPrice = '';

    if (gold > 0) {
      formattedPrice += `${gold} gold `;
    }
    if (silver > 0) {
      formattedPrice += `${silver} silver `;
    }
    if (copper > 0) {
      formattedPrice += `${copper} copper`;
    }

    return formattedPrice;
  }
}
