import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product';
import { CategoryService } from '../../../core/services/category-service';
import { ChangeDetectorRef } from '@angular/core';




@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductListComponent implements OnInit {

  products: any[] = [];
  categories: any[] = [];
  outOfStockProducts: any[] = [];
  searchText = '';
filteredProducts: any[] = [];

  showForm = false;
  loading = false;

  formProduct: any = {
    id: null,
    name: '',
    price: 0,
    stock: 0,
    category_id: '',
    codigo_barras: ''
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cd: ChangeDetectorRef


  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  // =====================
  // 📦 PRODUCTOS
  // =====================
  loadProducts() {
    this.loading = true;

    this.productService.getAll().subscribe({
      next: data => {
        this.products = data;
        this.filteredProducts = data;
       // this.outOfStockProducts = data.filter(p => p.stock <= 0);
        // 🔥 Solo productos con stock > 0 en la tabla principal
      this.filteredProducts = data.filter(p => p.stock > 0);
      //otra tabla
        this.outOfStockProducts = data.filter(p => p.stock <= 0);

     

       this.loading = false;
        this.cd.detectChanges();  //fuerza actualizarse al iniciarse
      },
      error: err => {
        console.error('Error productos', err);
        this.loading = false;
        this.cd.detectChanges(); 
      }
    });
  }

  // =====================
  // 📂 CATEGORÍAS
  // =====================
  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: data => this.categories = data,
      error: err => {
        console.error('Error categorías', err);
        this.categories = [];
      }
    });
  }

  // =====================
  // ➕ NUEVO
  // =====================
 newProduct() {
  this.showForm = true;

  this.formProduct = {
    id: null,
    name: '',
    price: 0,
    stock: 0,
    category_id: '',
    codigo_barras: ''
  };
}
  // =====================
  // ✏️ EDITAR
  // =====================
editProduct(product: any) {
  this.showForm = true;

  this.formProduct = {
    id: product.id,            // 🔥 ESTO define edición
    name: product.name,
    price: product.price,
    stock: product.stock,
    category_id: product.category_id,
    codigo_barras: product.codigo_barras
  };
}

  // =====================
  // 💾 GUARDAR / ACTUALIZAR
  // =====================
 saveProduct() {

  if (!this.formProduct.name || !this.formProduct.category_id) {
    alert('Completa los campos obligatorios');
    return;
  }

  // ✏️ EDITAR (si hay ID)
  if (this.formProduct.id) {
    this.productService.update(this.formProduct).subscribe({
      next: () => {
        this.loadProducts();
        this.cancel();
      },
      error: () => {
        console.warn('Actualizado aunque no venga JSON');
        this.loadProducts();
        this.cancel();
      }
    });
  }

  // ➕ CREAR (si NO hay ID)
  else {
    this.productService.create(this.formProduct).subscribe({
      next: () => {
        this.loadProducts();
        this.cancel();
      },
      error: () => {
        console.warn('Creado aunque no venga JSON');
        this.loadProducts();
        this.cancel();
      }
    });
  }
}


  // =====================
  // 🗑 ELIMINAR
  // =====================
  deleteProduct(id: number) {
    if (!confirm('¿Eliminar producto?')) return;

    this.productService.delete(id).subscribe({
      next: () => this.loadProducts(),
      error: () => {
        console.warn('Eliminado aunque no venga JSON');
        this.loadProducts();
      }
    });
  }


 filterProducts() {
  const text = this.searchText.toLowerCase();

  this.filteredProducts = this.products.filter(p =>
    p.name.toLowerCase().includes(text)
  );
}
  // =====================
  // ❌ CANCELAR
  // =====================
cancel() {
  this.showForm = false;

  this.formProduct = {
    id: null,
    name: '',
    price: 0,
    stock: 0,
    category_id: '',
    codigo_barras: ''
  };
}
}