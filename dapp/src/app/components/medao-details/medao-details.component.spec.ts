import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedaoDetailsComponent } from './medao-details.component';

describe('MedaoDetailsComponent', () => {
  let component: MedaoDetailsComponent;
  let fixture: ComponentFixture<MedaoDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedaoDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedaoDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
