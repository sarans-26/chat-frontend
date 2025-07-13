import { NgFor } from '@angular/common';
import { Component, computed, effect, EventEmitter, Input, Output, output } from '@angular/core';
import { UserService } from '../../services/user';
import { User } from '../../chat.model';


@Component({
  selector: 'app-chat-list',
  imports: [NgFor],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.css'
})
export class ChatList {
  @Input() selectedUserId:string|null=null;

  @Output() selectedUser=new EventEmitter<User>();
  constructor(public userService:UserService){
    effect(() => {
      this.userService.fetchUsers();
    });
  }
  users = computed(() => this.userService.users());


  selectUser(user : User){
    this.selectedUser.emit(user);
  }
  

}
