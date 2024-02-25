import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from './toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  toast: Toast | null = null;

  constructor(private toastService: ToastService) {
    this.toastSubscription = this.toastService.toastState.subscribe((toast: Toast) => {
      this.toast = toast;
      setTimeout(() => {
        this.toast = null;
      }, 5000);
    });
  }

  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
  }  private toastSubscription: Subscription;

}