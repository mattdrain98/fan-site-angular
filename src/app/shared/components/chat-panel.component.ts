import {
  Component, Input, OnInit, OnDestroy, OnChanges,
  ViewChild, ElementRef, AfterViewChecked, inject, NgZone
} from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ReportDialogService } from '../../core/services/report-dialog.service';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [AsyncPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './chat-panel.component.html',
  styleUrl: './chat-panel.component.css'
})
export class ChatPanelComponent implements OnInit, OnChanges, OnDestroy, AfterViewChecked {
  @Input() forumId!: number;
  @ViewChild('messageList') messageList!: ElementRef<HTMLDivElement>;

  chat = inject(ChatService);
  auth = inject(AuthService);
  private reportDialog = inject(ReportDialogService);

  messages$ = this.chat.messages$;
  connected$ = this.chat.connected$;
  currentUser$ = this.auth.currentUser$;

  newMessage = '';
  collapsed = false;
  private shouldScroll = false;

  ngOnInit(): void {
    if (this.auth.currentUser) {
      this.chat.joinRoom(this.forumId);
    }
  }

  ngOnChanges(): void {
    if (this.auth.currentUser && this.forumId) {
      this.chat.joinRoom(this.forumId);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.chat.leaveRoom();
  }

  send(): void {
    const text = this.newMessage.trim();
    if (!text || text.length > 500) return;
    this.newMessage = '';
    this.shouldScroll = true;
    this.chat.sendMessage(this.forumId, text).catch(() => {});
  }

  deleteMessage(id: number): void {
    this.chat.deleteMessage(id).subscribe();
  }

  reportMessage(msg: { id: number; userId: string; userName: string }): void {
    this.reportDialog.open({
      contentType: 'ChatMessage',
      contentId: msg.id,
      targetUserId: msg.userId,
      contentLabel: msg.userName
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messageList?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  onMessagesChange(): void {
    this.shouldScroll = true;
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    if (!this.collapsed) this.shouldScroll = true;
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }
}
