import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from '../chat.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  users=signal<User[]|null>([]);
  constructor(private http:HttpClient) { }
  async fetchUsers(){
    const res = await firstValueFrom(
      this.http.get<User[]>('/api/users', {
        withCredentials: true
      })
    );
    this.users.set(res);
  }
}
