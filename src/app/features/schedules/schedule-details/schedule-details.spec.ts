import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleDetails } from './schedule-details';

describe('ScheduleDetails', () => {
  let component: ScheduleDetails;
  let fixture: ComponentFixture<ScheduleDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
