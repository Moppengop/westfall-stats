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

  it('emits the entered enemy when submitted', () => {
    component.name = 'Defias Scout';
    component.level = 8;
    component.health = 75;
    spyOn(component.submitted, 'emit');

    component.submit();

    expect(component.submitted.emit).toHaveBeenCalledWith({
      name: 'Defias Scout',
      level: 8,
      health: 75,
    });
  });
});
