import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoxService, CierreCaja } from '../../../core/services/box';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChangeDetectorRef } from '@angular/core';

const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';

@Component({
  selector: 'app-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './box.html',
  styleUrls: ['./box.css']
})
export class BoxComponent implements OnInit {

  totalVentas = 0;
  totalEfectivo = 0;
  totalTarjeta = 0;

  efectivoContado = 0;
  diferencia = 0;

  observaciones = '';
  mensaje = '';
  vistaLista = false;
  loading = false;
  error = false;

  historial: CierreCaja[] = [];
  inicio = '';
  fin = '';

  id_usuario = 1;
  today = new Date();

  // ✅ Propiedades auxiliares para inputs de fecha
  todayStr = '';
  minFin = '';

  constructor(private boxService: BoxService,
              private cdr: ChangeDetectorRef ){}

  ngOnInit(): void {
    this.todayStr = new Date().toISOString().split('T')[0]; // fecha de hoy en formato yyyy-MM-dd
    this.cargarResumen();
    this.cargarHistorial();
  }

  onInicioChange() {
    this.minFin = this.inicio; // ✅ Ajusta el mínimo de la fecha fin
  }

  cargarResumen() {
    this.loading = true;
    this.error = false;

    this.boxService.obtenerResumen(this.id_usuario).subscribe({
      next: (res) => {
        this.totalVentas = Number(res.total_ventas) || 0;
        this.totalEfectivo = Number(res.total_efectivo) || 0;
        this.totalTarjeta = Number(res.total_tarjeta) || 0;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calcularDiferencia() {
    this.diferencia = this.efectivoContado - this.totalEfectivo;
  }

  cerrarCaja() {
    this.loading = true;
    this.error = false;

    this.boxService.cerrarCaja({
      id_usuario: this.id_usuario,
      observaciones: this.observaciones,
      efectivo_contado: this.efectivoContado
    }).subscribe({
      next: () => {
        this.mensaje = '✅ Caja cerrada correctamente';
        this.efectivoContado = 0;
        this.observaciones = '';
        this.diferencia = 0;
        this.cargarResumen();
        this.cargarHistorial();
        this.loading = false;
      },
      error: () => {
        this.mensaje = '❌ Error al cerrar la caja';
        this.loading = false;
      }
    });
  }

  cargarHistorial() {
    const hoy = new Date().toISOString().split('T')[0];

    // ✅ Validación: ambas fechas completas
    if (!this.inicio || !this.fin) {
      this.mensaje = '⚠️ Selecciona ambas fechas para filtrar';
      return;
    }

    // ✅ Validación: no permitir fechas futuras
    if ((this.inicio && this.inicio > hoy) || (this.fin && this.fin > hoy)) {
      this.mensaje = '⚠️ No puedes seleccionar fechas futuras';
      return;
    }

    // ✅ Validación: fecha fin no menor que inicio
    if (this.inicio && this.fin && this.inicio > this.fin) {
      this.mensaje = '⚠️ La fecha final no puede ser menor que la inicial';
      return;
    }

    this.boxService.obtenerHistorial(this.inicio, this.fin)
      .subscribe({
        next: (data) => this.historial = data,
        error: () => this.historial = []
      });
  }

  exportarPDF() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Reporte de Cierres de Caja', 14, 15);

    doc.setFontSize(10);
    doc.text(
      `Periodo: ${this.inicio || 'Inicio'} - ${this.fin || 'Hoy'}`,
      14,
      22
    );

    const totalVentas = this.historial.reduce(
      (sum, c) => sum + Number(c.total_ventas), 0
    );

    doc.setFontSize(11);
    doc.text(`Total de ventas: $${totalVentas.toFixed(2)}`, 14, 30);

    autoTable(doc, {
      startY: 36,
      head: [[
        'Fecha',
        'Ventas',
        'Efectivo Sistema',
        'Efectivo Contado',
        'Diferencia'
      ]],
      body: this.historial.map(c => [
        c.fecha,
        `$${Number(c.total_ventas).toFixed(2)}`,
        `$${Number(c.total_efectivo).toFixed(2)}`,
        `$${Number(c.efectivo_contado).toFixed(2)}`,
        `$${Number(c.diferencia).toFixed(2)}`
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255,
        halign: 'center'
      },
      bodyStyles: {
        halign: 'center'
      },
      styles: {
        fontSize: 9
      }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Generado el ${new Date().toLocaleDateString('es-MX')}`, // ✅ Fecha en español
        14,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save('Reporte_Cierres_Caja.pdf');

    // ✅ Limpiar filtros y resultados después de exportar
    this.inicio = '';
    this.fin = '';
    this.historial = [];
    this.cargarHistorial();
  }

  exportarCierrePDF(c: CierreCaja) {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Cierre de Caja', 14, 15);

    doc.setFontSize(12);
    doc.text(`Fecha: ${c.fecha}`, 14, 25);

    autoTable(doc, {
      startY: 35,
      body: [
        ['Total Ventas', `$${c.total_ventas}`],
        ['Efectivo Sistema', `$${c.total_efectivo}`],
        ['Efectivo Contado', `$${c.efectivo_contado}`],
        ['Diferencia', `$${c.diferencia}`]
      ],
      theme: 'grid'
    });

    doc.save(`Cierre_${c.fecha}.pdf`);

    // ✅ Limpiar filtros y resultados después de exportar
    this.inicio = '';
    this.fin = '';
    this.historial = [];
    this.cargarHistorial();
  }
}