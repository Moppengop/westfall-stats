import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Enemy } from '../../models/enemy';
import { KilledEnemy } from '../../models/killed_enemy';
import { MainService } from '../../services/main.service';
import { StatsComponent } from './stats.component';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;

  const wolf: Enemy = { id: 1, name: 'Wolf', level: 5, health: 25 };
  const quest: Enemy = { id: 2, name: 'Quest', level: 1, health: 1 };
  const kills: KilledEnemy[] = [
    { kill_number: 1, enemy: wolf, dropped_items: [], dropped_money: 5 },
    { kill_number: 2, enemy: quest, dropped_items: [], dropped_money: 10 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsComponent],
      providers: [{
        provide: MainService,
        useValue: { killedEnemies: signal(kills) },
      }],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('excludes quest entries from filtered statistics by default', () => {
    expect(component.includeQuests).toBeFalse();
    expect(component.filteredKills).toEqual([kills[0]]);
  });

  it('includes quest entries when enabled and restores their exclusion on reset', () => {
    component.includeQuests = true;
    expect(component.filteredKills).toEqual(kills);

    component.resetFilters();

    expect(component.includeQuests).toBeFalse();
    expect(component.filteredKills).toEqual([kills[0]]);
  });
});
