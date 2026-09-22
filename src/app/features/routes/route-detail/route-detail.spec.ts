import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteDetail } from './route-detail';

describe('RouteDetail', () => {
  let component: RouteDetail;
  let fixture: ComponentFixture<RouteDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
