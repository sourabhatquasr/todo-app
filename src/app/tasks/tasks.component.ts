import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Toast, ToastService, ToastType } from '../toast.service';
import { TodoService } from '../todo.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent {
  loggedInUser : null | string = null;
  toast: Toast | null = null;
  
  constructor(private router: Router, private toastService: ToastService) {
    this.toastSubscription = this.toastService.toastState.subscribe((toast: Toast) => {
      this.toast = toast;
      setTimeout(() => {
        this.toast = null;
      }, 5000);
    });
  }

  ngOnInit() {
    this.loggedInUser = localStorage.getItem('username')
    this.toastService.showToast(`Welcome ${this.loggedInUser}!`, ToastType.Success)
  }

  logOut() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
    this.toastService.showToast('Logged Out Successfully!', ToastType.Success)
    this.loggedInUser = null;
  }


  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
  } private toastSubscription: Subscription;

}