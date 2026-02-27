import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
  private auth = inject(AuthService);

  model = { password: '', newPassword: '', confirmPassword: '' };
  errors: string[] = [];
  success = '';

  submit(form: NgForm): void {
    if (form.invalid) return;
    if (this.model.newPassword !== this.model.confirmPassword) {
      this.errors = ['Passwords do not match']; return;
    }
    this.errors = []; this.success = '';
    this.auth.changePassword(this.model.password, this.model.newPassword).subscribe({
      next: res => this.success = res.message,
      error: err => this.errors = Array.isArray(err.error) ? err.error : [err.error?.message ?? 'Failed']
    });
  }
}
