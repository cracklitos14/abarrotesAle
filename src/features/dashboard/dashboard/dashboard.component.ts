import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../core/services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  dashboard: any = {
    ventasHoy: 0,
    productosVendidos: 0,
    stock: 0,
    categorias: 0,
    actividad: []
  };

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('✅ CONSTRUCTOR DASHBOARD');
  }

  ngOnInit(): void {
    console.log('🔥 NGONINIT DASHBOARD');

    this.api.getDashboard().subscribe({
      next: (res) => {
        console.log('📦 RESPUESTA DASHBOARD:', res);
        this.dashboard = res;

        // 🔥 fuerza render
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ ERROR DASHBOARD:', err);
      }
    });
  }
}