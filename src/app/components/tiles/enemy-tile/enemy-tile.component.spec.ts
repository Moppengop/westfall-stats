import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnemyTileComponent } from './enemy-tile.component';

describe('EnemyTileComponent', () => {
  let component: EnemyTileComponent;
  let fixture: ComponentFixture<EnemyTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnemyTileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnemyTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
