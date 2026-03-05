import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResumenCaja {
  total_ventas: number;
  total_efectivo: number;
  total_tarjeta: number;
}

export interface CerrarCajaRequest {
  id_usuario: number;
  observaciones: string;
  efectivo_contado: number;
}

export interface CierreCaja {
  fecha: string;
  total_ventas: number;
  total_efectivo: number;
  efectivo_contado: number;
  diferencia: number;
}

@Injectable({ providedIn: 'root' })
export class BoxService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerResumen(id: number): Observable<ResumenCaja> {
    return this.http.get<ResumenCaja>(`${this.api}/obtener_resumen_caja.php?id_usuario=${id}`);
  }

  cerrarCaja(data: CerrarCajaRequest): Observable<any> {
    return this.http.post(`${this.api}/cerrar_caja.php`, data);
  }

  obtenerHistorial(inicio?: string, fin?: string): Observable<CierreCaja[]> {
    let url = `${this.api}/obtener_historial_cierres.php`;
    if (inicio && fin) {
      url += `?inicio=${inicio}&fin=${fin}`;
    }
    return this.http.get<CierreCaja[]>(url);
  }
}