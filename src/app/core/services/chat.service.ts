import { Injectable, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ChatMessageDto {
  id: number;
  userId: string;
  userName: string;
  userImagePath?: string;
  content: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private zone = inject(NgZone);
  private base = `${environment.apiBaseUrl}/chat`;
  private hubUrl = environment.apiBaseUrl.replace('/api', '') + '/hubs/chat';

  private _messages = new BehaviorSubject<ChatMessageDto[]>([]);
  readonly messages$ = this._messages.asObservable();

  private _connected = new BehaviorSubject<boolean>(false);
  readonly connected$ = this._connected.asObservable();

  private _typingUsers = new BehaviorSubject<string[]>([]);
  readonly typingUsers$ = this._typingUsers.asObservable();

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
      this.zone.run(() => this._messages.next(messages));
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
        // Auto-clear after 3s in case the StopTyping signal is missed
        clearTimeout(this.typingTimeouts.get(payload.userId));
        this.typingTimeouts.set(payload.userId, setTimeout(() => {
          this.zone.run(() => this.removeTypingUser(payload.userName));
        }, 3000));
      });
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
    this.typingTimeouts.forEach(t => clearTimeout(t));
    this.typingTimeouts.clear();
    this.currentForumId = undefined;
  }

  sendTyping(forumId: number): void {
    this.hubConnection?.invoke('Typing', forumId).catch(() => {});
  }

  sendMessage(forumId: number, content: string): Promise<void> {
    if (!this.hubConnection) return Promise.reject('Not connected');
    return this.hubConnection.invoke('SendMessage', forumId, content);
  }

  private removeTypingUser(userName: string): void {
    this._typingUsers.next(this._typingUsers.value.filter(u => u !== userName));
  }

  deleteMessage(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
