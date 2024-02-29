import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Toast, ToastService } from './toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  toast: Toast | null = null;
  private toastSubscription: Subscription | undefined;

  constructor(private toastService: ToastService, private cdr: ChangeDetectorRef) {
    this.toastSubscription = this.toastService.toastState.subscribe((toast: Toast) => {
      this.showToast(toast);
    });
  }

  ngOnDestroy() {
    this.unsubscribeFromToast();
  }

  private showToast(toast: Toast) {
    setTimeout(() => {
      this.toast = toast;
      this.cdr.detectChanges();
    });
    setTimeout(() => {
      this.clearToast();
    }, 6000);
  }

  private clearToast() {
    this.toast = null;
    this.cdr.detectChanges();
  }

  private unsubscribeFromToast() {
    if (this.toastSubscription) {
      this.toastSubscription.unsubscribe();
    }
  }
}