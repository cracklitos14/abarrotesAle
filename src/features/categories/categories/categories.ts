import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoryService } from '../../../core/services/category-service';
import { Category } from '../../../shared/models/categries.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class CategoriesComponent implements OnInit {

  categories: Category[] = [];

  formCategory: Category = {
    id_categoria: null,
    nombre: '',
    descripcion: ''
  };

  showForm = false;
  isEdit = false;
  loading = false;
  error = false;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    // ✅ UNA sola carga inicial (estable)
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = false;

    this.categoryService.getAllWithCount().subscribe({
      next: (data: Category[]) => {
        this.categories = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: err => {
        console.error('Error cargando categorías', err);
        this.categories = [];
        this.error = true;
        this.loading = false;
      }
    });
  }

  // 🔹 NUEVA CATEGORÍA
  openNew() {
    this.formCategory = {
      id_categoria: null,
      nombre: '',
      descripcion: ''
    };
    this.isEdit = false;
    this.showForm = true;
  }

  // 🔹 EDITAR
  edit(cat: Category) {
    this.formCategory = { ...cat };
    this.isEdit = true;
    this.showForm = true;
  }

  // 🔹 GUARDAR / ACTUALIZAR
  save() {
    if (!this.formCategory.nombre.trim()) return;

    const action$ = this.isEdit
      ? this.categoryService.update(this.formCategory)
      : this.categoryService.create(this.formCategory);

    action$.subscribe({
      next: () => {
        this.loadCategories(); // ✅ recarga segura
        this.cancel();
      },
      error: err => console.error('Error guardando categoría', err)
    });
  }

  // 🔹 ELIMINAR
  delete(id: number) {
    if (!confirm('¿Eliminar categoría?')) return;

    this.categoryService.delete(id).subscribe({
      next: () => this.loadCategories(),
      error: err => console.error('Error eliminando', err)
    });
  }

  // 🔹 CANCELAR
  cancel() {
    this.showForm = false;
    this.isEdit = false;
    this.formCategory = {
      id_categoria: null,
      nombre: '',
      descripcion: ''
    };
  }
}