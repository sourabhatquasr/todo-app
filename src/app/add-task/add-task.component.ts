import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TodoService } from '../todo.service';
import { Todo } from '../model';


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
    private service: TodoService
  ) { }

  ngOnInit(): void{
    this.addTaskForm = this.fb.group({
      title: ["", Validators.required],
      dueDate: [],
    })
    this.todos = this.service.getTodos();
  }

  addTask() {
    const data = {
      id: this.service.generateUniqueId(),
      title: this.addTaskForm.controls['title'].value.toLowerCase(),
      dueDate: this.addTaskForm.controls['dueDate'].value,
      completed: false
    }
    if(!this.service.checkTaskExists(data)){
      this.service.addTodo(data)
      this.resetForm();
    } else {
      alert("Task " + data.title.toUpperCase() + " Exists")
    }
  }

  resetForm(){
    this.addTaskForm.reset();
  }
}
