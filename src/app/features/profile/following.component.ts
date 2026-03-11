import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/services';
import { FollowDto } from '../../core/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-following',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './following.component.html',
  styleUrl: './following.component.css'
})
export class FollowingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(ProfileService);

  followings: FollowDto[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getFollowing(id).subscribe(data => {
      this.followings = (data.following as unknown as FollowDto[]).filter(f => f.id !== id);
    });
  }
}