import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChatList } from '../chat-list/chat-list';
import {  NgFor, NgIf } from '@angular/common';
import { UserService } from '../../services/user';
import { MessageService } from '../../services/message-service';
import { Nav } from '../nav/nav';
import type { User, Message } from '../../chat.model';
import { AuthService } from '../../services/auth';
import { SocketService } from '../../services/socket-service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [ReactiveFormsModule, ChatList, NgIf, NgFor, Nav],
  templateUrl: './chat-room.html',
  styleUrls: ['./chat-room.css']
})
export class ChatRoom implements OnInit {
  public selectedUser: User | null = null;
  public isVideoChatActive=false;//is video chat active
  public incomingVideoOffer: any = null;// is there offer coming of video
  public isMuted = false;//is muted or not 
  public localStream?: MediaStream;//your video 
  public remoteStream?: MediaStream;//incoming video
  public peerConnection?: RTCPeerConnection;// the WebRTC peer connection object for handling video/audio streaming

  constructor(
    public userService: UserService,
    public messageService: MessageService,
    public auth: AuthService,
    public socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.userService.fetchUsers();
    this.messageService.fetchMessages();
    this.socketService.socket.on('chatMessage', (msg: Message) => {
      this.messageService.messages.update((msgs) => [...msgs, msg]);
    });
    this.socketService.socket.on('videoOffer', (data) => {
      this.incomingVideoOffer = data;
    });
    this.socketService.socket.on('videoAnswer', async (data) => {
      await this.handleVideoAnswer(data);
    });
    this.socketService.socket.on('iceCandidate', async (data) => {
      await this.handleIceCandidate(data);
    });
    this.socketService.socket.on('endCall', () => {
      this.endVideoChat(true);
    });

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
    const roomId = [this.currentUserId, user._id].sort().join('_');
    this.socketService.socket.emit('joinRoom', roomId);

  }
  public formatMessageDate(dateStr: string | Date): string {
    const messageDate = new Date(dateStr);
    const today = new Date();

    const isToday =
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();

    return isToday
      ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : messageDate.toLocaleString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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
    const roomId = [this.currentUserId, this.selectedUser._id].sort().join('_');
    this.socketService.socket.emit('chatMessage', { roomId, message: newMessage });


    // this.messageService.messages.update((msgs) => [...msgs, newMessage]);
    this.chatForm.reset();
    await this.messageService.sendMessage(newMessage); // Persist to backend and update signal
    this.chatForm.reset();
    // Optionally: send to backend via socket or HTTP
  }


  public async offerVideoChat() {
    if (!this.selectedUser) return;
    this.isVideoChatActive = true;
    const roomId = [this.currentUserId, this.selectedUser._id].sort().join('_');

    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    localVideo.srcObject = this.localStream;

    this.peerConnection = new RTCPeerConnection();

    this.localStream.getTracks().forEach(track => {
      this.peerConnection!.addTrack(track, this.localStream!);
    });

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      remoteVideo.srcObject = this.remoteStream;
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socketService.socket.emit('iceCandidate', { roomId, candidate: event.candidate });
      }
    };

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.socketService.socket.emit('videoOffer', { roomId, offer });
  }

  public async acceptVideoChat() {
    if (!this.selectedUser || !this.incomingVideoOffer) return;
    this.isVideoChatActive = true;
    const roomId = this.incomingVideoOffer.roomId;

    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    localVideo.srcObject = this.localStream;

    this.peerConnection = new RTCPeerConnection();

    this.localStream.getTracks().forEach(track => {
      this.peerConnection!.addTrack(track, this.localStream!);
    });

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
      remoteVideo.srcObject = this.remoteStream;
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socketService.socket.emit('iceCandidate', { roomId, candidate: event.candidate });
      }
    };

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(this.incomingVideoOffer.offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.socketService.socket.emit('videoAnswer', { roomId, answer });

    this.incomingVideoOffer = null;
  }

  private async handleVideoAnswer(data: any) {
    await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(data.answer));
  }

  private async handleIceCandidate(data: any) {
    if (data.candidate) {
      await this.peerConnection?.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }

  public toggleMute() {
    if (this.localStream) {
      this.isMuted = !this.isMuted;
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }
  }

  public endVideoChat(remote = false) {
    this.isVideoChatActive = false;
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = undefined;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = undefined;
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = undefined;
    }
    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
    if (localVideo) localVideo.srcObject = null;
    if (remoteVideo) remoteVideo.srcObject = null;

    // Notify the other user unless this is a remote hangup
    if (!remote && this.selectedUser) {
      const roomId = [this.currentUserId, this.selectedUser._id].sort().join('_');
      this.socketService.socket.emit('endCall', { roomId });
    }
    this.incomingVideoOffer = null;
    this.isMuted = false;
  }

}













// offerVideoChat()
// Checks if a user is selected; if not, exits.
// Sets isVideoChatActive to true to show video UI.
// Creates a unique room ID for the call using both user IDs.
// Requests access to your webcam and microphone (getUserMedia).
// Displays your video stream in the local video element.
// Creates a new WebRTC peer connection (RTCPeerConnection).
// Adds your video and audio tracks to the peer connection.
// Sets up a handler to display the remote user's stream when received.
// Sets up a handler to send ICE candidates (network info) to the other user via socket.
// Creates a WebRTC offer, sets it as your local description, and sends it to the other user via socket.

// acceptVideoChat()
// Checks if a user is selected and an offer is received; if not, exits.
// Sets isVideoChatActive to true to show video UI.
// Gets the room ID from the incoming offer.
// Requests webcam/mic access and displays your stream.
// Creates a peer connection and adds your tracks.
// Sets up a handler to display the remote user's stream when received.
// Sets up a handler to send ICE candidates to the other user.
// Sets the remote description to the received offer.
// Creates an answer, sets it as your local description, and sends it to the other user via socket.
// Clears the incoming offer.

// handleVideoAnswer(data)
// Sets the remote description of your peer connection to the received answer, completing the connection setup.

// handleIceCandidate(data)
// Adds received ICE candidates to your peer connection, helping establish the best network path for the video/audio stream.

// toggleMute()
// Toggles the mute state (isMuted).
// Disables/enables your microphone by turning audio tracks on/off in your local stream.

// endVideoChat(remote = false)
// Sets isVideoChatActive to false to hide video UI.
// Closes the peer connection and clears it.
// Stops and clears local and remote media streams.
// Clears the video elements.
// Notifies the other user that the call has ended (unless they ended it).
// Resets mute and incoming offer state.
