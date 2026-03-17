import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../../core/services/api';
import Chart from 'chart.js/auto';

@Component({
selector: 'app-dashboard',
standalone: true,
imports: [CommonModule, CurrencyPipe],
templateUrl: './dashboard.component.html',
styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

dashboard:any={
ventasHoy:0,
productosVendidos:0,
stock:0,
categorias:0,
actividad:[],
ultimaVenta:null,
ventasGrafica:[]
};

chart:any;

constructor(
private api:ApiService,
private cdr:ChangeDetectorRef
){}

ngOnInit(){

this.api.getDashboard().subscribe({
next:(res:any)=>{

this.dashboard=res;

this.cdr.detectChanges();

this.crearGrafica();

},
error:(err)=>console.error(err)
})

}

crearGrafica(){

if(!this.dashboard.ventasGrafica) return;

const labels=this.dashboard.ventasGrafica.map((v:any)=>v.hora);
const data=this.dashboard.ventasGrafica.map((v:any)=>v.total);

const canvas:any=document.getElementById("graficaVentas");
const ctx=canvas.getContext("2d");

/* degradado moderno */

const gradient=ctx.createLinearGradient(0,0,0,200);
gradient.addColorStop(0,"rgba(59,130,246,0.4)");
gradient.addColorStop(1,"rgba(59,130,246,0)");

this.chart=new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
label:'Ventas',
data:data,

borderColor:"#3b82f6",
backgroundColor:gradient,
fill:true,

tension:0.4,

pointRadius:5,
pointHoverRadius:7,
pointBackgroundColor:"#3b82f6",
pointBorderColor:"#fff",
pointBorderWidth:2
}]
},

options:{
responsive:true,
maintainAspectRatio:false,

plugins:{
legend:{display:false},
tooltip:{
backgroundColor:"#111827",
titleColor:"#fff",
bodyColor:"#fff",
padding:10
}
},

scales:{
x:{
grid:{
display:false
}
},
y:{
beginAtZero:true,
grid:{
color:"#f1f5f9"
}
}
}

}

});

}

}