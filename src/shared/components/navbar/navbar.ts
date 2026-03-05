import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {

  role = '';

  constructor(private authService: AuthService) {
    this.role = this.authService.getRole();

    
  }

  
  logout() {9
    this.authService.logout();
    location.href = '/login';
  }
}
