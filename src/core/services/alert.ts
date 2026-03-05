import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {

  
  private alertSubject = new BehaviorSubject<any>(null);
  alert$ = this.alertSubject.asObservable();

  show(message: string, type: 'success' | 'error' = 'success') {
    this.alertSubject.next({ message, type });

    //  se oculta sola en 3 segundos
    setTimeout(() => {
      this.clear();
    }, 3000);
  }

  clear() {
    this.alertSubject.next(null);
  }
}
