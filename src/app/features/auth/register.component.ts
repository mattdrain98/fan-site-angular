import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {
  private auth = inject(AuthService);

  model = { userName: '', email: '', password: '', confirmPassword: '' };
  emailSent = false;
  errors: string[] = [];

  submit(form: NgForm) {
    this.auth.register(
      form.value.userName,
      form.value.email,
      form.value.password
    ).subscribe({
      next: () => {
        this.emailSent = true; 
      },
      error: err => {
        this.errors = Array.isArray(err.error) 
          ? err.error 
          : [err.error];
      }
    });
  }
}