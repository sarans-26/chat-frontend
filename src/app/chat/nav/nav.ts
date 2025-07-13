import { Component, signal } from '@angular/core';
import { User } from '../../chat.model';
import { Auth } from '../../services/auth';
import { NgIf } from '@angular/common';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [NgIf],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  constructor(public auth:Auth,private router:Router){
    // console.log(auth)
  }
 async logout() {
  try {
    await this.auth.logout();
    console.log('Logged out, navigating...');
    this.router.navigate(['/register']);
  } catch (e) {
    console.error('Logout failed', e);
    this.router.navigate(['/register']); // Try navigating anyway
  }
}

}
