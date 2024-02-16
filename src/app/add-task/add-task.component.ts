import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TodoService } from '../todo.service';
import { Todo } from '../model';


@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})


export class AddTaskComponent implements OnInit {
  
  id: number = 0
  addTaskForm: FormGroup = new FormGroup({});
  todos: Todo[] = []
  constructor(
    private fb: FormBuilder,
    private service: TodoService
  ) { }

  ngOnInit(): void{
    this.addTaskForm = this.fb.group({
      title: ["", Validators.required],
    })
    this.todos = this.service.getTodos()
  }

  addTask() {
    const data = {
      id: this.todos.length +1,
      title: this.addTaskForm.controls['title'].value,
      completed: false
    }
    this.service.addTodo(data)
    this.addTaskForm.reset()
    this.service.getTodos()
  }
}
