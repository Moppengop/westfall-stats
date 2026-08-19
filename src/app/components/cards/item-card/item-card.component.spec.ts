import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemCardComponent } from './item-card.component';

describe('ItemCardComponent', () => {
  let component: ItemCardComponent;
  let fixture: ComponentFixture<ItemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemCardComponent);
    component = fixture.componentInstance;
    component.item = {
      id: 1,
      name: 'Health Potion',
      sell_price: 10039503,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formats sell price as gold, silver, and copper', () => {
    expect(component.formattedSellPrice).toBe('1003 gold 95 silver 3 copper');
  });

  it('formats 100 copper as 1 silver', () => {
    component.item.sell_price = 100;

    expect(component.formattedSellPrice).toBe('1 silver');
  });

  it('formats 99 copper as 99 copper', () => {
    component.item.sell_price = 99;

    expect(component.formattedSellPrice).toBe('99 copper');
  });

  it('formats 136 copper as 1 silver and 36 copper', () => {
    component.item.sell_price = 136;

    expect(component.formattedSellPrice).toBe('1 silver 36 copper');
  });

  it('formats 10005 copper as 1 gold and 5 copper', () => {
    component.item.sell_price = 10005;

    expect(component.formattedSellPrice).toBe('1 gold 5 copper');
  });

  it('formats 12255 copper as 1 gold, 22 silver, and 55 copper', () => {
    component.item.sell_price = 12255;

    expect(component.formattedSellPrice).toBe('1 gold 22 silver 55 copper');
  });
});
