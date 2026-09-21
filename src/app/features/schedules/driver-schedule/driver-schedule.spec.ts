import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverSchedule } from './driver-schedule';

describe('DriverSchedule', () => {
  let component: DriverSchedule;
  let fixture: ComponentFixture<DriverSchedule>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverSchedule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverSchedule);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
