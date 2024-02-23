import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfimrationDialogComponent } from './confimration-dialog.component';

describe('ConfimrationDialogComponent', () => {
  let component: ConfimrationDialogComponent;
  let fixture: ComponentFixture<ConfimrationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfimrationDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfimrationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
