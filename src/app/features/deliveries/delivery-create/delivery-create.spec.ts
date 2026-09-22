import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryCreate } from './delivery-create';

describe('DeliveryCreate', () => {
  let component: DeliveryCreate;
  let fixture: ComponentFixture<DeliveryCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
