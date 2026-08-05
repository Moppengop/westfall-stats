import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEnemyComponent } from './create-enemy.component';

describe('CreateEnemyComponent', () => {
  let component: CreateEnemyComponent;
  let fixture: ComponentFixture<CreateEnemyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEnemyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEnemyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
