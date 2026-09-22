import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverDeliveries } from './driver-deliveries';

describe('DriverDeliveries', () => {
  let component: DriverDeliveries;
  let fixture: ComponentFixture<DriverDeliveries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DriverDeliveries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DriverDeliveries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
