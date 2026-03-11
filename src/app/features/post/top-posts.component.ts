import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostService } from '../../core/services/services';
import { PostListingModel } from '../../core/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-top-posts',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './top-posts.component.html',
  styleUrl: './top-posts.component.css'
})
export class TopPostsComponent implements OnInit {
  private postService = inject(PostService);
  posts: PostListingModel[] = [];

  ngOnInit(): void { this.postService.getTopPosts().subscribe(p => this.posts = p); }
}
