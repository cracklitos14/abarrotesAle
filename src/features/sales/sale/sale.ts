import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Product } from '../../../shared/models/product.model';
import { CartService, CartItem } from '../../../core/services/cart';
import { ProductService } from '../../../core/services/product';

@Component({
  standalone: true,
  selector: 'app-sale',
  imports: [CommonModule, FormsModule],
  templateUrl: './sale.html',
  styleUrl: './sale.css',
})
export class SaleComponent implements OnInit {

  search = '';
  products: Product[] = [];
  paymentMethod: 'efectivo' | 'tarjeta' | null = null;
  today = new Date();
  cashReceived: number = 0;
change: number = 0;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: data => {
        this.products = data;
        this.cdr.detectChanges();
      },
      error: err => console.error(err)
    });
  }
calculateChange() {
  if (this.paymentMethod === 'efectivo') {
    this.change = this.cashReceived - this.total;
  } else {
    this.change = 0;
  }
}
  // 🛒 carrito
  get cart(): CartItem[] {
    return this.cartService.getCart();
  }

  get total(): number {
    return this.cartService.total();
  }

  addToCart(product: Product) {
    this.cartService.add(product);
  }

  increase(item: CartItem) {
    this.cartService.increase(item);
  }

  decrease(item: CartItem) {
    this.cartService.decrease(item);
  }

  selectPayment(method: 'efectivo' | 'tarjeta') {
    this.paymentMethod = method;
    this.cashReceived = 0;
  this.change = 0;
  }

  newSale() {
  if (!this.paymentMethod) {
    alert('Selecciona un método de pago');
    return;
  }

  if (this.paymentMethod === 'efectivo' && this.cashReceived < this.total) {
    alert('El efectivo no cubre el total');
    return;
  }

  const payload = {
    total: this.total,
    id_usuario: 1,
    metodo_pago: this.paymentMethod,
    efectivo: this.cashReceived,
    cambio: this.change,
    items: this.cart
  };

  this.productService.saveSale(payload).subscribe({
    next: () => {
      this.cdr.detectChanges();

      setTimeout(() => {
        this.printTicket();
        this.cartService.clear();
        this.loadProducts();
        this.cashReceived = 0;
        this.change = 0;
      }, 300);
    },
    error: err => console.error(err)
  });
}

  printTicket() {
    window.print();
    
  }

get filteredProducts(): Product[] {
  const term = this.search.trim().toLowerCase();

  return this.products
    .filter(p => p.stock > 0)
    .filter(p =>
      p.name.toLowerCase().includes(term) ||

      (p.codigo_barras && p.codigo_barras === term)
    );
}

/*onSearchChange() {
  const product = this.products.find(
    p => p.codigo_barras === this.search
  );

  if (product) {
    this.addToCart(product);
    this.search = '';
  }
} */
onSearchChange() {
  const term = this.search.trim();

  if (!term) return;

  const product = this.products.find(
    p => p.codigo_barras?.toString() === term 
  );

  if (product) {
    this.addToCart(product);
    this.search = ''; // 🔥 limpia la barra
  }
}
}  