import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { ChatRoom } from './chat/chat-room/chat-room';
import { authGuard } from './guards/auth-guard';

function hastoken():boolean{
    return document.cookie.split(';').some(c=>c.trim().startsWith('token'))
}

export const routes: Routes = [
    {path:'',redirectTo:'register',pathMatch:'full'},
    {path:'register',component:Register,canActivate:[authGuard]},
    {path:'chat',component:ChatRoom},
    {path:"**",redirectTo:"register"}
];
