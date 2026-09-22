import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofOfDelivery } from './proof-of-delivery';

describe('ProofOfDelivery', () => {
  let component: ProofOfDelivery;
  let fixture: ComponentFixture<ProofOfDelivery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProofOfDelivery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProofOfDelivery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
