import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoBubblesComponent } from './info-bubbles.component';

describe('InfoBubblesComponent', () => {
  let component: InfoBubblesComponent;
  let fixture: ComponentFixture<InfoBubblesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoBubblesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoBubblesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
