import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Asegúrate de importar esto para pipes si los usas

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

  ngOnInit(): void {
    this.actualizarFechaHora(); // Inicializa inmediatamente
    
    // Cambiamos a 1000ms (1 segundo) para que el cambio de minuto sea instantáneo
    this.intervalo = setInterval(() => {
      this.actualizarFechaHora();
    }, 1000); 
  }

  ngOnDestroy(): void {
    // Es vital limpiar el intervalo para evitar fugas de memoria
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  private actualizarFechaHora(): void {
    const ahora = new Date();
    // Agregué 'seconds' opcionalmente por si quieres que se vea el segundero
    this.fechaHora = ahora.toLocaleString('es-MX', {
      weekday: 'long', // Opcional: "lunes"
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit' // Quita esta línea si no quieres ver los segundos
    });
  }
}