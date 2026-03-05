import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent implements OnInit, OnDestroy {
  fechaHora: string = '';
  private intervalo: any;

  ngOnInit(): void {
    this.actualizarFechaHora(); // inicializa al cargar
    this.intervalo = setInterval(() => {
      this.actualizarFechaHora();
    }, 60000); // cada minuto
  }

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  private actualizarFechaHora(): void {
    const ahora = new Date();
    this.fechaHora = ahora.toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }
}
