import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../core/services/services';
import { PostListingModel } from '../../core/models';

// ── Create Post ───────────────────────────────────────────────────────────
import { Component as Comp1 } from '@angular/core';
@Comp1({ selector: 'app-post-create', templateUrl: './post-create.component.html' })
export class PostCreateComponent implements OnInit {
  forumId!: number;
  forumName = '';
  model = { title: '', content: '' };
  errors: string[] = [];

  constructor(private route: ActivatedRoute, private postService: PostService, private router: Router) {}

  ngOnInit(): void {
    this.forumId = +this.route.snapshot.paramMap.get('forumId')!;
  }

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.postService.add(this.model.title, this.model.content, this.forumId).subscribe({
      next: p => this.router.navigate(['/forum', this.forumId]),
      error: () => this.errors = ['Failed to create post']
    });
  }
}

// ── Edit Post ─────────────────────────────────────────────────────────────
import { Component as Comp2 } from '@angular/core';
@Comp2({ selector: 'app-post-edit', templateUrl: './post-edit.component.html' })
export class PostEditComponent implements OnInit {
  postId!: number;
  model = { title: '', content: '' };
  forumName = '';
  errors: string[] = [];

  constructor(private route: ActivatedRoute, private postService: PostService, private router: Router) {}

  ngOnInit(): void {
    this.postId = +this.route.snapshot.paramMap.get('id')!;
    this.postService.getById(this.postId).subscribe(p => {
      this.model.title = p.title;
      this.model.content = p.postContent;
      this.forumName = p.forumName;
    });
  }

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.postService.edit(this.postId, this.model.title, this.model.content).subscribe({
      next: () => this.router.navigate(['/post', this.postId]),
      error: () => this.errors = ['Failed to edit post']
    });
  }
}

// ── User Posts ────────────────────────────────────────────────────────────
import { Component as Comp3 } from '@angular/core';
@Comp3({ selector: 'app-user-posts', templateUrl: './user-posts.component.html' })
export class UserPostsComponent implements OnInit {
  posts: PostListingModel[] = [];
  constructor(private postService: PostService) {}
  ngOnInit(): void { this.postService.getUserPosts().subscribe(p => this.posts = p); }
  delete(id: number): void {
    if (confirm('Delete this post?')) {
      this.postService.delete(id).subscribe(() => this.posts = this.posts.filter(p => p.id !== id));
    }
  }
}

// ── Top Posts ─────────────────────────────────────────────────────────────
import { Component as Comp4 } from '@angular/core';
@Comp4({ selector: 'app-top-posts', templateUrl: './top-posts.component.html' })
export class TopPostsComponent implements OnInit {
  posts: PostListingModel[] = [];
  constructor(private postService: PostService) {}
  ngOnInit(): void { this.postService.getTopPosts().subscribe(p => this.posts = p); }
}
