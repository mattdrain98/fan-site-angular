import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/services';
import { FollowDto } from '../../core/models';

@Component({
  selector: 'app-followers',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './followers.component.html'
})
export class FollowersComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(ProfileService);

  followers: FollowDto[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getFollowers(id).subscribe(data => {
      this.followers = (data.followers as unknown as FollowDto[]).filter(f => f.id !== id);
    });
  }
}