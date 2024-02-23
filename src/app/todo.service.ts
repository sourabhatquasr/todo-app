import { Injectable } from '@angular/core';
import { Todo } from './model';


@Injectable({
  providedIn: 'root'
})


export class TodoService {
  private todos: Todo[] = [
    { id: 2024220114544350, title: 'code', completed: false, description: "I like to code using Angular Framework"},
    { id: 2024219114544351, title: 'eat', completed: false },
    { id: 2024218114544352, title: 'sleep', completed: false },
    { id: 2024217114544353, title: 'repeat', completed: true, completedDate: "2024-02-17T03:38:18.375Z" },
  ];

  constructor() { }

  getTodos(): Todo[] {
    return this.todos;
  }

  // Add a new task
  addTodo(todo: Todo): void {
      this.todos.unshift(todo);
      console.log("New Task Added: ", todo.title);
    }
    
    // Toggle a task to completed or not
  toggleCompletion(todo: Todo): void {
    const index = this.todos.findIndex(i => i.id === todo.id);
    this.todos[index].completed = !this.todos[index].completed;
    if (todo.completed) {
      this.todos[index].completedDate = new Date;
      console.log(todo.title, " has been Completed");
    } else {
      console.log(todo.title, " is Incomplete");
    }
  }

  // Update a task 
  updateTodo(todo: Todo): void{
    let toDelete: number = todo.id;
    this.todos = this.todos.filter(todo => todo.id !== toDelete);
    this.todos.unshift(todo);
  }

  // Delete a task
  deleteTodo(todo: Todo): void {
    let toDelete: number = todo.id;
    this.todos = this.todos.filter(todo => todo.id != toDelete);
    this.getTodos();
    console.log("Deleted task: " + todo.title)
  }

  checkTaskExists(todo: Todo): boolean{
    let exists = true;
    const index = this.todos.findIndex(i => i.title.toLowerCase() === todo.title.toLowerCase());
    if (index === -1){
      exists = false;
    }
    return exists
  }

  generateUniqueId(): number {
    let date = new Date();
    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString().padStart(0);
    let day = date.getDate().toString();
    let hour = date.getHours().toString();
    let min = date.getMinutes().toString();
    let sec = date.getSeconds().toString();
    let miliSec = date.getMilliseconds().toString();

    const concat: number = parseInt(year + month + day + hour + min + sec + miliSec);
    return concat;
  }
}
