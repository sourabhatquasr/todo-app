import { Component, Inject } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TodoService } from '../todo.service';
import { TaskStatus, Todo } from '../model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService, ToastType } from '../toast.service';


@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent {
  
  exists: boolean = false;
  minDate = new Date();
  updateTaskForm: FormGroup = new FormGroup({});
  todos: Array<Todo> = [] 
  todo = MAT_DIALOG_DATA;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Todo,
    private fb: FormBuilder,
    private service: TodoService,
    private toast: ToastService,
  ) { }

  ngOnInit(): void {
    this.updateTaskForm = this.fb.group({
      id: [this.data.id],
      title: [this.data.title, Validators.required],
      dueDate: [this.data.dueDate],
      description: [this.data.description],
    })
  }

  updateTasks() {
    let updatedData = {
      id: this.data.id,
      title: this.updateTaskForm.controls['title'].value,
      dueDate: this.updateTaskForm.controls['dueDate'].value,
      description: this.updateTaskForm.controls['description'].value,
      status: TaskStatus.Todo,
    }
    if(!this.service.checkTaskExists(updatedData, 'edit')){
      this.service.updateTodo(updatedData);
      this.toast.showToast(`Details of task: ${updatedData.title} modified!`, ToastType.Success)
    } else {
      this.toast.showToast(`Task with title: ${updatedData.title} already exists!`, ToastType.Error)
    }
  }
}
