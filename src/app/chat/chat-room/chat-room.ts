import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChatList } from '../chat-list/chat-list';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { UserService } from '../../services/user';
import { MessageService } from '../../services/message-service';
import { Nav } from '../nav/nav';
import type { User, Message } from '../../chat.model';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [ReactiveFormsModule, ChatList, NgIf, DatePipe, NgFor, Nav],
  templateUrl: './chat-room.html',
  styleUrls: ['./chat-room.css']
})
export class ChatRoom implements OnInit {
  public selectedUser: User | null = null;

  constructor(
    public userService: UserService,
    public messageService: MessageService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.userService.fetchUsers();
    this.messageService.fetchMessages();
  }

  public get currentUserId(): string | undefined {
    return this.auth.user()?.['_id'];
  }

  public get users() {
    return this.userService.users();
  }

  public get allMessages() {
    return this.messageService.messages();
  }

  public chatForm = new FormGroup({
    message: new FormControl('', Validators.required)
  });

  public get filteredMessages(): Message[] {
    if (!this.selectedUser) return [];
    return this.allMessages.filter(m =>
      (m.senderId === this.currentUserId && m.receiverId === this.selectedUser?._id) ||
      (m.receiverId === this.currentUserId && m.senderId === this.selectedUser?._id)
    );
  }

  public onUserSelected(user: User): void {
    this.selectedUser = user;
  }

  public async sendMessage() {
    if (!this.selectedUser || this.chatForm.invalid) {
      this.chatForm.markAllAsTouched();
      return;
    }

    const newMessage: Message = {
      _id: crypto.randomUUID(),
      senderId: this.currentUserId!,
      receiverId: this.selectedUser._id,
      text: this.chatForm.value.message!,
      timestamp: new Date(),
      read: false,
    };

    // this.messageService.messages.update((msgs) => [...msgs, newMessage]);
    this.chatForm.reset();
    await this.messageService.sendMessage(newMessage); // Persist to backend and update signal
    this.chatForm.reset();
    // Optionally: send to backend via socket or HTTP
  }
}