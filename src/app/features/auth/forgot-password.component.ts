import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);

  email = '';
  submitted = false;
  loading = false;
  error = '';

  submit(form: NgForm) {
    if (form.invalid) return;
    this.loading = true;
    this.error = '';
    this.auth.forgotPassword(this.email).subscribe({
      next: () => { this.loading = false; this.submitted = true; },
      error: () => { this.loading = false; this.error = 'Something went wrong. Please try again.'; }
    });
  }
}
