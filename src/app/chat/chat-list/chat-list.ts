import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output, output } from '@angular/core';
import { User } from '../../chat.model';


@Component({
  selector: 'app-chat-list',
  imports: [NgFor],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.css'
})
export class ChatList {
  @Input() users:User[]=[];
  @Input() selectedUserId:string|null=null;

  @Output() selectedUser=new EventEmitter<User>();

  selectUser(user : User){
    this.selectedUser.emit(user);
  }

}
