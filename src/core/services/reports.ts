import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

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

  getReportesPorFechas(fechaInicio: string, fechaFin: string): Observable<Reporte> {

    return this.http.get<any>(
      `${this.baseUrl}/reportes.php?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    ).pipe(

      map((data:any) => {

        return {

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

        };

      })

    );

  }

}