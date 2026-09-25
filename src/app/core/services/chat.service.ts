import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { PresenceService } from './presence.service';

export interface ChatMessageDto {
  id: number;
  userId: string;
  userName: string;
  userImagePath?: string | null;
  content: string;
  createdAt: string;
  replyToMessageId?: number | null;
  replyToUserName?: string | null;
  replyToContent?: string | null;
  isSystem?: boolean;
}

export interface RoomMemberInfo {
  userId: string;
  userName?: string | null;
  userImagePath?: string | null;
}

export interface ChatMemberDto {
  userId: string;
  userName?: string | null;
  userImagePath?: string | null;
  joinedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private zone = inject(NgZone);
  private presence = inject(PresenceService);
  private base = `${environment.apiBaseUrl}/chat`;
  private hubUrl = environment.apiBaseUrl.replace('/api', '') + '/hubs/chat';

  private _messages = new BehaviorSubject<ChatMessageDto[]>([]);
  readonly messages$ = this._messages.asObservable();

  private _connected = new BehaviorSubject<boolean>(false);
  readonly connected$ = this._connected.asObservable();

  private _typingUsers = new BehaviorSubject<string[]>([]);
  readonly typingUsers$ = this._typingUsers.asObservable();

  private _onlineUsers = new BehaviorSubject<Set<string>>(new Set());
  readonly onlineUsers$ = this._onlineUsers.asObservable();

  private _participantCount = new BehaviorSubject<number>(0);
  readonly participantCount$ = this._participantCount.asObservable();

  private _roomMembers = new BehaviorSubject<RoomMemberInfo[]>([]);
  readonly roomMembers$ = this._roomMembers.asObservable();

  private typingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private hubConnection?: signalR.HubConnection;
  private currentForumId?: number;

  joinRoom(forumId: number): void {
    if (this.hubConnection && this.currentForumId === forumId) return;

    this.leaveRoom();
    this.currentForumId = forumId;
    this._messages.next([]);

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => this.auth.getToken() ?? ''
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.hubConnection.on('LoadHistory', (messages: ChatMessageDto[]) => {
      this.zone.run(() => {
        this._messages.next(messages);
        const userIds = [...new Set(messages.map(m => m.userId))];
        if (userIds.length) {
          this.presence.getOnline(userIds).subscribe(online => {
            this.zone.run(() => this._onlineUsers.next(new Set(online)));
          });
        }
      });
    });

    this.hubConnection.on('ReceiveMessage', (msg: ChatMessageDto) => {
      this.zone.run(() => this._messages.next([...this._messages.value, msg]));
    });

    this.hubConnection.on('MessageDeleted', (id: number) => {
      this.zone.run(() =>
        this._messages.next(this._messages.value.filter(m => m.id !== id))
      );
    });

    this.hubConnection.on('UserTyping', (payload: { userId: string; userName: string }) => {
      this.zone.run(() => {
        const current = this._typingUsers.value;
        if (!current.includes(payload.userName)) {
          this._typingUsers.next([...current, payload.userName]);
        }
        clearTimeout(this.typingTimeouts.get(payload.userId));
        this.typingTimeouts.set(payload.userId, setTimeout(() => {
          this.zone.run(() => this.removeTypingUser(payload.userName));
        }, 3000));
      });
    });

    this.hubConnection.on('ParticipantCount', (count: number) => {
      this.zone.run(() => this._participantCount.next(count));
    });

    this.hubConnection.on('RoomMembersUpdated', (members: RoomMemberInfo[]) => {
      this.zone.run(() => this._roomMembers.next(members));
    });

    this.hubConnection.onreconnected(() => {
      this.hubConnection?.invoke('JoinRoom', forumId);
    });

    this.hubConnection.start()
      .then(() => {
        this._connected.next(true);
        return this.hubConnection?.invoke('JoinRoom', forumId);
      })
      .catch(err => console.error('Chat SignalR error:', err));
  }

  leaveRoom(): void {
    if (this.hubConnection && this.currentForumId != null) {
      this.hubConnection.invoke('LeaveRoom', this.currentForumId).catch(() => {});
      this.hubConnection.stop();
      this.hubConnection = undefined;
    }
    this._connected.next(false);
    this._messages.next([]);
    this._typingUsers.next([]);
    this._onlineUsers.next(new Set());
    this._participantCount.next(0);
    this._roomMembers.next([]);
    this.typingTimeouts.forEach(t => clearTimeout(t));
    this.typingTimeouts.clear();
    this.currentForumId = undefined;
  }

  joinChat(forumId: number): Observable<{ joined: boolean }> {
    return this.http.post<{ joined: boolean }>(`${this.base}/${forumId}/join`, {});
  }

  leaveChat(forumId: number): Observable<{ joined: boolean }> {
    return this.http.post<{ joined: boolean }>(`${this.base}/${forumId}/leave`, {});
  }

  checkJoined(forumId: number): Observable<{ joined: boolean }> {
    return this.http.get<{ joined: boolean }>(`${this.base}/${forumId}/joined`);
  }

  getMembers(forumId: number, page = 1): Observable<{ members: ChatMemberDto[]; totalMembers: number; totalPages: number }> {
    return this.http.get<{ members: ChatMemberDto[]; totalMembers: number; totalPages: number }>(
      `${this.base}/${forumId}/members?page=${page}&pageSize=20`
    );
  }

  sendTyping(forumId: number): void {
    this.hubConnection?.send('Typing', forumId).catch(() => {});
  }

  sendMessage(forumId: number, content: string, replyToMessageId: number | null = null): Promise<void> {
    if (!this.hubConnection) return Promise.reject('Not connected');
    return this.hubConnection.invoke('SendMessage', forumId, content, replyToMessageId);
  }

  deleteMessage(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }

  private removeTypingUser(userName: string): void {
    this._typingUsers.next(this._typingUsers.value.filter(u => u !== userName));
  }
}
