import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../../core/services/reports';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reportes',
  standalone: true,
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
  imports: [FormsModule, CommonModule, CurrencyPipe]
})
export class ReportesComponent implements OnInit {

  fechaInicio: string = '';
  fechaFin: string = '';
  mostrarAlerta: boolean = false;
  rangoInicio: string = '';
  rangoFin: string = '';
  hoy: string = new Date().toISOString().split('T')[0];
  cargando: boolean = false;

  reportes: any = {
    ingresosTotales: 0,
    productosAgotados: [],
    productosStockBajo: [],
    ventasPorMetodo: [],
    productosVendidos: [],
    mensajeAlertas: ""
  };

  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.fechaInicio = this.hoy;
    this.fechaFin = this.hoy;
  }

  generarReporte() {
    if (this.cargando) return;

    // 1. Validaciones de fechas
    if (!this.fechaInicio || !this.fechaFin) {
      alert("⚠️ Por favor, selecciona ambas fechas.");
      return;
    }

    if (this.fechaInicio > this.fechaFin) {
      alert("⚠️ La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }

    this.cargando = true;
    this.mostrarAlerta = false;
    this.rangoInicio = ''; // Resetear rango previo para ocultar botones viejos

    this.reportsService.getReportesPorFechas(this.fechaInicio, this.fechaFin)
      .subscribe({
        next: (data) => {
          this.reportes = data;
          this.rangoInicio = this.fechaInicio;
          this.rangoFin = this.fechaFin;

          // Finalizamos carga y mostramos aviso de descarga
          this.cargando = false;
          this.mostrarAlerta = true;
        },
        error: (err) => {
          console.error(err);
          alert("❌ Error al obtener datos del servidor.");
          this.cargando = false;
        }
      });
  }

  // Función para resetear todo después de una descarga exitosa
  limpiarYFinalizar() {
    this.fechaInicio = this.hoy;
    this.fechaFin = this.hoy;
    this.rangoInicio = '';
    this.rangoFin = '';
    this.mostrarAlerta = false;
    this.reportes = {
      ingresosTotales: 0,
      productosAgotados: [],
      productosStockBajo: [],
      ventasPorMetodo: [],
      productosVendidos: [],
      mensajeAlertas: ""
    };
  }

  exportarReportePDF() {
    if (!this.rangoInicio) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Ventas - Abarrotes Alejandra", 14, 20);
    doc.setFontSize(11);
    doc.text(`Periodo: ${this.rangoInicio} al ${this.rangoFin}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Producto', 'Unidades', 'Ingresos']],
      body: this.reportes.productosVendidos.map((p: any) => [
        p.nombre, 
        p.unidades, 
        `$${p.ingresos}`
      ]),
      theme: 'striped'
    });

    doc.save(`Reporte_Ventas_${this.rangoInicio}.pdf`);
    
    alert("✅ PDF descargado. El formulario se reiniciará.");
    this.limpiarYFinalizar();
  }

  exportarReporteCSV() {
    if (!this.rangoInicio) return;

    const filas = [
      ["Reporte de Ventas - Abarrotes Alejandra"],
      [`Periodo: ${this.rangoInicio} a ${this.rangoFin}`],
      [""],
      ["Producto", "Unidades", "Subtotal (MXN)"]
    ];

    this.reportes.productosVendidos.forEach((p: any) => {
      filas.push([p.nombre, p.unidades, p.ingresos]);
    });

    const csvContent = filas.map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_Ale_${this.rangoInicio}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("✅ CSV descargado. El formulario se reiniciará.");
    this.limpiarYFinalizar();
  }
}