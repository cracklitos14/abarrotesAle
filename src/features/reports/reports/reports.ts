import { Component, OnInit } from '@angular/core';
import { ReportsService, Reporte } from '../../../core/services/reports';
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

rangoInicio: string = '';
rangoFin: string = '';

hoy: string = new Date().toLocaleDateString('sv-SE');

cargando: boolean = false;

timeoutCarga: any;

reportes: Reporte = {
ingresosTotales: 0,
productosAgotados: [],
productosStockBajo: [],
ventasPorMetodo: [],
productosVendidos: [],
mensajeAlertas: "Seleccione un rango de fechas"
};

constructor(private reportsService: ReportsService) {}

ngOnInit() {}

loadReportesPorFechas(){

if(this.cargando){
return;
}

if(!this.fechaInicio || !this.fechaFin){
alert("Debes seleccionar ambas fechas");
return;
}

if(this.fechaFin < this.fechaInicio){
alert("La fecha final no puede ser menor que la inicial");
return;
}

this.cargando = true;

/* seguridad para evitar botón trabado */
clearTimeout(this.timeoutCarga);

this.timeoutCarga = setTimeout(()=>{
this.cargando = false;
},8000);

this.reportsService
.getReportesPorFechas(this.fechaInicio,this.fechaFin)
.subscribe({

next:(data)=>{

this.reportes = {...data};

this.rangoInicio = this.fechaInicio;
this.rangoFin = this.fechaFin;

this.cargando = false;

clearTimeout(this.timeoutCarga);

},

error:(err)=>{

console.error(err);

this.cargando = false;

clearTimeout(this.timeoutCarga);

alert("Error al generar reporte");

}

});

}


/* LIMPIAR FILTROS */

limpiarFiltros(){

this.fechaInicio = '';
this.fechaFin = '';

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


/* EXPORTAR CSV */

exportarReporteCSV(){

if(!this.rangoInicio || !this.rangoFin){
alert("Primero genera un reporte");
return;
}

let csv = "Producto,Unidades,Ingresos\n";

this.reportes.productosVendidos.forEach(p=>{
csv += `${p.nombre},${p.unidades},${p.ingresos}\n`;
});

const blob = new Blob([csv],{type:'text/csv'});
const url = window.URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = "reporte.csv";
a.click();

setTimeout(()=>{
this.limpiarFiltros();
},500);

}


/* EXPORTAR PDF */

exportarReportePDF(){

if(!this.rangoInicio || !this.rangoFin){
alert("Primero genera un reporte");
return;
}

const doc = new jsPDF();

doc.text("Reporte de Ventas",20,20);
doc.text(`Desde: ${this.rangoInicio}`,20,30);
doc.text(`Hasta: ${this.rangoFin}`,20,38);

autoTable(doc,{
startY:50,
head:[["Producto","Unidades","Ingresos"]],
body:this.reportes.productosVendidos.map(p=>[
p.nombre,
p.unidades,
p.ingresos
])
});

doc.save("reporte.pdf");

setTimeout(()=>{
this.limpiarFiltros();
},500);

}

}