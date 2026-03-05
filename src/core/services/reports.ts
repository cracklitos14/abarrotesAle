import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Reporte {
  ingresosTotales: number;
  productosAgotados: { nombre: string; stock: number; stock_minimo: number }[];
  productosStockBajo: { nombre: string; stock: number; stock_minimo: number }[];
  ventasPorMetodo: { nombre: string; transacciones: number; monto: number }[];
  productosVendidos: { nombre: string; unidades: number; ingresos: number }[];
  mensajeAlertas?: string;
}



@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getReportes(periodo: string): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.baseUrl}/reportes.php?periodo=${periodo}`);
  }

  getReportesPorFechas(fechaInicio: string, fechaFin: string): Observable<Reporte> {
    return this.http.get<Reporte>(
      `${this.baseUrl}/reportes.php?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
  }
}