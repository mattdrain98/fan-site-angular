import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ForumService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { ForumListingModel } from '../../core/models';
import { ConfirmService } from 'src/app/core/services/confirm-dialogue.service';

@Component({
  selector: 'app-forum-index',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  templateUrl: './forum-index.component.html',
  styleUrl: './forum-index.component.css'
})
export class ForumIndexComponent implements OnInit {
  private forumService = inject(ForumService);
  private auth = inject(AuthService);
  private confirmService = inject(ConfirmService);

  forums: ForumListingModel[] = [];
  currentUser$ = this.auth.currentUser$;

  ngOnInit(): void { this.forumService.getAll().subscribe(f => this.forums = f); }

  async delete(id: number): Promise<void> {
    const confirmed = await this.confirmService.confirm('Delete this forum?');
    if (confirmed) {
      this.forumService.delete(id).subscribe(() => this.forums = this.forums.filter(f => f.forumId !== id));
    }
  }
}
