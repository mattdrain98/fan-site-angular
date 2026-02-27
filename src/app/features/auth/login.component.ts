import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  model = { userName: '', password: '', rememberMe: false };
  errors: string[] = [];

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.errors = [];
    this.auth.login(this.model).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => this.errors = [err.error?.message ?? 'Invalid login attempt']
    });
  }
}
