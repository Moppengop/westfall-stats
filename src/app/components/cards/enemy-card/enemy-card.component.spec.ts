import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnemyCardComponent } from './enemy-card.component';

describe('EnemyCardComponent', () => {
  let component: EnemyCardComponent;
  let fixture: ComponentFixture<EnemyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnemyCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnemyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
