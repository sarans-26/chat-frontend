import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';
import { UserService } from './services/user';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'frontend';
  constructor(private auth: AuthService,public userService:UserService) {}

  ngOnInit() {
    this.auth.fetchCurrentUser();
    this.userService.fetchUsers();
  }
}
