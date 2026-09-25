import {
  Component, Input, OnInit, OnDestroy, OnChanges,
  ViewChild, ElementRef, AfterViewChecked, inject
} from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatMemberDto, RoomMemberInfo } from '../../core/services/chat.service';
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
  @Input() forumName = 'Chat';
  @ViewChild('messageList') messageList!: ElementRef<HTMLDivElement>;

  chat = inject(ChatService);
  auth = inject(AuthService);
  private reportDialog = inject(ReportDialogService);

  messages$ = this.chat.messages$;
  connected$ = this.chat.connected$;
  currentUser$ = this.auth.currentUser$;
  typingUsers$ = this.chat.typingUsers$;
  onlineUsers$ = this.chat.onlineUsers$;

  newMessage = '';
  collapsed = true;
  unreadCount = 0;
  hasJoined = false;
  joining = false;
  showMembers = false;
  memberList: ChatMemberDto[] = [];
  membersLoading = false;
  participantCount = 0;
  currentRoomMembers: RoomMemberInfo[] = [];

  private shouldScroll = false;
  private typingTimer?: ReturnType<typeof setTimeout>;
  private prevMessageCount = 0;
  private msgSub?: Subscription;
  private countSub?: Subscription;
  private roomSub?: Subscription;
  private initialized = false;

  ngOnInit(): void {
    this.initialized = true;
    if (!this.auth.currentUser) return;
    this.connectAndCheck();
  }

  ngOnChanges(): void {
    if (!this.initialized) return;
    if (this.auth.currentUser && this.forumId) {
      this.hasJoined = false;
      this.showMembers = false;
      this.memberList = [];
      this.participantCount = 0;
      this.connectAndCheck();
    }
  }

  private connectAndCheck(): void {
    this.chat.joinRoom(this.forumId);

    this.chat.checkJoined(this.forumId).subscribe({
      next: ({ joined }) => { this.hasJoined = joined; }
    });

    this.msgSub?.unsubscribe();
    this.msgSub = this.chat.messages$.subscribe(msgs => {
      if (this.collapsed && msgs.length > this.prevMessageCount) {
        this.unreadCount += msgs.length - this.prevMessageCount;
      } else if (!this.collapsed) {
        this.shouldScroll = true;
      }
      this.prevMessageCount = msgs.length;
    });

    this.countSub?.unsubscribe();
    this.countSub = this.chat.participantCount$.subscribe(count => {
      this.participantCount = count;
    });

    this.roomSub?.unsubscribe();
    this.roomSub = this.chat.roomMembers$.subscribe(members => {
      this.currentRoomMembers = members;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.typingTimer);
    this.msgSub?.unsubscribe();
    this.countSub?.unsubscribe();
    this.roomSub?.unsubscribe();
    this.chat.leaveRoom();
  }

  joinChat(): void {
    this.joining = true;
    this.chat.joinChat(this.forumId).subscribe({
      next: () => {
        this.hasJoined = true;
        this.joining = false;
        this.shouldScroll = true;
      },
      error: () => { this.joining = false; }
    });
  }

  leaveChat(): void {
    this.chat.leaveChat(this.forumId).subscribe({
      next: () => {
        this.hasJoined = false;
        this.showMembers = false;
      }
    });
  }

  toggleMembers(event: Event): void {
    event.stopPropagation();
    this.showMembers = !this.showMembers;
    if (this.showMembers && this.memberList.length === 0) {
      this.loadMembers();
    }
  }

  loadMembers(): void {
    this.membersLoading = true;
    this.chat.getMembers(this.forumId).subscribe({
      next: ({ members }) => {
        this.memberList = members;
        this.membersLoading = false;
      },
      error: () => { this.membersLoading = false; }
    });
  }

  isRoomMember(userId: string): boolean {
    return this.currentRoomMembers.some(m => m.userId === userId);
  }

  avatarUrl(path?: string | null): string {
    return path
      ? `url(${path})`
      : 'url(https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png)';
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

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    if (!this.collapsed) {
      this.unreadCount = 0;
      this.shouldScroll = true;
    }
  }

  onInput(): void {
    this.chat.sendTyping(this.forumId);
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {}, 2500);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      clearTimeout(this.typingTimer);
      this.send();
    }
  }
}
