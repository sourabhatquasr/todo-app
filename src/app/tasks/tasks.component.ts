import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Toast, ToastService, ToastType } from '../toast.service';
import { ViewTasksComponent } from '../view-tasks/view-tasks.component';
import { TodoService } from '../todo.service';
import { TaskStatus } from '../model';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css'],
    standalone: false
})
export class TasksComponent {
  @ViewChild('viewTasks') viewTasks!: ViewTasksComponent;

  loggedInUser: null | string = null;
  toast: Toast | null = null;

  // Dashboard stats
  totalTasks: number = 0;
  todoCount: number = 0;
  ongoingCount: number = 0;
  completedCount: number = 0;
  overdueCount: number = 0;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private todoService: TodoService,
  ) {}

  ngOnInit() {
    this.loggedInUser = localStorage.getItem('username');
    this.toastService.showToast(`Welcome back, ${this.loggedInUser}!`, ToastType.Success);
    this.refreshStats();
  }

  refreshStats() {
    const todos = this.todoService.getTodos();
    const today = new Date();
    this.totalTasks = todos.length;
    this.todoCount = todos.filter(t => t.status === TaskStatus.Todo).length;
    this.ongoingCount = todos.filter(t => t.status === TaskStatus.InProgress).length;
    this.completedCount = todos.filter(t => t.status === TaskStatus.Completed).length;
    this.overdueCount = todos.filter(t =>
      t.dueDate && t.dueDate < today && t.status !== TaskStatus.Completed
    ).length;
  }

  logOut() {
    localStorage.removeItem('username');
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
    this.toastService.showToast('Logged Out Successfully!', ToastType.Success);
    this.loggedInUser = null;
  }

  updateView() {
    this.viewTasks.newTaskAdded();
    this.refreshStats();
  }
}
