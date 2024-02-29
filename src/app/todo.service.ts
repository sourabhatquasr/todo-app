import { Injectable } from '@angular/core';
import { Todo } from './model';
import { ToastService, ToastType } from './toast.service';
import { ValidatorFn, AbstractControl } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})

export class TodoService {
  private todos: Todo[] = [
    { id: 1709225620161, title: 'Code', completed: false, description: "I like to code using Angular Framework because it is very challenging." },
    { id: 1709215610182, title: 'Eat', completed: false, dueDate: new Date("2024-02-17T03:38:18.375Z") },
    { id: 1709221654621, title: 'Sleep', completed: false, dueDate: new Date("2024-03-17T03:38:18.375Z") },
    { id: 1709221456744, title: 'Repeat', completed: true, completedDate: new Date("2024-02-17T03:38:18.375Z") },
  ];

  loggedInUser: string = '';

  constructor(private toast: ToastService) { }

  usernameSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value && control.value.indexOf(' ') !== -1) {
        return { 'spaces': true };
      }
      return null;
    };
  }

  ignoreSpacesValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control.value && control.value.trim().length === 0) {
        return { 'spaces': true };
      }
      return null;
    };
  }

  getTodos(): Todo[] {
    return this.todos;
  }

  // Add a new task
  addTodo(todo: Todo): void {
    this.todos.unshift(todo);
  }

  // Update a task 
  updateTodo(todo: Todo): void {
    let toDelete: number = todo.id;
    this.todos = this.todos.filter(todo => todo.id !== toDelete);
    this.todos.unshift(todo);
  }

  // Delete a task
  deleteTodo(todo: Todo): void {
    let toDelete: number = todo.id;
    this.todos = this.todos.filter(todo => todo.id != toDelete);
    this.getTodos();
    this.toast.showToast(`'${todo.title}' Deleted Successfully`, ToastType.Error)
  }

    checkTaskExists(todo: Todo, type ?: 'edit'): boolean {
      if (type === 'edit') {
        const otherTasks = this.getTodos().filter(t => t.id !== todo.id);
        return otherTasks.some(task => task.title === todo.title);
      } else {
        return this.getTodos().some(task => task.title === todo.title);
      }
    }
}