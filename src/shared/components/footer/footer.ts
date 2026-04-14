import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent implements OnInit, OnDestroy {
  fechaHora: string = '';
  private intervalo: any;

  // Inyectamos ChangeDetectorRef para forzar la actualización de la vista
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.actualizarFechaHora(); // Carga inicial
    
    // Usamos 1000ms (1 segundo) para que Angular detecte el cambio de minuto al instante
    this.intervalo = setInterval(() => {
      this.actualizarFechaHora();
      // Forzamos a Angular a re-dibujar el componente
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    // Limpiamos el proceso para evitar que consuma RAM al cerrar la app
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  private actualizarFechaHora(): void {
    const ahora = new Date();
    this.fechaHora = ahora.toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short' // Cambia a 'medium' si quieres ver los segundos
    });
  }
}