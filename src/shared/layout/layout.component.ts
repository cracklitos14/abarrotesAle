import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from '../components/navbar/navbar';
import { SidebarComponent } from '../components/sidebar/sidebar';
import { FooterComponent } from '../components/footer/footer';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  
}