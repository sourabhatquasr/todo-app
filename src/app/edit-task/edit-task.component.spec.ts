import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditTaskComponent } from './edit-task.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TaskStatus } from '../model';

describe('EditTaskComponent', () => {
  let component: EditTaskComponent;
  let fixture: ComponentFixture<EditTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MaterialModule, NoopAnimationsModule],
      declarations: [ EditTaskComponent ],
      providers: [
        FormBuilder,
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            id: 1,
            title: 'Test Task',
            status: TaskStatus.Todo,
            dueDate: new Date(),
            description: 'Test Description'
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
