import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Toast, ToastService, ToastType } from '../toast.service';
import { ViewTasksComponent } from '../view-tasks/view-tasks.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent {
  @ViewChild('viewTasks') viewTasks!: ViewTasksComponent;

  loggedInUser : null | string = null;
  toast: Toast | null = null;

  constructor(private router: Router, private toastService: ToastService) {

  }

  ngOnInit() {
    this.loggedInUser = localStorage.getItem('username')
    this.toastService.showToast(`Welcome ${this.loggedInUser}!`, ToastType.Success)
  }

  logOut() {
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
    this.toastService.showToast('Logged Out Successfully!', ToastType.Success)
    this.loggedInUser = null;
  }

  updateView() {
    this.viewTasks.newTaskAdded();
  }
}
