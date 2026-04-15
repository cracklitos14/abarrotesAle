import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoxService, CierreCaja } from '../../../core/services/box';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './box.html',
  styleUrls: ['./box.css']
})
export class BoxComponent implements OnInit {
  // ... (variables de totales y estado se mantienen igual)
  totalVentas = 0;
  totalEfectivo = 0;
  totalTarjeta = 0;
  efectivoContado = 0;
  diferencia = 0;
  observaciones = '';
  mensaje = '';
  loading = false;
  error = false;
  
  historial: CierreCaja[] = [];
  inicio: string = '';
  fin: string = '';
  id_usuario = 1;
  today = new Date();

  constructor(private boxService: BoxService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarResumen();
    this.cargarHistorial(); // Carga inicial (sin filtros)
  }

  // --- LÓGICA DE FILTRADO ---

  cargarHistorial() {
    const hoy = new Date().toISOString().split('T')[0];

    // Solo validamos si el usuario ha escrito algo en las fechas
    if (this.inicio || this.fin) {
      if (this.inicio > hoy || this.fin > hoy) {
        this.mensaje = '⚠️ No puedes seleccionar fechas futuras';
        return;
      }
      if (this.inicio && this.fin && this.inicio > this.fin) {
        this.mensaje = '⚠️ La fecha inicial no puede ser mayor que la final';
        return;
      }
    }

    this.boxService.obtenerHistorial(this.inicio, this.fin)
      .subscribe({
        next: (data) => {
          this.historial = data;
          this.mensaje = data.length > 0 ? '' : 'No se encontraron resultados';
        },
        error: () => this.historial = []
      });
  }

  // Ajuste 2: Función de limpieza centralizada
  limpiarFiltrosYTabla() {
    this.inicio = '';
    this.fin = '';
    // Opción A: Cargar historial general (comentada)
    // this.cargarHistorial(); 
    
    // Opción B: Vaciar la tabla por completo para que quede limpia
    this.historial = []; 
    this.mensaje = 'Filtros limpiados';
    setTimeout(() => this.mensaje = '', 2000);
  }

  // --- EXPORTACIONES ---

  exportarPDF() {
    if (this.historial.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de Cierres de Caja - Abarrotes Ale', 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [['Fecha', 'Ventas', 'Efectivo', 'Contado', 'Diff']],
      body: this.historial.map(c => [
        c.fecha,
        `$${c.total_ventas}`,
        `$${c.total_efectivo}`,
        `$${c.efectivo_contado}`,
        `$${c.diferencia}`
      ]),
    });

    doc.save('Reporte_General_Cierres.pdf');

    // ✅ Ajuste 2: Limpiar después de exportar
    this.limpiarFiltrosYTabla();
  }

  exportarCierrePDF(c: CierreCaja) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Comprobante de Cierre de Caja', 14, 15);
    
    autoTable(doc, {
      startY: 25,
      body: [
        ['Fecha', c.fecha],
        ['Venta Total', `$${c.total_ventas}`],
        ['Diferencia', `$${c.diferencia}`]
      ]
    });

    doc.save(`Cierre_${c.fecha}.pdf`);

    // ✅ Ajuste 2: Limpiar después de exportar individual
    this.limpiarFiltrosYTabla();
  }

  // ... (cargarResumen, calcularDiferencia y cerrarCaja se mantienen igual)
  cargarResumen() { /* ... */ }
  calcularDiferencia() { /* ... */ }
  cerrarCaja() { /* ... */ }
}