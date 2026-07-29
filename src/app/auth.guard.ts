import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {

  constructor(private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkLogin(state.url);
  }

  checkLogin(url: string): true | UrlTree {
    if (localStorage.getItem('isLoggedIn')) {
      return true;
    } else {
      // Store the attempted URL for redirection after login
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: url } });
    }
  }
}