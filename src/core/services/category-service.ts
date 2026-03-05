import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Category } from '../../shared/models/categries.model';
import { map } from 'rxjs/operators';

export interface ApiResponse {
  status: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /* 🔹 LISTAR simple
  getAll() {
    return this.http.get<any[]>(`${this.baseUrl}/categories.php`).pipe(
      map(data => data.map(cat => ({
        id_categoria: cat.id,   // 🔹 transformamos id → id_categoria
        nombre: cat.nombre,
        descripcion: cat.descripcion
      } as Category)))
    );
  }*/

     getAll() {
    return this.http.get<Category[]>(`${this.baseUrl}/categories.php`);
  }

  // 🔹 LISTAR con conteo de productos
  getAllWithCount() {
    return this.http.get<any[]>(`${this.baseUrl}/categories_with_count.php`).pipe(
      map(data => data.map(cat => ({
        id_categoria: cat.id,   // 🔹 transformamos id → id_categoria
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        productos: cat.productos
      } as Category)))
    );
  }

  // 🔹 CREAR
  create(category: Category) {
    return this.http.post<ApiResponse>(`${this.baseUrl}/guardar_categoria.php`, category);
  }

  // 🔹 ACTUALIZAR
  update(category: Category) {
    return this.http.post<ApiResponse>(`${this.baseUrl}/editar_categoria.php`, category);
  }

  // 🔹 ELIMINAR
  delete(id_categoria: number) {
    return this.http.post<ApiResponse>(`${this.baseUrl}/eliminar_categoria.php`, {
      id_categoria
    });
  }
  
}
