import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ChatService } from '../../core/services/chat.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm-dialogue.service';

interface MyChatEntry {
  forumId: number;
  forumName: string;
  joinedAt: string;
}

@Component({
  selector: 'app-my-chats',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './my-chats.component.html',
  styleUrl: './my-chats.component.css'
})
export class MyChatsComponent implements OnInit {
  private chatService = inject(ChatService);
  private toastService = inject(ToastService);
  private confirmService = inject(ConfirmService);

  chats: MyChatEntry[] = [];
  loading = true;
  leavingId: number | null = null;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.chatService.getMyChats().subscribe({
      next: chats => {
        this.chats = chats;
        this.loading = false;
      },
      error: () => {
        this.toastService.error('Failed to load your chats');
        this.loading = false;
      }
    });
  }

  async leave(chat: MyChatEntry, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    event.preventDefault();
    const confirmed = await this.confirmService.confirm(`Leave the chat for "${chat.forumName}"?`);
    if (!confirmed) return;

    this.leavingId = chat.forumId;
    this.chatService.leaveChat(chat.forumId).subscribe({
      next: () => {
        this.chats = this.chats.filter(c => c.forumId !== chat.forumId);
        this.leavingId = null;
        this.toastService.success(`Left ${chat.forumName} chat`);
      },
      error: () => {
        this.leavingId = null;
        this.toastService.error('Failed to leave chat');
      }
    });
  }
}
