import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedaoComponent } from './medao.component';

describe('MedaoComponent', () => {
  let component: MedaoComponent;
  let fixture: ComponentFixture<MedaoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedaoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
