import { Injectable } from '@angular/core';
import { Product } from '../../shared/models/product.model';

export interface CartItem extends Product {
  qty: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cart: CartItem[] = [];

  getCart() {
    return this.cart;
  }

  add(product: Product) {
    const item = this.cart.find(p => p.id === product.id);

    if (item) {
      if (item.qty < product.stock) {
        item.qty++;
      } else {
        alert('No hay más stock disponible');
      }
    } else {
      if (product.stock > 0) {
        this.cart.push({ ...product, qty: 1 });
      } else {
        alert('Producto sin stock');
      }
    }
  }

  increase(item: CartItem) {
    if (item.qty < item.stock) {
      item.qty++;
    } else {
      alert('Stock máximo alcanzado');
    }
  }

  decrease(item: CartItem) {
    if (item.qty > 1) {
      item.qty--;
    } else {
      this.remove(item);
    }
  }

  remove(item: CartItem) {
    this.cart = this.cart.filter(p => p.id !== item.id);
  }

  clear() {
    this.cart = [];
  }

  total() {
    return this.cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );
  }
}