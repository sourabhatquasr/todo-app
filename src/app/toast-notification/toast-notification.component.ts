import { Component, Input } from '@angular/core';
import { Toast, ToastType } from '../toast.service';

@Component({
    selector: 'app-toast-notification',
    templateUrl: './toast-notification.component.html',
    styleUrls: ['./toast-notification.component.css'],
    standalone: false
})
export class ToastNotificationComponent {
  @Input() toast: Toast | null = null;

  constructor() { }

  getToastClass() {
    return this.toast ? this.toast.type : '';
  }
}