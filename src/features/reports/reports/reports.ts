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

  hoy: string = new Date().toLocaleDateString('sv-SE');

  cargando: boolean = false;

  reportes: any = {
    ingresosTotales: 0,
    productosAgotados: [],
    productosStockBajo: [],
    ventasPorMetodo: [],
    productosVendidos: [],
    mensajeAlertas: "Seleccione un rango de fechas"
  };

  constructor(private reportsService: ReportsService) {}

  ngOnInit(){
    this.fechaInicio = this.hoy;
    this.fechaFin = this.hoy;
  }

  // 🔥 FUNCIÓN PRINCIPAL CORREGIDA
  generarReporte() {

    if(this.cargando) return;

    if(!this.fechaInicio || !this.fechaFin){
      alert("Debes seleccionar ambas fechas");
      return;
    }

    if(this.fechaFin < this.fechaInicio){
      alert("La fecha final no puede ser menor que la inicial");
      return;
    }

    this.cargando = true;

    this.reportsService.getReportesPorFechas(this.fechaInicio, this.fechaFin)
      .subscribe({
        next: (data) => {

          // ✅ AHORA SÍ GUARDAMOS LOS DATOS
          this.reportes = data;

          this.rangoInicio = this.fechaInicio;
          this.rangoFin = this.fechaFin;

          this.cargando = false;

          this.mostrarAlerta = true;

          setTimeout(() => {
            this.mostrarAlerta = false;
          }, 3000);
        },
        error: (err) => {
          console.error(err);
          alert("Error al generar reporte");
          this.cargando = false;
        }
      });
  }

  limpiarFiltros(){
    this.fechaInicio = this.hoy;
    this.fechaFin = this.hoy;

    this.rangoInicio = '';
    this.rangoFin = '';

    this.reportes = {
      ingresosTotales: 0,
      productosAgotados: [],
      productosStockBajo: [],
      ventasPorMetodo: [],
      productosVendidos: [],
      mensajeAlertas: "Seleccione un rango de fechas"
    };
  }

  // ✅ CSV CORREGIDO
  exportarReporteCSV() {

    const titulo = "Reporte de Ventas - Abarrotes Ale";
    const rango = `Periodo: ${this.rangoInicio} a ${this.rangoFin}`;

    const rows = [
      [titulo],
      [rango],
      [],
      ["Ingresos Totales", `${this.reportes.ingresosTotales} MXN`],
      [],
      ["Productos Agotados"],
      ...(this.reportes.productosAgotados.length > 0
        ? this.reportes.productosAgotados.map((p:any) => [p.nombre, p.stock])
        : [["Ninguno"]]),
      [],
      ["Productos con Stock Bajo"],
      ...(this.reportes.productosStockBajo.length > 0
        ? this.reportes.productosStockBajo.map((p:any) => [p.nombre, p.stock, p.stock_minimo])
        : [["Ninguno"]]),
      [],
      ["Productos Vendidos"],
      ["Producto", "Unidades", "Ingresos (MXN)"],
      ...(this.reportes.productosVendidos.length > 0
        ? this.reportes.productosVendidos.map((p:any) => [p.nombre, p.unidades, p.ingresos])
        : [["No hay productos vendidos"]])
    ];

    let csvContent = "data:text/csv;charset=utf-8,"
      + rows.map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Reporte_Abarrotes_Ale.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // ❌ YA NO BORRAMOS DATOS
  }

  // ✅ PDF CORREGIDO
  exportarReportePDF() {

    const doc = new jsPDF();
    let currentY = 20;

    doc.setFontSize(16);
    doc.text("Reporte de Ventas - Abarrotes Ale", 40, currentY);

    currentY += 10;

    const inicio = this.rangoInicio || "N/A";
    const fin = this.rangoFin || "N/A";

    doc.setFontSize(12);
    doc.text(`Periodo: ${inicio} a ${fin}`, 14, currentY);

    currentY += 15;

    doc.setFontSize(14);
    doc.text("Ingresos Totales", 14, currentY);

    currentY += 8;

    doc.setFontSize(12);
    doc.text(`${this.reportes.ingresosTotales} MXN`, 14, currentY);

    currentY += 15;

    // 🔹 AGOTADOS
    doc.setFontSize(14);
    doc.text("Productos Agotados", 14, currentY);

    if (this.reportes.productosAgotados.length > 0) {

      autoTable(doc,{
        startY: currentY + 5,
        head:[["Producto","Stock"]],
        body:this.reportes.productosAgotados.map((p:any)=>[p.nombre,p.stock])
      });

      const finalY = (doc as any).lastAutoTable?.finalY || currentY;
      currentY = finalY + 15;

    } else {
      doc.text("Ninguno",14,currentY + 8);
      currentY += 15;
    }

    // 🔹 STOCK BAJO
    doc.setFontSize(14);
    doc.text("Productos con Stock Bajo",14,currentY);

    if(this.reportes.productosStockBajo.length > 0){

      autoTable(doc,{
        startY: currentY + 5,
        head:[["Producto","Stock","Mínimo"]],
        body:this.reportes.productosStockBajo.map((p:any)=>[
          p.nombre,
          p.stock,
          p.stock_minimo
        ])
      });

      const finalY = (doc as any).lastAutoTable?.finalY || currentY;
      currentY = finalY + 15;

    } else {
      doc.text("Ninguno",14,currentY + 8);
      currentY += 15;
    }

    // 🔹 VENDIDOS
    doc.setFontSize(14);
    doc.text("Productos Vendidos",14,currentY);

    if(this.reportes.productosVendidos.length > 0){

      autoTable(doc,{
        startY: currentY + 5,
        head:[["Producto","Unidades","Ingresos"]],
        body:this.reportes.productosVendidos.map((p:any)=>[
          p.nombre,
          p.unidades,
          p.ingresos
        ])
      });

    } else {
      doc.text("No hay productos vendidos",14,currentY + 8);
    }

    doc.save("Reporte_Abarrotes_Ale.pdf");
  }

}