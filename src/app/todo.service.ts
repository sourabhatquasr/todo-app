import { Injectable } from '@angular/core';
import { TaskStatus, Todo } from './model';
import { ToastService, ToastType } from './toast.service';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  loggedInUser: string = '';
  todos: Todo[] = [];

  constructor(
    private toast: ToastService,
    private http: HttpClient
  ) {
    this.loggedInUser = localStorage.getItem('username') || '';
    this.syncAndLoadTodos();
  }

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

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`
    });
  }

  syncAndLoadTodos(): void {
    const username = localStorage.getItem('username');
    if (!username) {
      this.todos.length = 0;
      return;
    }

    // Populate with local storage cache first to prevent any UI delay / flicker
    const cached = this.getTodosFromLocalStorage();
    this.todos.length = 0;
    this.todos.push(...cached);

    const token = localStorage.getItem('token');
    if (!token || token === 'offline-fallback-token') {
      return; // Offline fallback mode, no server calls
    }

    this.http.get<Todo[]>('/api/todos', { headers: this.getAuthHeaders() }).subscribe({
      next: (data) => {
        const parsed = data.map(t => ({
          ...t,
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          completedDate: t.completedDate ? new Date(t.completedDate) : undefined
        }));

        // Mutate in-place to keep component array references valid
        this.todos.length = 0;
        this.todos.push(...parsed);

        // Update local cache
        localStorage.setItem(`todos_${username}`, JSON.stringify(this.todos));
      },
      error: (err) => {
        console.warn('Failed to sync todos from backend. Operating in cached offline mode.', err);
      }
    });
  }

  private getTodosFromLocalStorage(): Todo[] {
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

  getTodos(): Todo[] {
    if (this.todos.length === 0) {
      const cached = this.getTodosFromLocalStorage();
      this.todos.push(...cached);
    }
    return this.todos;
  }

  // Add a new task
  addTodo(todo: Todo): void {
    this.todos.unshift(todo);
    const username = localStorage.getItem('username') || 'default';
    localStorage.setItem(`todos_${username}`, JSON.stringify(this.todos));

    const token = localStorage.getItem('token');
    if (token && token !== 'offline-fallback-token') {
      this.http.post<Todo>('/api/todos', todo, { headers: this.getAuthHeaders() }).subscribe({
        next: (savedTodo) => {
          console.log('Todo added to server database successfully.', savedTodo);
        },
        error: (err) => {
          console.error('Failed to sync added todo with server database.', err);
        }
      });
    }
  }

  // Update a task 
  updateTodo(todo: Todo): void {
    const idx = this.todos.findIndex(t => t.id === todo.id);
    if (idx !== -1) {
      this.todos[idx] = todo;
    } else {
      this.todos.unshift(todo);
    }
    const username = localStorage.getItem('username') || 'default';
    localStorage.setItem(`todos_${username}`, JSON.stringify(this.todos));

    const token = localStorage.getItem('token');
    if (token && token !== 'offline-fallback-token') {
      this.http.put<Todo>(`/api/todos/${todo.id}`, todo, { headers: this.getAuthHeaders() }).subscribe({
        next: (updatedTodo) => {
          console.log('Todo updated on server database successfully.', updatedTodo);
        },
        error: (err) => {
          console.error('Failed to sync updated todo with server database.', err);
        }
      });
    }
  }

  // Delete a task
  deleteTodo(todo: Todo): void {
    const idx = this.todos.findIndex(t => t.id === todo.id);
    if (idx !== -1) {
      this.todos.splice(idx, 1);
    }
    const username = localStorage.getItem('username') || 'default';
    localStorage.setItem(`todos_${username}`, JSON.stringify(this.todos));

    this.toast.showToast(`'${todo.title}' Deleted Successfully`, ToastType.Error);

    const token = localStorage.getItem('token');
    if (token && token !== 'offline-fallback-token') {
      this.http.delete(`/api/todos/${todo.id}`, { headers: this.getAuthHeaders() }).subscribe({
        next: () => {
          console.log('Todo deleted on server database successfully.');
        },
        error: (err) => {
          console.error('Failed to sync deleted todo with server database.', err);
        }
      });
    }
  }

  checkTaskExists(todo: Todo, type?: 'edit'): boolean {
    if (type === 'edit') {
      const otherTasks = this.getTodos().filter(t => t.id !== todo.id);
      return otherTasks.some(task => task.title === todo.title);
    } else {
      return this.getTodos().some(task => task.title === todo.title);
    }
  }
}
