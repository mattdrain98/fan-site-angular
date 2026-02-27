import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostService } from '../../core/services/services';
import { PostListingModel } from '../../core/models';

@Component({
  selector: 'app-top-posts',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './top-posts.component.html'
})
export class TopPostsComponent implements OnInit {
  private postService = inject(PostService);
  posts: PostListingModel[] = [];

  ngOnInit(): void { this.postService.getTopPosts().subscribe(p => this.posts = p); }
}
