import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostService } from '../../core/services/services';
import { PostListingModel } from '../../core/models';

@Component({
  selector: 'app-user-posts',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-posts.component.html'
})
export class UserPostsComponent implements OnInit {
  private postService = inject(PostService);
  posts: PostListingModel[] = [];

  ngOnInit(): void { this.postService.getUserPosts().subscribe(p => this.posts = p); }

  delete(id: number): void {
    if (confirm('Delete this post?')) {
      this.postService.delete(id).subscribe(() => this.posts = this.posts.filter(p => p.id !== id));
    }
  }
}
