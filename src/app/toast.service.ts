import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Info = 'info'
}

export interface Toast {
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})

export class ToastService {
  private toastSubject = new Subject<any>();
  toastState = this.toastSubject.asObservable();

  constructor() { }

  showToast(message: string, type: ToastType) {
    this.toastSubject.next({ message, type });
  }
}