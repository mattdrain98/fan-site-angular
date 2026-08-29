import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar.component';
import { ToastComponent } from './shared/components/toast.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog.component';
import { ReportModalComponent } from './shared/components/report-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ConfirmDialogComponent, ToastComponent, ReportModalComponent],
  template: `
    <app-navbar />
    <app-confirm-dialog />
    <app-toast />
    <app-report-modal />
    <router-outlet />
  `
})
export class AppComponent {}
