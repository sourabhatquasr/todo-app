import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService, ToastType } from '../toast.service';
import { TodoService } from '../todo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup = new FormGroup({});
  username: string = '';
  password: string = '';
  returnUrl: string = '';

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    private service: TodoService,
    private fb: FormBuilder,
    ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    this.loginForm = this.fb.group({
      username: ["", [Validators.required, this.service.ignoreSpacesValidator()]],
      password: ["", Validators.required],
    })
  }

  login() {
    if (this.loginForm.controls['password'].value === 'admin') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('username', this.loginForm.controls['username'].value);
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.toast.showToast("Username and Password do not match!", ToastType.Error)
    }
  }

}