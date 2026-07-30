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
    // Bolt Optimization: single-pass O(N) loop to calculate all dashboard stats.
    // This avoids 4 separate filter allocations and array iterations, significantly reducing CPU and GC overhead.
    const todos = this.todoService.getTodos();
    const today = new Date();
    this.totalTasks = todos.length;

    let todoCount = 0;
    let ongoingCount = 0;
    let completedCount = 0;
    let overdueCount = 0;

    for (let i = 0; i < todos.length; i++) {
      const t = todos[i];
      const status = t.status;
      if (status === TaskStatus.Todo) {
        todoCount++;
      } else if (status === TaskStatus.InProgress) {
        ongoingCount++;
      } else if (status === TaskStatus.Completed) {
        completedCount++;
      }

      if (t.dueDate && status !== TaskStatus.Completed && t.dueDate < today) {
        overdueCount++;
      }
    }

    this.todoCount = todoCount;
    this.ongoingCount = ongoingCount;
    this.completedCount = completedCount;
    this.overdueCount = overdueCount;
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
