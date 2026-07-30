import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewTasksComponent } from './view-tasks.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ViewTasksComponent', () => {
  let component: ViewTasksComponent;
  let fixture: ComponentFixture<ViewTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MatDialogModule ],
      declarations: [ ViewTasksComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
