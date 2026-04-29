import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  model = { userName: '', password: '', rememberMe: false };
  errors: string[] = [];
  emailUnconfirmed = false;
  unconfirmedEmail = '';

  submit(form: NgForm) {
    this.auth.login(form.value).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: err => {
        if (err.error === 'Please confirm your email before logging in.') {
          this.emailUnconfirmed = true;
          this.unconfirmedEmail = form.value.userName; 
        }
        this.errors = [err.error];
      }
    });
}

  resendConfirmation() {
    this.auth.resendConfirmation(this.unconfirmedEmail).subscribe({
      next: () => this.errors = ['Confirmation email resent. Please check your inbox.'],
      error: () => this.errors = ['Could not resend confirmation email.']
    });
  }
}
