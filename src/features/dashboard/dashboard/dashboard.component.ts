import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../core/services/api';
import Chart from 'chart.js/auto';

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
    actividad: [],
    ultimaVenta:null,
    ventasGrafica:[]
  };

  chart:any;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.api.getDashboard().subscribe({
      next: (res:any) => {

        this.dashboard = res;

        this.cdr.detectChanges();

        this.crearGrafica();

      },
      error: (err) => {
        console.error(err);
      }
    });

  }

  crearGrafica(){

    if(!this.dashboard.ventasGrafica) return;

    const labels = this.dashboard.ventasGrafica.map((v:any)=>v.hora);
    const data = this.dashboard.ventasGrafica.map((v:any)=>v.total);

    const ctx:any = document.getElementById("graficaVentas");

    this.chart = new Chart(ctx,{
      type:'line',
      data:{
        labels:labels,
        datasets:[
          {
            label:'Ventas del día',
            data:data,
            tension:0.4
          }
        ]
      },
      options:{
        responsive:true,
        plugins:{
          legend:{
            display:false
          }
        }
      }
    });

  }

}