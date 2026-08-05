import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadSaveFileComponent } from './load-save-file.component';

describe('LoadSaveFileComponent', () => {
  let component: LoadSaveFileComponent;
  let fixture: ComponentFixture<LoadSaveFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadSaveFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadSaveFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
