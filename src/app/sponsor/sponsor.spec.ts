import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sponsor } from './sponsor';

describe('Sponsor', () => {
  let component: Sponsor;
  let fixture: ComponentFixture<Sponsor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sponsor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sponsor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
