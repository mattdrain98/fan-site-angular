import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { AuthService } from "src/app/core/services/auth.service";
import { ToastService } from "src/app/core/services/toast.service";

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css'
})
export class ConfirmEmailComponent {
  message = '';
  success = false;

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  ngOnInit() {
    const userId = this.route.snapshot.queryParams['userId'];
    const token  = this.route.snapshot.queryParams['token'];

    this.authService.confirmEmail(userId, token).subscribe({
      next: ()  => { this.success = true;  this.toastService.success('Email confirmed! You can now log in.'); },
      error: () => { this.success = false; this.toastService.error('Link is invalid or has expired.'); }
    });
  }
}