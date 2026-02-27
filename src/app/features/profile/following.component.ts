import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/services';
import { ProfileModel } from '../../core/models';

@Component({
  selector: 'app-following',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './following.component.html'
})
export class FollowingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(ProfileService);
  profile: ProfileModel | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getProfile(id).subscribe(p => this.profile = p);
  }
}
