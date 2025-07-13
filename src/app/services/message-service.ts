import { Injectable, signal } from '@angular/core';
import { Message } from '../chat.model';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
   messages=signal<Message[]>([]);

  constructor(private http:HttpClient) { }
  async fetchMessages() {
    const res = await firstValueFrom(this.http.get<Message[]>('/api/message/mine', { withCredentials: true }));
    // console.log(res)
    this.messages.set(res);
  }
  async sendMessage(message: Message) {
    const saved = await firstValueFrom(
      this.http.post<Message>('/api/message/send', message, { withCredentials: true })
    );
    // Update the local messages signal with the new message
    this.messages.update(msgs => [...msgs, saved]);
    return saved;
  }
 
}
