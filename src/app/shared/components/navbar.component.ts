import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService, CurrentUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  template: `
    <nav class="navbar navbar-expand-sm navbar-light bg-white border-bottom box-shadow mb-3">
      <div class="container">
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target=".navbar-collapse">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="navbar-collapse collapse">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" routerLink="/"><i class="inline-icon material-icons">home</i> Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/screenshots"><i class="inline-icon material-icons">photo_camera</i> Screenshots</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/forum"><i class="inline-icon material-icons">forum</i> Forum</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/new-users"><i class="inline-icon material-icons">person</i> New Users</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/top-posts"><i class="fa fa-diamond fa-3" aria-hidden="true"></i> Top Posts</a>
            </li>
          </ul>

          <ul class="navbar-nav ml-auto">
            @if (currentUser$ | async; as cu) {
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink"
                   data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="material-icons">account_circle</i>
                </a>
                <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                  <a class="dropdown-item" [routerLink]="['/profile', cu.userId]">My Account</a>
                  <a class="dropdown-item" routerLink="/screenshots/mine">Your Screenshots</a>
                  <a class="dropdown-item" routerLink="/posts/mine">Your Posts</a>
                  <a class="dropdown-item" routerLink="/account/change-password">Change Password</a>
                  <button class="dropdown-item" type="button" style="border:none" (click)="logout()">Logout</button>
                </div>
              </li>
            } @else {
              <li class="nav-item">
                <a class="nav-link" routerLink="/register">Register</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/login">Login</a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  currentUser$ = this.auth.currentUser$;

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
