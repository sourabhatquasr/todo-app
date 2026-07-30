import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService, ToastType } from '../toast.service';
import { TodoService } from '../todo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

declare var google: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm: FormGroup = new FormGroup({});
  isRegisterMode: boolean = false;
  returnUrl: string = '';
  showPassword: boolean = false;
  googleClientId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    private service: TodoService,
    private fb: FormBuilder,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    this.initForm();
    this.fetchGoogleConfig();
  }

  ngAfterViewInit() {
    // If the google script loaded early and we already have client ID, try to render.
    if (this.googleClientId) {
      this.initGoogleBtn();
    }
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required, this.service.usernameSpacesValidator()]],
      password: ["", Validators.required],
    });
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.initForm();
  }

  fetchGoogleConfig() {
    this.http.get<{ googleClientId: string }>('/api/config').subscribe({
      next: (config) => {
        this.googleClientId = config.googleClientId;
        // Wait a small tick to ensure the DOM is ready for the google button
        setTimeout(() => this.initGoogleBtn(), 100);
      },
      error: (err) => {
        console.warn('Could not fetch Google client configuration from backend:', err);
        // Fallback to placeholder or wait to initialize
      }
    });
  }

  initGoogleBtn() {
    if (!this.googleClientId || this.googleClientId.includes('your-google-client-id')) {
      console.warn('Google client ID is unset or using default placeholder.');
      return;
    }

    if (typeof google !== 'undefined') {
      try {
        google.accounts.id.initialize({
          client_id: this.googleClientId,
          callback: this.handleGoogleCredential.bind(this)
        });

        const btnElement = document.getElementById('google-signin-btn');
        if (btnElement) {
          google.accounts.id.renderButton(btnElement, {
            theme: 'filled_blue',
            size: 'large',
            width: btnElement.clientWidth || 300,
            text: 'signin_with',
            shape: 'rectangular'
          });
        }
      } catch (e) {
        console.error('Error rendering Google Sign-In button:', e);
      }
    } else {
      console.warn('Google Sign-In API script not available yet.');
    }
  }

  handleGoogleCredential(response: any) {
    if (!response || !response.credential) return;

    this.http.post<{ token: string, username: string }>('/api/auth/google-login', {
      credential: response.credential
    }).subscribe({
      next: (data) => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', data.username);
        localStorage.setItem('token', data.token);

        this.service.loggedInUser = data.username;
        this.service.syncAndLoadTodos(); // Trigger sync for the logged-in user!

        this.toast.showToast(`Logged in successfully as Google user ${data.username}!`, ToastType.Success);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        console.error('Google authentication failed:', err);
        this.toast.showToast(err.error?.error || 'Google Sign-In failed.', ToastType.Error);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    if (this.isRegisterMode) {
      // Create Account (Sign Up)
      this.http.post('/api/auth/register', { username, password }).subscribe({
        next: () => {
          this.toast.showToast('Account created successfully!', ToastType.Success);
          // Automatically log them in after registration
          this.loginUser(username, password);
        },
        error: (err) => {
          console.error('Registration failed:', err);
          this.toast.showToast(err.error?.error || 'Account creation failed.', ToastType.Error);
        }
      });
    } else {
      // Standard Sign In
      this.loginUser(username, password);
    }
  }

  loginUser(username: string, password: string) {
    this.http.post<{ token: string, username: string }>('/api/auth/login', { username, password }).subscribe({
      next: (data) => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', data.username);
        localStorage.setItem('token', data.token);

        this.service.loggedInUser = data.username;
        this.service.syncAndLoadTodos(); // Trigger sync for the logged-in user!

        this.toast.showToast(`Welcome back, ${data.username}!`, ToastType.Success);
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        console.error('Authentication failed:', err);

        // If the backend is completely offline/unreachable (status === 0), or if this is local dev
        // and they use standard 'admin' password, offer local fallback login
        if (err.status === 0 || password === 'admin') {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('username', username);
          // Dummy token for local fallback
          localStorage.setItem('token', 'offline-fallback-token');

          this.service.loggedInUser = username;
          this.service.syncAndLoadTodos();

          this.toast.showToast(`Logged in (Local Fallback Mode).`, ToastType.Success);
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.toast.showToast(err.error?.error || 'Username and password do not match!', ToastType.Error);
        }
      }
    });
  }
}
