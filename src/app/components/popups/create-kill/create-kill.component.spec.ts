import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Enemy } from '../../../models/enemy';
import { Item } from '../../../models/item';
import { KilledEnemy } from '../../../models/killed_enemy';
import { MainService } from '../../../services/main.service';
import { CreateKillComponent } from './create-kill.component';

describe('CreateKillComponent', () => {
  let component: CreateKillComponent;
  let fixture: ComponentFixture<CreateKillComponent>;
  let kills: KilledEnemy[];

  const enemy: Enemy = { id: 1, name: 'Wolf', level: 5, health: 25 };
  const otherEnemy: Enemy = { id: 2, name: 'Bear', level: 10, health: 50 };
  const copper: Item = { id: 1, name: 'Copper', sell_price: 10 };
  const hat: Item = { id: 2, name: 'Hat', sell_price: 20 };
  const apple: Item = { id: 3, name: 'Apple', sell_price: 5 };
  const cloth: Item = { id: 4, name: 'Cloth', sell_price: 8 };
  const items = [copper, hat, apple, cloth];

  beforeEach(async () => {
    kills = [
      {
        kill_number: 1,
        enemy,
        dropped_items: [
          { item: copper, amount: 2 },
          { item: hat, amount: 1 },
          { item: cloth, amount: 1 },
        ],
        dropped_money: 0,
      },
      {
        kill_number: 2,
        enemy,
        dropped_items: [
          { item: hat, amount: 1 },
          { item: cloth, amount: 1 },
        ],
        dropped_money: 0,
      },
      { kill_number: 3, enemy, dropped_items: [{ item: copper, amount: 1 }], dropped_money: 0 },
      { kill_number: 4, enemy: otherEnemy, dropped_items: [{ item: apple, amount: 1 }], dropped_money: 0 },
    ];

    await TestBed.configureTestingModule({
      imports: [CreateKillComponent],
      providers: [{
        provide: MainService,
        useValue: { killedEnemies: signal(kills) },
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateKillComponent);
    component = fixture.componentInstance;
    component.enemies = [otherEnemy, enemy];
    component.items = items;
    component.selectedEnemy = enemy;
    fixture.detectChanges();
  });

  it('orders selected enemy drops by total quantity before alphabetized remaining items', () => {
    expect(component.frequentItems).toEqual([copper, cloth, hat]);
    expect(component.sortedItems).toEqual([apple]);
  });

  it('orders enemies by name and then level', () => {
    const wolfAtHigherLevel = { ...enemy, id: 3, level: 9 };
    const anotherBear = { ...otherEnemy, id: 4, level: 12 };
    component.enemies = [wolfAtHigherLevel, enemy, anotherBear, otherEnemy];

    expect(component.sortedEnemies).toEqual([otherEnemy, anotherBear, enemy, wolfAtHigherLevel]);
  });

  it('has no recent items until an enemy is selected', () => {
    component.selectedEnemy = null;

    expect(component.frequentItems).toEqual([]);
    expect(component.sortedItems).toEqual([apple, cloth, copper, hat]);
  });
});
