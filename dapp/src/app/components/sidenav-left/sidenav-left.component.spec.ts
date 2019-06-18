import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidenavLeftComponent } from './sidenav-left.component';

describe('SidenavLeftComponent', () => {
  let component: SidenavLeftComponent;
  let fixture: ComponentFixture<SidenavLeftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidenavLeftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidenavLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
