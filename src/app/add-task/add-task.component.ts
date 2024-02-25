import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, AbstractControl, ValidatorFn } from '@angular/forms';
import { TodoService } from '../todo.service';
import { Todo } from '../model';
import { ToastService, ToastType } from '../toast.service';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css'],
})


export class AddTaskComponent implements OnInit {
  
  addTaskForm: FormGroup = new FormGroup({});
  minDate: Date = new Date();
  todos: Todo[] = []
  constructor(
    private fb: FormBuilder,
    private service: TodoService,
    private toast: ToastService,
  ) { }

  ngOnInit(): void{
    this.addTaskForm = this.fb.group({
      title: ["", [Validators.required, this.ignoreSpacesValidator()]],
      dueDate: [],
    })
    this.todos = this.service.getTodos();
  }

  addTask() {
    const data = {
      id: this.service.generateUniqueId(),
      title: this.addTaskForm.controls['title'].value,
      dueDate: this.addTaskForm.controls['dueDate'].value,
      completed: false
    }
    if(!this.service.checkTaskExists(data)){
      this.service.addTodo(data);
      this.resetForm();
    } else {
      this.toast.showToast(`Such Task Already Exists: ${data.title}`,ToastType.Error)
    }
  }

  ignoreSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value && control.value.trim().length === 0) {
        return { 'spaces': true };
      }
      return null;
    };
  }

  resetForm(){
    this.addTaskForm.reset();
  }
}
