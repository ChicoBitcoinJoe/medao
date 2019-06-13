import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedaoButtonsComponent } from './medao-buttons.component';

describe('MedaoButtonsComponent', () => {
  let component: MedaoButtonsComponent;
  let fixture: ComponentFixture<MedaoButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedaoButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedaoButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
