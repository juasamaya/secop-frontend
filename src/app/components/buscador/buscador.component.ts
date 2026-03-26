import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RadarService } from '../../services/radar.service';
import { ContratoAlerta, FiltrosMotor } from '../../models/alerta.model';
import { VisorForenseComponent } from '../visor-forense/visor-forense.component';

@Component({
  selector: 'app-buscador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VisorForenseComponent],
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
  
  // Variable para el Visor Forense
  contratoSeleccionado: string | null = null;

  listaAnios: number[] = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];

  constructor(private fb: FormBuilder, private radarService: RadarService) {}

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
    
    // 1. Extraemos la llave de seguridad y los filtros del formulario
    const { apiKey, ...filtrosPuros } = this.motorForm.value;

    // 2. Limpiamos cualquier filtro vacío para que FastAPI no arroje Error 422
    Object.keys(filtrosPuros).forEach(key => {
      if (filtrosPuros[key] === '' || filtrosPuros[key] === null) {
        delete filtrosPuros[key];
      }
    });

    const filtros: FiltrosMotor = { ...filtrosPuros, pagina: pagina, limite: 10 };

    // 3. Llamamos al servicio pasando los filtros y la llave extraída del input
    this.radarService.obtenerAlertas(filtros, apiKey).subscribe({
      next: (respuesta: any) => {
        this.alertas = respuesta.datos;
        this.totalAlertas = respuesta.metadata.total_alertas;
        this.paginaActual = respuesta.metadata.pagina_actual;
        this.totalPaginas = respuesta.metadata.total_paginas;
        this.cargando = false;
      },
      error: (err: any) => {
        this.cargando = false;
        if (err.status === 401) {
          this.errorValidacion = "Acceso Denegado. La clave ingresada es incorrecta.";
        } else if (err.status === 422) {
          this.errorValidacion = "Error en los datos de búsqueda. Revisa los filtros.";
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
    
    if (motivos.includes('Múltiples Empresas')) {
      glosario.push({ titulo: 'Carrusel de Testaferros', desc: 'Mismo representante legal con diferentes razones sociales.', icon: 'bi-people-fill' });
    }
    if (motivos.includes('Posible Sobrecosto')) {
      glosario.push({ titulo: 'Sobrecosto > 20%', desc: 'Valor facturado excede el pactado inicial.', icon: 'bi-graph-up-arrow' });
    }
    if (motivos.includes('Empresa Todoterreno')) {
      glosario.push({ titulo: 'Fachada Multiproposito', desc: 'Contratos en sectores económicos no relacionados.', icon: 'bi-tools' });
    }
    if (motivos.includes('Raspado de Olla')) {
      glosario.push({ titulo: 'Raspado de Olla', desc: 'Firma a fin de año para agotar presupuesto.', icon: 'bi-calendar2-x' });
    }
    if (motivos.includes('Fin de Semana')) {
      glosario.push({ titulo: 'Día No Laborable', desc: 'Firma en sábado o domingo.', icon: 'bi-calendar-week' });
    }
    if (motivos.includes('Sin Fecha de Firma')) {
      glosario.push({ titulo: 'Omisión de Firma', desc: 'Falta fecha de firma en el sistema.', icon: 'bi-calendar-x' });
    }
    if (motivos.includes('Corbata')) {
      glosario.push({ titulo: 'Corbatas', desc: 'Múltiples contratos simultáneos.', icon: 'bi-person-badge' });
    }
    if (motivos.includes('Fraccionamiento')) {
      glosario.push({ titulo: 'Fraccionamiento', desc: 'Contratos divididos artificialmente.', icon: 'bi-scissors' });
    }
    if (motivos.includes('Contrato Directo >')) {
      glosario.push({ titulo: 'Adjudicación Directa', desc: 'Monto alto sin competencia.', icon: 'bi-currency-dollar' });
    }
    if (motivos.includes('Retrasos')) {
      glosario.push({ titulo: 'Retraso Crítico', desc: 'Adiciones de tiempo altas.', icon: 'bi-clock-history' });
    }
    if (motivos.includes('Consorcio Multimillonario')) {
      glosario.push({ titulo: 'Uso de Consorcio', desc: 'Figura asociativa inusual para el monto.', icon: 'bi-building-exclamation' });
    }
    if (motivos.includes('Anónimo')) {
      glosario.push({ titulo: 'Opacidad', desc: 'Identidad del adjudicatario oculta.', icon: 'bi-incognito' });
    }
    if (motivos.includes('otros años')) {
      glosario.push({ titulo: 'Reincidencia', desc: 'Adjudicaciones previas detectadas.', icon: 'bi-hourglass-split' });
    }
    if (motivos.includes('IA: Anomalía')) {
      glosario.push({ titulo: 'Anomalía IA', desc: 'Isolation Forest detectó atipicidad.', icon: 'bi-robot' });
    }
    return glosario;
  }

  analizarContrato(idContrato: string, event: Event): void {
    event.stopPropagation(); 
    this.contratoSeleccionado = idContrato;
  }

  cerrarVisorForense(): void {
    this.contratoSeleccionado = null;
  }
}