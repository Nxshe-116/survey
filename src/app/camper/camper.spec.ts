import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Camper } from './camper';

describe('Camper', () => {
  let component: Camper;
  let fixture: ComponentFixture<Camper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Camper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Camper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
