import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../core/services/alert';

@Component({
  standalone: true,
  selector: 'app-alert',
  imports: [CommonModule],
  template: `
    <div *ngIf="alert$ | async as alert"
         class="alert"
         [class.success]="alert.type === 'success'"
         [class.error]="alert.type === 'error'">
      {{ alert.message }}
    </div>
  `,
  styleUrl: './alert.css'
})
export class AlertComponent {

  alert$;

  constructor(private alertService: AlertService) {
    this.alert$ = this.alertService.alert$;
  }
}
