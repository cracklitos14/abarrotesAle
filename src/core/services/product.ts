import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 📦 Obtener productos
  getAll() {
    return this.http.get<any[]>(`${this.baseUrl}/products.php`).pipe(
      map(products =>
        products.map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          stock: Number(p.stock),
          category: p.category,
          category_id: p.category_id,
          codigo_barras: p.codigo_barras
        }))
      )
    );
  }

  // ➕ Guardar producto
  create(product: any) {
    return this.http.post(`${this.baseUrl}/guardar_producto.php`, product);
  }

  // 🗑 Eliminar producto
  delete(id: number) {
    return this.http.post(`${this.baseUrl}/eliminar_producto.php`, { id });
  }

  // ✏️ Editar producto
  update(product: any) {
    return this.http.post(`${this.baseUrl}/editar_producto.php`, {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      codigo_barras: product.codigo_barras
    });
  }

  // 💾 Guardar venta
  saveSale(data: any) {
    return this.http.post(`${this.baseUrl}/guardar_venta.php`, data);
  }
}