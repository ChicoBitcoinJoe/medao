import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedaoHeaderComponent } from './medao-header.component';

describe('MedaoHeaderComponent', () => {
  let component: MedaoHeaderComponent;
  let fixture: ComponentFixture<MedaoHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedaoHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedaoHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
