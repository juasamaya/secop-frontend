import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SecopService } from '../../services/secop.service';
import { ContratoAlerta, FiltrosMotor } from '../../models/alerta.model';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.css']
})
export class BuscadorComponent implements OnInit {
  motorForm!: FormGroup;
  alertas: ContratoAlerta[] = [];
  
  cargando: boolean = false;
  busquedaRealizada: boolean = false;
  totalAlertas: number = 0;
  paginaActual: number = 1;
  totalPaginas: number = 1;
  
  errorValidacion: string | null = null;
  alertaSeleccionada: ContratoAlerta | null = null;
  detallesDossier: any[] = []; 

  listaAnios: number[] = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
  listaCiudades: string[] = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Cúcuta', 'Ibagué', 'Santa Marta', 'Villavicencio', 'Pasto', 'Montería', 'Valledupar', 'Popayán', 'Sincelejo', 'Armenia', 'Neiva', 'Riohacha', 'Tunja'];
  listaEntidades: string[] = ['Alcaldía', 'Gobernación', 'Hospital', 'Personería', 'Contraloría', 'Concejo', 'Universidad', 'Ministerio', 'SENA', 'ICBF', 'Policía', 'Ejército'];

  constructor(private fb: FormBuilder, private secopService: SecopService) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.motorForm = this.fb.group({
      apiKey: ['', Validators.required], 
      ciudad: [''],
      entidad: [''],
      busqueda: [''],
      anio: [''], 
      umbral_corbatas: [2],
      umbral_fraccionamiento: [2],
      umbral_valor: [40000000]
    });
  }

  limpiarDashboard(): void {
    const keyActual = this.motorForm.get('apiKey')?.value;
    
    this.inicializarFormulario();
    this.motorForm.patchValue({ apiKey: keyActual });
    
    this.alertas = [];
    this.busquedaRealizada = false;
    this.totalAlertas = 0;
    this.paginaActual = 1;
    this.totalPaginas = 1;
    this.errorValidacion = null;
  }

  analizarDatos(pagina: number = 1): void {
    this.errorValidacion = null; 

    if (!this.motorForm.value.apiKey) {
      this.errorValidacion = "Por favor, ingresa tu clave de investigador para continuar.";
      return;
    }

    this.alertas = []; 
    this.cargando = true;
    this.busquedaRealizada = true;
    
    const { apiKey, ...filtrosPuros } = this.motorForm.value;
    const filtros: FiltrosMotor = { ...filtrosPuros, pagina: pagina, limite: 10 };

    this.secopService.ejecutarMotorRiesgo(filtros, apiKey).subscribe({
      next: (respuesta) => {
        this.alertas = respuesta.datos;
        this.totalAlertas = respuesta.metadata.total_alertas;
        this.paginaActual = respuesta.metadata.pagina_actual;
        this.totalPaginas = respuesta.metadata.total_paginas;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 401) {
          this.errorValidacion = "Acceso Denegado. La clave ingresada es incorrecta.";
        } else {
          this.errorValidacion = "Error de conexión con el servidor.";
        }
      }
    });
  }

  cambiarPagina(delta: number): void {
    const nuevaPagina = this.paginaActual + delta;
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.analizarDatos(nuevaPagina);
    }
  }

  obtenerClaseRiesgo(puntaje: number): string {
    if (puntaje >= 100) return 'badge bg-danger fs-6 shadow-sm';
    if (puntaje >= 70) return 'badge bg-warning text-dark fs-6 shadow-sm';
    return 'badge bg-secondary fs-6 shadow-sm';
  }

  abrirDossier(alerta: ContratoAlerta): void {
    this.alertaSeleccionada = alerta;
    this.detallesDossier = this.generarGlosarioInvestigativo(alerta.motivo_alerta);
  }

  cerrarDossier(): void {
    this.alertaSeleccionada = null;
  }

  generarGlosarioInvestigativo(motivos: string): any[] {
    const glosario = [];
    
    // NUEVAS ALERTAS FORENSES
    if (motivos.includes('Múltiples Empresas')) {
      glosario.push({ titulo: 'Carrusel de Testaferros (Mismo Representante)', desc: 'La Inteligencia de Datos cruzó la cédula del representante legal y descubrió que esta misma persona firma contratos usando múltiples razones sociales (empresas diferentes) con esta entidad. Práctica típica para simular pluralidad de oferentes.', icon: 'bi-people-fill' });
    }
    if (motivos.includes('Posible Sobrecosto')) {
      glosario.push({ titulo: 'Alerta Financiera: Sobrecosto > 20%', desc: 'El valor final facturado o pagado de este contrato excedió en más de un 20% el valor inicialmente pactado. Sugiere posibles adiciones irregulares a puerta cerrada.', icon: 'bi-graph-up-arrow' });
    }
    if (motivos.includes('Empresa Todoterreno')) {
      glosario.push({ titulo: 'Fachada Multiproposito (Empresa Todoterreno)', desc: 'Esta empresa tiene contratos adjudicados en 3 o más sectores económicos completamente distintos (ej. papelería, construcción, alimentación). Comportamiento característico de empresas "de papel" creadas para ganar contratos, no por su idoneidad.', icon: 'bi-tools' });
    }
    if (motivos.includes('Raspado de Olla')) {
      glosario.push({ titulo: 'Contrato "Raspado de Olla" (Fin de Año)', desc: 'Este contrato se firmó en la última semana del año (del 24 al 31 de diciembre). Históricamente, estas fechas se usan para adjudicar rápido y agotar el presupuesto antes del cierre fiscal, reduciendo la veeduría ciudadana.', icon: 'bi-calendar2-x' });
    }
    if (motivos.includes('Fin de Semana')) {
      glosario.push({ titulo: 'Firma en Día No Laborable', desc: 'El sistema registró la firma de este documento un Sábado o Domingo, lo cual es inusual para la administración pública y suele indicar contrataciones "relámpago".', icon: 'bi-calendar-week' });
    }

    // ALERTAS CLÁSICAS
    if (motivos.includes('Sin Fecha de Firma')) {
      glosario.push({ titulo: 'Anomalía Documental: Omisión de Firma', desc: 'El funcionario público omitió registrar en el sistema la fecha exacta en la que se firmó el documento. Falta de transparencia grave.', icon: 'bi-calendar-x' });
    }
    if (motivos.includes('Corbata')) {
      glosario.push({ titulo: 'Carrusel de Contratos (Corbatas)', desc: 'Una misma persona o empresa registra múltiples contratos simultáneos en esta muestra.', icon: 'bi-person-badge' });
    }
    if (motivos.includes('Fraccionamiento')) {
      glosario.push({ titulo: 'Alerta de Fraccionamiento', desc: 'Se detectó que la entidad dividió artificialmente un contrato grande en varios pequeños entregados a la misma empresa.', icon: 'bi-scissors' });
    }
    if (motivos.includes('Contrato Directo >')) {
      glosario.push({ titulo: 'Adjudicación Directa Inusual', desc: 'Se adjudicó un monto multimillonario sin competencia abierta. Riesgo alto de direccionamiento.', icon: 'bi-currency-dollar' });
    }
    if (motivos.includes('Retrasos')) {
      glosario.push({ titulo: 'Tácticas de Retraso Crítico', desc: 'El contrato acumula adiciones de tiempo superiores a 180 días. Riesgo de elefante blanco.', icon: 'bi-clock-history' });
    }
    if (motivos.includes('Consorcio Multimillonario')) {
      glosario.push({ titulo: 'Uso de Figura Asociativa (Consorcio)', desc: 'Contrato ganado por Unión Temporal o Consorcio. Frecuentemente usado para licuar responsabilidades.', icon: 'bi-building-exclamation' });
    }
    if (motivos.includes('Anónimo')) {
      glosario.push({ titulo: 'Opacidad de Identidad', desc: 'El nombre del adjudicatario ha sido ofuscado. Ocultar quién recibe los fondos públicos es una bandera roja crítica.', icon: 'bi-incognito' });
    }
    if (motivos.includes('otros años')) {
      glosario.push({ titulo: 'Contexto de Reincidencia Histórica', desc: 'El sistema detectó que este contratista también ha recibido adjudicaciones en años diferentes al que estás consultando actualmente.', icon: 'bi-hourglass-split' });
    }
    if (motivos.includes('IA: Anomalía')) {
      glosario.push({ titulo: 'Detección por Inteligencia Artificial (Isolation Forest)', desc: 'El algoritmo matemático determinó que este contrato pertenece al 5% de los datos más atípicos (Tasa de Contaminación) de su entidad.', icon: 'bi-robot' });
    }
    return glosario;
  }
}