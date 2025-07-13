import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { User } from '../chat.model';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  constructor(private http:HttpClient) {  }
  user=signal<User|null>(null);
  async fetchCurrentUser(){
    try{
      //firstvaluefrom convert observable to promise
      const res = await firstValueFrom(this.http.get<{user:User}>('/api/auth/me',{withCredentials:true}));
      this.user.set(res.user)
    }
    catch{
      this.user.set(null);
    }
  }

  async login(username:string,password:string){
    await firstValueFrom(this.http.post('/api/auth',{username,password},{withCredentials:true}))
  }
  async logout(){
    await firstValueFrom(this.http.post('/api/auth/logout',{},{withCredentials:true}));
    this.user.set(null);
  }

}
