import { Component, Inject } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TodoService } from '../todo.service';
import { Todo } from '../model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


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
  ) { }

  ngOnInit(): void {
    this.updateTaskForm = this.fb.group({
      id: [this.data.id],
      title: [this.data.title, Validators.required],
      dueDate: [this.data.dueDate],
      description: [this.data.description],
    })
  }

  checkTodoUnique(){
    let exists = false;
    this.todos = this.service.getTodos();
    let taskTitles: string[] = [];
    let otherTasks = this.todos.filter(todo => todo.title !== this.data.title);
    otherTasks.forEach(element => {
      taskTitles.push(element.title);
    });
    if (taskTitles.includes(this.updateTaskForm.controls['title'].value.toLowerCase())) {
      exists = false;
    } else {
      exists = true;
    }
    return exists;
  }

  updateTasks() {
    let updatedData = {
      id: this.data.id,
      title: this.updateTaskForm.controls['title'].value.toLowerCase(),
      dueDate: this.updateTaskForm.controls['dueDate'].value,
      description: this.updateTaskForm.controls['description'].value,
      completed: false,
    }
    if(this.checkTodoUnique()){
      this.service.updateTodo(updatedData)
    } else {
      alert("Task with name " + updatedData.title.toLocaleUpperCase() + " exists")
    }
  }
}
