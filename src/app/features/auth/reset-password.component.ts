import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  private auth  = inject(AuthService);
  private route = inject(ActivatedRoute);

  email = '';
  token = '';
  newPassword = '';
  confirmPassword = '';

  submitted = false;
  loading = false;
  errors: string[] = [];
  invalidLink = false;

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.email || !this.token) this.invalidLink = true;
  }

  submit(form: NgForm): void {
    if (form.invalid) return;
    if (this.newPassword !== this.confirmPassword) {
      this.errors = ['Passwords do not match.'];
      return;
    }
    this.loading = true;
    this.errors = [];
    this.auth.resetPassword(this.email, this.token, this.newPassword).subscribe({
      next: () => { this.loading = false; this.submitted = true; },
      error: err => {
        this.loading = false;
        this.errors = Array.isArray(err.error) ? err.error : ['Invalid or expired reset link.'];
      }
    });
  }
}
