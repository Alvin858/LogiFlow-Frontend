import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleCalender } from './schedule-calender';

describe('ScheduleCalender', () => {
  let component: ScheduleCalender;
  let fixture: ComponentFixture<ScheduleCalender>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleCalender]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleCalender);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
