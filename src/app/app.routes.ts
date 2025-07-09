import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { ChatRoom } from './chat/chat-room/chat-room';

export const routes: Routes = [
    {path:'',redirectTo:'register',pathMatch:'full'},
    {path:'register',component:Register},
    {path:'chat',component:ChatRoom},
    {path:"**",redirectTo:"register"}
];
