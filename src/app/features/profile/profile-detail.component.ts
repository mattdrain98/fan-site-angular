import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ProfileService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { ProfileModel } from '../../core/models';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './profile-detail.component.html'
})
export class ProfileDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  auth = inject(AuthService);

  profile: ProfileModel | null = null;
  currentUser$ = this.auth.currentUser$;
  isFollowing = false;
  isOwnProfile = false;
currentUser: any;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.profileService.getProfile(id).subscribe(p => {
      this.profile = p;
      const cu = this.auth.currentUser;
      if (cu) {
        this.isOwnProfile = cu.userId === p.userId;
        this.isFollowing = p.follows.some(f => f.id === cu.userId);  // ← flat check
      }
    });
  }

  toggleFollow(): void {
    if (!this.profile) return;

    // Optimistic update — react instantly
    this.isFollowing = !this.isFollowing;
    this.profile.followers += this.isFollowing ? 1 : -1;

    this.profileService.toggleFollow(this.profile.userId).subscribe({
      next: res => {
        if (this.profile) this.profile.followers = res.followers;
      },
      error: () => {
        // Revert on failure
        this.isFollowing = !this.isFollowing;
        if (this.profile) this.profile.followers += this.isFollowing ? 1 : -1;
      }
    });
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.profileService.uploadProfileImage(file).subscribe(res => {
      if (this.profile) this.profile.profileImageUrl = res.imageUrl;
    });
  }
}
