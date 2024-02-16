import { Injectable } from '@angular/core';
import { Todo } from './model';


@Injectable({
  providedIn: 'root'
})


export class TodoService {
  private todos: Todo[] = [
    { id: 1, title: 'Eat', completed: false },
    { id: 2, title: 'Sleep', completed: false },
    { id: 3, title: 'Repeat', completed: true },
  ];
  
  constructor() { }

  getTodos(): Todo[] {
    return this.todos;
  }

  // Add a new task
  addTodo(todo: Todo): void {
    this.todos.push(todo);
  }

  // Toggle a task to completed or not
  toggleCompletion(todo:Todo): void{
    const index = this.todos.findIndex(i => i.id === todo.id);
    this.todos[index].completed = !this.todos[index].completed;
  }

  // Delete a task
  deleteTodo(id: number): void {
    this.todos = this.todos.filter(todo => todo.id !== id);
  }
}
