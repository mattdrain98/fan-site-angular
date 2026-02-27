import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ForumService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { ForumListingModel } from '../../core/models';

@Component({
  selector: 'app-forum-index',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './forum-index.component.html'
})
export class ForumIndexComponent implements OnInit {
  private forumService = inject(ForumService);
  private auth = inject(AuthService);

  forums: ForumListingModel[] = [];
  currentUser$ = this.auth.currentUser$;

  ngOnInit(): void { this.forumService.getAll().subscribe(f => this.forums = f); }

  delete(id: number): void {
    if (confirm('Delete this forum?')) {
      this.forumService.delete(id).subscribe(() => this.forums = this.forums.filter(f => f.id !== id));
    }
  }
}
