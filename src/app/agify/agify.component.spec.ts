import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgifyComponent } from './agify.component';

describe('AgifyComponent', () => {
  let component: AgifyComponent;
  let fixture: ComponentFixture<AgifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
