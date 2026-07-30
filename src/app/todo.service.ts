import { Injectable } from '@angular/core';
import { TaskStatus, Todo } from './model';
import { ToastService, ToastType } from './toast.service';
import { ValidatorFn, AbstractControl } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})

export class TodoService {
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
    const username = localStorage.getItem('username') || 'default';
    const stored = localStorage.getItem(`todos_${username}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Todo[];
        return parsed.map(t => ({
          ...t,
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          completedDate: t.completedDate ? new Date(t.completedDate) : undefined
        }));
      } catch (e) {
        console.error('Error parsing todos from localStorage', e);
      }
    }
    // Default fallback seed tasks
    const defaults: Todo[] = [
      { id: 1709225620161, title: 'Code', status: TaskStatus.Todo, description: "I like to code using Angular Framework because it is very challenging." },
      { id: 1709215610182, title: 'Eat', status: TaskStatus.Todo, dueDate: new Date("2024-02-17T03:38:18.375Z") },
      { id: 1709221654621, title: 'Sleep', status: TaskStatus.InProgress, dueDate: new Date("2024-03-17T03:38:18.375Z") },
      { id: 1709221456744, title: 'Repeat', status: TaskStatus.Completed, completedDate: new Date("2024-02-17T03:38:18.375Z") },
    ];
    localStorage.setItem(`todos_${username}`, JSON.stringify(defaults));
    return defaults;
  }

  // Add a new task
  addTodo(todo: Todo): void {
    const todos = this.getTodos();
    todos.unshift(todo);
    this.saveTodos(todos);
  }

  // Update a task 
  updateTodo(todo: Todo): void {
    let toDelete: number = todo.id;
    const todos = this.getTodos().filter(t => t.id !== toDelete);
    todos.unshift(todo);
    this.saveTodos(todos);
  }

  // Delete a task
  deleteTodo(todo: Todo): void {
    let toDelete: number = todo.id;
    const todos = this.getTodos().filter(t => t.id !== toDelete);
    this.saveTodos(todos);
    this.toast.showToast(`'${todo.title}' Deleted Successfully`, ToastType.Error)
  }

  private saveTodos(todos: Todo[]): void {
    const username = localStorage.getItem('username') || 'default';
    localStorage.setItem(`todos_${username}`, JSON.stringify(todos));
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
