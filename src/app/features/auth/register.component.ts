import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  model = { userName: '', email: '', password: '', confirmPassword: '' };
  errors: string[] = [];

  submit(form: NgForm): void {
    if (form.invalid) return;
    if (this.model.password !== this.model.confirmPassword) {
      this.errors = ['Passwords do not match'];
      return;
    }
    this.errors = [];
    this.auth.register(this.model.userName, this.model.email, this.model.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => this.errors = Array.isArray(err.error) ? err.error : [err.error?.message ?? 'Registration failed']
    });
  }
}
