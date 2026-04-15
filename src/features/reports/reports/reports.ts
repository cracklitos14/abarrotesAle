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

  // 🔥 GENERAR REPORTE PRO
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
    this.mostrarAlerta = false;

    const inicioTiempo = Date.now();

    this.reportsService.getReportesPorFechas(this.fechaInicio, this.fechaFin)
      .subscribe({
        next: (data) => {

          this.reportes = data;
          this.rangoInicio = this.fechaInicio;
          this.rangoFin = this.fechaFin;

          const tiempoTranscurrido = Date.now() - inicioTiempo;
          const tiempoMinimo = 1500;

          const delay = tiempoTranscurrido < tiempoMinimo 
            ? tiempoMinimo - tiempoTranscurrido 
            : 0;

          setTimeout(() => {

            this.cargando = false;

            this.mostrarAlerta = true;

            setTimeout(() => {
              this.mostrarAlerta = false;
            }, 3000);

          }, delay);

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
      mensajeAlertas: ""
    };
  }
exportarReporteCSV() {

  if(!this.rangoInicio || !this.rangoFin){
    alert("Primero genera el reporte");
    return;
  }

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

  const csv = rows.map(e => e.join(";")).join("\n");

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "Reporte_Abarrotes_Ale.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
}
  exportarReportePDF() {


     if(!this.rangoInicio || !this.rangoFin){
    alert("Primero genera el reporte");
    return;
  }


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

    // Agotados
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

    // Stock bajo
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

    // Vendidos
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