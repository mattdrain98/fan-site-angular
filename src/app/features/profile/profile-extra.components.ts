import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService, ProfileCommentService } from '../../core/services/services';
import { ProfileModel, ProfileCommentDto } from '../../core/models';

// ── Edit Username ──────────────────────────────────────────────────────────
import { Component as C2 } from '@angular/core';
@C2({ selector: 'app-edit-username', templateUrl: './edit-username.component.html' })
export class EditUsernameComponent implements OnInit {
  userId = ''; userName = ''; currentUserName = '';
  constructor(private route: ActivatedRoute, private svc: ProfileService, private router: Router) {}
  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.svc.getProfile(this.userId).subscribe(p => { this.currentUserName = p.userName; this.userName = p.userName; });
  }
  submit(form: NgForm): void {
    this.svc.editUsername(this.userId, this.userName).subscribe(() => {
      localStorage.removeItem('currentUser');
      this.router.navigate(['/login']); // server signs user out after username change
    });
  }
}

// ── Followers ─────────────────────────────────────────────────────────────
import { Component as C3 } from '@angular/core';
@C3({ selector: 'app-followers', templateUrl: './followers.component.html' })
export class FollowersComponent implements OnInit {
  profile: ProfileModel | null = null;
  constructor(private route: ActivatedRoute, private svc: ProfileService) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getProfile(id).subscribe(p => this.profile = p);
  }
}

// ── Following ─────────────────────────────────────────────────────────────
import { Component as C4 } from '@angular/core';
@C4({ selector: 'app-following', templateUrl: './following.component.html' })
export class FollowingComponent implements OnInit {
  profile: ProfileModel | null = null;
  constructor(private route: ActivatedRoute, private svc: ProfileService) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getProfile(id).subscribe(p => this.profile = p);
  }
}

// ── Profile Comment Create ────────────────────────────────────────────────
import { Component as C5 } from '@angular/core';
@C5({ selector: 'app-profile-comment-create', templateUrl: './profile-comment-create.component.html' })
export class ProfileCommentCreateComponent implements OnInit {
  template: ProfileCommentDto | null = null;
  commentContent = '';
  errors: string[] = [];
  constructor(private route: ActivatedRoute, private svc: ProfileCommentService, private router: Router) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getTemplate(id).subscribe(t => this.template = t);
  }
  submit(form: NgForm): void {
    if (!this.template) return;
    const payload: ProfileCommentDto = { ...this.template, commentContent: this.commentContent };
    this.svc.add(payload).subscribe({
      next: () => this.router.navigate(['/profile', this.template!.commentUserId]),
      error: () => this.errors = ['Failed to submit comment']
    });
  }
}
