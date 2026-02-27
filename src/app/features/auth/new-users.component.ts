import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApplicationUser } from '../../core/models';

@Component({
  selector: 'app-new-users',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './new-users.component.html'
})
export class NewUsersComponent implements OnInit {
  private auth = inject(AuthService);
  users: ApplicationUser[] = [];

  ngOnInit(): void { this.auth.getLatestUsers().subscribe(u => this.users = u); }
}
