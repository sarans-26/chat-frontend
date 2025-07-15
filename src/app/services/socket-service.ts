import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
 public socket: Socket;

  constructor() {
    this.socket = io('http://localhost:5000'); // Use your backend URL/port
  }
}
