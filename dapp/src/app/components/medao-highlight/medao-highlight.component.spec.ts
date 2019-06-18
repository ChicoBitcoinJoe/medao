import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MedaoHighlightComponent } from './medao-highlight.component';

describe('MedaoHighlightComponent', () => {
  let component: MedaoHighlightComponent;
  let fixture: ComponentFixture<MedaoHighlightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MedaoHighlightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedaoHighlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
