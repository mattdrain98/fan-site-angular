import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../core/services/services';

@Component({
  selector: 'app-edit-username',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-username.component.html'
})
export class EditUsernameComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(ProfileService);
  private router = inject(Router);

  userId = ''; userName = ''; currentUserName = '';

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.svc.getProfile(this.userId).subscribe(p => { this.currentUserName = p.userName; this.userName = p.userName; });
  }

  submit(form: NgForm): void {
    this.svc.editUsername(this.userId, this.userName).subscribe(() => {
      localStorage.removeItem('currentUser');
      this.router.navigate(['/login']);
    });
  }
}
