import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavRightComponent } from './sidenav-right.component';

describe('SidenavRightComponent', () => {
  let component: SidenavRightComponent;
  let fixture: ComponentFixture<SidenavRightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidenavRightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
