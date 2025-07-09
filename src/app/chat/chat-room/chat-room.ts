import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatList } from '../chat-list/chat-list';
import { NgIf } from '@angular/common';
interface Message{
  senderId:string,
  recieverId:string,
  content:string
}
interface User{
  name:string,
  id:string
}
@Component({
  selector: 'app-chat-room',
  imports: [ReactiveFormsModule,ChatList,NgIf],
  templateUrl: './chat-room.html',
  styleUrl: './chat-room.css'
})
export class ChatRoom {
   users: User[] = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' }
  ];
  selectedUser: User | null = null;
  chatForm=new FormGroup({
    message:new FormControl('',Validators.required)
  })
  onUserSelected(user:User){
    this.selectedUser=user;
  }
}
