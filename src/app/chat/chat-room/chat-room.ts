import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChatList } from '../chat-list/chat-list';
import { DatePipe, NgFor, NgIf } from '@angular/common';

import type { User, Message } from '../../chat.model';  // adjust path as needed
import { Nav } from '../nav/nav';

@Component({
  selector: 'app-chat-room',
  imports: [ReactiveFormsModule, ChatList, NgIf, DatePipe, NgFor,Nav],
  templateUrl: './chat-room.html',
  styleUrls: ['./chat-room.css'],
  standalone: true
})
export class ChatRoom {
  public readonly currentUserId = '0';

  public users: User[] = [
    { _id: '1', username: 'Alice', isOnline: true },
    { _id: '2', username: 'Bob', isOnline: false },
    { _id: '3', username: 'Charlie', isOnline: true }
  ];

  public allMessages: Message[] = [
    { _id:"mi",senderId: '1', receiverId: '0', content: 'Hi!', timestamp: new Date(Date.now() - 600000),delivered: true, read: true },
    { _id:"mi",senderId: '0', receiverId: '1', content: 'Hello Alice!', timestamp: new Date(Date.now() - 300000) ,delivered: true, read: true },
    { _id:"mi",senderId: '2', receiverId: '0', content: 'Are you there?', timestamp: new Date(Date.now() - 120000) ,delivered: true, read: false },
  ];

  public selectedUser: User | null = null;

  public chatForm = new FormGroup({
    message: new FormControl('', Validators.required)
  });

  public get filteredMessages(): Message[] {
    if (!this.selectedUser) return [];

    return this.allMessages.filter(m =>
      (m.senderId === this.currentUserId && m.receiverId === this.selectedUser!._id) ||
      (m.receiverId === this.currentUserId && m.senderId === this.selectedUser!._id)
    );
  }

  public onUserSelected(user: User): void {
    this.selectedUser = user;
  }

  public sendMessage(): void {
    if (!this.selectedUser || this.chatForm.invalid) {
      this.chatForm.markAllAsTouched();
      return;
    }

    const newMessage: Message = {
      senderId: this.currentUserId,
      receiverId: this.selectedUser._id,
      content: this.chatForm.value.message!,
      timestamp: new Date(),
      delivered: false,
      read: false
    };

    this.allMessages.push(newMessage);
    this.chatForm.reset();
  }
}
