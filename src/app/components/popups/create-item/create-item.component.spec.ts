import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateItemComponent } from './create-item.component';

describe('CreateItemComponent', () => {
  let component: CreateItemComponent;
  let fixture: ComponentFixture<CreateItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits the entered item when submitted', () => {
    component.name = 'Copper Tube';
    component.sellPrice = 100;
    spyOn(component.submitted, 'emit');

    component.submit();

    expect(component.submitted.emit).toHaveBeenCalledWith({
      name: 'Copper Tube',
      sell_price: 100,
    });
  });
});
