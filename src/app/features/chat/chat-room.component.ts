import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ForumService } from '../../core/services/services';
import { ChatPanelComponent } from '../../shared/components/chat-panel.component';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [RouterLink, ChatPanelComponent],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.css'
})
export class ChatRoomComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private forumService = inject(ForumService);

  forumId!: number;
  forumName = '';
  loading = true;

  ngOnInit(): void {
    this.forumId = +this.route.snapshot.paramMap.get('id')!;
    this.forumService.getById(this.forumId).subscribe({
      next: result => {
        this.forumName = result.forum?.forumTitle ?? 'Chat';
        this.loading = false;
      },
      error: () => {
        this.forumName = 'Chat';
        this.loading = false;
      }
    });
  }
}
