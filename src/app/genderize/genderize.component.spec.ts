import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenderizeComponent } from './genderize.component';

describe('GenderizeComponent', () => {
  let component: GenderizeComponent;
  let fixture: ComponentFixture<GenderizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenderizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenderizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
