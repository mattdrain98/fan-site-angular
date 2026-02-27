import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from '../../core/services/services';

@Component({
  selector: 'app-edit-bio',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-bio.component.html'
})
export class EditBioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(ProfileService);
  private router = inject(Router);

  userId = ''; userName = ''; bio = '';

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.svc.getProfile(this.userId).subscribe(p => { this.userName = p.userName; this.bio = p.bio ?? ''; });
  }

  submit(form: NgForm): void {
    this.svc.editBio(this.userId, this.bio, this.userName).subscribe(() => this.router.navigate(['/profile', this.userId]));
  }
}
