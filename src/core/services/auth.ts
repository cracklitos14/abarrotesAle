import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //private apiUrl = 'http://localhost/backend-ale/index.php?endpoint=login';
  private apiUrl = environment.authUrl;

  constructor(private http: HttpClient) {}

  login(usuario: string, password: string) {
    return this.http.post<any>(this.apiUrl, {
      usuario,
      password
    });
  }

  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  // 🔧 CORRECCIÓN CLAVE (rol, no role)
 // getRole(): string {
   // return this.getUser()?.rol || '';
  //}
  getRole(): string {
  return this.getUser()?.role || '';
}

  logout() {
    localStorage.removeItem('user');
  }
}