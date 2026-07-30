import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfimrationDialogComponent } from './confimration-dialog.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../material.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TaskStatus } from '../model';

describe('ConfimrationDialogComponent', () => {
  let component: ConfimrationDialogComponent;
  let fixture: ComponentFixture<ConfimrationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MaterialModule, NoopAnimationsModule ],
      declarations: [ ConfimrationDialogComponent ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            id: 1,
            title: 'Test Task',
            status: TaskStatus.Todo
          }
        }
      ]
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
