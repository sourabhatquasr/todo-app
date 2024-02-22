import { Injectable } from '@angular/core';
import { Todo } from './model';


@Injectable({
  providedIn: 'root'
})


export class TodoService {
  private todos: Todo[] = [
    { id: 2024220114544350, title: 'Code', completed: false, dueDate: "2024-02-02T03:38:18.375Z"},
    { id: 2024219114544351, title: 'Eat', completed: false },
    { id: 2024218114544352, title: 'Sleep', completed: false },
    { id: 2024217114544353, title: 'Repeat', completed: true, completedDate: "2024-02-17T03:38:18.375Z" },
  ];
  
  constructor() { }

  getTodos(): Todo[] {
    return this.todos;
  }

  // Add a new task
  addTodo(todo: Todo): void {
    this.todos.unshift(todo);
    console.log("New Task Added: ", todo.title);
    this.getTodos();
  }

  // Toggle a task to completed or not
  toggleCompletion(todo: Todo): void{
    const index = this.todos.findIndex(i => i.id === todo.id);
    this.todos[index].completed = !this.todos[index].completed;
    if(todo.completed){
      this.todos[index].completedDate = new Date;
      console.log(todo.title, " has been Completed");
    } else{
      console.log(todo.title, " is Incomplete");
    }
  }

  // Delete a task
  deleteTodo(id: number): void {
    this.todos = this.todos.filter(todo => todo.id !== id);
    console.log("Deleted todo with ID: " + id)
  }

  checkTaskExists(todo: Todo): boolean{
    let exists = true;
    const index = this.todos.findIndex(i => i.title.toLowerCase() === todo.title.toLowerCase());
    if (index === -1){
      exists = false;
    }
    return exists
  }

  generateUniqueId(): number{
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
