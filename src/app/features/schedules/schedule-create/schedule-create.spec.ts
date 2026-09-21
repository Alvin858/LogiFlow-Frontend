import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleCreate } from './schedule-create';

describe('ScheduleCreate', () => {
  let component: ScheduleCreate;
  let fixture: ComponentFixture<ScheduleCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
