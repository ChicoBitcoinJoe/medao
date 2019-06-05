import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabletViewComponent } from './tablet-view.component';

describe('TabletViewComponent', () => {
  let component: TabletViewComponent;
  let fixture: ComponentFixture<TabletViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabletViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabletViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
