import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

export interface Reporte {
  ingresosTotales: number;
  productosAgotados: any[];
  productosStockBajo: any[];
  ventasPorMetodo: any[];
  productosVendidos: any[];
  mensajeAlertas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getReportesPorFechas(fechaInicio: string, fechaFin: string): Observable<Reporte> {

    return this.http.get<any>(
      `${this.baseUrl}/reportes.php?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    ).pipe(
      map((data:any) => ({
        ingresosTotales: Number(data.ingresosTotales) || 0,
        productosAgotados: data.productosAgotados || [],
        productosStockBajo: data.productosStockBajo || [],
        ventasPorMetodo: data.ventasPorMetodo || [],
        productosVendidos: (data.productosVendidos || []).map((p:any)=>({
          nombre: p.nombre,
          unidades: Number(p.unidades),
          ingresos: Number(p.ingresos)
        })),
        mensajeAlertas: data.mensajeAlertas || ""
      }))
    );
  }
}