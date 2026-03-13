import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';
import { ToastComponent } from './shared/components/toast.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ConfirmDialogComponent, ToastComponent],
  template: `
    <app-navbar />
    <app-confirm-dialog />
    <app-toast />
    <router-outlet />
  `
})
export class AppComponent {}
