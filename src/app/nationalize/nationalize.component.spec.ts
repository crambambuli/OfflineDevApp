import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalizeComponent } from './nationalize.component';

describe('NationalizeComponent', () => {
  let component: NationalizeComponent;
  let fixture: ComponentFixture<NationalizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
