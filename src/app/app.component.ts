import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ToastComponent } from './toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent, ConfirmDialogComponent, ToastComponent],
  templateUrl: './app.html'
})
export class AppComponent {}