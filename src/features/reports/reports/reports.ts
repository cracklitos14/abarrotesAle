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

  ngOnInit(){
    this.fechaInicio = this.hoy;
    this.fechaFin = this.hoy;
  }

  generarReporte() {
    if (this.cargando) return;

    // ✅ VALIDACIÓN DE RANGO DE FECHAS
    if (!this.fechaInicio || !this.fechaFin) {
      alert("⚠️ Debes seleccionar ambas fechas");
      return;
    }

    if (this.fechaInicio > this.fechaFin) {
      alert("⚠️ La fecha de inicio no puede ser mayor a la de fin");
      return;
    }

    this.cargando = true;
    this.mostrarAlerta = false;

    this.reportsService.getReportesPorFechas(this.fechaInicio, this.fechaFin)
      .subscribe({
        next: (data) => {
          this.reportes = data;
          this.rangoInicio = this.fechaInicio;
          this.rangoFin = this.fechaFin;

          setTimeout(() => {
            this.cargando = false;
            // ✅ MOSTRAR ALERTA DE INSTRUCCIONES
            this.mostrarAlerta = true;
          }, 1000);
        },
        error: (err) => {
          console.error(err);
          alert("❌ Error al obtener datos del servidor");
          this.cargando = false;
        }
      });
  }

  // ✅ ESTA FUNCIÓN AHORA COINCIDE CON EL HTML
  limpiarFiltros(){
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
    if(!this.rangoInicio || !this.rangoFin){
      alert("⚠️ Primero genera el reporte con el botón azul");
      return;
    }

    const doc = new jsPDF();
    let currentY = 20;

    doc.setFontSize(16);
    doc.text("Reporte de Ventas - Abarrotes Ale", 40, currentY);
    currentY += 10;
    doc.setFontSize(12);
    doc.text(`Periodo: ${this.rangoInicio} a ${this.rangoFin}`, 14, currentY);
    currentY += 15;

    doc.setFontSize(14);
    doc.text(`Ingresos Totales: $${this.reportes.ingresosTotales} MXN`, 14, currentY);
    currentY += 15;

    // Productos Agotados
    doc.text("Productos Agotados", 14, currentY);
    if (this.reportes.productosAgotados && this.reportes.productosAgotados.length > 0) {
      autoTable(doc,{
        startY: currentY + 5,
        head:[["Producto","Stock"]],
        body:this.reportes.productosAgotados.map((p:any)=>[p.nombre,p.stock])
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.text("Ninguno", 14, currentY + 8);
      currentY += 15;
    }

    // Productos Vendidos
    doc.text("Productos Vendidos", 14, currentY);
    if(this.reportes.productosVendidos && this.reportes.productosVendidos.length > 0){
      autoTable(doc,{
        startY: currentY + 5,
        head:[["Producto","Unidades","Ingresos"]],
        body:this.reportes.productosVendidos.map((p:any)=>[p.nombre, p.unidades, `$${p.ingresos}`])
      });
    }

    doc.save(`Reporte_Ale_${this.rangoInicio}.pdf`);
    this.limpiarFiltros(); // Limpia después de descargar
  }

  exportarReporteCSV() {
    if(!this.rangoInicio || !this.rangoFin){
      alert("⚠️ Primero genera el reporte con el botón azul");
      return;
    }

    const rows = [
      ["Reporte de Ventas - Abarrotes Ale"],
      [`Periodo: ${this.rangoInicio} a ${this.rangoFin}`],
      [],
      ["Ingresos Totales", `${this.reportes.ingresosTotales} MXN`],
      [],
      ["Producto", "Unidades", "Ingresos (MXN)"],
      ...this.reportes.productosVendidos.map((p:any) => [p.nombre, p.unidades, p.ingresos])
    ];

    const csv = rows.map(e => e.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_Ale_${this.rangoInicio}.csv`;
    link.click();
    
    this.limpiarFiltros(); // Limpia después de descargar
  }
}