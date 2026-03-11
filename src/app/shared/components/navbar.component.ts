import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  currentUser$ = this.auth.currentUser$;

  menuOpen     = false;
  dropdownOpen = false;
  mobileUserOpen = false;
  postsDropdownOpen = false;

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.dropdownOpen = false;
      this.router.navigate(['/login']);
    });
  }

  isPostsRouteActive(): boolean {
    return this.router.url.startsWith('/top-posts') || this.router.url.startsWith('/latest-posts');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    if (!(e.target as HTMLElement).closest('.nav-dropdown')) {
      this.dropdownOpen = false;
    }
    if (!(e.target as HTMLElement).closest('.nav-links') &&
        !(e.target as HTMLElement).closest('.nav-toggler')) {
      this.menuOpen = false;
    }
  }
}