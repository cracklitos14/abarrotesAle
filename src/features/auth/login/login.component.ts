import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { AlertService } from '../../../core/services/alert';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) {}

  login() {
    this.authService.login(this.username, this.password)
      .subscribe({
        next: (res) => {
          this.authService.saveUser(res.user);

          this.alertService.show('Inicio de sesión exitoso', 'success');

          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          const msg = err.error?.message || 'Credenciales incorrectas';
          this.alertService.show(msg, 'error');
        }
      });
  }
}
